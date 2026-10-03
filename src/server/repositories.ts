/** Repositories for public + admin data access (contract §98, §236).
 *
 *  Design rules enforced here:
 *  - Explicit bounded queries; never `SELECT *` (§60, §61).
 *  - D1 binds only — no user string concatenation into SQL (§196).
 *  - Alias DB columns to camelCase directly in SQL for zero-overhead domain shapes.
 *  - Free-tier safe: every list is paginated or clamped (§62, §93).
 */

import { all, one, run, encodeCursor, decodeCursor, clampLimit } from '../db/query';
import type { Queryable, Page } from '../db/query';
import type {
  PublicServiceDto,
  BusinessHoursDto,
  BusinessSegmentDto,
  PublicBlogPostDto,
  PublicBlogPostSummaryDto,
  AdminBookingRowDto,
  AdminBookingDto,
  AdminCustomerRowDto,
  AdminServiceDto,
  AdminStaffDto,
  AdminBlogPostDto,
  AuditLogRowDto,
  NotificationEventRowDto,
  AdminDashboardDto,
  FaqItemDto,
  PublicSettingsDto,
} from '../domain/api/dto.types';
import type { PricingCategory, BookingStatus } from '../domain/booking/booking.types';
import type { PriceRow } from '../domain/pricing/pricing';
import type { HoursRow, ScheduleExceptionKind } from '../domain/schedule/availability';

/* ── Settings ─────────────────────────────────────────────────── */

