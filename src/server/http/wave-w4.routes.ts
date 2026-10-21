/** Wave W4 admin contracts — detail/timeline/SEO/search/pricing reads.
 *
 *  Extracted from `router.ts` for the same reason `operators.routes.ts` was:
 *  the central router is already ~1.6k lines of flat `if (pathname …)` checks,
 *  and these eleven routes are one cohesive contract (the console's
 *  detail + discoverability surface). The router stays a flat table and
 *  delegates here.
 *
 *  Rules that hold for every route below:
 *  - permissions are enforced server-side, never inferred from what the UI
 *    chose to render;
 *  - every read is bounded and lists explicit columns (contract §60–§62);
 *  - unknown entities return `404 NOT_FOUND`, never an envelope with nulls;
 *  - the SEO upsert validates with zod and rejects unknown entity types, so
 *    the CHECK constraint can never be the only thing standing between a
 *    bad request and a corrupt row.
 */

import { env } from 'cloudflare:workers';
import { requirePermission } from '../auth/guard';
import { ApiError } from '../../lib/api/errors';
import { getSearchParams, ok, parseBody } from '../../lib/api/respond';
import { seoUpsertSchema } from '../../domain/validation/schemas';
import {
  findAdminBooking,
  findAdminCustomer,
  findBookingTimeline,
  findSeoOverridesFor,
  listAdminPrices,
  listSeoOverrides,
  adminQuickSearch,
} from '../repositories';

const BOOKING_DETAIL = /^\/api\/v1\/admin\/bookings\/([^/]+)$/;
const BOOKING_TIMELINE = /^\/api\/v1\/admin\/bookings\/([^/]+)\/timeline$/;
const CUSTOMER_DETAIL = /^\/api\/v1\/admin\/customers\/([^/]+)$/;
const PRICING_LIST = '/api/v1/admin/pricing';
const SEO_LIST = '/api/v1/admin/seo';
const SEARCH = '/api/v1/admin/search';

/** Handle one W4 admin request, or return null when the path is not ours. */
export async function handleWaveW4Routes(
  request: Request,
  locals: App.Locals,
  pathname: string,
  method: string,
): Promise<Response | null> {
  /* ── Booking detail ─────────────────────────────────────────── */
  const timeline = BOOKING_TIMELINE.exec(pathname);
  if (timeline && method === 'GET') {
    requirePermission(locals, 'booking.read');
    const result = await findBookingTimeline(env.DB, timeline[1]!);
    if (!result) throw new ApiError('NOT_FOUND', 'نوبت مورد نظر یافت نشد.');
    return ok(result);
  }

  const bookingDetail = BOOKING_DETAIL.exec(pathname);
  if (bookingDetail && method === 'GET') {
    requirePermission(locals, 'booking.read');
    const booking = await findAdminBooking(env.DB, bookingDetail[1]!);
    if (!booking) throw new ApiError('NOT_FOUND', 'نوبت مورد نظر یافت نشد.');
    return ok(booking);
  }

  /* ── Customer detail (drawer) ───────────────────────────────── */
  const customerDetail = CUSTOMER_DETAIL.exec(pathname);
  if (customerDetail && method === 'GET') {
    requirePermission(locals, 'customer.read');
    const customer = await findAdminCustomer(env.DB, customerDetail[1]!);
    if (!customer) throw new ApiError('NOT_FOUND', 'مراجع مورد نظر یافت نشد.');
    return ok(customer);
  }

  /* ── Pricing ledger ─────────────────────────────────────────── */
  if (pathname === PRICING_LIST && method === 'GET') {
    requirePermission(locals, 'pricing.read');
    return ok(await listAdminPrices(env.DB));
  }

  /* ── SEO overrides ──────────────────────────────────────────── */
  if (pathname === SEO_LIST && method === 'GET') {
    requirePermission(locals, 'seo.read');
    /* `?entityType&entityId` narrows to one override; without them the whole
       ledger comes back. `entityType` is validated so an unknown value can
       never be passed through to SQL. */
    const q = getSearchParams(request);
    if (q.entityType || q.entityId) {
      if (q.entityType !== 'page' && q.entityType !== 'service' && q.entityType !== 'post') {
        throw new ApiError('VALIDATION_ERROR', 'نوع محتوای انتخاب‌شده معتبر نیست.', {
          fields: { entityType: ['نوع محتوا باید page، service یا post باشد.'] },
        });
      }
      if (!q.entityId) {
        throw new ApiError('VALIDATION_ERROR', 'شناسه محتوا الزامی است.', {
          fields: { entityId: ['برای فیلتر بر اساس نوع، شناسه محتوا هم لازم است.'] },
        });
      }
      const override = await findSeoOverridesFor(env.DB, q.entityType, q.entityId);
      return ok(override);
    }
    return ok(await listSeoOverrides(env.DB));
  }

  if (pathname === SEO_LIST && method === 'PUT') {
    const auth = requirePermission(locals, 'seo.write');
    const body = await parseBody(request, seoUpsertSchema);
    const nowIso = new Date().toISOString();

    /* Upsert on the natural key (entity_type, entity_id) — a panel save is
       idempotent, so a second click must not duplicate a row. */
    await env.DB.prepare(
      `INSERT INTO seo_metadata (id, entity_type, entity_id, title, description,
                                 canonical_url, og_image, noindex, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (entity_type, entity_id) DO UPDATE SET
             title = excluded.title,
             description = excluded.description,
             canonical_url = excluded.canonical_url,
             og_image = excluded.og_image,
             noindex = excluded.noindex,
             updated_at = excluded.updated_at`,
    )
      .bind(
        crypto.randomUUID(),
        body.entityType,
        body.entityId,
        body.title,
        body.description,
        body.canonicalUrl ?? null,
        body.ogImage ?? null,
        body.noindex ? 1 : 0,
        nowIso,
      )
      .run();

    return ok({
      entityType: body.entityType,
      entityId: body.entityId,
      updated: true,
      updatedBy: auth.id,
    });
  }

  /* ── Command-palette search ─────────────────────────────────── */
  if (pathname === SEARCH && method === 'GET') {
    requirePermission(locals, 'booking.read');
    const q = getSearchParams(request);
    const term = typeof q.q === 'string' ? q.q : '';
    return ok(await adminQuickSearch(env.DB, term));
  }

  return null;
}
