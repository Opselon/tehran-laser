globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { ct as array, dt as object, ft as record, ht as _coercedNumber, lt as boolean, mt as union, ot as ZodNumber, pt as string, st as _enum, ut as number$1 } from "./console_B-OutPbu.mjs";
import { a as clearSessionCookie, i as buildSessionCookie, o as isSecureRequest, r as revokeSession, t as createSession } from "./session_CsRAh52x.mjs";
import { a as overlaps, i as localMinutesOf, n as instantFromLocalMinutes, o as weekdayOf, r as localDateOf, s as zonedTimeToUtc, t as addMinutes } from "./timezone_DL81nGWL.mjs";
import { a as one, o as run, t as all } from "./query_DDZB-tD1.mjs";
import { C as loadPriceRowsForService, S as listScheduleExceptionsForDate, T as writeAuditLog, a as getAllSettings, b as listPublicFaq, c as listAdminBlogPosts, d as listAdminFaq, f as listAdminServices, g as listBusinessHours, h as listAuditLogs, i as getAdminDashboard, l as listAdminBookings, n as findPublicBlogPostBySlug, o as getPublicSettings, p as listAdminStaff, r as findPublicServiceBySlug, s as getSettingValue, t as findOccupiedSlotStarts, u as listAdminCustomers, v as listNotificationEvents, w as toHoursRows, x as listPublicServices, y as listPublicBlogPosts } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region node_modules/zod/v4/classic/coerce.js
function number(params) {
	return _coercedNumber(ZodNumber, params);
}
//#endregion
//#region src/lib/api/errors.ts
var STATUS_BY_CODE = {
	AUTH_REQUIRED: 401,
	FORBIDDEN: 403,
	VALIDATION_ERROR: 422,
	BAD_REQUEST: 400,
	NOT_FOUND: 404,
	BOOKING_CONFLICT: 409,
	BOOKING_DISABLED: 409,
	INVALID_BOOKING_STATUS: 409,
	SERVICE_INACTIVE: 409,
	SLOT_UNAVAILABLE: 409,
	RATE_LIMITED: 429,
	INTEGRATION_FAILURE: 502,
	INTERNAL_ERROR: 500
};
var ApiError = class extends Error {
	code;
	status;
	fields;
	/** Machine-safe extra payload for the `meta` bag (never free-form internals). */
	meta;
	constructor(code, message, options = {}) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = options.status ?? STATUS_BY_CODE[code];
		this.fields = options.fields;
		this.meta = options.meta ?? {};
	}
};
//#endregion
//#region src/server/auth/guard.ts
function currentAuth(locals) {
	return locals.auth ?? null;
}
function requireAuth(locals) {
	const auth = currentAuth(locals);
	if (!auth) throw new ApiError("AUTH_REQUIRED", "ابتدا وارد شوید.");
	return auth;
}
function requirePermission(locals, permission) {
	const auth = requireAuth(locals);
	if (!auth.permissions.includes(permission)) throw new ApiError("FORBIDDEN", "شما مجوز انجام این عملیات را ندارید.");
	return auth;
}
//#endregion
//#region src/lib/security/rate-limit.ts
function parseRateLimitPolicy(raw, fallback) {
	if (!raw) return fallback;
	const match = /^(\d{1,6})\/(\d{1,6})$/.exec(raw.trim());
	if (!match) return fallback;
	const limit = Number.parseInt(match[1] ?? "", 10);
	const windowSeconds = Number.parseInt(match[2] ?? "", 10);
	if (limit < 1 || windowSeconds < 1) return fallback;
	return {
		limit,
		windowSeconds
	};
}
/** Atomically consume one unit of the budget for `key`. */
async function consumeRateLimit(db, key, policy, now) {
	const nowIso = now.toISOString();
	const expiresIso = new Date(now.getTime() + policy.windowSeconds * 1e3).toISOString();
	const row = await db.prepare(`INSERT INTO rate_limits (key, window_started_at, count, expires_at)
         VALUES (?1, ?2, 1, ?3)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.expires_at <= ?2 THEN 1 ELSE rate_limits.count + 1 END,
         window_started_at = CASE WHEN rate_limits.expires_at <= ?2 THEN ?2 ELSE rate_limits.window_started_at END,
         expires_at = CASE WHEN rate_limits.expires_at <= ?2 THEN ?3 ELSE rate_limits.expires_at END
       RETURNING count, expires_at`).bind(key, nowIso, expiresIso).first() ?? {
		count: 1,
		expires_at: expiresIso
	};
	if (Math.random() < .02) await db.prepare("DELETE FROM rate_limits WHERE expires_at <= ?1").bind(nowIso).run();
	const allowed = row.count <= policy.limit;
	const retryAfterSeconds = Math.max(1, Math.ceil((Date.parse(row.expires_at) - now.getTime()) / 1e3));
	return {
		allowed,
		remaining: Math.max(0, policy.limit - row.count),
		retryAfterSeconds: allowed ? 0 : retryAfterSeconds
	};
}
//#endregion
//#region src/lib/security/password.ts
/** PBKDF2-SHA256 password hashing via WebCrypto (available in workerd + Node).
*
*  Format: `pbkdf2-sha256$<iterations>$<saltB64>$<hashB64>` so the cost factor can
*  evolve without invalidating stored hashes.
*
*  Default iterations = 100k: a deliberate trade-off documented in SECURITY.md —
*  Workers Free has a small per-invocation CPU budget, so OWASP's 600k recommendation
*  would breach it on every login. Raise via the private `password_iterations` setting
*  if the plan allows more CPU.
*/
var encoder = new TextEncoder();
function fromBase64(value) {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
async function verifyPassword(password, stored) {
	const parts = stored.split("$");
	if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
	const iterations = Number.parseInt(parts[1] ?? "", 10);
	if (!Number.isFinite(iterations) || iterations < 1e3 || iterations > 5e6) return false;
	let salt;
	let expected;
	try {
		salt = fromBase64(parts[2] ?? "");
		expected = fromBase64(parts[3] ?? "");
	} catch {
		return false;
	}
	const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
	const bits = await crypto.subtle.deriveBits({
		name: "PBKDF2",
		salt,
		iterations,
		hash: "SHA-256"
	}, key, expected.length * 8);
	const actual = new Uint8Array(bits);
	if (actual.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < actual.length; i += 1) diff |= (actual[i] ?? 0) ^ (expected[i] ?? 0);
	return diff === 0;
}
//#endregion
//#region src/lib/api/respond.ts
function ok(data, meta = {}) {
	return json({
		data,
		error: null,
		meta
	}, 200);
}
function okWithStatus(data, status, meta = {}) {
	return json({
		data,
		error: null,
		meta
	}, status);
}
function fail(code, message, options = {}) {
	return json({
		data: null,
		error: options.fields ? {
			code,
			message,
			fields: options.fields
		} : {
			code,
			message
		},
		meta: options.meta ?? {}
	}, options.status ?? new ApiError(code, message).status);
}
function json(body, status, headers = {}) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			...headers
		}
	});
}
/** Parse JSON body with a schema; throws ApiError(VALIDATION_ERROR) with field messages. */
async function parseBody(request, schema) {
	let raw;
	try {
		raw = await request.json();
	} catch {
		throw new ApiError("BAD_REQUEST", "بدنه درخواست معتبر نیست.");
	}
	const result = schema.safeParse(raw);
	if (!result.success) throw new ApiError("VALIDATION_ERROR", "اطلاعات واردشده معتبر نیست.", { fields: zodFieldErrors(result.error.issues) });
	return result.data;
}
function getSearchParams(source) {
	const url = source instanceof URL ? source : new URL(source.url);
	const record = {};
	url.searchParams.forEach((value, key) => {
		record[key] = value;
	});
	return record;
}
/** Parse an already-extracted value with a schema.
*  Identical error contract to parseBody/parseQuery: VALIDATION_ERROR + per-field messages.
*  Use instead of `schema.parse(...)` — a raw ZodError surfaces as INTERNAL_ERROR (500). */
function parseValue(schema, value, message = "پارامترهای درخواست معتبر نیست.") {
	const result = schema.safeParse(value);
	if (!result.success) throw new ApiError("VALIDATION_ERROR", message, { fields: zodFieldErrors(result.error.issues) });
	return result.data;
}
function zodFieldErrors(issues) {
	const fields = {};
	for (const issue of issues) {
		const key = issue.path.length > 0 ? issue.path.join(".") : "_";
		const list = fields[key] ?? (fields[key] = []);
		if (!list.includes(issue.message)) list.push(issue.message);
	}
	return fields;
}
/**
* Wrap a route handler: converts ApiError / unknown failures into the envelope,
* never leaking stack traces or internals (contract §6).
*/
function handleRoute(handler) {
	return handler().catch((error) => {
		if (error instanceof ApiError) return fail(error.code, error.message, {
			...error.fields ? { fields: error.fields } : {},
			meta: error.meta,
			status: error.status
		});
		console.error("[api] unhandled error", error instanceof Error ? error.message : String(error));
		return fail("INTERNAL_ERROR", "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
	});
}
//#endregion
//#region src/domain/validation/schemas.ts
/** Validation shared by API routes and server services. Everything that crosses a
*  boundary is parsed here — the client is never trusted. */
var pricingCategorySchema = _enum(["male", "female"]);
/** Accepts 09121234567, +989****4567, 00989121234567, 9121234567 → canonical +989****4567.
*  Persian/Arabic-Indic digits (۰-۹, ٠-٩) are normalised first — admins type them
*  from the on-screen keypad and would otherwise be rejected as invalid input. */
var phoneSchema = string().trim().min(4).max(24).transform((value) => value.replace(/[\s\-().]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))).refine((value) => /^\+?\d{10,15}$/.test(value), { message: "شماره تماس معتبر نیست." }).transform((value) => {
	if (value.startsWith("0098")) return `+98${value.slice(4)}`;
	if (value.startsWith("+98")) return value;
	if (value.startsWith("98") && value.length === 12) return `+${value}`;
	if (value.startsWith("0")) return `+98${value.slice(1)}`;
	if (value.startsWith("9") && value.length === 10) return `+98${value}`;
	return `+${value}`;
});
var isoInstantSchema = string().datetime({ offset: true }).refine((value) => !Number.isNaN(Date.parse(value)), { message: "زمان نامعتبر است." });
var localDateSchema = string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ باید به شکل YYYY-MM-DD باشد.").refine((value) => {
	const [y, m, d] = value.split("-").map(Number);
	if (y < 2e3 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
	const dt = new Date(Date.UTC(y, m - 1, d));
	return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}, { message: "تاریخ نامعتبر است." });
