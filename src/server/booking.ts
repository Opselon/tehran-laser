/** Transactional booking writer (contract §13, §15, §161, §162).
 *
 *  HARD CONSTRAINTS ENFORCED HERE:
 *  - Double-booking protection: writes slot-grid records (`booking_slots`) with
 *    PRIMARY KEY (staff_key, slot_start). If two clients race, D1 rolls back the entire
 *    batch atomically; the loser receives BOOKING_CONFLICT (HTTP 409).
 *  - Server-authoritative quote: price, duration, and discounts are recalculated
 *    server-side; client inputs are presentation-only.
 *  - State transitions follow `canTransitionBookingState()`.
 *  - Reschedule revalidates the entire duration + hours + breaks + conflicts before moving.
 */

import { one, run } from '../db/query';
import { canTransitionBookingState } from '../domain/booking/booking.state';
import type { BookingStatus, PricingCategory } from '../domain/booking/booking.types';
import { calculateQuote, hasPriceFor, PricingError } from '../domain/pricing/pricing';
import { calculateAvailability } from '../domain/schedule/availability';
import { buildSlotInstants, slotStaffKey } from '../domain/booking/booking.slots';
import { parseOperationalSettings } from '../domain/settings/settings.types';
import { ApiError } from '../lib/api/errors';
import {
  findOccupiedSlotStarts,
  getPublicSettings,
  listBusinessHours,
  listScheduleExceptionsForDate,
  loadPriceRowsForService,
  toHoursRows,
  writeAuditLog,
} from './repositories';
import { localDateOf } from '../lib/datetime/timezone';

/* ── Human-friendly collision-safe booking reference (§213) ──── */

const REFERENCE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes 0/O/1/I

export function generateBookingReference(): string {
  let code = '';
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 5; i++) {
    code += REFERENCE_CHARS[bytes[i]! % REFERENCE_CHARS.length];
  }
  return `TL-${code}`;
}

/* ── Creation (public endpoint) ───────────────────────────────── */

export interface CreateBookingParams {
  serviceSlug: string;
  pricingCategory: PricingCategory;
  startsAtIso: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | undefined;
  customerNote?: string | undefined;
  idempotencyKey?: string | undefined;
}

export interface BookingCreatedResult {
  bookingId: string;
  reference: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  serviceName: string;
  pricingCategory: PricingCategory;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
}

