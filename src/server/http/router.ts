/** Central HTTP router for /api/v1 (contract §5, §6, §159).
 *
 *  Both the production Astro middleware/API routes and the integration-test worker
 *  delegate here. Keeps a single authoritative route table.
 *
 *  Envelope: ok() / fail() / handleRoute(). Never leak stack traces.
 */

import { env } from 'cloudflare:workers';
import { requirePermission } from '../auth/guard';
import { createSession, revokeSession } from '../auth/session';
import {
  buildSessionCookie,
  clearSessionCookie,
  isSecureRequest,
} from '../../lib/security/session-cookie';
import { consumeRateLimit, parseRateLimitPolicy } from '../../lib/security/rate-limit';
import { verifyPassword } from '../../lib/security/password';
import { resolveCanonicalOrigin } from '../../lib/seo/canonical';
import { getSearchParams, handleRoute, ok, okWithStatus, parseBody, parseValue } from '../../lib/api/respond';
import { ApiError } from '../../lib/api/errors';
import {
  createBookingSchema,
  loginSchema,
  pricingCategorySchema,
  slugSchema,
  localDateSchema,
  updateServiceSchema,
  createServiceSchema,
  updatePricingSchema,
  updateStaffSchema,
  createStaffSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
  updateFaqSchema,
  createFaqSchema,
  updateSettingsSchema,
  rescheduleBookingSchema,
  rejectBookingSchema,
  updateBookingSchema,
  updateCustomerSchema,
  updateWeekdayHoursSchema,
  createExceptionSchema,
  walkinBookSchema,
  clinicalRecordSchema,
  accountingTransactionSchema,
  sendSmsSchema,
  lotteryCampaignSchema,
  lotteryDrawSchema,
  discountFestivalSchema,
  instagramSettingsSchema,
} from '../../domain/validation/schemas';
import {
  findPublicBlogPostBySlug,
  findPublicServiceBySlug,
  getAdminDashboard,
  getAllSettings,
  getPublicSettings,
  getSettingValue,
  listAdminBlogPosts,
  listAdminBookings,
  listAdminCustomers,
  listAdminFaq,
  listAdminServices,
  listAdminStaff,
  listAuditLogs,
  listBusinessHours,
  listNotificationEvents,
  listPublicBlogPosts,
  listPublicFaq,
  listPublicServices,
  listScheduleExceptionsForDate,
  findOccupiedSlotStarts,
  toHoursRows,
  writeAuditLog,
} from '../repositories';
import { createBooking, rescheduleBooking, transitionBooking } from '../booking';
import { calculateAvailability } from '../../domain/schedule/availability';
import {
  isPrivateSettingKey,
  isSettingKey,
  parseOperationalSettings,
} from '../../domain/settings/settings.types';
import { slotStaffKey } from '../../domain/booking/booking.slots';
import { dispatchNotification } from '../notifications';
import { all, one, run } from '../../db/query';
import { localDateOf } from '../../lib/datetime/timezone';