var slugSchema = string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ باید انگلیسی و با خط تیره باشد.");
var nameSchema = string().trim().min(2, "نام باید حداقل ۲ حرف باشد.").max(80, "نام طولانی است.");
var emailSchema = string().trim().toLowerCase().max(160).regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "ایمیل معتبر نیست.");
var noteSchema = string().trim().max(500, "متن طولانی است.");
/** ── Public booking creation ────────────────────────────────── */
var createBookingSchema = object({
	serviceSlug: slugSchema.optional(),
	serviceSlugs: array(slugSchema).min(1).optional(),
	pricingCategory: pricingCategorySchema,
	startsAt: isoInstantSchema,
	customerName: nameSchema,
	customerPhone: phoneSchema,
	customerEmail: emailSchema.optional(),
	note: noteSchema.optional(),
	/** Client-generated token that dedupes accidental double submits. */
	idempotencyKey: string().trim().min(8).max(64).optional()
}).refine((data) => Boolean(data.serviceSlug || data.serviceSlugs && data.serviceSlugs.length > 0), {
	message: "حداقل یک خدمت باید انتخاب شود.",
	path: ["serviceSlug"]
});
object({
	service: slugSchema.optional(),
	services: string().optional(),
	date: localDateSchema,
	category: pricingCategorySchema,
	staffId: string().trim().min(1).max(64).optional()
}).refine((data) => Boolean(data.service || data.services), {
	message: "حداقل یک خدمت برای استعلام ظرفیت الزامی است.",
	path: ["service"]
});
/** ── Admin booking actions ──────────────────────────────────── */
var rejectBookingSchema = object({ reason: string().trim().max(300).optional() });
object({ reason: string().trim().max(300).optional() });
var updateBookingSchema = object({
	adminNote: string().max(500).nullable().optional(),
	customerNote: string().max(500).nullable().optional(),
	quotedAmount: number$1().int().nonnegative().optional()
});
var rescheduleBookingSchema = object({
	startsAt: isoInstantSchema,
	staffId: string().trim().min(1).max(64).nullable().optional()
});
object({
	status: _enum([
		"pending",
		"confirmed",
		"rejected",
		"cancelled",
		"completed",
		"no_show"
	]).optional(),
	from: localDateSchema.optional(),
	to: localDateSchema.optional(),
	q: string().trim().min(1).max(80).optional(),
	serviceSlug: slugSchema.optional(),
	staffId: string().trim().min(1).max(64).optional(),
	cursor: string().trim().max(120).optional(),
	limit: number().int().min(1).max(100).optional()
});
/** ── Auth ───────────────────────────────────────────────────── */
var loginSchema = object({
	email: emailSchema,
	password: string().min(8, "رمز عبور حداقل ۸ کاراکتر است.").max(200)
});
/** ── Services / pricing / staff (admin) ─────────────────────── */
var serviceWriteSchema = object({
	name: nameSchema,
	slug: slugSchema,
	description: string().trim().max(2e3),
	shortDescription: string().trim().max(200).nullable().optional(),
	durationMinutes: number$1().int().min(5).max(600),
	active: boolean(),
	featured: boolean(),
	displayOrder: number$1().int().min(0).max(9999)
});
var pricingWriteSchema = object({
	pricingCategory: pricingCategorySchema,
	amount: number$1().int().min(0).max(1e9)
});
object({
	name: nameSchema,
	active: boolean(),
	serviceSlugs: array(slugSchema).max(100)
});
/** ── Schedule (admin) ───────────────────────────────────────── */
var timeSchema = string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "زمان باید HH:MM باشد.");
object({
	hours: array(object({
		weekday: number$1().int().min(0).max(6),
		segments: array(object({
			opensAt: timeSchema,
			closesAt: timeSchema
		})).max(4).refine((segments) => segments.every((s) => s.opensAt < s.closesAt), "ساعت شروع باید قبل از پایان باشد.")
	})).length(7),
	exceptions: array(object({
		date: localDateSchema,
		kind: _enum([
			"holiday",
			"closed",
			"special_hours",
			"blocked_time",
			"temporary_change"
		]),
		opensAt: timeSchema.nullable().optional(),
		closesAt: timeSchema.nullable().optional(),
		note: string().trim().max(300).nullable().optional()
	})).max(400)
});
var updateWeekdayHoursSchema = object({
	isOpen: boolean(),
	opensAt: timeSchema.optional(),
	closesAt: timeSchema.optional()
});
var createExceptionSchema = object({
	exceptionDate: localDateSchema,
	kind: _enum([
		"holiday",
		"closed",
		"special_hours",
		"blocked_time",
		"temporary_change"
	]),
	opensAt: timeSchema.nullable().optional(),
	closesAt: timeSchema.nullable().optional(),
	note: string().trim().max(300).nullable().optional()
});
/** ── Blog (admin) ───────────────────────────────────────────── */
var blogWriteSchema = object({
	title: string().trim().min(2).max(160),
	slug: slugSchema,
	excerpt: string().trim().max(400),
	content: string().max(1e5),
	coverImage: string().trim().max(500).nullable().optional(),
	categoryId: string().trim().max(64).nullable().optional(),
	author: string().trim().max(80).nullable().optional(),
	status: _enum([
		"draft",
		"published",
		"scheduled",
		"archived"
	]),
	publishedAt: isoInstantSchema.nullable().optional(),
	seoTitle: string().trim().max(70).nullable().optional(),
	seoDescription: string().trim().max(170).nullable().optional(),
	canonicalUrl: string().trim().max(300).nullable().optional(),
	ogTitle: string().trim().max(70).nullable().optional(),
	ogDescription: string().trim().max(200).nullable().optional()
});
/** ── FAQ / settings / seo (admin) ───────────────────────────── */
var faqWriteSchema = object({
	question: string().trim().min(2).max(200),
	answer: string().trim().min(2).max(2e3),
	displayOrder: number$1().int().min(0).max(9999),
	active: boolean()
});
object({ settings: record(string().regex(/^[a-z_]{2,40}$/), string().max(1e3)) });
object({
	entityType: _enum([
		"page",
		"service",
		"post"
	]),
	entityId: string().trim().min(1).max(140),
	title: string().trim().min(2).max(70),
	description: string().trim().min(2).max(170),
	canonicalUrl: string().trim().max(300).nullable().optional(),
	ogImage: string().trim().max(500).nullable().optional(),
	noindex: boolean()
});
/** ── Admin schema aliases / helpers ────────────────────────── */
var createServiceSchema = serviceWriteSchema;
var updateServiceSchema = serviceWriteSchema.partial();
var updatePricingSchema = pricingWriteSchema.extend({ currency: string().trim().max(10).optional() });
var createStaffSchema = object({
	name: nameSchema,
	active: boolean().default(true),
	serviceIds: array(string().trim()).max(100).optional()
});
var updateStaffSchema = createStaffSchema.partial();
var createBlogPostSchema = blogWriteSchema;
var updateBlogPostSchema = blogWriteSchema.partial();
var createFaqSchema = faqWriteSchema;
var updateFaqSchema = faqWriteSchema.partial();
var updateSettingsSchema = record(string(), union([
	string(),
	number$1(),
	boolean()
]));
var updateCustomerSchema = object({
	name: nameSchema.optional(),
	phone: phoneSchema.optional(),
	pricingCategory: _enum(["female", "male"]).optional(),
	email: emailSchema.nullable().optional(),
	note: noteSchema.nullable().optional()
});
/** ── Admin "operations console" endpoints (walk-in, CRM, accounting, SMS,
*  lottery, festivals). These previously called request.json() unsafely; the
*  schemas below match the payloads the admin pages actually submit, so no
*  bad input can reach a D1 INSERT. ────────────────────────────────────── */
var paymentMethodSchema = _enum([
	"pos",
	"cash",
	"card_to_card",
	"online"
]);
var transactionTypeSchema = _enum([
	"income",
	"expense",
	"refund"
]);
var transactionCategorySchema = string().trim().min(1).max(60);
var walkinBookSchema = object({
	customerId: string().trim().min(1).max(64).optional(),
	customerName: nameSchema.optional(),
	customerPhone: phoneSchema.optional(),
	pricingCategory: pricingCategorySchema.optional(),
	serviceId: string().trim().max(64).optional(),
	startsAt: isoInstantSchema.optional(),
	amount: number$1().int().min(0).max(1e9).optional(),
	paymentMethod: paymentMethodSchema.optional(),
	trackingNumber: string().trim().max(80).optional(),
	adminNote: string().trim().max(500).optional(),
	note: string().trim().max(500).optional(),
	sessionNumber: number$1().int().min(1).max(200).optional(),
	totalSessions: number$1().int().min(1).max(200).optional(),
	deviceModel: string().trim().max(120).optional(),
	joulesEnergy: number$1().finite().min(0).max(200).optional(),
	pulseWidthMs: number$1().finite().min(0).max(1e3).optional(),
	shotCount: number$1().int().min(0).max(1e5).optional(),
	skinReaction: string().trim().max(200).optional(),
	operatorName: string().trim().max(80).optional(),
	doctorNotes: string().trim().max(2e3).optional(),
	scheduleNextSession: boolean().optional(),
	nextSessionDate: string().trim().max(40).nullable().optional()
});
var clinicalRecordSchema = object({
	customerId: string().trim().min(1).max(64),
	bookingId: string().trim().min(1).max(64).nullable().optional(),
	sessionNumber: number$1().int().min(1).max(200).optional(),
	totalSessions: number$1().int().min(1).max(200).optional(),
	treatedAreas: string().trim().max(500).optional(),
	deviceModel: string().trim().max(120).optional(),
	joulesEnergy: number$1().finite().min(0).max(200).optional(),
	pulseWidthMs: number$1().finite().min(0).max(1e3).optional(),
	shotCount: number$1().int().min(0).max(1e5).optional(),
	skinReaction: string().trim().max(200).optional(),
	operatorName: string().trim().max(80).optional(),
	doctorNotes: string().trim().max(2e3).nullable().optional(),
	nextSessionRecommendedAt: string().trim().max(40).nullable().optional()
});
var accountingTransactionSchema = object({
	customerId: string().trim().min(1).max(64).nullable().optional(),
	bookingId: string().trim().min(1).max(64).nullable().optional(),
	amount: number$1().int().min(0).max(1e9, "مبلغ سند نامعتبر است."),
	type: transactionTypeSchema.optional(),
	method: paymentMethodSchema.optional(),
	category: transactionCategorySchema.optional(),
	description: string().trim().max(500).nullable().optional(),
	trackingNumber: string().trim().max(80).nullable().optional()
});
var sendSmsSchema = object({
	phone: phoneSchema,
	message: string().trim().min(1).max(1200, "متن پیامک طولانی است."),
	customerId: string().trim().min(1).max(64).nullable().optional(),
	templateName: string().trim().min(1).max(60).optional()
});
var lotteryCampaignSchema = object({
	title: string().trim().min(2, "عنوان دوره الزامی است.").max(120),
	prize: string().trim().min(1, "جایزه الزامی است.").max(200),
	minSpending: number$1().finite().min(0).max(1e9).optional(),
	drawDate: string().trim().max(40).nullable().optional()
});
var lotteryDrawSchema = object({ campaignId: string().trim().min(1).max(64) });
var discountFestivalSchema = object({
	title: string().trim().min(2, "عنوان جشنواره الزامی است.").max(120),
	slug: slugSchema.optional(),
	/** D1 CHECK: discount_percent BETWEEN 1 AND 100, starts_at/ends_at NOT NULL. */
	discountPercent: number$1().int().min(1).max(100).optional(),
	description: string().trim().max(2e3).nullable().optional(),
	bannerImage: string().trim().max(500).nullable().optional(),
	startsAt: string().trim().min(1).max(40),
	endsAt: string().trim().min(1).max(40),
	active: boolean().optional()
});
var instagramSettingsSchema = object({
	username: string().trim().max(60).optional(),
	bioLink: string().trim().max(300).optional(),
	promoCode: string().trim().max(40).optional(),
	latestReel: string().trim().max(300).optional(),
	discountPercent: number$1().finite().min(0).max(100).optional()
});
//#endregion
//#region src/domain/booking/booking.state.ts
/** Hard-rule transition table. See canTransitionBookingState(). */
var BOOKING_TRANSITIONS = {
	pending: [
		"confirmed",
		"rejected",
		"cancelled"
	],
	confirmed: [
		"completed",
		"no_show",
		"cancelled"
	],
	rejected: [],
	cancelled: [],
	completed: [],
	no_show: []
};
function canTransitionBookingState(current, next) {
	if (current === next) return false;
	return BOOKING_TRANSITIONS[current].includes(next);
}
//#endregion
//#region src/domain/pricing/pricing.ts
var PricingError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.name = "PricingError";
		this.code = code;
	}
};
/**
* Server-authoritative quote. The client only ever *presents* prices — every stored
* booking amount is produced here from (service × category × current price × discount).
*/
function calculateQuote(service, prices, category, discountPercent) {
	if (!service.active) throw new PricingError("SERVICE_INACTIVE", "این خدمت در حال حاضر غیرفعال است.");
	const row = prices.find((price) => price.pricingCategory === category);
	if (!row) throw new PricingError("PRICE_NOT_CONFIGURED", "قیمت این خدمت برای این دسته هنوز ثبت نشده است.");
	const percent = Math.min(100, Math.max(0, Math.round(discountPercent)));
	const baseAmount = row.amount;
	const discountAmount = Math.round(baseAmount * percent / 100);
	return {
		serviceId: service.id,
		pricingCategory: category,
		baseAmount,
		discountPercent: percent,
		discountAmount,
		totalAmount: baseAmount - discountAmount,
		currency: row.currency,
		durationMinutes: service.durationMinutes
	};
}
/** Whether a public price row exists for the requested category (drives "price on request" UI). */
function hasPriceFor(prices, category) {
	return prices.some((price) => price.pricingCategory === category);
}
//#endregion
//#region src/domain/schedule/availability.ts
/** Availability engine — pure, bounded, server-side.
*
*  Input is deliberately small: one day's open hours, that day's exceptions, the
*  already-occupied slot set (one indexed range query on booking_slots), and the
*  booking parameters. There is no per-minute or per-slot database access (contract
*  §17: one bounded indexed query + in-memory interval calculation).
*/
var MAX_SLOTS_PER_DAY = 512;
/** Reduce regular hours + day exceptions into concrete open segments and blocked ranges. */
function effectiveDay(input) {
	const weekday = weekdayOf(input.localDate);
	const dayExceptions = input.exceptions.filter((exception) => exception.date === input.localDate);
	if (dayExceptions.some((exception) => exception.kind === "closed" || exception.kind === "holiday")) return {
		segments: [],
		blocked: []
	};
	let segments = (input.hours.find((row) => row.weekday === weekday)?.segments ?? []).map((segment) => ({ ...segment }));
	const overrides = dayExceptions.filter((exception) => (exception.kind === "special_hours" || exception.kind === "temporary_change") && exception.opensAt !== null && exception.closesAt !== null);
	if (overrides.length > 0) segments = overrides.map((exception) => ({
		opensAt: exception.opensAt,
		closesAt: exception.closesAt
	}));
	const blocked = dayExceptions.filter((exception) => exception.kind === "blocked_time" && exception.opensAt !== null && exception.closesAt !== null).map((exception) => ({
		startsAt: zonedTimeToUtc(input.localDate, exception.opensAt, input.timezone),
		endsAt: zonedTimeToUtc(input.localDate, exception.closesAt, input.timezone)
	}));
	return {
		segments,
		blocked
	};
}
/** Every bookable start for one day, ascending. Only genuinely free slots are returned. */
function calculateAvailability(input) {
	const { localDate, timezone, durationMinutes, granularityMinutes, bufferMinutes } = input;
	const { segments, blocked } = effectiveDay(input);
	const earliestInstant = addMinutes(input.nowIso, input.minLeadMinutes);
	const earliestIdx = localMinutesOf(earliestInstant, timezone);
	const slots = [];
	for (const segment of segments) {
		const segmentStart = zonedTimeToUtc(localDate, segment.opensAt, timezone);
		const segmentEnd = zonedTimeToUtc(localDate, segment.closesAt, timezone);
		if (segmentStart >= segmentEnd) continue;
		const firstIdx = Math.ceil(localMinutesOf(segmentStart, timezone) / granularityMinutes) * granularityMinutes;
		const endIdx = localMinutesOf(segmentEnd, timezone);
		for (let idx = firstIdx; idx < endIdx && slots.length < MAX_SLOTS_PER_DAY; idx += granularityMinutes) {
			if (idx < earliestIdx) continue;
			const startsAt = instantFromLocalMinutes(idx, timezone);
			const endsAt = addMinutes(startsAt, durationMinutes);
			if (Date.parse(endsAt) > Date.parse(segmentEnd)) break;
			if (blocked.some((range) => overlaps(startsAt, endsAt, range.startsAt, range.endsAt))) continue;
			let occupied = false;
			const claimEnd = idx + durationMinutes + bufferMinutes;
			for (let claimIdx = idx; claimIdx < claimEnd; claimIdx += granularityMinutes) if (input.occupiedSlots.has(instantFromLocalMinutes(claimIdx, timezone))) {
				occupied = true;
				break;
			}
			if (occupied) continue;
			slots.push({
				startsAt,
				endsAt,
				available: true
			});
		}
	}
	return slots;
}
//#endregion
//#region src/domain/booking/booking.slots.ts
/** Slot-grid math — the backbone of double-booking protection and availability.
*
*  Slots are indexed on the clinic's *local wall clock* (minutes since 1970-01-01 local),
*  quantised to the configured granularity, then converted back to ISO instants. Because
*  every write canonicalises the same way, `booking_slots(staff_key, slot_start)` behaves
*  as an exclusion constraint in plain SQLite/D1 (which has no EXCLUDE constraint).
*/
/** Slot owner for bookings with no assigned staff. */
var CLINIC_SLOT_OWNER = "clinic";
function staffSlotKey(staffId) {
	return staffId ? `staff:${staffId}` : CLINIC_SLOT_OWNER;
}
/** Alias for staffSlotKey. */
var slotStaffKey = staffSlotKey;
/** Generates canonical grid slot instants for a booking duration. */
function buildSlotInstants(startsAt, durationMinutes, granularityMinutes, timezone = "Asia/Tehran") {
	return occupiedSlotStarts({
		startsAt,
		durationMinutes,
		bufferMinutes: 0,
		timezone,
		granularityMinutes
	});
}
function quantise(localMinutes, granularityMinutes) {
	return Math.floor(localMinutes / granularityMinutes) * granularityMinutes;
}
/** Every grid slot a booking occupies: [startsAt, startsAt + duration + buffer). */
function occupiedSlotStarts(input) {
	const { startsAt, durationMinutes, bufferMinutes, timezone, granularityMinutes } = input;
	const startIdx = quantise(localMinutesOf(startsAt, timezone), granularityMinutes);
	const endIdx = localMinutesOf(addMinutes(startsAt, durationMinutes + bufferMinutes), timezone);
	const slots = [];
	for (let idx = startIdx; idx < endIdx; idx += granularityMinutes) slots.push(instantFromLocalMinutes(idx, timezone));
	if (slots.length === 0) slots.push(instantFromLocalMinutes(startIdx, timezone));
	return slots;
}
//#endregion
//#region src/domain/settings/settings.types.ts
function parseOperationalSettings(raw) {
	const num = (key, fallback, min, max) => {
		const parsed = Number.parseInt(raw[key] ?? "", 10);
		if (Number.isNaN(parsed)) return fallback;
		return Math.min(max, Math.max(min, parsed));
	};
	return {
		timezone: raw["timezone"] ?? "Asia/Tehran",
		currency: raw["currency"] ?? "IRT",
		currencyLabel: raw["currency_label"] ?? "تومان",
		discountPercent: num("discount_percent", 0, 0, 100),
		bookingEnabled: (raw["booking_enabled"] ?? "false") === "true",
		slotGranularityMinutes: num("slot_granularity_minutes", 15, 5, 120),
		bookingBufferMinutes: num("booking_buffer_minutes", 0, 0, 120),
		minLeadMinutes: num("min_lead_minutes", 0, 0, 43200),
		maxAdvanceDays: num("max_advance_days", 90, 1, 365)
	};
}
//#endregion
//#region src/server/booking.ts
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
var REFERENCE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function generateBookingReference() {
	let code = "";
	const bytes = /* @__PURE__ */ new Uint8Array(5);
	crypto.getRandomValues(bytes);
	for (let i = 0; i < 5; i++) code += REFERENCE_CHARS[bytes[i] % 32];
	return `TL-${code}`;
}
async function createBooking(db, params) {
	if (params.idempotencyKey) {
		const existing = await one(db, `SELECT b.id, b.reference, b.status, b.starts_at AS startsAt, b.ends_at AS endsAt,
              s.name AS serviceName, b.pricing_category AS pricingCategory,
              b.quoted_amount AS quotedAmount, b.discount_amount AS discountAmount,
              b.currency, c.name AS customerName, c.phone AS customerPhone
         FROM bookings b
         JOIN services s ON s.id = b.service_id
         JOIN customers c ON c.id = b.customer_id
        WHERE b.idempotency_key = ?`, params.idempotencyKey);
		if (existing) return {
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
			customerPhone: existing.customerPhone
		};
	}
	const slugs = params.serviceSlugs && params.serviceSlugs.length > 0 ? params.serviceSlugs : params.serviceSlug ? [params.serviceSlug] : [];
	if (slugs.length === 0) throw new ApiError("VALIDATION_ERROR", "حداقل یک خدمت باید انتخاب شود.");
	const placeholders = slugs.map(() => "?").join(",");
	const services = await all(db, `SELECT id, slug, name, duration_minutes AS durationMinutes, active
       FROM services
      WHERE slug IN (${placeholders})`, ...slugs);
	if (services.length !== slugs.length || services.some((s) => s.active !== 1)) throw new ApiError("SERVICE_INACTIVE", "یک یا چند خدمت انتخاب‌شده فعال یا معتبر نیست.");
	services.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
	const [rawSettings, ...pricesPerService] = await Promise.all([getPublicSettings(db), ...services.map((s) => loadPriceRowsForService(db, s.id))]);
	const settings = parseOperationalSettings(rawSettings);
	if (!settings.bookingEnabled) throw new ApiError("BOOKING_DISABLED", "سیستم رزرو آنلاین در حال حاضر غیرفعال است.");
	for (let i = 0; i < services.length; i++) {
		const s = services[i];
		if (!hasPriceFor(pricesPerService[i] ?? [], params.pricingCategory)) throw new ApiError("VALIDATION_ERROR", `قیمت خدمت «${s.name}» برای دسته انتخابی تعریف نشده است. لطفاً با کلینیک تماس بگیرید.`);
	}
	const quotes = services.map((s, i) => calculateQuote({
		id: s.id,
		durationMinutes: s.durationMinutes,
		active: s.active === 1
	}, pricesPerService[i] ?? [], params.pricingCategory, settings.discountPercent));
	const totalBaseAmount = quotes.reduce((acc, q) => acc + q.baseAmount, 0);
	const totalDiscountAmount = quotes.reduce((acc, q) => acc + q.discountAmount, 0);
	const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
	const currency = quotes[0]?.currency ?? "IRT";
	const localDate = localDateOf(params.startsAtIso, settings.timezone);
	const totalEndsAtIso = new Date(Date.parse(params.startsAtIso) + totalDurationMinutes * 6e4).toISOString();
	const [businessHours, exceptions, occupied] = await Promise.all([
		listBusinessHours(db),
		listScheduleExceptionsForDate(db, localDate),
		findOccupiedSlotStarts(db, slotStaffKey(null), params.startsAtIso, totalEndsAtIso)
	]);
	if (occupied.length > 0) throw new ApiError("BOOKING_CONFLICT", "این زمان دیگر قابل رزرو نیست.");
	const slotMatch = calculateAvailability({
		localDate,
		timezone: settings.timezone,
		hours: toHoursRows(businessHours),
		exceptions,
		durationMinutes: totalDurationMinutes,
		granularityMinutes: settings.slotGranularityMinutes,
		bufferMinutes: settings.bookingBufferMinutes,
		occupiedSlots: new Set(occupied),
		nowIso: (/* @__PURE__ */ new Date()).toISOString(),
		minLeadMinutes: settings.minLeadMinutes
	}).find((s) => s.startsAt === params.startsAtIso && s.available);
	if (!slotMatch) throw new ApiError("SLOT_UNAVAILABLE", "زمان انتخابی در دسترس نیست.");
	const endsAtIso = slotMatch.endsAt;
	let customer = await one(db, `SELECT id FROM customers WHERE phone = ?`, params.customerPhone);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	if (!customer) {
		const customerId = crypto.randomUUID();
		await run(db, `INSERT INTO customers (id, name, phone, email, pricing_category, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, customerId, params.customerName, params.customerPhone, params.customerEmail ?? null, params.pricingCategory, nowIso, nowIso);
		customer = { id: customerId };
	} else await run(db, `UPDATE customers SET name = ?, email = COALESCE(?, email), updated_at = ? WHERE id = ?`, params.customerName, params.customerEmail ?? null, nowIso, customer.id);
	const requiredSlots = buildSlotInstants(params.startsAtIso, totalDurationMinutes, settings.slotGranularityMinutes);
	const bookingId = crypto.randomUUID();
	const reference = generateBookingReference();
	const serviceListDesc = `نواحی انتخابی (${services.length}): ${services.map((s) => s.name).join("، ")}`;
	const finalCustomerNote = services.length > 1 ? params.customerNote ? `${serviceListDesc} — ${params.customerNote}` : serviceListDesc : params.customerNote ?? null;
	const batchStatements = [];
	batchStatements.push(db.prepare(`INSERT INTO bookings (
           id, reference, customer_id, service_id, staff_id, pricing_category,
           starts_at, ends_at, status, quoted_amount, discount_amount, currency,
           customer_note, idempotency_key, created_at, updated_at
         ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).bind(bookingId, reference, customer.id, services[0].id, params.pricingCategory, params.startsAtIso, endsAtIso, totalBaseAmount, totalDiscountAmount, currency, finalCustomerNote, params.idempotencyKey ?? null, nowIso, nowIso));
	for (const slotStart of requiredSlots) batchStatements.push(db.prepare(`INSERT INTO booking_slots (staff_key, slot_start, booking_id) VALUES (?, ?, ?)`).bind(slotStaffKey(null), slotStart, bookingId));
	batchStatements.push(db.prepare(`INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, 'created', NULL, 'ثبت نوبت توسط مشتری', ?)`).bind(crypto.randomUUID(), bookingId, nowIso));
	try {
		await db.batch(batchStatements);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("UNIQUE constraint failed") || msg.includes("PRIMARY KEY")) throw new ApiError("BOOKING_CONFLICT", "این زمان توسط مشتری دیگری رزرو شد.");
		throw err;
	}
	return {
		bookingId,
		reference,
		status: "pending",
		startsAt: params.startsAtIso,
		endsAt: endsAtIso,
		serviceName: services.map((s) => s.name).join(" + "),
		pricingCategory: params.pricingCategory,
		quotedAmount: totalBaseAmount,
		discountAmount: totalDiscountAmount,
		currency,
		customerName: params.customerName,
		customerPhone: params.customerPhone
	};
}
async function transitionBooking(db, bookingId, targetStatus, actorId, reason) {
	const booking = await one(db, `SELECT id, status, staff_id AS staffId FROM bookings WHERE id = ?`, bookingId);
	if (!booking) throw new ApiError("NOT_FOUND", "رزرو یافت نشد.");
	if (!canTransitionBookingState(booking.status, targetStatus)) throw new ApiError("INVALID_BOOKING_STATUS", `تغییر وضعیت از «${booking.status}» به «${targetStatus}» مجاز نیست.`);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const batch = [];
	batch.push(db.prepare(`UPDATE bookings
            SET status = ?,
                rejection_reason = CASE WHEN ? = 'rejected' THEN ? ELSE rejection_reason END,
                updated_at = ?
          WHERE id = ?`).bind(targetStatus, targetStatus, reason ?? null, nowIso, bookingId));
	if (targetStatus === "cancelled" || targetStatus === "rejected") batch.push(db.prepare(`DELETE FROM booking_slots WHERE booking_id = ?`).bind(bookingId));
	batch.push(db.prepare(`INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), bookingId, targetStatus, actorId, reason ?? `تغییر وضعیت به ${targetStatus}`, nowIso));
	await db.batch(batch);
	await writeAuditLog(db, actorId, `booking.${targetStatus}`, "booking", bookingId);
	return {
		id: bookingId,
		status: targetStatus
	};
}
async function rescheduleBooking(db, bookingId, newStartsAtIso, newStaffId, actorId) {
	const booking = await one(db, `SELECT b.id, b.service_id AS serviceId, b.status,
            s.duration_minutes AS durationMinutes, b.starts_at AS startsAt
       FROM bookings b
       JOIN services s ON s.id = b.service_id
      WHERE b.id = ?`, bookingId);
	if (!booking) throw new ApiError("NOT_FOUND", "رزرو یافت نشد.");
	if (booking.status === "cancelled" || booking.status === "rejected" || booking.status === "completed") throw new ApiError("INVALID_BOOKING_STATUS", "تنها رزروهای در انتظار، تأییدشده یا عدم حضور قابل زمان‌بندی مجدد هستند.");
	const settings = parseOperationalSettings(await getPublicSettings(db));
	const localDate = localDateOf(newStartsAtIso, settings.timezone);
	const [businessHours, exceptions, occupied] = await Promise.all([
		listBusinessHours(db),
		listScheduleExceptionsForDate(db, localDate),
		findOccupiedSlotStarts(db, slotStaffKey(newStaffId), newStartsAtIso, new Date(Date.parse(newStartsAtIso) + booking.durationMinutes * 6e4).toISOString())
	]);
	if (!calculateAvailability({
		localDate,
		timezone: settings.timezone,
		hours: toHoursRows(businessHours),
		exceptions,
		durationMinutes: booking.durationMinutes,
		granularityMinutes: settings.slotGranularityMinutes,
		bufferMinutes: settings.bookingBufferMinutes,
		occupiedSlots: new Set(occupied),
		nowIso: (/* @__PURE__ */ new Date()).toISOString(),
		minLeadMinutes: settings.minLeadMinutes
	}).find((s) => s.startsAt === newStartsAtIso && s.available)) throw new ApiError("SLOT_UNAVAILABLE", "زمان جدید در ساعات کاری یا در دسترس نیست.");
	const foreignClash = await one(db, `SELECT COUNT(*) AS count
       FROM booking_slots
      WHERE staff_key = ?
        AND slot_start >= ?
        AND slot_start < ?
        AND booking_id != ?`, slotStaffKey(newStaffId), newStartsAtIso, new Date(Date.parse(newStartsAtIso) + booking.durationMinutes * 6e4).toISOString(), bookingId);
	if (foreignClash && foreignClash.count > 0) throw new ApiError("BOOKING_CONFLICT", "زمان جدید با رزرو دیگری تداخل دارد.");
	const newEndsAtIso = new Date(Date.parse(newStartsAtIso) + booking.durationMinutes * 6e4).toISOString();
	const newSlots = buildSlotInstants(newStartsAtIso, booking.durationMinutes, settings.slotGranularityMinutes);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const batch = [db.prepare(`DELETE FROM booking_slots WHERE booking_id = ?`).bind(bookingId), db.prepare(`UPDATE bookings
            SET starts_at = ?, ends_at = ?, staff_id = ?, updated_at = ?
          WHERE id = ?`).bind(newStartsAtIso, newEndsAtIso, newStaffId, nowIso, bookingId)];
	for (const s of newSlots) batch.push(db.prepare(`INSERT INTO booking_slots (staff_key, slot_start, booking_id) VALUES (?, ?, ?)`).bind(slotStaffKey(newStaffId), s, bookingId));
	const detail = `${booking.startsAt} → ${newStartsAtIso}`;
	batch.push(db.prepare(`INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, 'rescheduled', ?, ?, ?)`).bind(crypto.randomUUID(), bookingId, actorId, detail, nowIso));
	await db.batch(batch);
	await writeAuditLog(db, actorId, "booking.rescheduled", "booking", bookingId);
	return {
		id: bookingId,
		startsAt: newStartsAtIso,
		endsAt: newEndsAtIso
	};
}
//#endregion
//#region src/server/notifications.ts
/** Notification abstraction (contract §49, §50, §51, §210).
*
*  Design rules:
*  - Primary operations (booking creation / confirmation) must never fail because a
*    notification channel was slow or unreachable.
*  - Channels are isolated: Telegram error does not throw out of booking flow.
*  - Deduplication is atomic in D1: a duplicate event is ignored via dedupe_key.
*  - Secrets (bot token, chat id) stay server-side, read from private settings or env.
*/
var TelegramProvider = class {
	botToken;
	chatId;
	channel = "telegram";
	constructor(botToken, chatId) {
		this.botToken = botToken;
		this.chatId = chatId;
	}
	async send(payload) {
		const text = formatTelegramMessage(payload);
		const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					chat_id: this.chatId,
					text,
					parse_mode: "HTML"
				})
			});
			if (!res.ok) {
				const body = await res.text();
				return {
					ok: false,
					error: `HTTP ${res.status}: ${body.slice(0, 200)}`
				};
			}
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}
};
function formatTelegramMessage(p) {
	const titles = {
		"booking.created": "🔔 <b>رزرو جدید ثبت شد</b>",
		"booking.confirmed": "✅ <b>رزرو تأیید شد</b>",
		"booking.rejected": "❌ <b>رزرو رد شد</b>",
		"booking.cancelled": "🚫 <b>رزرو لغو شد</b>",
		"booking.rescheduled": "🔄 <b>زمان رزرو تغییر کرد</b>"
	};
	const categoryLabel = p.pricingCategory === "female" ? "بانوان" : "آقایان";
	const priceFormatted = (p.quotedAmount - p.discountAmount).toLocaleString("fa-IR");
	let msg = `${titles[p.eventType]}

<b>کد رهگیری:</b> <code>${escapeHtml(p.reference)}</code>
<b>مشتری:</b> ${escapeHtml(p.customerName)} (${escapeHtml(p.customerPhone)})
<b>خدمت:</b> ${escapeHtml(p.serviceName)} (${categoryLabel})
<b>زمان (UTC):</b> ${p.startsAtIso}
<b>مبلغ نهایی:</b> ${priceFormatted} ${escapeHtml(p.currency)}`;
	if (p.rejectionReason) msg += `\n<b>علت رد:</b> ${escapeHtml(p.rejectionReason)}`;
	return msg;
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
var WhatsAppProvider = class {
	apiUrl;
	apiKey;
	channel = "whatsapp";
	constructor(apiUrl, apiKey) {
		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
	}
	async send(payload) {
		if (!this.apiUrl || !this.apiKey) return {
			ok: false,
			error: "سرویس‌دهنده واتس‌اپ تنظیم نشده است."
		};
		try {
			const res = await fetch(this.apiUrl, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${this.apiKey}`
				},
				body: JSON.stringify(payload)
			});
			return res.ok ? { ok: true } : {
				ok: false,
				error: `HTTP ${res.status}`
			};
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}
};
async function dispatchNotification(db, payload, channel) {
	const dedupeKey = `${payload.eventType}:${payload.bookingId}:${channel}`;
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	if (await one(db, `SELECT id, status FROM notification_events WHERE dedupe_key = ?`, dedupeKey)) return;
	const eventId = crypto.randomUUID();
	await run(db, `INSERT INTO notification_events (id, dedupe_key, event_type, booking_id, channel, status, attempts, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', 0, ?)`, eventId, dedupeKey, payload.eventType, payload.bookingId, channel, nowIso);
	let provider = null;
	if (channel === "telegram") {
		const [enabled, token, chatId] = await Promise.all([
			getSettingValue(db, "telegram_enabled"),
			getSettingValue(db, "telegram_bot_token"),
			getSettingValue(db, "telegram_chat_id")
		]);
		if (enabled === "true" && token && chatId) provider = new TelegramProvider(token, chatId);
	} else if (channel === "whatsapp") {
		const [enabled, url, key] = await Promise.all([
			getSettingValue(db, "whatsapp_enabled"),
			getSettingValue(db, "whatsapp_api_url"),
			getSettingValue(db, "whatsapp_api_key")
		]);
		if (enabled === "true" && url && key) provider = new WhatsAppProvider(url, key);
	}
	if (!provider) {
		await run(db, `UPDATE notification_events SET status = 'failed', last_error = 'سرویس‌دهنده فعال یا تنظیم نشده است.', attempts = 1 WHERE id = ?`, eventId);
		return;
	}
	const result = await provider.send(payload);
	const finishIso = (/* @__PURE__ */ new Date()).toISOString();
	if (result.ok) await run(db, `UPDATE notification_events SET status = 'sent', sent_at = ?, attempts = attempts + 1 WHERE id = ?`, finishIso, eventId);
	else await run(db, `UPDATE notification_events SET status = 'failed', last_error = ?, attempts = attempts + 1 WHERE id = ?`, (result.error ?? "خطای نامشخص").slice(0, 500), eventId);
}
//#endregion
//#region src/server/http/router.ts
/** Central HTTP router for /api/v1 (contract §5, §6, §159).
*
*  Both the production Astro middleware/API routes and the integration-test worker
*  delegate here. Keeps a single authoritative route table.
*
*  Envelope: ok() / fail() / handleRoute(). Never leak stack traces.
*/
async function handleApiRequest(request, locals, pathname) {
	const method = request.method;
	return handleRoute(async () => {
		if (pathname === "/api/health" && method === "GET") {
			let dbStatus = "ok";
			try {
				await one(env.DB, "SELECT 1");
			} catch {
				dbStatus = "error";
			}
			return ok({
				status: dbStatus === "ok" ? "ok" : "degraded",
				database: dbStatus,
				version: "1.0.0",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
		}
		if (pathname === "/api/v1/auth/login" && method === "POST") {
			const clientIp = request.headers.get("cf-connecting-ip") ?? "local";
			const rlPolicy = parseRateLimitPolicy(await getSettingValue(env.DB, "rate_limit_login") ?? void 0, {
				limit: 10,
				windowSeconds: 600
			});
			if (!(await consumeRateLimit(env.DB, `login:${clientIp}`, rlPolicy, /* @__PURE__ */ new Date())).allowed) throw new ApiError("RATE_LIMITED", "تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً بعداً امتحان کنید.");
			const body = await parseBody(request, loginSchema);
			const user = await one(env.DB, `SELECT id, email, display_name AS displayName, password_hash AS passwordHash, active
           FROM users
          WHERE email = ?`, body.email);
			if (!user || user.active !== 1) throw new ApiError("FORBIDDEN", "ایمیل یا رمز عبور اشتباه است.");
			if (!await verifyPassword(body.password, user.passwordHash)) throw new ApiError("FORBIDDEN", "ایمیل یا رمز عبور اشتباه است.");
			const session = await createSession(env.DB, user.id);
			const isSecure = isSecureRequest(request);
			const cookieHeader = buildSessionCookie(session.token, {
				maxAgeSeconds: 604800,
				secure: isSecure
			});
			await writeAuditLog(env.DB, user.id, "admin.login", "user", user.id);
			const res = ok(await one(env.DB, `SELECT id, email, display_name AS displayName FROM users WHERE id = ?`, user.id));
			res.headers.set("set-cookie", cookieHeader);
			return res;
		}
		if (pathname === "/api/v1/auth/logout" && method === "POST") {
			if (locals.auth) {
				const rawToken = request.headers.get("cookie")?.match(/tl_session=([^;]+)/)?.[1];
				if (rawToken) await revokeSession(env.DB, rawToken);
				await writeAuditLog(env.DB, locals.auth.id, "admin.logout", "user", locals.auth.id);
			}
			const res = ok({ success: true });
			res.headers.set("set-cookie", clearSessionCookie(isSecureRequest(request)));
			return res;
		}
		if (pathname === "/api/v1/me" && method === "GET") {
			if (!locals.auth) throw new ApiError("AUTH_REQUIRED", "ابتدا وارد حساب مدیریت شوید.");
			return ok({
				id: locals.auth.id,
				email: locals.auth.email,
				displayName: locals.auth.displayName,
				roles: locals.auth.roles,
				permissions: locals.auth.permissions
			});
		}
		if (pathname === "/api/v1/services" && method === "GET") return ok(await listPublicServices(env.DB));
		if (pathname.startsWith("/api/v1/services/") && method === "GET") {
			const slug = pathname.slice(17);
			const service = await findPublicServiceBySlug(env.DB, slug);
			if (!service) throw new ApiError("NOT_FOUND", "خدمت مورد نظر یافت نشد.");
			return ok(service);
		}
		if (pathname === "/api/v1/availability" && method === "GET") {
			const q = getSearchParams(request);
			const category = parseValue(pricingCategorySchema, q.category, "دسته قیمتی انتخاب‌شده معتبر نیست.");
			const localDate = parseValue(localDateSchema, q.date, "تاریخ انتخاب‌شده معتبر نیست.");
			const staffId = typeof q.staffId === "string" && q.staffId ? q.staffId.slice(0, 64) : null;
			const rawSlugs = (typeof q.services === "string" && q.services ? q.services : typeof q.service === "string" ? q.service : "").split(",").map((s) => s.trim()).filter(Boolean);
			if (rawSlugs.length === 0) throw new ApiError("VALIDATION_ERROR", "حداقل یک خدمت برای استعلام الزامی است.");
			if (rawSlugs.length > 20) throw new ApiError("VALIDATION_ERROR", "حداکثر ۲۰ خدمت در هر درخواست ظرفیت مجاز است.");
			const slugs = [...new Set(rawSlugs.map((s) => parseValue(slugSchema, s, "نام خدمت انتخاب‌شده معتبر نیست.")))];
			const placeholders = slugs.map(() => "?").join(",");
			const services = await all(env.DB, `SELECT id, slug, name, duration_minutes AS durationMinutes, active
           FROM services
          WHERE slug IN (${placeholders})`, ...slugs);
			if (services.length === 0) throw new ApiError("NOT_FOUND", "خدمت یا خدمات یافت نشد.");
			services.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
			const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
			const [rawSettings, hours, exceptions, occupied] = await Promise.all([
				getPublicSettings(env.DB),
				listBusinessHours(env.DB),
				listScheduleExceptionsForDate(env.DB, localDate),
				findOccupiedSlotStarts(env.DB, slotStaffKey(staffId), `${localDate}T00:00:00.000Z`, `${localDate}T23:59:59.999Z`)
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
				nowIso: (/* @__PURE__ */ new Date()).toISOString(),
				minLeadMinutes: settings.minLeadMinutes
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
				slots: availability
			});
		}
		if (pathname === "/api/v1/bookings" && method === "POST") {
			const clientIp = request.headers.get("cf-connecting-ip") ?? "local";
			const rlPolicy = parseRateLimitPolicy(await getSettingValue(env.DB, "rate_limit_booking") ?? void 0, {
				limit: 20,
				windowSeconds: 600
			});
			if (!(await consumeRateLimit(env.DB, `booking:${clientIp}`, rlPolicy, /* @__PURE__ */ new Date())).allowed) throw new ApiError("RATE_LIMITED", "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.");
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
				idempotencyKey: body.idempotencyKey
			});
			const notificationPayload = {
				eventType: "booking.created",
				bookingId: booking.bookingId,
				reference: booking.reference,
				customerName: booking.customerName,
				customerPhone: booking.customerPhone,
				serviceName: booking.serviceName,
				pricingCategory: booking.pricingCategory,
				startsAtIso: booking.startsAt,
				quotedAmount: booking.quotedAmount,
				discountAmount: booking.discountAmount,
				currency: booking.currency
			};
			try {
				await dispatchNotification(env.DB, notificationPayload, "telegram");
			} catch (err) {
				console.error("Notification dispatch failure:", err);
			}
			return okWithStatus(booking, 201);
		}
		if (pathname === "/api/v1/blog" && method === "GET") {
			const q = getSearchParams(request);
			const limit = q.limit ? Number(q.limit) : 10;
			const cursor = typeof q.cursor === "string" ? q.cursor : void 0;
			return ok(await listPublicBlogPosts(env.DB, limit, cursor));
		}
		if (pathname.startsWith("/api/v1/blog/") && method === "GET") {
			const slug = pathname.slice(13);
			const post = await findPublicBlogPostBySlug(env.DB, slug);
			if (!post) throw new ApiError("NOT_FOUND", "مقاله مورد نظر یافت نشد.");
			return ok(post);
		}
		if (pathname === "/api/v1/clinic" && method === "GET") {
			const [settings, hours] = await Promise.all([getPublicSettings(env.DB), listBusinessHours(env.DB)]);
			return ok({
				settings,
				hours
			});
		}
		if (pathname === "/api/v1/settings/public" && method === "GET") return ok(await getPublicSettings(env.DB));
		if (pathname === "/api/v1/faq" && method === "GET") return ok(await listPublicFaq(env.DB));
		if (pathname === "/api/v1/admin/dashboard" && method === "GET") {
			requirePermission(locals, "booking.read");
			const tz = (await getPublicSettings(env.DB)).timezone ?? "Asia/Tehran";
			const today = localDateOf((/* @__PURE__ */ new Date()).toISOString(), tz);
			const todayStartIso = `${today}T00:00:00.000Z`;
			const todayEndIso = `${today}T23:59:59.999Z`;
			return ok(await getAdminDashboard(env.DB, todayStartIso, todayEndIso));
		}
		if (pathname === "/api/v1/admin/bookings" && method === "GET") {
			requirePermission(locals, "booking.read");
			const q = getSearchParams(request);
			return ok(await listAdminBookings(env.DB, {
				status: typeof q.status === "string" ? q.status : void 0,
				staffId: typeof q.staffId === "string" ? q.staffId : void 0,
				serviceId: typeof q.serviceId === "string" ? q.serviceId : void 0,
				fromStartsAt: typeof q.fromStartsAt === "string" ? q.fromStartsAt : void 0,
				toStartsAt: typeof q.toStartsAt === "string" ? q.toStartsAt : void 0,
				search: typeof q.q === "string" ? q.q : void 0,
				limit: q.limit ? Number(q.limit) : 20,
				cursor: typeof q.cursor === "string" ? q.cursor : void 0
			}));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/accept$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.accept");
			const id = pathname.split("/")[5];
			return ok(await transitionBooking(env.DB, id, "confirmed", auth.id));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/reject$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.reject");
			const id = pathname.split("/")[5];
			const body = await parseBody(request, rejectBookingSchema);
			return ok(await transitionBooking(env.DB, id, "rejected", auth.id, body.reason));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/cancel$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.cancel");
			const id = pathname.split("/")[5];
			return ok(await transitionBooking(env.DB, id, "cancelled", auth.id));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/complete$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.complete");
			const id = pathname.split("/")[5];
			return ok(await transitionBooking(env.DB, id, "completed", auth.id));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/no-show$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.complete");
			const id = pathname.split("/")[5];
			return ok(await transitionBooking(env.DB, id, "no_show", auth.id));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+\/reschedule$/) && method === "POST") {
			const auth = requirePermission(locals, "booking.reschedule");
			const id = pathname.split("/")[5];
			const body = await parseBody(request, rescheduleBookingSchema);
			return ok(await rescheduleBooking(env.DB, id, body.startsAt, body.staffId ?? null, auth.id));
		}
		if (pathname.match(/^\/api\/v1\/admin\/bookings\/[^/]+$/) && method === "PUT") {
			const auth = requirePermission(locals, "booking.accept");
			const id = pathname.split("/")[5];
			const body = await parseBody(request, updateBookingSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE bookings
            SET admin_note = COALESCE(?, admin_note),
                customer_note = COALESCE(?, customer_note),
                quoted_amount = COALESCE(?, quoted_amount),
                updated_at = ?
          WHERE id = ?`, body.adminNote ?? null, body.customerNote ?? null, body.quotedAmount ?? null, nowIso, id);
			await writeAuditLog(env.DB, auth.id, "booking.updated", "booking", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname === "/api/v1/admin/services" && method === "GET") {
			requirePermission(locals, "service.read");
			return ok(await listAdminServices(env.DB));
		}
		if (pathname === "/api/v1/admin/services" && method === "POST") {
			const auth = requirePermission(locals, "service.write");
			const body = await parseBody(request, createServiceSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO services (id, name, slug, description, short_description, duration_minutes, active, featured, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, body.name, body.slug, body.description ?? "", body.shortDescription ?? null, body.durationMinutes, body.active ? 1 : 0, body.featured ? 1 : 0, body.displayOrder ?? 0, nowIso, nowIso);
			await writeAuditLog(env.DB, auth.id, "service.created", "service", id);
			return okWithStatus({ id }, 201);
		}
		if (pathname.startsWith("/api/v1/admin/services/") && method === "PUT") {
			const auth = requirePermission(locals, "service.write");
			const id = pathname.slice(23);
			const body = await parseBody(request, updateServiceSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE services
            SET name = COALESCE(?, name),
                slug = COALESCE(?, slug),
                description = COALESCE(?, description),
                short_description = COALESCE(?, short_description),
                duration_minutes = COALESCE(?, duration_minutes),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                featured = CASE WHEN ? IS NOT NULL THEN ? ELSE featured END,
                display_order = COALESCE(?, display_order),
                updated_at = ?
          WHERE id = ?`, body.name ?? null, body.slug ?? null, body.description ?? null, body.shortDescription ?? null, body.durationMinutes ?? null, body.active !== void 0 ? body.active ? 1 : 0 : null, body.active !== void 0 ? body.active ? 1 : 0 : null, body.featured !== void 0 ? body.featured ? 1 : 0 : null, body.featured !== void 0 ? body.featured ? 1 : 0 : null, body.displayOrder ?? null, nowIso, id);
			await writeAuditLog(env.DB, auth.id, "service.updated", "service", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname.startsWith("/api/v1/admin/pricing/") && method === "PUT") {
			const auth = requirePermission(locals, "pricing.write");
			const serviceId = pathname.slice(22);
			const body = await parseBody(request, updatePricingSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			const existing = await one(env.DB, `SELECT id FROM service_prices WHERE service_id = ? AND pricing_category = ?`, serviceId, body.pricingCategory);
			if (existing) await run(env.DB, `UPDATE service_prices SET amount = ?, currency = ?, updated_at = ? WHERE id = ?`, body.amount, body.currency ?? "IRT", nowIso, existing.id);
			else await run(env.DB, `INSERT INTO service_prices (id, service_id, pricing_category, amount, currency, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`, crypto.randomUUID(), serviceId, body.pricingCategory, body.amount, body.currency ?? "IRT", nowIso, nowIso);
			await writeAuditLog(env.DB, auth.id, "pricing.updated", "service_price", serviceId);
			return ok({
				serviceId,
				updated: true
			});
		}
		if (pathname === "/api/v1/admin/staff" && method === "GET") {
			requirePermission(locals, "staff.read");
			return ok(await listAdminStaff(env.DB));
		}
		if (pathname === "/api/v1/admin/staff" && method === "POST") {
			const auth = requirePermission(locals, "staff.write");
			const body = await parseBody(request, createStaffSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO staff (id, name, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, id, body.name, body.active ? 1 : 0, nowIso, nowIso);
			if (body.serviceIds && body.serviceIds.length > 0) for (const sId of body.serviceIds) await run(env.DB, `INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)`, id, sId);
			await writeAuditLog(env.DB, auth.id, "staff.created", "staff", id);
			return okWithStatus({ id }, 201);
		}
		if (pathname.startsWith("/api/v1/admin/staff/") && method === "PUT") {
			const auth = requirePermission(locals, "staff.write");
			const id = pathname.slice(20);
			const body = await parseBody(request, updateStaffSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE staff
            SET name = COALESCE(?, name),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                updated_at = ?
          WHERE id = ?`, body.name ?? null, body.active !== void 0 ? body.active ? 1 : 0 : null, body.active !== void 0 ? body.active ? 1 : 0 : null, nowIso, id);
			if (body.serviceIds) {
				await run(env.DB, `DELETE FROM staff_services WHERE staff_id = ?`, id);
				for (const sId of body.serviceIds) await run(env.DB, `INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)`, id, sId);
			}
			await writeAuditLog(env.DB, auth.id, "staff.updated", "staff", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname === "/api/v1/admin/customers" && method === "GET") {
			requirePermission(locals, "customer.read");
			const q = getSearchParams(request);
			return ok(await listAdminCustomers(env.DB, q.limit ? Number(q.limit) : 20, typeof q.cursor === "string" ? q.cursor : void 0, typeof q.q === "string" ? q.q : void 0));
		}
		if (pathname.startsWith("/api/v1/admin/customers/") && method === "PUT") {
			const auth = requirePermission(locals, "customer.update");
			const id = pathname.slice(24);
			const body = await parseBody(request, updateCustomerSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE customers
            SET name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                pricing_category = COALESCE(?, pricing_category),
                email = COALESCE(?, email),
                note = COALESCE(?, note),
                updated_at = ?
          WHERE id = ?`, body.name ?? null, body.phone ?? null, body.pricingCategory ?? null, body.email ?? null, body.note ?? null, nowIso, id);
			await writeAuditLog(env.DB, auth.id, "customer.updated", "customer", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname === "/api/v1/admin/blog" && method === "GET") {
			requirePermission(locals, "blog.read");
			const q = getSearchParams(request);
			return ok(await listAdminBlogPosts(env.DB, q.limit ? Number(q.limit) : 20, typeof q.cursor === "string" ? q.cursor : void 0));
		}
		if (pathname === "/api/v1/admin/blog" && method === "POST") {
			const auth = requirePermission(locals, "blog.write");
			const body = await parseBody(request, createBlogPostSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO blog_posts (
           id, title, slug, excerpt, content, cover_image, category_id,
           author, status, published_at, seo_title, seo_description,
           canonical_url, og_title, og_description, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, body.title, body.slug, body.excerpt ?? "", body.content, body.coverImage ?? null, body.categoryId ?? null, body.author ?? auth.displayName, body.status ?? "draft", body.publishedAt ?? (body.status === "published" ? nowIso : null), body.seoTitle ?? null, body.seoDescription ?? null, body.canonicalUrl ?? null, body.ogTitle ?? null, body.ogDescription ?? null, nowIso, nowIso);
			await writeAuditLog(env.DB, auth.id, "blog.created", "blog_post", id);
			return okWithStatus({ id }, 201);
		}
		if (pathname.startsWith("/api/v1/admin/blog/") && method === "PUT") {
			const auth = requirePermission(locals, "blog.write");
			const id = pathname.slice(19);
			const body = await parseBody(request, updateBlogPostSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE blog_posts
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
          WHERE id = ?`, body.title ?? null, body.slug ?? null, body.excerpt ?? null, body.content ?? null, body.coverImage ?? null, body.categoryId ?? null, body.author ?? null, body.status ?? null, body.publishedAt ?? null, body.seoTitle ?? null, body.seoDescription ?? null, body.canonicalUrl ?? null, body.ogTitle ?? null, body.ogDescription ?? null, nowIso, id);
			await writeAuditLog(env.DB, auth.id, "blog.updated", "blog_post", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname.startsWith("/api/v1/admin/blog/") && method === "DELETE") {
			const auth = requirePermission(locals, "blog.write");
			const id = pathname.slice(19);
			await run(env.DB, `DELETE FROM blog_posts WHERE id = ?`, id);
			await writeAuditLog(env.DB, auth.id, "blog.deleted", "blog_post", id);
			return ok({
				id,
				deleted: true
			});
		}
		if (pathname === "/api/v1/admin/faq" && method === "GET") {
			requirePermission(locals, "settings.read");
			return ok(await listAdminFaq(env.DB));
		}
		if (pathname === "/api/v1/admin/faq" && method === "POST") {
			const auth = requirePermission(locals, "settings.write");
			const body = await parseBody(request, createFaqSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO faq_items (id, question, answer, display_order, active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`, id, body.question, body.answer, body.displayOrder ?? 0, body.active ? 1 : 0, nowIso);
			await writeAuditLog(env.DB, auth.id, "faq.created", "faq", id);
			return okWithStatus({ id }, 201);
		}
		if (pathname.startsWith("/api/v1/admin/faq/") && method === "PUT") {
			const auth = requirePermission(locals, "settings.write");
			const id = pathname.slice(18);
			const body = await parseBody(request, updateFaqSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE faq_items
            SET question = COALESCE(?, question),
                answer = COALESCE(?, answer),
                display_order = COALESCE(?, display_order),
                active = CASE WHEN ? IS NOT NULL THEN ? ELSE active END,
                updated_at = ?
          WHERE id = ?`, body.question ?? null, body.answer ?? null, body.displayOrder ?? null, body.active !== void 0 ? body.active ? 1 : 0 : null, body.active !== void 0 ? body.active ? 1 : 0 : null, nowIso, id);
			await writeAuditLog(env.DB, auth.id, "faq.updated", "faq", id);
			return ok({
				id,
				updated: true
			});
		}
		if (pathname.match(/^\/api\/v1\/admin\/schedule\/hours\/[0-6]$/) && method === "PUT") {
			const auth = requirePermission(locals, "schedule.write");
			const weekday = Number(pathname.split("/")[6]);
			const body = await parseBody(request, updateWeekdayHoursSchema);
			await run(env.DB, `DELETE FROM business_hours WHERE weekday = ?`, weekday);
			if (body.isOpen && body.opensAt && body.closesAt) await run(env.DB, `INSERT INTO business_hours (id, weekday, opens_at, closes_at, display_order)
           VALUES (?, ?, ?, ?, ?)`, crypto.randomUUID(), weekday, body.opensAt, body.closesAt, 0);
			await writeAuditLog(env.DB, auth.id, "schedule.updated", "business_hours", String(weekday));
			return ok({
				weekday,
				updated: true
			});
		}
		if (pathname === "/api/v1/admin/schedule/exceptions" && method === "POST") {
			const auth = requirePermission(locals, "schedule.write");
			const body = await parseBody(request, createExceptionSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO schedule_exceptions (id, exception_date, kind, opens_at, closes_at, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, id, body.exceptionDate, body.kind, body.opensAt ?? null, body.closesAt ?? null, body.note ?? null, nowIso);
			await writeAuditLog(env.DB, auth.id, "schedule_exception.created", "schedule_exception", id);
			return okWithStatus({ id }, 201);
		}
		if (pathname.startsWith("/api/v1/admin/schedule/exceptions/") && method === "DELETE") {
			const auth = requirePermission(locals, "schedule.write");
			const id = pathname.slice(34);
			await run(env.DB, `DELETE FROM schedule_exceptions WHERE id = ?`, id);
			await writeAuditLog(env.DB, auth.id, "schedule_exception.deleted", "schedule_exception", id);
			return ok({
				id,
				deleted: true
			});
		}
		if (pathname === "/api/v1/admin/settings" && method === "GET") {
			requirePermission(locals, "settings.read");
			return ok(await getAllSettings(env.DB));
		}
		if (pathname === "/api/v1/admin/settings" && method === "PUT") {
			const auth = requirePermission(locals, "settings.write");
			const body = await parseBody(request, updateSettingsSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			for (const [key, value] of Object.entries(body)) if (value !== void 0) await run(env.DB, `INSERT INTO settings (key, value, scope, updated_at)
             VALUES (?, ?, 'public', ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`, key, String(value), nowIso);
			await writeAuditLog(env.DB, auth.id, "settings.updated", "settings", null);
			return ok({ updated: true });
		}
		if (pathname === "/api/v1/admin/audit" && method === "GET") {
			requirePermission(locals, "audit.read");
			const q = getSearchParams(request);
			return ok(await listAuditLogs(env.DB, q.limit ? Number(q.limit) : 50, typeof q.cursor === "string" ? q.cursor : void 0));
		}
		if (pathname === "/api/v1/admin/notifications" && method === "GET") {
			requirePermission(locals, "settings.read");
			const q = getSearchParams(request);
			return ok(await listNotificationEvents(env.DB, q.limit ? Number(q.limit) : 50, typeof q.cursor === "string" ? q.cursor : void 0));
		}
		if (pathname === "/api/v1/admin/walkin/book" && method === "POST") {
			const auth = requirePermission(locals, "booking.accept");
			const body = await parseBody(request, walkinBookSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			let customerId = body.customerId;
			if (!customerId && body.customerPhone) {
				const existingCust = await one(env.DB, `SELECT id FROM customers WHERE phone = ?`, body.customerPhone);
				if (existingCust) customerId = existingCust.id;
				else {
					customerId = crypto.randomUUID();
					await run(env.DB, `INSERT INTO customers (id, name, phone, pricing_category, note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, customerId, body.customerName || "مراجع حضوری", body.customerPhone, body.pricingCategory || "female", body.note || "ثبت حضوری در کلینیک", nowIso, nowIso);
				}
			}
			if (!customerId) {
				const fallbackCust = await one(env.DB, `SELECT id FROM customers LIMIT 1`);
				if (fallbackCust) customerId = fallbackCust.id;
				else {
					customerId = crypto.randomUUID();
					await run(env.DB, `INSERT INTO customers (id, name, phone, pricing_category, note, created_at, updated_at)
             VALUES (?, 'مراجع حضوری', '09035555090', 'female', 'ثبت حضوری در کلینیک', ?, ?)`, customerId, nowIso, nowIso);
				}
			}
			const serviceId = body.serviceId || "svc_face";
			let service = await one(env.DB, `SELECT id, name, duration_minutes FROM services WHERE id = ? OR slug = ?`, serviceId, serviceId);
			if (!service) service = await one(env.DB, `SELECT id, name, duration_minutes FROM services LIMIT 1`) ?? {
				id: "svc_face",
				name: "لیزر کاربردی",
				duration_minutes: 30
			};
			const bookingId = crypto.randomUUID();
			const ref = "TL-W" + Math.random().toString(36).substring(2, 6).toUpperCase();
			const startsAt = body.startsAt || nowIso;
			const durationMs = (service.duration_minutes || 30) * 60 * 1e3;
			const endsAt = new Date(new Date(startsAt).getTime() + durationMs).toISOString();
			const amount = Number(body.amount) || 0;
			await run(env.DB, `INSERT INTO bookings (
           id, reference, customer_id, service_id, pricing_category,
           starts_at, ends_at, status, quoted_amount, discount_amount,
           currency, customer_note, admin_note, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, 0, 'IRR_TOMAN', ?, ?, ?, ?)`, bookingId, ref, customerId, service.id, body.pricingCategory || "female", startsAt, endsAt, amount, "پذیرش حضوری در کلینیک", body.adminNote || "انجام‌شده با موفقیت", nowIso, nowIso);
			const txId = crypto.randomUUID();
			await run(env.DB, `INSERT INTO accounting_transactions (
           id, reference, customer_id, booking_id, amount, type, method, category, description, tracking_number, created_at
         ) VALUES (?, ?, ?, ?, ?, 'income', ?, 'laser_service', ?, ?, ?)`, txId, "TX-" + Math.random().toString(36).substring(2, 7).toUpperCase(), customerId, bookingId, amount, body.paymentMethod || "pos", `پذیرش حضوری ${service.name}`, body.trackingNumber || "POS-" + Math.floor(1e4 + Math.random() * 9e4), nowIso);
			const recordId = crypto.randomUUID();
			await run(env.DB, `INSERT INTO customer_clinical_records (
           id, customer_id, booking_id, session_number, total_sessions,
           treated_areas, device_model, joules_energy, pulse_width_ms,
           shot_count, skin_reaction, operator_name, doctor_notes,
           next_session_recommended_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, recordId, customerId, bookingId, Number(body.sessionNumber) || 1, Number(body.totalSessions) || 8, service.name, body.deviceModel || "الکساندرایت کندلا جنتل پرومکس ۲۰۲۶", Number(body.joulesEnergy) || 14, Number(body.pulseWidthMs) || 3, Number(body.shotCount) || 500, body.skinReaction || "اریتم طبیعی و بدون سوختگی", body.operatorName || auth.displayName || "اپراتور کلینیک", body.doctorNotes || "پوست بدون حساسیت و آماده", body.nextSessionDate || null, nowIso);
			let nextBookingId = null;
			if (body.scheduleNextSession && body.nextSessionDate) {
				nextBookingId = crypto.randomUUID();
				const nextRef = "TL-N" + Math.random().toString(36).substring(2, 6).toUpperCase();
				const nextStartsAt = new Date(body.nextSessionDate).toISOString();
				const nextEndsAt = new Date(new Date(nextStartsAt).getTime() + durationMs).toISOString();
				await run(env.DB, `INSERT INTO bookings (
             id, reference, customer_id, service_id, pricing_category,
             starts_at, ends_at, status, quoted_amount, discount_amount,
             currency, customer_note, admin_note, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 0, 'IRR_TOMAN', ?, ?, ?, ?)`, nextBookingId, nextRef, customerId, service.id, body.pricingCategory || "female", nextStartsAt, nextEndsAt, amount, `رزرو خودکار جلسه بعدی (${(Number(body.sessionNumber) || 1) + 1} از ${Number(body.totalSessions) || 8})`, "تنظیم نوبت جلسه آتی با هماهنگی مراجع", nowIso, nowIso);
			}
			await run(env.DB, `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, 'walkin_complete', 'delivered', 150, ?)`, crypto.randomUUID(), body.customerPhone || "09035555090", customerId, `مراجع گرامی، جلسه لیزر شما با موفقیت ثبت شد.${nextBookingId ? " نوبت جلسه بعدی شما نیز در سامانه رزرو گردید." : ""} تهران لیزر`, nowIso);
			return ok({
				bookingId,
				nextBookingId,
				customerId,
				success: true
			});
		}
		if (pathname === "/api/v1/admin/crm/records" && method === "GET") {
			requirePermission(locals, "customer.read");
			const custId = new URL(request.url).searchParams.get("customerId");
			let sql = `SELECT r.*, c.name AS customerName, c.phone AS customerPhone
                   FROM customer_clinical_records r
                   JOIN customers c ON c.id = r.customer_id`;
			const params = [];
			if (custId) {
				sql += ` WHERE r.customer_id = ?`;
				params.push(custId);
			}
			sql += ` ORDER BY r.created_at DESC LIMIT 100`;
			return ok(await all(env.DB, sql, ...params));
		}
		if (pathname === "/api/v1/admin/crm/records" && method === "POST") {
			const auth = requirePermission(locals, "customer.update");
			const body = await parseBody(request, clinicalRecordSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO customer_clinical_records (
           id, customer_id, booking_id, session_number, total_sessions,
           treated_areas, device_model, joules_energy, pulse_width_ms,
           shot_count, skin_reaction, operator_name, doctor_notes,
           next_session_recommended_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, body.customerId, body.bookingId ?? null, Number(body.sessionNumber) || 1, Number(body.totalSessions) || 8, body.treatedAreas || "نواحی درخواستی", body.deviceModel || "الکساندرایت کندلا جنتل پرومکس ۲۰۲۶", Number(body.joulesEnergy) || 14, Number(body.pulseWidthMs) || 3, Number(body.shotCount) || 450, body.skinReaction || "عادی", body.operatorName || auth.displayName || "اپراتور", body.doctorNotes ?? null, body.nextSessionRecommendedAt ?? null, nowIso);
			return okWithStatus({
				id,
				success: true
			}, 201);
		}
		if (pathname === "/api/v1/admin/accounting/summary" && method === "GET") {
			requirePermission(locals, "settings.read");
			const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			const monthIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
			const [todayRow, monthRow, expenseRow, recentRows] = await Promise.all([
				one(env.DB, `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`, `${todayIso}%`),
				one(env.DB, `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`, `${monthIso}%`),
				one(env.DB, `SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'expense' AND created_at LIKE ?`, `${monthIso}%`),
				all(env.DB, `SELECT t.*, c.name AS customerName FROM accounting_transactions t
           LEFT JOIN customers c ON c.id = t.customer_id
           ORDER BY t.created_at DESC LIMIT 50`)
			]);
			const todayIncome = todayRow?.total ?? 0;
			const monthIncome = monthRow?.total ?? 0;
			const monthExpense = expenseRow?.total ?? 0;
			return ok({
				todayIncome,
				monthIncome,
				monthExpense,
				netProfit: monthIncome - monthExpense,
				transactions: recentRows
			});
		}
		if (pathname === "/api/v1/admin/accounting/transactions" && method === "POST") {
			requirePermission(locals, "settings.write");
			const body = await parseBody(request, accountingTransactionSchema);
			const id = crypto.randomUUID();
			const ref = "TX-" + Math.random().toString(36).substring(2, 7).toUpperCase();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO accounting_transactions (
           id, reference, customer_id, booking_id, amount, type, method, category, description, tracking_number, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, ref, body.customerId ?? null, body.bookingId ?? null, Number(body.amount) || 0, body.type || "income", body.method || "pos", body.category || "laser_service", body.description ?? null, body.trackingNumber ?? null, nowIso);
			return okWithStatus({
				id,
				reference: ref,
				success: true
			}, 201);
		}
		if (pathname === "/api/v1/admin/sms/logs" && method === "GET") {
			requirePermission(locals, "settings.read");
			return ok(await all(env.DB, `SELECT l.*, c.name AS customerName FROM sms_logs l
         LEFT JOIN customers c ON c.id = l.customer_id
         ORDER BY l.created_at DESC LIMIT 50`));
		}
		if (pathname === "/api/v1/admin/sms/send" && method === "POST") {
			requirePermission(locals, "settings.write");
			const body = await parseBody(request, sendSmsSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, ?, 'delivered', 150, ?)`, id, body.phone, body.customerId ?? null, body.message, body.templateName || "custom", nowIso);
			return ok({
				id,
				success: true,
				status: "delivered"
			});
		}
		if (pathname === "/api/v1/admin/lottery" && method === "GET") {
			requirePermission(locals, "settings.read");
			return ok(await all(env.DB, `SELECT * FROM lottery_campaigns ORDER BY created_at DESC`));
		}
		if (pathname === "/api/v1/admin/lottery/draw" && method === "POST") {
			requirePermission(locals, "settings.write");
			const campaignId = (await parseBody(request, lotteryDrawSchema)).campaignId;
			const candidate = await one(env.DB, `SELECT id, name, phone FROM customers ORDER BY RANDOM() LIMIT 1`);
			if (!candidate) throw new ApiError("NOT_FOUND", "هیچ مراجع ثبت‌شده‌ای برای قرعه‌کشی یافت نشد.");
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `UPDATE lottery_campaigns
            SET winner_customer_id = ?,
                winner_name = ?,
                winner_phone = ?,
                draw_date = ?,
                status = 'completed'
          WHERE id = ?`, candidate.id, candidate.name, candidate.phone, nowIso, campaignId);
			await run(env.DB, `INSERT INTO sms_logs (id, phone, customer_id, message, template_name, status, cost, created_at)
         VALUES (?, ?, ?, ?, 'lottery_winner', 'delivered', 150, ?)`, crypto.randomUUID(), candidate.phone, candidate.id, `تبریک به ${candidate.name} عزیز! شما برنده جایزه ویژه قرعه‌کشی این دوره کلینیک تهران لیزر شدید. جهت هماهنگی با ما تماس حاصل فرمایید.`, nowIso);
			return ok({
				winner: candidate,
				success: true
			});
		}
		if (pathname === "/api/v1/admin/lottery" && method === "POST") {
			requirePermission(locals, "settings.write");
			const body = await parseBody(request, lotteryCampaignSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO lottery_campaigns (id, title, prize, status, min_spending, draw_date, created_at)
         VALUES (?, ?, ?, 'active', ?, ?, ?)`, id, body.title, body.prize, Number(body.minSpending) || 0, body.drawDate || null, nowIso);
			return okWithStatus({
				id,
				success: true
			}, 201);
		}
		if (pathname === "/api/v1/admin/festivals" && method === "GET") {
			requirePermission(locals, "settings.read");
			return ok(await all(env.DB, `SELECT * FROM discount_festivals ORDER BY created_at DESC`));
		}
		if (pathname === "/api/v1/admin/festivals" && method === "POST") {
			const auth = requirePermission(locals, "settings.write");
			const body = await parseBody(request, discountFestivalSchema);
			const id = crypto.randomUUID();
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			await run(env.DB, `INSERT INTO discount_festivals (id, title, slug, discount_percent, description, banner_image, starts_at, ends_at, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, body.title, body.slug || "fest-" + crypto.randomUUID().slice(0, 8), body.discountPercent ?? 15, body.description ?? null, body.bannerImage ?? null, body.startsAt ?? null, body.endsAt ?? null, body.active ? 1 : 0, nowIso);
			await writeAuditLog(env.DB, auth.id, "festival.created", "discount_festival", id);
			return okWithStatus({
				id,
				success: true
			}, 201);
		}
		if (pathname === "/api/v1/admin/instagram" && method === "GET") {
			requirePermission(locals, "settings.read");
			const pub = (await getAllSettings(env.DB)).public;
			return ok({
				username: pub.instagram_username || "tehranlaser_clinic",
				bioLink: pub.instagram_bio_link || "https://tehranlaser.ir",
				promoCode: pub.instagram_promo_code || "INSTA20",
				latestReel: pub.instagram_latest_reel_url || "https://instagram.com/reel/...",
				discountPercent: Number(pub.instagram_follower_discount_percent || 10)
			});
		}
		if (pathname === "/api/v1/admin/instagram" && method === "PUT") {
			const auth = requirePermission(locals, "settings.write");
			const body = await parseBody(request, instagramSettingsSchema);
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			const pairs = [
				["instagram_username", body.username],
				["instagram_bio_link", body.bioLink],
				["instagram_promo_code", body.promoCode],
				["instagram_latest_reel_url", body.latestReel],
				["instagram_follower_discount_percent", body.discountPercent !== void 0 ? String(body.discountPercent) : void 0]
			];
			for (const [k, v] of pairs) if (v !== void 0) await run(env.DB, `INSERT INTO settings (key, value, scope, updated_at)
             VALUES (?, ?, 'public', ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`, k, String(v), nowIso);
			await writeAuditLog(env.DB, auth.id, "instagram.updated", "settings", null);
			return ok({ success: true });
		}
		throw new ApiError("NOT_FOUND", "مسیر درخواستی یافت نشد.");
	});
}
//#endregion
//#region src/pages/api/[...path].ts
var ____path__exports = /* @__PURE__ */ __exportAll({ ALL: () => ALL });
var ALL = async (context) => {
	return handleApiRequest(context.request, context.locals, context.url.pathname);
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/[...path]@_@ts
var page = () => ____path__exports;
//#endregion
export { page };