export async function getPublicSettings(db: Queryable): Promise<PublicSettingsDto> {
  const rows = await all<{ key: string; value: string }>(
    db,
    `SELECT key, value FROM settings WHERE scope = 'public'`,
  );
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function getAllSettings(
  db: Queryable,
): Promise<{ public: Record<string, string>; private: Record<string, string> }> {
  const rows = await all<{ key: string; value: string; scope: 'public' | 'private' }>(
    db,
    `SELECT key, value, scope FROM settings`,
  );
  const pub: Record<string, string> = {};
  const priv: Record<string, string> = {};
  for (const r of rows) {
    if (r.scope === 'public') pub[r.key] = r.value;
    else priv[r.key] = r.value;
  }
  return { public: pub, private: priv };
}

export async function getSettingValue(db: Queryable, key: string): Promise<string | null> {
  const row = await one<{ value: string }>(db, `SELECT value FROM settings WHERE key = ?`, key);
  return row ? row.value : null;
}

/* ── Services & pricing ───────────────────────────────────────── */

interface RawPriceRow {
  serviceId: string;
  pricingCategory: PricingCategory;
  amount: number;
  currency: string;
}

export async function listPublicServices(db: Queryable): Promise<PublicServiceDto[]> {
  const [services, prices] = await Promise.all([
    all<{
      id: string;
      name: string;
      slug: string;
      description: string;
      shortDescription: string | null;
      durationMinutes: number;
      featured: number;
      displayOrder: number;
    }>(
      db,
      `SELECT id, name, slug, description, short_description AS shortDescription,
              duration_minutes AS durationMinutes, featured, display_order AS displayOrder
         FROM services
        WHERE active = 1
        ORDER BY display_order ASC, name ASC`,
    ),
    all<RawPriceRow>(
      db,
      `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
         FROM service_prices`,
    ),
  ]);

  const priceMap = new Map<string, RawPriceRow[]>();
  for (const p of prices) {
    const list = priceMap.get(p.serviceId) ?? [];
    list.push(p);
    priceMap.set(p.serviceId, list);
  }

  return services.map((s) => ({
    name: s.name,
    slug: s.slug,
    description: s.description,
    shortDescription: s.shortDescription,
    durationMinutes: s.durationMinutes,
    featured: s.featured === 1,
    displayOrder: s.displayOrder,
    prices: (priceMap.get(s.id) ?? []).map((p) => ({
      pricingCategory: p.pricingCategory,
      amount: p.amount,
      currency: p.currency,
    })),
  }));
}

export async function findPublicServiceBySlug(
  db: Queryable,
  slug: string,
): Promise<PublicServiceDto | null> {
  const service = await one<{
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    durationMinutes: number;
    featured: number;
  }>(
    db,
    `SELECT id, name, slug, description, short_description AS shortDescription,
            duration_minutes AS durationMinutes, featured
       FROM services
      WHERE slug = ? AND active = 1`,
    slug,
  );
  if (!service) return null;

  const prices = await all<RawPriceRow>(
    db,
    `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
       FROM service_prices
      WHERE service_id = ?`,
    service.id,
  );

  return {
    name: service.name,
    slug: service.slug,
    description: service.description,
    shortDescription: service.shortDescription,
    durationMinutes: service.durationMinutes,
    featured: service.featured === 1,
    displayOrder: 0,
    prices: prices.map((p) => ({
      pricingCategory: p.pricingCategory,
      amount: p.amount,
      currency: p.currency,
    })),
  };
}

export async function loadPriceRowsForService(
  db: Queryable,
  serviceId: string,
): Promise<PriceRow[]> {
  const rows = await all<RawPriceRow>(
    db,
    `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
       FROM service_prices
      WHERE service_id = ?`,
    serviceId,
  );
  return rows.map((r) => ({
    pricingCategory: r.pricingCategory,
    amount: r.amount,
    currency: r.currency,
  }));
}

export async function listAdminServices(db: Queryable): Promise<AdminServiceDto[]> {
  const [services, prices] = await Promise.all([
    all<{
      id: string;
      name: string;
      slug: string;
      description: string;
      shortDescription: string | null;
      durationMinutes: number;
      active: number;
      featured: number;
      displayOrder: number;
      createdAt: string;
      updatedAt: string;
    }>(
      db,
      `SELECT id, name, slug, description, short_description AS shortDescription,
              duration_minutes AS durationMinutes, active, featured,
              display_order AS displayOrder, created_at AS createdAt, updated_at AS updatedAt
         FROM services
        ORDER BY display_order ASC, name ASC`,
    ),
    all<RawPriceRow & { id: string }>(
      db,
      `SELECT id, service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
         FROM service_prices`,
    ),
  ]);

  const priceMap = new Map<string, Array<{ id: string; pricingCategory: PricingCategory; amount: number; currency: string }>>();
  for (const p of prices) {
    const list = priceMap.get(p.serviceId) ?? [];
    list.push({ id: p.id, pricingCategory: p.pricingCategory, amount: p.amount, currency: p.currency });
    priceMap.set(p.serviceId, list);
  }

  return services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    shortDescription: s.shortDescription,
    durationMinutes: s.durationMinutes,
    active: s.active === 1,
    featured: s.featured === 1,
    displayOrder: s.displayOrder,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    prices: priceMap.get(s.id) ?? [],
  }));
}

/* ── Schedule & business hours ────────────────────────────────── */

export function toHoursRows(hours: BusinessHoursDto[]): HoursRow[] {
  return hours.map((h) => ({ weekday: h.weekday, segments: h.segments }));
}

export async function listBusinessHours(db: Queryable): Promise<BusinessHoursDto[]> {
  const rows = await all<{
    weekday: number;
    opensAt: string;
    closesAt: string;
  }>(
    db,
    `SELECT weekday, opens_at AS opensAt, closes_at AS closesAt
       FROM business_hours
      ORDER BY weekday ASC, display_order ASC, opens_at ASC`,
  );
  const map = new Map<number, BusinessSegmentDto[]>();
  for (let i = 0; i <= 6; i++) map.set(i, []);
  for (const r of rows) {
    const list = map.get(r.weekday) ?? [];
    list.push({ opensAt: r.opensAt, closesAt: r.closesAt });
    map.set(r.weekday, list);
  }
  return Array.from(map.entries()).map(([weekday, segments]) => ({ weekday, segments }));
}

