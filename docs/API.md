# API Contract — `/api/v1`

Single source of truth for request/response shapes. Shared TypeScript types live in
`src/domain/api/dto.types.ts`; validation schemas in `src/domain/validation/schemas.ts`.

## Envelope

Success → `{ "data": T, "error": null, "meta": {} }` (HTTP 200/201).
Failure → `{ "data": null, "error": { "code", "message", "fields?" }, "meta": {} }`.
Messages are Persian; `code` is stable and machine-readable.
Codes: `AUTH_REQUIRED, FORBIDDEN, VALIDATION_ERROR, BAD_REQUEST, NOT_FOUND, BOOKING_CONFLICT,
BOOKING_DISABLED, INVALID_BOOKING_STATUS, SERVICE_INACTIVE, SLOT_UNAVAILABLE, RATE_LIMITED,
INTEGRATION_FAILURE, INTERNAL_ERROR`.

Never leak stack traces, SQL, env values or internals. Use
`handleRoute()` + `ok()/fail()/parseBody()/parseQuery()` from `src/lib/api/respond.ts`.

## Auth

- Session = `tl_session` cookie (HttpOnly, SameSite=Lax, Secure in prod), D1-backed.
- `POST /api/v1/auth/login` `{ email, password }` → `200 MeDto` + `Set-Cookie`.
  Rate limited (`rate_limit_login`, key `login:<ip>`).
- `POST /api/v1/auth/logout` → `200 { data: true }`, revokes session, clears cookie.
- `GET /api/v1/me` → `MeDto`. Guarded by middleware (401 envelope when anonymous).

Authorization is enforced per route with `requirePermission(locals, '...')` — hiding UI
buttons is never authorization.

## Public

| Method | Path | Query/Body | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/services` | – | `PublicServiceDto[]` | active services, ordered by `displayOrder`, with price rows |
| GET | `/api/v1/services/:slug` | – | `PublicServiceDto` | `404 NOT_FOUND` if missing/inactive |
| GET | `/api/v1/availability` | `service, date, category, staffId?` | `AvailabilityResponseDto` | `date` = `YYYY-MM-DD` clinic-local |
| POST | `/api/v1/bookings` | `CreateBookingInput` | `PublicBookingSummaryDto` | `201`; rate limited; idempotent via `idempotencyKey` |
| GET | `/api/v1/blog` | `cursor?, limit?` | `Paginated<PublicBlogPostDto>` | published only |
| GET | `/api/v1/blog/:slug` | – | `PublicBlogPostDto` | `404` for non-published |
| GET | `/api/v1/clinic` | – | `ClinicInfoDto` | `{ settings: PublicSettingsDto, hours: BusinessHoursDto[] }` |
| GET | `/api/v1/settings/public` | – | `PublicSettingsDto` | public scope only — never private keys |
| GET | `/api/health` | – | `HealthDto` | lightweight; no heavy diagnostics |

### POST /api/v1/bookings (authoritative flow)

1. Validate body (`createBookingSchema`).
2. Rate limit by IP (`rate_limit_booking`).
3. Load service (must be `active`), prices, settings.
4. `calculateQuote()` server-side — never trust client price/duration.
5. `validateSlotStart()` against hours + exceptions + occupied slots (granularity, buffer,
   lead time). Failure → `SLOT_UNAVAILABLE` / `BOOKING_DISABLED` with Persian message.
6. Upsert customer by canonical phone (one bounded query).
7. **One `db.batch()`**: `INSERT booking_slots…` (all slots) → `INSERT booking` →
   `INSERT booking_event`. Duplicate slot ⇒ whole batch rolls back ⇒
   `BOOKING_CONFLICT` (HTTP 409). Retry reference generation on `reference` unique clash.
8. Respond `201` with summary; enqueue notification via `waitUntil` (booking must not fail
   if Telegram is down).

`idempotencyKey` unique-violation ⇒ return the existing booking with `200`.

## Admin (all require session + permission)

| Group | Endpoints | Permission |
| --- | --- | --- |
| dashboard | `GET /admin/dashboard` | `booking.read` |
| bookings | `GET /admin/bookings`, `GET /admin/bookings/:id` | `booking.read` |
| booking actions | `POST /admin/bookings/:id/{accept,reject,cancel,reschedule,complete,no-show}` | `booking.accept` / `booking.reject` / `booking.cancel` / `booking.reschedule` / `booking.complete` |
| services | `GET /admin/services` (`service.read`), `POST`, `PUT /:id`, `DELETE /:id` (`service.write`) | |
| pricing | `GET /admin/pricing` (`pricing.read`), `PUT /admin/pricing/:id` (`pricing.write`) | |
| staff | `GET /admin/staff` (`staff.read`), `POST`, `PUT /:id` (`staff.write`) | |
| schedule | `GET /admin/schedule` (`schedule.read`), `PUT /admin/schedule` (`schedule.write`) | |
| customers | `GET /admin/customers` (`customer.read`), `GET /:id`, `PUT /:id` (`customer.update`) | |
| blog | `GET /admin/blog` (`blog.read`), `POST`, `PUT /:id`, `DELETE /:id` (`blog.write`) | |
| seo | `GET /admin/seo` (`seo.read`), `PUT /admin/seo` (`seo.write`) | |
| faq | `GET /admin/faq` (`settings.read`), `POST`, `PUT /:id`, `DELETE /:id` (`settings.write`) | |
| settings | `GET /admin/settings` (`settings.read`), `PUT /admin/settings` (`settings.write`) | |
| notifications | `GET /admin/notifications` (`settings.read`) | |
| audit | `GET /admin/audit` (`audit.read`) | |

Rules:

- Lists are **paginated** (`?limit=&cursor=`, cursor = opaque `created_at|id`), `limit` ≤ 100.
- Search (`q`) is exact/prefix on indexed columns (`customers.phone`, `customers.name`,
  `bookings.reference`) — never unbounded `LIKE '%…%'` scans.
- Every admin mutation writes an `audit_logs` row (actor, action, entity).
- Reschedule revalidates duration/hours/breaks/exceptions/conflicts before writing;
  slot keys migrate (`clinic` ↔ `staff:<id>`) inside the same batch.
- `DELETE` on service/blog = soft deactivate/archive (`active=0` / `status='archived'`).
- Settings PUT accepts only allowlisted keys (`PUBLIC_SETTING_KEYS` + `PRIVATE_SETTING_KEYS`)
  and validates values (phone/email/int ranges/booleans).

## Rate limiting

`consumeRateLimit(db, key, policy, now)` — fixed window, atomic upsert, policy `"N/SECONDS"`
from private settings. Applied to: login, booking creation, admin mutations that matter.
Return `429 RATE_LIMITED` with `meta.retryAfterSeconds`.

## Caching

- Public service catalog / blog / clinic / settings responses: `Cache-Control:
  public, max-age=60, stale-while-revalidate=300`.
- Availability, bookings, all admin: `no-store` (default in `json()`).
- Never cache personalized/admin responses at the CDN.