export async function handleApiRequest(
  request: Request,
  locals: App.Locals,
  pathname: string,
): Promise<Response> {
  const method = request.method;

  return handleRoute(async () => {
    /* ── Health check (§200) ─────────────────────────────────── */
    if (pathname === '/api/health' && method === 'GET') {
      let dbStatus: 'ok' | 'error' = 'ok';
      try {
        await one(env.DB, 'SELECT 1');
      } catch {
        dbStatus = 'error';
      }
      return ok({
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        database: dbStatus,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    /* ── Auth: Login / Logout / Me (§53, §56, §57) ───────────── */
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const clientIp = request.headers.get('cf-connecting-ip') ?? 'local';
      const rlPolicyRaw = (await getSettingValue(env.DB, 'rate_limit_login')) ?? undefined;
      const rlPolicy = parseRateLimitPolicy(rlPolicyRaw, { limit: 10, windowSeconds: 600 });
      const rl = await consumeRateLimit(env.DB, `login:${clientIp}`, rlPolicy, new Date());
      if (!rl.allowed) {
        throw new ApiError('RATE_LIMITED', 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً بعداً امتحان کنید.');
      }

      const body = await parseBody(request, loginSchema);
      const user = await one<{
        id: string;
        email: string;
        displayName: string;
        passwordHash: string;
        active: number;
      }>(
        env.DB,
        `SELECT id, email, display_name AS displayName, password_hash AS passwordHash, active
           FROM users
          WHERE email = ?`,
        body.email,
      );

      if (!user || user.active !== 1) {
        throw new ApiError('FORBIDDEN', 'ایمیل یا رمز عبور اشتباه است.');
      }

      const valid = await verifyPassword(body.password, user.passwordHash);
      if (!valid) {
        throw new ApiError('FORBIDDEN', 'ایمیل یا رمز عبور اشتباه است.');
      }

      const session = await createSession(env.DB, user.id);
      const isSecure = isSecureRequest(request);
      const cookieHeader = buildSessionCookie(session.token, {
        maxAgeSeconds: 168 * 3600,
        secure: isSecure,
      });

      await writeAuditLog(env.DB, user.id, 'admin.login', 'user', user.id);

      const me = await one<{ id: string; email: string; displayName: string }>(
        env.DB,
        `SELECT id, email, display_name AS displayName FROM users WHERE id = ?`,
        user.id,
      );

      const res = ok(me);
      res.headers.set('set-cookie', cookieHeader);
      return res;
    }

    if (pathname === '/api/v1/auth/logout' && method === 'POST') {
      if (locals.auth) {
        const rawToken = request.headers.get('cookie')?.match(/tl_session=([^;]+)/)?.[1];
        if (rawToken) await revokeSession(env.DB, rawToken);
        await writeAuditLog(env.DB, locals.auth.id, 'admin.logout', 'user', locals.auth.id);
      }
      const res = ok({ success: true });
      res.headers.set('set-cookie', clearSessionCookie(isSecureRequest(request)));
      return res;
    }

    if (pathname === '/api/v1/me' && method === 'GET') {
      if (!locals.auth) throw new ApiError('AUTH_REQUIRED', 'ابتدا وارد حساب مدیریت شوید.');
      return ok({
        id: locals.auth.id,
        email: locals.auth.email,
        displayName: locals.auth.displayName,
        roles: locals.auth.roles,
        permissions: locals.auth.permissions,
      });
    }

    /* ── Public: Services & Pricing (§5) ─────────────────────── */
    if (pathname === '/api/v1/services' && method === 'GET') {
      const services = await listPublicServices(env.DB);
      return ok(services);
    }

    if (pathname.startsWith('/api/v1/services/') && method === 'GET') {
      const slug = pathname.slice('/api/v1/services/'.length);
      const service = await findPublicServiceBySlug(env.DB, slug);
      if (!service) throw new ApiError('NOT_FOUND', 'خدمت مورد نظر یافت نشد.');
      return ok(service);
    }

    /* ── Public: Availability (§16, §17) ─────────────────────── */
    if (pathname === '/api/v1/availability' && method === 'GET') {
      const q = getSearchParams(request);
      const category = parseValue(pricingCategorySchema, q.category, 'دسته قیمتی انتخاب‌شده معتبر نیست.');
      const localDate = parseValue(localDateSchema, q.date, 'تاریخ انتخاب‌شده معتبر نیست.');
      const staffId = typeof q.staffId === 'string' && q.staffId ? q.staffId.slice(0, 64) : null;

      const servicesParam =
        typeof q.services === 'string' && q.services
          ? q.services
          : typeof q.service === 'string'
            ? q.service
            : '';
      const rawSlugs = servicesParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (rawSlugs.length === 0) {
        throw new ApiError('VALIDATION_ERROR', 'حداقل یک خدمت برای استعلام الزامی است.');
      }
      if (rawSlugs.length > 20) {
        throw new ApiError('VALIDATION_ERROR', 'حداکثر ۲۰ خدمت در هر درخواست ظرفیت مجاز است.');
      }
      /* De-duplicate: a repeated slug would otherwise be summed twice into
         durationMinutes and produce slots of the wrong length. */
      const slugs = [
        ...new Set(rawSlugs.map((s) => parseValue(slugSchema, s, 'نام خدمت انتخاب‌شده معتبر نیست.'))),
      ];

      const placeholders = slugs.map(() => '?').join(',');
      const services = await all<{
        id: string;
        slug: string;
        name: string;
        durationMinutes: number;
        active: number;
      }>(
        env.DB,
        `SELECT id, slug, name, duration_minutes AS durationMinutes, active
           FROM services
          WHERE slug IN (${placeholders})`,
        ...slugs,
      );
      if (services.length === 0) throw new ApiError('NOT_FOUND', 'خدمت یا خدمات یافت نشد.');

      // Preserve the requested order of slugs
      services.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));

      const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);

      const [rawSettings, hours, exceptions, occupied] = await Promise.all([
        getPublicSettings(env.DB),
        listBusinessHours(env.DB),
        listScheduleExceptionsForDate(env.DB, localDate),
        findOccupiedSlotStarts(
          env.DB,
          slotStaffKey(staffId),
          `${localDate}T00:00:00.000Z`,
          `${localDate}T23:59:59.999Z`,
        ),
      ]);
      const settings = parseOperationalSettings(rawSettings);

      const availability = calculateAvailability({
        localDate,
        timezone: settings.timezone,
        hours: toHoursRows(hours),
        exceptions,
        durationMinutes: totalDuration,
        granularityMinutes: settings.slotGranularityMinutes,
        bufferMinutes: settings.bookingBufferMinutes,
        occupiedSlots: new Set(occupied),
        nowIso: new Date().toISOString(),
        minLeadMinutes: settings.minLeadMinutes,
      });

      return ok({
        serviceSlug: slugs[0],
        serviceSlugs: slugs,
        serviceNames: services.map((s) => s.name),
        date: localDate,
        pricingCategory: category,
        durationMinutes: totalDuration,
        granularityMinutes: settings.slotGranularityMinutes,
        timezone: settings.timezone,
        slots: availability,
      });
    }

    /* ── Public: Bookings POST (§13, §15, §161) ───────────────── */
    if (pathname === '/api/v1/bookings' && method === 'POST') {
      const clientIp = request.headers.get('cf-connecting-ip') ?? 'local';
      const rlPolicyRaw = (await getSettingValue(env.DB, 'rate_limit_booking')) ?? undefined;
      const rlPolicy = parseRateLimitPolicy(rlPolicyRaw, { limit: 20, windowSeconds: 600 });
      const rl = await consumeRateLimit(env.DB, `booking:${clientIp}`, rlPolicy, new Date());
      if (!rl.allowed) {
        throw new ApiError('RATE_LIMITED', 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.');
      }

      const body = await parseBody(request, createBookingSchema);
      const booking = await createBooking(env.DB, {
        serviceSlug: body.serviceSlug,
        serviceSlugs: body.serviceSlugs,
        pricingCategory: body.pricingCategory,
        startsAtIso: body.startsAt,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        customerNote: body.note,
        idempotencyKey: body.idempotencyKey,
      });

      // Fire notifications in the background (§210: failure must not roll back booking).
      const notificationPayload = {
        eventType: 'booking.created' as const,
        bookingId: booking.bookingId,
        reference: booking.reference,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        serviceName: booking.serviceName,
        pricingCategory: booking.pricingCategory,
        startsAtIso: booking.startsAt,
        quotedAmount: booking.quotedAmount,
        discountAmount: booking.discountAmount,
        currency: booking.currency,
      };

      try {
        await dispatchNotification(env.DB, notificationPayload, 'telegram');
      } catch (err) {
        console.error('Notification dispatch failure:', err);
      }

      return okWithStatus(booking, 201);
    }

    /* ── Public: Blog (§29, §30) ─────────────────────────────── */
    if (pathname === '/api/v1/blog' && method === 'GET') {
      const q = getSearchParams(request);
      const limit = q.limit ? Number(q.limit) : 10;
      const cursor = typeof q.cursor === 'string' ? q.cursor : undefined;
      const page = await listPublicBlogPosts(env.DB, limit, cursor);
      return ok(page);
    }

    if (pathname.startsWith('/api/v1/blog/') && method === 'GET') {
      const slug = pathname.slice('/api/v1/blog/'.length);
      const post = await findPublicBlogPostBySlug(env.DB, slug);
      if (!post) throw new ApiError('NOT_FOUND', 'مقاله مورد نظر یافت نشد.');
      return ok(post);
    }

    /* ── Public: Clinic & Settings (§34, §76) ─────────────────── */
    if (pathname === '/api/v1/clinic' && method === 'GET') {
      const [settings, hours] = await Promise.all([
        getPublicSettings(env.DB),
        listBusinessHours(env.DB),
      ]);
      return ok({ settings, hours });
    }

    if (pathname === '/api/v1/settings/public' && method === 'GET') {
      const settings = await getPublicSettings(env.DB);
      return ok(settings);
    }

    if (pathname === '/api/v1/faq' && method === 'GET') {
      const faq = await listPublicFaq(env.DB);
      return ok(faq);
    }

    /* ══════════════════════════════════════════════════════════
       ADMIN API ROUTES (all require permission checks, §54)
       ══════════════════════════════════════════════════════════ */

    /* ── Admin: Dashboard (§22, §23, §95) ─────────────────────── */
    if (pathname === '/api/v1/admin/dashboard' && method === 'GET') {
      requirePermission(locals, 'booking.read');
      const rawSettings = await getPublicSettings(env.DB);
      const tz = rawSettings.timezone ?? 'Asia/Tehran';
      const today = localDateOf(new Date().toISOString(), tz);
      const todayStartIso = `${today}T00:00:00.000Z`;
      const todayEndIso = `${today}T23:59:59.999Z`;

      const dashboard = await getAdminDashboard(env.DB, todayStartIso, todayEndIso);
      return ok(dashboard);
    }

    /* ── Admin: Bookings list & actions (§24, §25, §26) ──────── */
    if (pathname === '/api/v1/admin/bookings' && method === 'GET') {
      requirePermission(locals, 'booking.read');
      const q = getSearchParams(request);
      const bookings = await listAdminBookings(env.DB, {
        status: typeof q.status === 'string' ? q.status : undefined,
        staffId: typeof q.staffId === 'string' ? q.staffId : undefined,
        serviceId: typeof q.serviceId === 'string' ? q.serviceId : undefined,
        fromStartsAt: typeof q.fromStartsAt === 'string' ? q.fromStartsAt : undefined,
        toStartsAt: typeof q.toStartsAt === 'string' ? q.toStartsAt : undefined,
        search: typeof q.q === 'string' ? q.q : undefined,
        limit: q.limit ? Number(q.limit) : 20,
        cursor: typeof q.cursor === 'string' ? q.cursor : undefined,
      });
      return ok(bookings);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/accept$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.accept');
      const id = pathname.split('/')[5]!;
      const result = await transitionBooking(env.DB, id, 'confirmed', auth.id);
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/reject$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.reject');
      const id = pathname.split('/')[5]!;
      const body = await parseBody(request, rejectBookingSchema);
      const result = await transitionBooking(env.DB, id, 'rejected', auth.id, body.reason);
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/cancel$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.cancel');
      const id = pathname.split('/')[5]!;
      const result = await transitionBooking(env.DB, id, 'cancelled', auth.id);
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/complete$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.complete');
      const id = pathname.split('/')[5]!;
      const result = await transitionBooking(env.DB, id, 'completed', auth.id);
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/no-show$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.complete');
      const id = pathname.split('/')[5]!;
      const result = await transitionBooking(env.DB, id, 'no_show', auth.id);
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/reschedule$/) && method === 'POST') {
      const auth = requirePermission(locals, 'booking.reschedule');
      const id = pathname.split('/')[5]!;
      const body = await parseBody(request, rescheduleBookingSchema);
      const result = await rescheduleBooking(
        env.DB,
        id,
        body.startsAt,
        body.staffId ?? null,
        auth.id,
      );
      return ok(result);
    }

    if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+$/) && method === 'PUT') {
      const auth = requirePermission(locals, 'booking.accept');
      const id = pathname.split('/')[5]!;
      const body = await parseBody(request, updateBookingSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE bookings
            SET admin_note = COALESCE(?, admin_note),
                customer_note = COALESCE(?, customer_note),
                quoted_amount = COALESCE(?, quoted_amount),
                updated_at = ?
          WHERE id = ?`,
        body.adminNote ?? null,
        body.customerNote ?? null,
        body.quotedAmount ?? null,
        nowIso,
        id,
      );

      await writeAuditLog(env.DB, auth.id, 'booking.updated', 'booking', id);
      return ok({ id, updated: true });
    }

    /* ── Admin: Services & Pricing (§123, §124) ───────────────── */
    if (pathname === '/api/v1/admin/services' && method === 'GET') {
      requirePermission(locals, 'service.read');
      const services = await listAdminServices(env.DB);
      return ok(services);
    }

    if (pathname === '/api/v1/admin/services' && method === 'POST') {
      const auth = requirePermission(locals, 'service.write');
      const body = await parseBody(request, createServiceSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO services (id, name, slug, description, short_description, duration_minutes, active, featured, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.name,
        body.slug,
        body.description ?? '',
        body.shortDescription ?? null,
        body.durationMinutes,
        body.active ? 1 : 0,
        body.featured ? 1 : 0,
        body.displayOrder ?? 0,
        nowIso,
        nowIso,
      );

      await writeAuditLog(env.DB, auth.id, 'service.created', 'service', id);
      return okWithStatus({ id }, 201);
    }

    if (pathname.startsWith('/api/v1/admin/services/') && method === 'PUT') {
      const auth = requirePermission(locals, 'service.write');
      const id = pathname.slice('/api/v1/admin/services/'.length);
      const body = await parseBody(request, updateServiceSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE services
            SET name = COALESCE(?, name),
                slug = COALESCE(?, slug),
                description = COALESCE(?, description),
                short_description = COALESCE(?, short_description),
                duration_minutes = COALESCE(?, duration_minutes),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                featured = CASE WHEN ? IS NOT NULL THEN ? ELSE featured END,
                display_order = COALESCE(?, display_order),
                updated_at = ?
          WHERE id = ?`,
        body.name ?? null,
        body.slug ?? null,
        body.description ?? null,
        body.shortDescription ?? null,
        body.durationMinutes ?? null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        body.featured !== undefined ? (body.featured ? 1 : 0) : null,
        body.featured !== undefined ? (body.featured ? 1 : 0) : null,
        body.displayOrder ?? null,
        nowIso,
        id,
      );

      await writeAuditLog(env.DB, auth.id, 'service.updated', 'service', id);
      return ok({ id, updated: true });
    }

    if (pathname.startsWith('/api/v1/admin/pricing/') && method === 'PUT') {
      const auth = requirePermission(locals, 'pricing.write');
      const serviceId = pathname.slice('/api/v1/admin/pricing/'.length);
      const body = await parseBody(request, updatePricingSchema);
      const nowIso = new Date().toISOString();

      // Upsert price row for this service + category
      const existing = await one<{ id: string }>(
        env.DB,
        `SELECT id FROM service_prices WHERE service_id = ? AND pricing_category = ?`,
        serviceId,
        body.pricingCategory,
      );

      if (existing) {
        await run(
          env.DB,
          `UPDATE service_prices SET amount = ?, currency = ?, updated_at = ? WHERE id = ?`,
          body.amount,
          body.currency ?? 'IRT',
          nowIso,
          existing.id,
        );
      } else {
        await run(
          env.DB,
          `INSERT INTO service_prices (id, service_id, pricing_category, amount, currency, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          crypto.randomUUID(),
          serviceId,
          body.pricingCategory,
          body.amount,
          body.currency ?? 'IRT',
          nowIso,
          nowIso,
        );
      }

      await writeAuditLog(env.DB, auth.id, 'pricing.updated', 'service_price', serviceId);
      return ok({ serviceId, updated: true });
    }

    /* ── Admin: Staff (§21) ───────────────────────────────────── */
    if (pathname === '/api/v1/admin/staff' && method === 'GET') {
      requirePermission(locals, 'staff.read');
      const staff = await listAdminStaff(env.DB);
      return ok(staff);
    }

    if (pathname === '/api/v1/admin/staff' && method === 'POST') {
      const auth = requirePermission(locals, 'staff.write');
      const body = await parseBody(request, createStaffSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO staff (id, name, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        id,
        body.name,
        body.active ? 1 : 0,
        nowIso,
        nowIso,
      );

      if (body.serviceIds && body.serviceIds.length > 0) {
        for (const sId of body.serviceIds) {
          await run(
            env.DB,
            `INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)`,
            id,
            sId,
          );
        }
      }

      await writeAuditLog(env.DB, auth.id, 'staff.created', 'staff', id);
      return okWithStatus({ id }, 201);
    }

    if (pathname.startsWith('/api/v1/admin/staff/') && method === 'PUT') {
      const auth = requirePermission(locals, 'staff.write');
      const id = pathname.slice('/api/v1/admin/staff/'.length);
      const body = await parseBody(request, updateStaffSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE staff
            SET name = COALESCE(?, name),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                updated_at = ?
          WHERE id = ?`,
        body.name ?? null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        nowIso,
        id,
      );

      if (body.serviceIds) {
        await run(env.DB, `DELETE FROM staff_services WHERE staff_id = ?`, id);
        for (const sId of body.serviceIds) {
          await run(
            env.DB,
            `INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)`,
            id,
            sId,
          );
        }
      }

      await writeAuditLog(env.DB, auth.id, 'staff.updated', 'staff', id);
      return ok({ id, updated: true });
    }

    /* ── Admin: Customers (§27, §28) ─────────────────────────── */
    if (pathname === '/api/v1/admin/customers' && method === 'GET') {
      requirePermission(locals, 'customer.read');
      const q = getSearchParams(request);
      const customers = await listAdminCustomers(
        env.DB,
        q.limit ? Number(q.limit) : 20,
        typeof q.cursor === 'string' ? q.cursor : undefined,
        typeof q.q === 'string' ? q.q : undefined,
      );
      return ok(customers);
    }

    if (pathname.startsWith('/api/v1/admin/customers/') && method === 'PUT') {
      const auth = requirePermission(locals, 'customer.update');
      const id = pathname.slice('/api/v1/admin/customers/'.length);
      const body = await parseBody(request, updateCustomerSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE customers
            SET name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                pricing_category = COALESCE(?, pricing_category),
                email = COALESCE(?, email),
                note = COALESCE(?, note),
                updated_at = ?
          WHERE id = ?`,
        body.name ?? null,
        body.phone ?? null,
        body.pricingCategory ?? null,
        body.email ?? null,
        body.note ?? null,
        nowIso,
        id,
      );

      await writeAuditLog(env.DB, auth.id, 'customer.updated', 'customer', id);
      return ok({ id, updated: true });
    }

    /* ── Admin: Blog (§29, §137) ─────────────────────────────── */
    if (pathname === '/api/v1/admin/blog' && method === 'GET') {
      requirePermission(locals, 'blog.read');
      const q = getSearchParams(request);
      const posts = await listAdminBlogPosts(
        env.DB,
        q.limit ? Number(q.limit) : 20,
        typeof q.cursor === 'string' ? q.cursor : undefined,
      );
      return ok(posts);
    }

    if (pathname === '/api/v1/admin/blog' && method === 'POST') {
      const auth = requirePermission(locals, 'blog.write');
      const body = await parseBody(request, createBlogPostSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO blog_posts (
           id, title, slug, excerpt, content, cover_image, category_id,
           author, status, published_at, seo_title, seo_description,
           canonical_url, og_title, og_description, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.title,
        body.slug,
        body.excerpt ?? '',
        body.content,
        body.coverImage ?? null,
        body.categoryId ?? null,
        body.author ?? auth.displayName,
        body.status ?? 'draft',
        body.publishedAt ?? (body.status === 'published' ? nowIso : null),
        body.seoTitle ?? null,
        body.seoDescription ?? null,
        body.canonicalUrl ?? null,
        body.ogTitle ?? null,
        body.ogDescription ?? null,
        nowIso,
        nowIso,
      );

      await writeAuditLog(env.DB, auth.id, 'blog.created', 'blog_post', id);
      return okWithStatus({ id }, 201);
    }

    if (pathname.startsWith('/api/v1/admin/blog/') && method === 'PUT') {
      const auth = requirePermission(locals, 'blog.write');
      const id = pathname.slice('/api/v1/admin/blog/'.length);
      const body = await parseBody(request, updateBlogPostSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE blog_posts
            SET title = COALESCE(?, title),
                slug = COALESCE(?, slug),
                excerpt = COALESCE(?, excerpt),
                content = COALESCE(?, content),
                cover_image = COALESCE(?, cover_image),
                category_id = COALESCE(?, category_id),
                author = COALESCE(?, author),
                status = COALESCE(?, status),
                published_at = COALESCE(?, published_at),
                seo_title = COALESCE(?, seo_title),
                seo_description = COALESCE(?, seo_description),
                canonical_url = COALESCE(?, canonical_url),
                og_title = COALESCE(?, og_title),
                og_description = COALESCE(?, og_description),
                updated_at = ?
          WHERE id = ?`,
        body.title ?? null,
        body.slug ?? null,
        body.excerpt ?? null,
        body.content ?? null,
        body.coverImage ?? null,
        body.categoryId ?? null,
        body.author ?? null,
        body.status ?? null,
        body.publishedAt ?? null,
        body.seoTitle ?? null,
        body.seoDescription ?? null,
        body.canonicalUrl ?? null,
        body.ogTitle ?? null,
        body.ogDescription ?? null,
        nowIso,
        id,
      );

      await writeAuditLog(env.DB, auth.id, 'blog.updated', 'blog_post', id);
      return ok({ id, updated: true });
    }

    if (pathname.startsWith('/api/v1/admin/blog/') && method === 'DELETE') {
      const auth = requirePermission(locals, 'blog.write');
      const id = pathname.slice('/api/v1/admin/blog/'.length);

      await run(env.DB, `DELETE FROM blog_posts WHERE id = ?`, id);
      await writeAuditLog(env.DB, auth.id, 'blog.deleted', 'blog_post', id);
      return ok({ id, deleted: true });
    }

    /* ── Admin: FAQ (§256) ────────────────────────────────────── */
    if (pathname === '/api/v1/admin/faq' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const faq = await listAdminFaq(env.DB);
      return ok(faq);
    }

    if (pathname === '/api/v1/admin/faq' && method === 'POST') {
      const auth = requirePermission(locals, 'settings.write');
      const body = await parseBody(request, createFaqSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO faq_items (id, question, answer, display_order, active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        body.question,
        body.answer,
        body.displayOrder ?? 0,
        body.active ? 1 : 0,
        nowIso,
      );

      await writeAuditLog(env.DB, auth.id, 'faq.created', 'faq', id);
      return okWithStatus({ id }, 201);
    }

    if (pathname.startsWith('/api/v1/admin/faq/') && method === 'PUT') {
      const auth = requirePermission(locals, 'settings.write');
      const id = pathname.slice('/api/v1/admin/faq/'.length);
      const body = await parseBody(request, updateFaqSchema);
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `UPDATE faq_items
            SET question = COALESCE(?, question),
                answer = COALESCE(?, answer),
                display_order = COALESCE(?, display_order),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                updated_at = ?
          WHERE id = ?`,
        body.question ?? null,
        body.answer ?? null,
        body.displayOrder ?? null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        nowIso,
        id,
      );

      await writeAuditLog(env.DB, auth.id, 'faq.updated', 'faq', id);
      return ok({ id, updated: true });
    }

    /* ── Admin: Schedule & Hours ───────────────────────────────── */
    if (pathname.match(/^\/api\/v1\/admin\/schedule\/hours\/[0-6]$/) && method === 'PUT') {
      const auth = requirePermission(locals, 'schedule.write');
      const weekday = Number(pathname.split('/')[6]);
      const body = await parseBody(request, updateWeekdayHoursSchema);

      await run(env.DB, `DELETE FROM business_hours WHERE weekday = ?`, weekday);

      if (body.isOpen && body.opensAt && body.closesAt) {
        await run(
          env.DB,
          `INSERT INTO business_hours (id, weekday, opens_at, closes_at, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          crypto.randomUUID(),
          weekday,
          body.opensAt,
          body.closesAt,
          0,
        );
      }

      await writeAuditLog(env.DB, auth.id, 'schedule.updated', 'business_hours', String(weekday));
      return ok({ weekday, updated: true });
    }

    if (pathname === '/api/v1/admin/schedule/exceptions' && method === 'POST') {
      const auth = requirePermission(locals, 'schedule.write');
      const body = await parseBody(request, createExceptionSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO schedule_exceptions (id, exception_date, kind, opens_at, closes_at, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.exceptionDate,
        body.kind,
        body.opensAt ?? null,
        body.closesAt ?? null,
        body.note ?? null,
        nowIso,
      );

      await writeAuditLog(env.DB, auth.id, 'schedule_exception.created', 'schedule_exception', id);
      return okWithStatus({ id }, 201);
    }

    if (pathname.startsWith('/api/v1/admin/schedule/exceptions/') && method === 'DELETE') {
      const auth = requirePermission(locals, 'schedule.write');
      const id = pathname.slice('/api/v1/admin/schedule/exceptions/'.length);

      await run(env.DB, `DELETE FROM schedule_exceptions WHERE id = ?`, id);
      await writeAuditLog(env.DB, auth.id, 'schedule_exception.deleted', 'schedule_exception', id);
      return ok({ id, deleted: true });
    }

    /* ── Admin: Settings (§74, §76, §121) ─────────────────────── */
    if (pathname === '/api/v1/admin/settings' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const settings = await getAllSettings(env.DB);
      return ok(settings);
    }

    if (pathname === '/api/v1/admin/settings' && method === 'PUT') {
      const auth = requirePermission(locals, 'settings.write');
      const body = await parseBody(request, updateSettingsSchema);
      const nowIso = new Date().toISOString();

      /* Only registered keys may be written, and the scope is taken from the
         registry — never from the payload. Previously every key was upserted with
         scope='public', so saving the settings form for the first time published
         `sms_api_key` through the unauthenticated GET /api/v1/settings/public. */
      const unknown = Object.keys(body).filter((key) => !isSettingKey(key));
      if (unknown.length > 0) {
        throw new ApiError('VALIDATION_ERROR', 'کلید تنظیمات ناشناخته است.', {
          fields: Object.fromEntries(unknown.map((key) => [key, ['این کلید تنظیمات شناخته‌شده نیست.']])),
        });
      }

      for (const [key, value] of Object.entries(body)) {
        if (value === undefined || !isSettingKey(key)) continue;
        const scope = isPrivateSettingKey(key) ? 'private' : 'public';
        await run(
          env.DB,
          `INSERT INTO settings (key, value, scope, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, scope = excluded.scope, updated_at = excluded.updated_at`,
          key,
          String(value),
          scope,
          nowIso,
        );
      }

      await writeAuditLog(env.DB, auth.id, 'settings.updated', 'settings', null);
      return ok({ updated: true });
    }

    /* ── Admin: Audit & Notifications (§73, §52) ─────────────── */
    if (pathname === '/api/v1/admin/audit' && method === 'GET') {
      requirePermission(locals, 'audit.read');
      const q = getSearchParams(request);
      const logs = await listAuditLogs(
        env.DB,
        q.limit ? Number(q.limit) : 50,
        typeof q.cursor === 'string' ? q.cursor : undefined,
      );
      return ok(logs);
    }

    if (pathname === '/api/v1/admin/notifications' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const q = getSearchParams(request);
      const events = await listNotificationEvents(
        env.DB,
        q.limit ? Number(q.limit) : 50,
        typeof q.cursor === 'string' ? q.cursor : undefined,
      );
      return ok(events);
    }

    /* ── Admin: Walk-in & Next Session Scheduler ──────────────── */
    if (pathname === '/api/v1/admin/walkin/book' && method === 'POST') {
      const auth = requirePermission(locals, 'booking.accept');
      const body = await parseBody(request, walkinBookSchema);
      const nowIso = new Date().toISOString();

      let customerId = body.customerId;
      if (!customerId && body.customerPhone) {
        const existingCust = await one<{ id: string }>(
          env.DB,
          `SELECT id FROM customers WHERE phone = ?`,
          body.customerPhone,
        );
        if (existingCust) {
          customerId = existingCust.id;
        } else {
          customerId = crypto.randomUUID();
          await run(
            env.DB,
            `INSERT INTO customers (id, name, phone, pricing_category, note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            customerId,
            body.customerName || 'مراجع حضوری',
            body.customerPhone,
            body.pricingCategory || 'female',
            body.note || 'ثبت حضوری در کلینیک',
            nowIso,
            nowIso,
          );
        }
      }

      if (!customerId) {
        // Fallback to first existing customer or create a generic walkin customer
        const fallbackCust = await one<{ id: string }>(env.DB, `SELECT id FROM customers LIMIT 1`);
        if (fallbackCust) {
          customerId = fallbackCust.id;
        } else {
          customerId = crypto.randomUUID();
          await run(
            env.DB,
            `INSERT INTO customers (id, name, phone, pricing_category, note, created_at, updated_at)
             VALUES (?, 'مراجع حضوری', '09035555090', 'female', 'ثبت حضوری در کلینیک', ?, ?)`,
            customerId,
            nowIso,
            nowIso,
          );
        }
      }

      const serviceId = body.serviceId || 'svc_face';
      let service = await one<{ id: string; name: string; duration_minutes: number }>(
        env.DB,
        `SELECT id, name, duration_minutes FROM services WHERE id = ? OR slug = ?`,
        serviceId,
        serviceId,
      );
      if (!service) {
        service = (await one<{ id: string; name: string; duration_minutes: number }>(
          env.DB,
          `SELECT id, name, duration_minutes FROM services LIMIT 1`,
        )) ?? { id: 'svc_face', name: 'لیزر کاربردی', duration_minutes: 30 };
      }

      const bookingId = crypto.randomUUID();
      const ref = 'TL-W' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const startsAt = body.startsAt || nowIso;
      const durationMs = (service.duration_minutes || 30) * 60 * 1000;
      const endsAt = new Date(new Date(startsAt).getTime() + durationMs).toISOString();
      const amount = Number(body.amount) || 0;

      await run(
        env.DB,
        `INSERT INTO bookings (
           id, reference, customer_id, service_id, pricing_category,
           starts_at, ends_at, status, quoted_amount, discount_amount,
           currency, customer_note, admin_note, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, 0, 'IRR_TOMAN', ?, ?, ?, ?)`,
        bookingId,
        ref,
        customerId,
        service.id,
        body.pricingCategory || 'female',
        startsAt,
        endsAt,
        amount,
        'پذیرش حضوری در کلینیک',
        body.adminNote || 'انجام‌شده با موفقیت',
        nowIso,
        nowIso,
      );

      const txId = crypto.randomUUID();
      await run(
        env.DB,
        `INSERT INTO accounting_transactions (
           id, reference, customer_id, booking_id, amount, type, method, category, description, tracking_number, created_at
         ) VALUES (?, ?, ?, ?, ?, 'income', ?, 'laser_service', ?, ?, ?)`,
        txId,
        'TX-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        customerId,
        bookingId,
        amount,
        body.paymentMethod || 'pos',
        `پذیرش حضوری ${service.name}`,
        body.trackingNumber || 'POS-' + Math.floor(10000 + Math.random() * 90000),
        nowIso,
      );

      const recordId = crypto.randomUUID();
      await run(
        env.DB,
        `INSERT INTO customer_clinical_records (
           id, customer_id, booking_id, session_number, total_sessions,
           treated_areas, device_model, joules_energy, pulse_width_ms,
           shot_count, skin_reaction, operator_name, doctor_notes,
           next_session_recommended_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        recordId,
        customerId,
        bookingId,
        Number(body.sessionNumber) || 1,
        Number(body.totalSessions) || 8,
        service.name,
        body.deviceModel || 'الکساندرایت کندلا جنتل پرومکس ۲۰۲۶',
        Number(body.joulesEnergy) || 14.0,
        Number(body.pulseWidthMs) || 3.0,
        Number(body.shotCount) || 500,
        body.skinReaction || 'اریتم طبیعی و بدون سوختگی',
        body.operatorName || auth.displayName || 'اپراتور کلینیک',
        body.doctorNotes || 'پوست بدون حساسیت و آماده',
        body.nextSessionDate || null,
        nowIso,
      );

      let nextBookingId = null;
      if (body.scheduleNextSession && body.nextSessionDate) {
        nextBookingId = crypto.randomUUID();
        const nextRef = 'TL-N' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const nextStartsAt = new Date(body.nextSessionDate).toISOString();
        const nextEndsAt = new Date(new Date(nextStartsAt).getTime() + durationMs).toISOString();

        await run(
          env.DB,
          `INSERT INTO bookings (
             id, reference, customer_id, service_id, pricing_category,
             starts_at, ends_at, status, quoted_amount, discount_amount,
             currency, customer_note, admin_note, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 0, 'IRR_TOMAN', ?, ?, ?, ?)`,
          nextBookingId,
          nextRef,
          customerId,
          service.id,
          body.pricingCategory || 'female',
          nextStartsAt,
          nextEndsAt,
          amount,
          `رزرو خودکار جلسه بعدی (${(Number(body.sessionNumber) || 1) + 1} از ${Number(body.totalSessions) || 8})`,
          'تنظیم نوبت جلسه آتی با هماهنگی مراجع',
          nowIso,
          nowIso,
        );
      }

      await run(
        env.DB,
        `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, 'walkin_complete', 'delivered', 150, ?)`,
        crypto.randomUUID(),
        body.customerPhone || '09035555090',
        customerId,
        `مراجع گرامی، جلسه لیزر شما با موفقیت ثبت شد.${nextBookingId ? ' نوبت جلسه بعدی شما نیز در سامانه رزرو گردید.' : ''} تهران لیزر`,
        nowIso,
      );

      return ok({
        bookingId,
        nextBookingId,
        customerId,
        success: true,
      });
    }

    /* ── Admin: CRM & Clinical Dossier ────────────────────────── */
    if (pathname === '/api/v1/admin/crm/records' && method === 'GET') {
      requirePermission(locals, 'customer.read');
      const url = new URL(request.url);
      const custId = url.searchParams.get('customerId');
      let sql = `SELECT r.*, c.name AS customerName, c.phone AS customerPhone
                   FROM customer_clinical_records r
                   JOIN customers c ON c.id = r.customer_id`;
      const params: any[] = [];
      if (custId) {
        sql += ` WHERE r.customer_id = ?`;
        params.push(custId);
      }
      sql += ` ORDER BY r.created_at DESC LIMIT 100`;
      const records = await all(env.DB, sql, ...params);
      return ok(records);
    }

    if (pathname === '/api/v1/admin/crm/records' && method === 'POST') {
      const auth = requirePermission(locals, 'customer.update');
      const body = await parseBody(request, clinicalRecordSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO customer_clinical_records (
           id, customer_id, booking_id, session_number, total_sessions,
           treated_areas, device_model, joules_energy, pulse_width_ms,
           shot_count, skin_reaction, operator_name, doctor_notes,
           next_session_recommended_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.customerId,
        body.bookingId ?? null,
        Number(body.sessionNumber) || 1,
        Number(body.totalSessions) || 8,
        body.treatedAreas || 'نواحی درخواستی',
        body.deviceModel || 'الکساندرایت کندلا جنتل پرومکس ۲۰۲۶',
        Number(body.joulesEnergy) || 14.0,
        Number(body.pulseWidthMs) || 3.0,
        Number(body.shotCount) || 450,
        body.skinReaction || 'عادی',
        body.operatorName || auth.displayName || 'اپراتور',
        body.doctorNotes ?? null,
        body.nextSessionRecommendedAt ?? null,
        nowIso,
      );

      return okWithStatus({ id, success: true }, 201);
    }

    /* ── Admin: Accounting & Transactions ─────────────────────── */
    if (pathname === '/api/v1/admin/accounting/summary' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const todayIso = new Date().toISOString().slice(0, 10);
      const monthIso = new Date().toISOString().slice(0, 7);

      const [todayRow, monthRow, expenseRow, recentRows] = await Promise.all([
        one<{ total: number }>(
          env.DB,
          `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`,
          `${todayIso}%`,
        ),
        one<{ total: number }>(
          env.DB,
          `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`,
          `${monthIso}%`,
        ),
        one<{ total: number }>(
          env.DB,
          `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'expense' AND created_at LIKE ?`,
          `${monthIso}%`,
        ),
        all(
          env.DB,
          `SELECT t.*, c.name AS customerName FROM accounting_transactions t
           LEFT JOIN customers c ON c.id = t.customer_id
           ORDER BY t.created_at DESC LIMIT 50`,
        ),
      ]);

      const todayIncome = todayRow?.total ?? 0;
      const monthIncome = monthRow?.total ?? 0;
      const monthExpense = expenseRow?.total ?? 0;
      const netProfit = monthIncome - monthExpense;

      return ok({
        todayIncome,
        monthIncome,
        monthExpense,
        netProfit,
        transactions: recentRows,
      });
    }

    if (pathname === '/api/v1/admin/accounting/transactions' && method === 'POST') {
      requirePermission(locals, 'settings.write');
      const body = await parseBody(request, accountingTransactionSchema);
      const id = crypto.randomUUID();
      const ref = 'TX-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO accounting_transactions (
           id, reference, customer_id, booking_id, amount, type, method, category, description, tracking_number, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        ref,
        body.customerId ?? null,
        body.bookingId ?? null,
        Number(body.amount) || 0,
        body.type || 'income',
        body.method || 'pos',
        body.category || 'laser_service',
        body.description ?? null,
        body.trackingNumber ?? null,
        nowIso,
      );

      return okWithStatus({ id, reference: ref, success: true }, 201);
    }

    /* ── Admin: SMS Marketing & Logs ──────────────────────────── */
    if (pathname === '/api/v1/admin/sms/logs' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const rows = await all(
        env.DB,
        `SELECT l.*, c.name AS customerName FROM sms_logs l
         LEFT JOIN customers c ON c.id = l.customer_id
         ORDER BY l.created_at DESC LIMIT 50`,
      );
      return ok(rows);
    }

    if (pathname === '/api/v1/admin/sms/send' && method === 'POST') {
      requirePermission(locals, 'settings.write');
      const body = await parseBody(request, sendSmsSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, ?, 'delivered', 150, ?)`,
        id,
        body.phone,
        body.customerId ?? null,
        body.message,
        body.templateName || 'custom',
        nowIso,
      );

      return ok({ id, success: true, status: 'delivered' });
    }

    /* ── Admin: Lottery & Lucky Draw ──────────────────────────── */
    if (pathname === '/api/v1/admin/lottery' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const campaigns = await all(env.DB, `SELECT * FROM lottery_campaigns ORDER BY created_at DESC`);
      return ok(campaigns);
    }

    if (pathname === '/api/v1/admin/lottery/draw' && method === 'POST') {
      requirePermission(locals, 'settings.write');
      const body = await parseBody(request, lotteryDrawSchema);
      const campaignId = body.campaignId;

      const candidate = await one<{ id: string; name: string; phone: string }>(
        env.DB,
        `SELECT id, name, phone FROM customers ORDER BY RANDOM() LIMIT 1`,
      );

      if (!candidate) {
        throw new ApiError('NOT_FOUND', 'هیچ مراجع ثبت‌شده‌ای برای قرعه‌کشی یافت نشد.');
      }

      const nowIso = new Date().toISOString();
      await run(
        env.DB,
        `UPDATE lottery_campaigns
            SET winner_customer_id = ?,
                winner_name = ?,
                winner_phone = ?,
                draw_date = ?,
                status = 'completed'
          WHERE id = ?`,
        candidate.id,
        candidate.name,
        candidate.phone,
        nowIso,
        campaignId,
      );

      await run(
        env.DB,
        `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, 'lottery_winner', 'delivered', 150, ?)`,
        crypto.randomUUID(),
        candidate.phone,
        candidate.id,
        `تبریک به ${candidate.name} عزیز! شما برنده جایزه ویژه قرعه‌کشی این دوره کلینیک تهران لیزر شدید. جهت هماهنگی با ما تماس حاصل فرمایید.`,
        nowIso,
      );

      return ok({
        winner: candidate,
        success: true,
      });
    }

    if (pathname === '/api/v1/admin/lottery' && method === 'POST') {
      requirePermission(locals, 'settings.write');
      const body = await parseBody(request, lotteryCampaignSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO lottery_campaigns (id, title, prize, status, min_spending, draw_date, created_at)
         VALUES (?, ?, ?, 'active', ?, ?, ?)`,
        id,
        body.title,
        body.prize,
        Number(body.minSpending) || 0,
        body.drawDate || null,
        nowIso,
      );

      return okWithStatus({ id, success: true }, 201);
    }

    /* ── Admin: Discount Festivals ────────────────────────────── */
    if (pathname === '/api/v1/admin/festivals' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const rows = await all(env.DB, `SELECT * FROM discount_festivals ORDER BY created_at DESC`);
      return ok(rows);
    }

    if (pathname === '/api/v1/admin/festivals' && method === 'POST') {
      const auth = requirePermission(locals, 'settings.write');
      const body = await parseBody(request, discountFestivalSchema);
      const id = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await run(
        env.DB,
        `INSERT INTO discount_festivals (id, title, slug, discount_percent, description, banner_image, starts_at, ends_at, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.title,
        body.slug || 'fest-' + crypto.randomUUID().slice(0, 8),
        body.discountPercent ?? 15,
        body.description ?? null,
        body.bannerImage ?? null,
        body.startsAt ?? null,
        body.endsAt ?? null,
        body.active ? 1 : 0,
        nowIso,
      );

      await writeAuditLog(env.DB, auth.id, 'festival.created', 'discount_festival', id);
      return okWithStatus({ id, success: true }, 201);
    }

    /* ── Admin: Instagram Social Hub ──────────────────────────── */
    if (pathname === '/api/v1/admin/instagram' && method === 'GET') {
      requirePermission(locals, 'settings.read');
      const allSettings = await getAllSettings(env.DB);
      const pub = allSettings.public;
      return ok({
        username: pub.instagram_username || 'tehranlaser_clinic',
        bioLink: pub.instagram_bio_link || resolveCanonicalOrigin(),
        promoCode: pub.instagram_promo_code || 'INSTA20',
        latestReel: pub.instagram_latest_reel_url || 'https://instagram.com/reel/...',
        discountPercent: Number(pub.instagram_follower_discount_percent || 10),
      });
    }

    if (pathname === '/api/v1/admin/instagram' && method === 'PUT') {
      const auth = requirePermission(locals, 'settings.write');
      const body = await parseBody(request, instagramSettingsSchema);
      const nowIso = new Date().toISOString();

      /* Only the keys actually present in the payload are written. (Previously
         `String(body.discountPercent || 10)` always produced a string, so a
         partial update silently reset the follower discount to 10%.) */
      const pairs: [string, string | undefined][] = [
        ['instagram_username', body.username],
        ['instagram_bio_link', body.bioLink],
        ['instagram_promo_code', body.promoCode],
        ['instagram_latest_reel_url', body.latestReel],
        [
          'instagram_follower_discount_percent',
          body.discountPercent !== undefined ? String(body.discountPercent) : undefined,
        ],
      ];

      for (const [k, v] of pairs) {
        if (v !== undefined) {
          await run(
            env.DB,
            `INSERT INTO settings (key, value, scope, updated_at)
             VALUES (?, ?, 'public', ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
            k,
            String(v),
            nowIso,
          );
        }
      }

      await writeAuditLog(env.DB, auth.id, 'instagram.updated', 'settings', null);
      return ok({ success: true });
    }

    /* ── 404 Route Not Found ─────────────────────────────────── */
    throw new ApiError('NOT_FOUND', 'مسیر درخواستی یافت نشد.');
  });
}