export async function listScheduleExceptionsForDate(
  db: Queryable,
  localDate: string,
): Promise<Array<{ date: string; kind: ScheduleExceptionKind; opensAt: string | null; closesAt: string | null; note: string | null }>> {
  const rows = await all<{
    id: string;
    exceptionDate: string;
    kind: ScheduleExceptionKind;
    opensAt: string | null;
    closesAt: string | null;
    note: string | null;
  }>(
    db,
    `SELECT id, exception_date AS exceptionDate, kind, opens_at AS opensAt,
            closes_at AS closesAt, note
       FROM schedule_exceptions
      WHERE exception_date = ?`,
    localDate,
  );
  return rows.map((r) => ({
    date: r.exceptionDate,
    kind: r.kind,
    opensAt: r.opensAt,
    closesAt: r.closesAt,
    note: r.note,
  }));
}

/* ── Staff ────────────────────────────────────────────────────── */

export async function listActiveStaffForService(
  db: Queryable,
  serviceId: string,
): Promise<Array<{ id: string; name: string }>> {
  return all<{ id: string; name: string }>(
    db,
    `SELECT s.id, s.name
       FROM staff s
       JOIN staff_services ss ON ss.staff_id = s.id
      WHERE s.active = 1 AND ss.service_id = ?
      ORDER BY s.name ASC`,
    serviceId,
  );
}