export async function createBooking(
  db: D1Database,
  params: CreateBookingParams,
): Promise<BookingCreatedResult> {
  // Idempotency: if an identical client key was already submitted, return the existing booking.
  if (params.idempotencyKey) {
    const existing = await one<{
      id: string;
      reference: string;
      status: BookingStatus;
      startsAt: string;
      endsAt: string;
      serviceName: string;
      pricingCategory: PricingCategory;
      quotedAmount: number;
      discountAmount: number;
      currency: string;
      customerName: string;
      customerPhone: string;
    }>(
      db,
      `SELECT b.id, b.reference, b.status, b.starts_at AS startsAt, b.ends_at AS endsAt,
              s.name AS serviceName, b.pricing_category AS pricingCategory,
              b.quoted_amount AS quotedAmount, b.discount_amount AS discountAmount,
              b.currency, c.name AS customerName, c.phone AS customerPhone
         FROM bookings b
         JOIN services s ON s.id = b.service_id
         JOIN customers c ON c.id = b.customer_id
        WHERE b.idempotency_key = ?`,
      params.idempotencyKey,
    );
    if (existing) {
      return {
        bookingId: existing.id,
        reference: existing.reference,
        status: existing.status,
        startsAt: existing.startsAt,
        endsAt: existing.endsAt,
        serviceName: existing.serviceName,
        pricingCategory: existing.pricingCategory,
        quotedAmount: existing.quotedAmount,
        discountAmount: existing.discountAmount,
        currency: existing.currency,
        customerName: existing.customerName,
        customerPhone: existing.customerPhone,
      };
    }
  }

  // 1. Service lookup
  const service = await one<{
    id: string;
    name: string;
    durationMinutes: number;
    active: number;
  }>(
    db,
    `SELECT id, name, duration_minutes AS durationMinutes, active
       FROM services
      WHERE slug = ?`,
    params.serviceSlug,
  );
  if (!service || service.active !== 1) {
    throw new ApiError('SERVICE_INACTIVE', 'خدمت انتخاب‌شده فعال نیست.');
  }

  // 2. Settings + Authoritative price
  const [rawSettings, priceRows] = await Promise.all([
    getPublicSettings(db),
    loadPriceRowsForService(db, service.id),
  ]);
  const settings = parseOperationalSettings(rawSettings);

  if (!settings.bookingEnabled) {
    throw new ApiError('BOOKING_DISABLED', 'سیستم رزرو آنلاین در حال حاضر غیرفعال است.');
  }

  if (!hasPriceFor(priceRows, params.pricingCategory)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'قیمت این خدمت برای دسته انتخابی تعریف نشده است. لطفاً با کلینیک تماس بگیرید.',
    );
  }

  let quote;
  try {
    quote = calculateQuote(
      { id: service.id, durationMinutes: service.durationMinutes, active: service.active === 1 },
      priceRows,
      params.pricingCategory,
      settings.discountPercent,
    );
  } catch (err) {
    if (err instanceof PricingError) {
      throw new ApiError('VALIDATION_ERROR', err.message);
    }
    throw err;
  }

  // 3. Availability verification (server-authoritative: client cannot pick an invalid slot)
  const localDate = localDateOf(params.startsAtIso, settings.timezone);
  const [businessHours, exceptions, occupied] = await Promise.all([
    listBusinessHours(db),
    listScheduleExceptionsForDate(db, localDate),
    findOccupiedSlotStarts(
      db,
      slotStaffKey(null),
      params.startsAtIso,
      new Date(Date.parse(params.startsAtIso) + quote.durationMinutes * 60_000).toISOString(),
    ),
  ]);

  // If ANY slot in the range is already occupied, abort immediately.
  if (occupied.length > 0) {
    throw new ApiError('BOOKING_CONFLICT', 'این زمان دیگر قابل رزرو نیست.');
  }

  // Calculate full day's availability to verify hours / breaks / advance limits.
  const slots = calculateAvailability({
    localDate,
    timezone: settings.timezone,
    hours: toHoursRows(businessHours),
    exceptions,
    durationMinutes: quote.durationMinutes,
    granularityMinutes: settings.slotGranularityMinutes,
    bufferMinutes: settings.bookingBufferMinutes,
    occupiedSlots: new Set(occupied),
    nowIso: new Date().toISOString(),
    minLeadMinutes: settings.minLeadMinutes,
  });

  const slotMatch = slots.find(
    (s) => s.startsAt === params.startsAtIso && s.available,
  );
  if (!slotMatch) {
    throw new ApiError('SLOT_UNAVAILABLE', 'زمان انتخابی در دسترس نیست.');
  }

  const endsAtIso = slotMatch.endsAt;

  // 4. Upsert customer record
  let customer = await one<{ id: string }>(
    db,
    `SELECT id FROM customers WHERE phone = ?`,
    params.customerPhone,
  );
  const nowIso = new Date().toISOString();
  if (!customer) {
    const customerId = crypto.randomUUID();
    await run(
      db,
      `INSERT INTO customers (id, name, phone, email, pricing_category, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      customerId,
      params.customerName,
      params.customerPhone,
      params.customerEmail ?? null,
      params.pricingCategory,
      nowIso,
      nowIso,
    );
    customer = { id: customerId };
  } else {
    // Update name/email if provided
    await run(
      db,
      `UPDATE customers SET name = ?, email = COALESCE(?, email), updated_at = ? WHERE id = ?`,
      params.customerName,
      params.customerEmail ?? null,
      nowIso,
      customer.id,
    );
  }

  // 5. Generate slots across the service duration
  const requiredSlots = buildSlotInstants(
    params.startsAtIso,
    quote.durationMinutes,
    settings.slotGranularityMinutes,
  );

  const bookingId = crypto.randomUUID();
  const reference = generateBookingReference();

  // 6. ATOMIC D1 BATCH: booking + all booking_slots + initial event.
  // PRIMARY KEY (staff_key, slot_start) guarantees only one booking can hold any slot.
  const batchStatements: D1PreparedStatement[] = [];

  // Bookings row
  batchStatements.push(
    db
      .prepare(
        `INSERT INTO bookings (
           id, reference, customer_id, service_id, staff_id, pricing_category,
           starts_at, ends_at, status, quoted_amount, discount_amount, currency,
           customer_note, idempotency_key, created_at, updated_at
         ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        bookingId,
        reference,
        customer.id,
        service.id,
        params.pricingCategory,
        params.startsAtIso,
        endsAtIso,
        quote.baseAmount,
        quote.discountAmount,
        quote.currency,
        params.customerNote ?? null,
        params.idempotencyKey ?? null,
        nowIso,
        nowIso,
      ),
  );

  // Exclusions: one row per granularity slot
  for (const slotStart of requiredSlots) {
    batchStatements.push(
      db
        .prepare(
          `INSERT INTO booking_slots (staff_key, slot_start, booking_id) VALUES (?, ?, ?)`,
        )
        .bind(slotStaffKey(null), slotStart, bookingId),
    );
  }

  // Event row
  batchStatements.push(
    db
      .prepare(
        `INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, 'created', NULL, 'ثبت نوبت توسط مشتری', ?)`,
      )
      .bind(crypto.randomUUID(), bookingId, nowIso),
  );

  try {
    await db.batch(batchStatements);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE constraint failed') || msg.includes('PRIMARY KEY')) {
      throw new ApiError('BOOKING_CONFLICT', 'این زمان توسط مشتری دیگری رزرو شد.');
    }
    throw err;
  }

  return {
    bookingId,
    reference,
    status: 'pending',
    startsAt: params.startsAtIso,
    endsAt: endsAtIso,
    serviceName: service.name,
    pricingCategory: params.pricingCategory,
    quotedAmount: quote.baseAmount,
    discountAmount: quote.discountAmount,
    currency: quote.currency,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
  };
}