export async function listAdminStaff(db: Queryable): Promise<AdminStaffDto[]> {
  const [staffList, services] = await Promise.all([
    all<{ id: string; name: string; active: number; createdAt: string; updatedAt: string }>(
      db,
      `SELECT id, name, active, created_at AS createdAt, updated_at AS updatedAt
         FROM staff
        ORDER BY name ASC`,
    ),
    all<{ staffId: string; serviceId: string }>(
      db,
      `SELECT staff_id AS staffId, service_id AS serviceId FROM staff_services`,
    ),
  ]);

  const serviceMap = new Map<string, string[]>();
  for (const row of services) {
    const arr = serviceMap.get(row.staffId) ?? [];
    arr.push(row.serviceId);
    serviceMap.set(row.staffId, arr);
  }

  return staffList.map((s) => ({
    id: s.id,
    name: s.name,
    active: s.active === 1,
    serviceIds: serviceMap.get(s.id) ?? [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

/* ── Slots query for availability (single indexed scan, §17) ──── */

export async function findOccupiedSlotStarts(
  db: Queryable,
  staffKey: string,
  rangeStartIso: string,
  rangeEndIso: string,
): Promise<string[]> {
  const rows = await all<{ slotStart: string }>(
    db,
    `SELECT slot_start AS slotStart
       FROM booking_slots
      WHERE staff_key = ?
        AND slot_start >= ?
        AND slot_start < ?
      ORDER BY slot_start ASC`,
    staffKey,
    rangeStartIso,
    rangeEndIso,
  );
  return rows.map((r) => r.slotStart);
}

/* ── Blog ─────────────────────────────────────────────────────── */

export async function listPublicBlogPosts(
  db: Queryable,
  limit = 10,
  cursor?: string,
): Promise<Page<PublicBlogPostSummaryDto>> {
  const safeLimit = clampLimit(limit, 10, 50);
  const nowIso = new Date().toISOString();
  let sql = `SELECT id, title, slug, excerpt, cover_image AS coverImage,
                    author, published_at AS publishedAt
               FROM blog_posts
              WHERE status = 'published'
                AND (published_at IS NULL OR published_at <= ?)`;
  const binds: (string | number)[] = [nowIso];

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      sql += ` AND (published_at < ? OR (published_at = ? AND id < ?))`;
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  sql += ` ORDER BY published_at DESC, id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rows = await all<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    author: string | null;
    publishedAt: string | null;
  }>(db, sql, ...binds);

  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last && last.publishedAt ? encodeCursor(last.publishedAt, last.id) : null;

  return { items, nextCursor };
}

export async function findPublicBlogPostBySlug(
  db: Queryable,
  slug: string,
): Promise<PublicBlogPostDto | null> {
  const row = await one<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    author: string | null;
    publishedAt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
  }>(
    db,
    `SELECT id, title, slug, excerpt, content, cover_image AS coverImage, author,
            published_at AS publishedAt, seo_title AS seoTitle,
            seo_description AS seoDescription, canonical_url AS canonicalUrl,
            og_title AS ogTitle, og_description AS ogDescription
       FROM blog_posts
      WHERE slug = ? AND status = 'published'`,
    slug,
  );
  if (!row) return null;

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    category: null,
    author: row.author,
    publishedAt: row.publishedAt ?? '',
    seo: {
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      canonicalUrl: row.canonicalUrl,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
    },
  };
}

export async function listAdminBlogPosts(
  db: Queryable,
  limit = 20,
  cursor?: string,
): Promise<Page<AdminBlogPostDto>> {
  const safeLimit = clampLimit(limit, 20, 100);
  let sql = `SELECT id, title, slug, excerpt, content, cover_image AS coverImage,
                    category_id AS categoryId, author, status,
                    published_at AS publishedAt, seo_title AS seoTitle,
                    seo_description AS seoDescription, canonical_url AS canonicalUrl,
                    og_title AS ogTitle, og_description AS ogDescription,
                    created_at AS createdAt, updated_at AS updatedAt
               FROM blog_posts`;
  const binds: (string | number)[] = [];

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      sql += ` WHERE created_at < ? OR (created_at = ? AND id < ?)`;
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  sql += ` ORDER BY created_at DESC, id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rows = await all<AdminBlogPostDto>(db, sql, ...binds);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

  return { items, nextCursor };
}

/* ── FAQ ──────────────────────────────────────────────────────── */

export async function listPublicFaq(db: Queryable): Promise<FaqItemDto[]> {
  return all<FaqItemDto>(
    db,
    `SELECT id, question, answer, display_order AS displayOrder, active,
            updated_at AS updatedAt
       FROM faq_items
      WHERE active = 1
      ORDER BY display_order ASC, id ASC`,
  );
}

/** Alias for listPublicFaq */
export const listFaqItems = listPublicFaq;

export async function listAdminFaq(db: Queryable): Promise<FaqItemDto[]> {
  return all<FaqItemDto>(
    db,
    `SELECT id, question, answer, display_order AS displayOrder, active,
            updated_at AS updatedAt
       FROM faq_items
      ORDER BY display_order ASC, id ASC`,
  );
}

/* ── SEO Metadata overrides ───────────────────────────────────── */

export async function findSeoOverride(
  db: Queryable,
  entityType: 'page' | 'service' | 'post',
  entityId: string,
): Promise<{
  title: string;
  description: string;
  canonicalUrl: string | null;
  ogImage: string | null;
  noindex: boolean;
} | null> {
  const row = await one<{
    title: string;
    description: string;
    canonicalUrl: string | null;
    ogImage: string | null;
    noindex: number;
  }>(
    db,
    `SELECT title, description, canonical_url AS canonicalUrl, og_image AS ogImage, noindex
       FROM seo_metadata
      WHERE entity_type = ? AND entity_id = ?`,
    entityType,
    entityId,
  );
  if (!row) return null;
  return { ...row, noindex: row.noindex === 1 };
}

/* ── Customers ────────────────────────────────────────────────── */

export async function listAdminCustomers(
  db: Queryable,
  limit = 20,
  cursor?: string,
  search?: string,
): Promise<Page<AdminCustomerRowDto>> {
  const safeLimit = clampLimit(limit, 20, 100);
  const conditions: string[] = [];
  const binds: (string | number)[] = [];

  if (search && search.trim()) {
    const q = search.trim();
    // Prefix / exact matches against indexed columns (§28).
    conditions.push(`(phone LIKE ? OR name LIKE ?)`);
    binds.push(`${q}%`, `${q}%`);
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      conditions.push(`(created_at < ? OR (created_at = ? AND id < ?))`);
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  let sql = `SELECT id, name, phone, email, pricing_category AS pricingCategory,
                    note, created_at AS createdAt, updated_at AS updatedAt
               FROM customers`;
  if (conditions.length > 0) sql += ` WHERE ` + conditions.join(' AND ');
  sql += ` ORDER BY created_at DESC, id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rows = await all<AdminCustomerRowDto>(db, sql, ...binds);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

  return { items, nextCursor };
}

/* ── Bookings ─────────────────────────────────────────────────── */

export interface BookingFilterOptions {
  status?: string | undefined;
  staffId?: string | undefined;
  serviceId?: string | undefined;
  fromStartsAt?: string | undefined;
  toStartsAt?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  cursor?: string | undefined;
}

interface RawAdminBookingDbRow {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  serviceSlug?: string;
  serviceDurationMinutes?: number;
  staffId: string | null;
  staffName: string | null;
  pricingCategory: PricingCategory;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapRawToAdminBookingDto(row: RawAdminBookingDbRow): AdminBookingDto {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    pricingCategory: row.pricingCategory,
    quotedAmount: row.quotedAmount,
    discountAmount: row.discountAmount,
    currency: row.currency,
    customer: {
      id: row.customerId,
      name: row.customerName,
      phone: row.customerPhone,
      email: null,
      pricingCategory: row.pricingCategory,
    },
    service: {
      id: row.serviceId,
      slug: row.serviceSlug || '',
      name: row.serviceName,
      durationMinutes: row.serviceDurationMinutes || 30,
    },
    staff: row.staffId ? { id: row.staffId, name: row.staffName || '' } : null,
    customerNote: row.customerNote,
    adminNote: row.adminNote,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listAdminBookings(
  db: Queryable,
  options: BookingFilterOptions = {},
): Promise<Page<AdminBookingRowDto>> {
  const safeLimit = clampLimit(options.limit, 20, 100);
  const conditions: string[] = [];
  const binds: (string | number)[] = [];

  if (options.status) {
    conditions.push(`b.status = ?`);
    binds.push(options.status);
  }
  if (options.staffId) {
    conditions.push(`b.staff_id = ?`);
    binds.push(options.staffId);
  }
  if (options.serviceId) {
    conditions.push(`b.service_id = ?`);
    binds.push(options.serviceId);
  }
  if (options.fromStartsAt) {
    conditions.push(`b.starts_at >= ?`);
    binds.push(options.fromStartsAt);
  }
  if (options.toStartsAt) {
    conditions.push(`b.starts_at < ?`);
    binds.push(options.toStartsAt);
  }
  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    conditions.push(`(b.reference LIKE ? OR c.phone LIKE ? OR c.name LIKE ?)`);
    binds.push(`${q}%`, `${q}%`, `${q}%`);
  }
  if (options.cursor) {
    const decoded = decodeCursor(options.cursor);
    if (decoded) {
      conditions.push(`(b.starts_at < ? OR (b.starts_at = ? AND b.id < ?))`);
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  let sql = `SELECT b.id, b.reference, b.customer_id AS customerId,
                    c.name AS customerName, c.phone AS customerPhone,
                    b.service_id AS serviceId, s.name AS serviceName,
                    s.slug AS serviceSlug, s.duration_minutes AS serviceDurationMinutes,
                    b.staff_id AS staffId, st.name AS staffName,
                    b.pricing_category AS pricingCategory,
                    b.starts_at AS startsAt, b.ends_at AS endsAt,
                    b.status, b.quoted_amount AS quotedAmount,
                    b.discount_amount AS discountAmount, b.currency,
                    b.customer_note AS customerNote, b.admin_note AS adminNote,
                    b.rejection_reason AS rejectionReason,
                    b.created_at AS createdAt, b.updated_at AS updatedAt
               FROM bookings b
               JOIN customers c ON c.id = b.customer_id
               JOIN services s ON s.id = b.service_id
          LEFT JOIN staff st ON st.id = b.staff_id`;

  if (conditions.length > 0) sql += ` WHERE ` + conditions.join(' AND ');
  sql += ` ORDER BY b.starts_at DESC, b.id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rawRows = await all<RawAdminBookingDbRow>(db, sql, ...binds);
  const rows = rawRows.map(mapRawToAdminBookingDto);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.startsAt, last.id) : null;

  return { items, nextCursor };
}

/* ── Admin Dashboard (single combined query, contract §95) ───── */

export async function getAdminDashboard(
  db: Queryable,
  todayStartIso: string,
  todayEndIso: string,
): Promise<AdminDashboardDto> {
  const [counts, rawTodayBookings] = await Promise.all([
    one<{
      pending: number;
      confirmed: number;
      todayTotal: number;
      totalCustomers: number;
      activeServices: number;
    }>(
      db,
      `SELECT
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
         SUM(CASE WHEN starts_at >= ? AND starts_at < ? THEN 1 ELSE 0 END) AS todayTotal,
         (SELECT COUNT(*) FROM customers) AS totalCustomers,
         (SELECT COUNT(*) FROM services WHERE active = 1) AS activeServices
       FROM bookings`,
      todayStartIso,
      todayEndIso,
    ),
    all<RawAdminBookingDbRow>(
      db,
      `SELECT b.id, b.reference, b.customer_id AS customerId,
              c.name AS customerName, c.phone AS customerPhone,
              b.service_id AS serviceId, s.name AS serviceName,
              s.slug AS serviceSlug, s.duration_minutes AS serviceDurationMinutes,
              b.staff_id AS staffId, st.name AS staffName,
              b.pricing_category AS pricingCategory,
              b.starts_at AS startsAt, b.ends_at AS endsAt,
              b.status, b.quoted_amount AS quotedAmount,
              b.discount_amount AS discountAmount, b.currency,
              b.customer_note AS customerNote, b.admin_note AS adminNote,
              b.rejection_reason AS rejectionReason,
              b.created_at AS createdAt, b.updated_at AS updatedAt
         FROM bookings b
         JOIN customers c ON c.id = b.customer_id
         JOIN services s ON s.id = b.service_id
    LEFT JOIN staff st ON st.id = b.staff_id
        WHERE b.starts_at >= ? AND b.starts_at < ?
        ORDER BY b.starts_at ASC
        LIMIT 50`,
      todayStartIso,
      todayEndIso,
    ),
  ]);

  const todayBookings = rawTodayBookings.map(mapRawToAdminBookingDto);

  return {
    date: todayStartIso.slice(0, 10),
    today: {
      total: counts?.todayTotal ?? 0,
      pending: counts?.pending ?? 0,
      confirmed: counts?.confirmed ?? 0,
    },
    counts: {
      pendingBookings: counts?.pending ?? 0,
      totalCustomers: counts?.totalCustomers ?? 0,
      activeServices: counts?.activeServices ?? 0,
    },
    todayBookings,
  };
}

/* ── Audit & Notifications ────────────────────────────────────── */

export async function listAuditLogs(
  db: Queryable,
  limit = 50,
  cursor?: string,
): Promise<Page<AuditLogRowDto>> {
  const safeLimit = clampLimit(limit, 50, 100);
  let sql = `SELECT a.id, a.actor_id AS actorId, u.display_name AS actorName,
                    a.action, a.entity_type AS entityType, a.entity_id AS entityId,
                    a.created_at AS createdAt
               FROM audit_logs a
          LEFT JOIN users u ON u.id = a.actor_id`;
  const binds: (string | number)[] = [];

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      sql += ` WHERE a.created_at < ? OR (a.created_at = ? AND a.id < ?)`;
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  sql += ` ORDER BY a.created_at DESC, a.id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rows = await all<AuditLogRowDto>(db, sql, ...binds);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

  return { items, nextCursor };
}

export async function listNotificationEvents(
  db: Queryable,
  limit = 50,
  cursor?: string,
): Promise<Page<NotificationEventRowDto>> {
  const safeLimit = clampLimit(limit, 50, 100);
  let sql = `SELECT id, dedupe_key AS dedupeKey, event_type AS eventType,
                    booking_id AS bookingId, channel, status, attempts,
                    last_error AS lastError, created_at AS createdAt, sent_at AS sentAt
               FROM notification_events`;
  const binds: (string | number)[] = [];

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      sql += ` WHERE created_at < ? OR (created_at = ? AND id < ?)`;
      binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
    }
  }

  sql += ` ORDER BY created_at DESC, id DESC LIMIT ?`;
  binds.push(safeLimit + 1);

  const rows = await all<NotificationEventRowDto>(db, sql, ...binds);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

  return { items, nextCursor };
}

export async function writeAuditLog(
  db: Queryable,
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
): Promise<void> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await run(
    db,
    `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    actorId,
    action,
    entityType,
    entityId,
    createdAt,
  );
}