/* ── Admin state mutations (contract §25, §26) ────────────────── */

export async function transitionBooking(
  db: D1Database,
  bookingId: string,
  targetStatus: BookingStatus,
  actorId: string,
  reason?: string,
): Promise<{ id: string; status: BookingStatus }> {
  const booking = await one<{
    id: string;
    status: BookingStatus;
    staffId: string | null;
  }>(db, `SELECT id, status, staff_id AS staffId FROM bookings WHERE id = ?`, bookingId);
  if (!booking) throw new ApiError('NOT_FOUND', 'رزرو یافت نشد.');

  if (!canTransitionBookingState(booking.status, targetStatus)) {
    throw new ApiError(
      'INVALID_BOOKING_STATUS',
      `تغییر وضعیت از «${booking.status}» به «${targetStatus}» مجاز نیست.`,
    );
  }

  const nowIso = new Date().toISOString();
  const batch: D1PreparedStatement[] = [];

  batch.push(
    db
      .prepare(
        `UPDATE bookings
            SET status = ?,
                rejection_reason = CASE WHEN ? = 'rejected' THEN ? ELSE rejection_reason END,
                updated_at = ?
          WHERE id = ?`,
      )
      .bind(targetStatus, targetStatus, reason ?? null, nowIso, bookingId),
  );

  // If status transitions to cancelled or rejected, free the slot reservations.
  if (targetStatus === 'cancelled' || targetStatus === 'rejected') {
    batch.push(
      db.prepare(`DELETE FROM booking_slots WHERE booking_id = ?`).bind(bookingId),
    );
  }

  batch.push(
    db
      .prepare(
        `INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        bookingId,
        targetStatus,
        actorId,
        reason ?? `تغییر وضعیت به ${targetStatus}`,
        nowIso,
      ),
  );

  await db.batch(batch);
  await writeAuditLog(db, actorId, `booking.${targetStatus}`, 'booking', bookingId);

  return { id: bookingId, status: targetStatus };
}

/* ── Rescheduling (atomic revalidation + slot migration, §26) ──── */

export async function rescheduleBooking(
  db: D1Database,
  bookingId: string,
  newStartsAtIso: string,
  newStaffId: string | null,
  actorId: string,
): Promise<{ id: string; startsAt: string; endsAt: string }> {
  const booking = await one<{
    id: string;
    serviceId: string;
    status: BookingStatus;
    durationMinutes: number;
    startsAt: string;
  }>(
    db,
    `SELECT b.id, b.service_id AS serviceId, b.status,
            s.duration_minutes AS durationMinutes, b.starts_at AS startsAt
       FROM bookings b
       JOIN services s ON s.id = b.service_id
      WHERE b.id = ?`,
    bookingId,
  );
  if (!booking) throw new ApiError('NOT_FOUND', 'رزرو یافت نشد.');

  if (booking.status === 'cancelled' || booking.status === 'rejected' || booking.status === 'completed') {
    throw new ApiError(
      'INVALID_BOOKING_STATUS',
      'تنها رزروهای در انتظار، تأییدشده یا عدم حضور قابل زمان‌بندی مجدد هستند.',
    );
  }

  const rawSettings = await getPublicSettings(db);
  const settings = parseOperationalSettings(rawSettings);

  const localDate = localDateOf(newStartsAtIso, settings.timezone);
  const [businessHours, exceptions, occupied] = await Promise.all([
    listBusinessHours(db),
    listScheduleExceptionsForDate(db, localDate),
    findOccupiedSlotStarts(
      db,
      slotStaffKey(newStaffId),
      newStartsAtIso,
      new Date(Date.parse(newStartsAtIso) + booking.durationMinutes * 60_000).toISOString(),
    ),
  ]);

  // Revalidate working hours, breaks, and exceptions on reschedule (§26).
  const slots = calculateAvailability({
    localDate,
    timezone: settings.timezone,
    hours: toHoursRows(businessHours),
    exceptions,
    durationMinutes: booking.durationMinutes,
    granularityMinutes: settings.slotGranularityMinutes,
    bufferMinutes: settings.bookingBufferMinutes,
    occupiedSlots: new Set(occupied),
    nowIso: new Date().toISOString(),
    minLeadMinutes: settings.minLeadMinutes,
  });
  const validSlot = slots.find((s) => s.startsAt === newStartsAtIso && s.available);
  if (!validSlot) {
    throw new ApiError('SLOT_UNAVAILABLE', 'زمان جدید در ساعات کاری یا در دسترس نیست.');
  }

  // If any occupied slot doesn't belong to THIS booking, conflict.
  const foreignClash = await one<{ count: number }>(
    db,
    `SELECT COUNT(*) AS count
       FROM booking_slots
      WHERE staff_key = ?
        AND slot_start >= ?
        AND slot_start < ?
        AND booking_id != ?`,
    slotStaffKey(newStaffId),
    newStartsAtIso,
    new Date(Date.parse(newStartsAtIso) + booking.durationMinutes * 60_000).toISOString(),
    bookingId,
  );
  if (foreignClash && foreignClash.count > 0) {
    throw new ApiError('BOOKING_CONFLICT', 'زمان جدید با رزرو دیگری تداخل دارد.');
  }

  const newEndsAtIso = new Date(
    Date.parse(newStartsAtIso) + booking.durationMinutes * 60_000,
  ).toISOString();

  const newSlots = buildSlotInstants(
    newStartsAtIso,
    booking.durationMinutes,
    settings.slotGranularityMinutes,
  );

  const nowIso = new Date().toISOString();
  const batch: D1PreparedStatement[] = [
    // Free old slots
    db.prepare(`DELETE FROM booking_slots WHERE booking_id = ?`).bind(bookingId),
    // Update booking row
    db
      .prepare(
        `UPDATE bookings
            SET starts_at = ?, ends_at = ?, staff_id = ?, updated_at = ?
          WHERE id = ?`,
      )
      .bind(newStartsAtIso, newEndsAtIso, newStaffId, nowIso, bookingId),
  ];

  // Insert new slots
  for (const s of newSlots) {
    batch.push(
      db
        .prepare(
          `INSERT INTO booking_slots (staff_key, slot_start, booking_id) VALUES (?, ?, ?)`,
        )
        .bind(slotStaffKey(newStaffId), s, bookingId),
    );
  }

  // Audit event
  const detail = `${booking.startsAt} → ${newStartsAtIso}`;
  batch.push(
    db
      .prepare(
        `INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, 'rescheduled', ?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), bookingId, actorId, detail, nowIso),
  );

  await db.batch(batch);
  await writeAuditLog(db, actorId, 'booking.rescheduled', 'booking', bookingId);

  return { id: bookingId, startsAt: newStartsAtIso, endsAt: newEndsAtIso };
}
