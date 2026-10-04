globalThis.process ??= {};
globalThis.process.env ??= {};
import { a as one, i as encodeCursor, n as clampLimit, o as run, r as decodeCursor, t as all } from "./query_DDZB-tD1.mjs";
//#region src/server/repositories.ts
/** Repositories for public + admin data access (contract §98, §236).
*
*  Design rules enforced here:
*  - Explicit bounded queries; never `SELECT *` (§60, §61).
*  - D1 binds only — no user string concatenation into SQL (§196).
*  - Alias DB columns to camelCase directly in SQL for zero-overhead domain shapes.
*  - Free-tier safe: every list is paginated or clamped (§62, §93).
*/
async function getPublicSettings(db) {
	const rows = await all(db, `SELECT key, value FROM settings WHERE scope = 'public'`);
	const out = {};
	for (const r of rows) out[r.key] = r.value;
	return out;
}
async function getAllSettings(db) {
	const rows = await all(db, `SELECT key, value, scope FROM settings`);
	const pub = {};
	const priv = {};
	for (const r of rows) if (r.scope === "public") pub[r.key] = r.value;
	else priv[r.key] = r.value;
	return {
		public: pub,
		private: priv
	};
}
async function getSettingValue(db, key) {
	const row = await one(db, `SELECT value FROM settings WHERE key = ?`, key);
	return row ? row.value : null;
}
async function listPublicServices(db) {
	const [services, prices] = await Promise.all([all(db, `SELECT id, name, slug, description, short_description AS shortDescription,
              duration_minutes AS durationMinutes, featured, display_order AS displayOrder
         FROM services
        WHERE active = 1
        ORDER BY display_order ASC, name ASC`), all(db, `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
         FROM service_prices`)]);
	const priceMap = /* @__PURE__ */ new Map();
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
			currency: p.currency
		}))
	}));
}
async function findPublicServiceBySlug(db, slug) {
	const service = await one(db, `SELECT id, name, slug, description, short_description AS shortDescription,
            duration_minutes AS durationMinutes, featured
       FROM services
      WHERE slug = ? AND active = 1`, slug);
	if (!service) return null;
	const prices = await all(db, `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
       FROM service_prices
      WHERE service_id = ?`, service.id);
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
			currency: p.currency
		}))
	};
}
async function loadPriceRowsForService(db, serviceId) {
	return (await all(db, `SELECT service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
       FROM service_prices
      WHERE service_id = ?`, serviceId)).map((r) => ({
		pricingCategory: r.pricingCategory,
		amount: r.amount,
		currency: r.currency
	}));
}
async function listAdminServices(db) {
	const [services, prices] = await Promise.all([all(db, `SELECT id, name, slug, description, short_description AS shortDescription,
              duration_minutes AS durationMinutes, active, featured,
              display_order AS displayOrder, created_at AS createdAt, updated_at AS updatedAt
         FROM services
        ORDER BY display_order ASC, name ASC`), all(db, `SELECT id, service_id AS serviceId, pricing_category AS pricingCategory, amount, currency
         FROM service_prices`)]);
	const priceMap = /* @__PURE__ */ new Map();
	for (const p of prices) {
		const list = priceMap.get(p.serviceId) ?? [];
		list.push({
			id: p.id,
			pricingCategory: p.pricingCategory,
			amount: p.amount,
			currency: p.currency
		});
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
		prices: priceMap.get(s.id) ?? []
	}));
}
function toHoursRows(hours) {
	return hours.map((h) => ({
		weekday: h.weekday,
		segments: h.segments
	}));
}
async function listBusinessHours(db) {
	const rows = await all(db, `SELECT weekday, opens_at AS opensAt, closes_at AS closesAt
       FROM business_hours
      ORDER BY weekday ASC, display_order ASC, opens_at ASC`);
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i <= 6; i++) map.set(i, []);
	for (const r of rows) {
		const list = map.get(r.weekday) ?? [];
		list.push({
			opensAt: r.opensAt,
			closesAt: r.closesAt
		});
		map.set(r.weekday, list);
	}
	return Array.from(map.entries()).map(([weekday, segments]) => ({
		weekday,
		segments
	}));
}
async function listScheduleExceptionsForDate(db, localDate) {
	return (await all(db, `SELECT id, exception_date AS exceptionDate, kind, opens_at AS opensAt,
            closes_at AS closesAt, note
       FROM schedule_exceptions
      WHERE exception_date = ?`, localDate)).map((r) => ({
		date: r.exceptionDate,
		kind: r.kind,
		opensAt: r.opensAt,
		closesAt: r.closesAt,
		note: r.note
	}));
}
async function listAllScheduleExceptions(db) {
	return all(db, `SELECT id, exception_date AS exceptionDate, kind, opens_at AS opensAt,
            closes_at AS closesAt, note
       FROM schedule_exceptions
      ORDER BY exception_date ASC`);
}
async function listAdminStaff(db) {
	const [staffList, services] = await Promise.all([all(db, `SELECT id, name, active, created_at AS createdAt, updated_at AS updatedAt
         FROM staff
        ORDER BY name ASC`), all(db, `SELECT staff_id AS staffId, service_id AS serviceId FROM staff_services`)]);
	const serviceMap = /* @__PURE__ */ new Map();
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
		updatedAt: s.updatedAt
	}));
}
async function findOccupiedSlotStarts(db, staffKey, rangeStartIso, rangeEndIso) {
	return (await all(db, `SELECT slot_start AS slotStart
       FROM booking_slots
      WHERE staff_key = ?
        AND slot_start >= ?
        AND slot_start < ?
      ORDER BY slot_start ASC`, staffKey, rangeStartIso, rangeEndIso)).map((r) => r.slotStart);
}
async function listPublicBlogPosts(db, limit = 10, cursor) {
	const safeLimit = clampLimit(limit, 10, 50);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	let sql = `SELECT id, title, slug, excerpt, cover_image AS coverImage,
                    author, published_at AS publishedAt
               FROM blog_posts
              WHERE status = 'published'
                AND (published_at IS NULL OR published_at <= ?)`;
	const binds = [nowIso];
	if (cursor) {
		const decoded = decodeCursor(cursor);
		if (decoded) {
			sql += ` AND (published_at < ? OR (published_at = ? AND id < ?))`;
			binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
		}
	}
	sql += ` ORDER BY published_at DESC, id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = await all(db, sql, ...binds);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last && last.publishedAt ? encodeCursor(last.publishedAt, last.id) : null
	};
}
async function findPublicBlogPostBySlug(db, slug) {
	const row = await one(db, `SELECT id, title, slug, excerpt, content, cover_image AS coverImage, author,
            published_at AS publishedAt, seo_title AS seoTitle,
            seo_description AS seoDescription, canonical_url AS canonicalUrl,
            og_title AS ogTitle, og_description AS ogDescription
       FROM blog_posts
      WHERE slug = ? AND status = 'published'`, slug);
	if (!row) return null;
	return {
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		content: row.content,
		coverImage: row.coverImage,
		category: null,
		author: row.author,
		publishedAt: row.publishedAt ?? "",
		seo: {
			seoTitle: row.seoTitle,
			seoDescription: row.seoDescription,
			canonicalUrl: row.canonicalUrl,
			ogTitle: row.ogTitle,
			ogDescription: row.ogDescription
		}
	};
}
async function listAdminBlogPosts(db, limit = 20, cursor) {
	const safeLimit = clampLimit(limit, 20, 100);
	let sql = `SELECT id, title, slug, excerpt, content, cover_image AS coverImage,
                    category_id AS categoryId, author, status,
                    published_at AS publishedAt, seo_title AS seoTitle,
                    seo_description AS seoDescription, canonical_url AS canonicalUrl,
                    og_title AS ogTitle, og_description AS ogDescription,
                    created_at AS createdAt, updated_at AS updatedAt
               FROM blog_posts`;
	const binds = [];
	if (cursor) {
		const decoded = decodeCursor(cursor);
		if (decoded) {
			sql += ` WHERE created_at < ? OR (created_at = ? AND id < ?)`;
			binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
		}
	}
	sql += ` ORDER BY created_at DESC, id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = await all(db, sql, ...binds);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null
	};
}
async function listPublicFaq(db) {
	return all(db, `SELECT id, question, answer, display_order AS displayOrder, active,
            updated_at AS updatedAt
       FROM faq_items
      WHERE active = 1
      ORDER BY display_order ASC, id ASC`);
}
/** Alias for listPublicFaq */
var listFaqItems = listPublicFaq;
async function listAdminFaq(db) {
	return all(db, `SELECT id, question, answer, display_order AS displayOrder, active,
            updated_at AS updatedAt
       FROM faq_items
      ORDER BY display_order ASC, id ASC`);
}
async function listAdminCustomers(db, limit = 20, cursor, search) {
	const safeLimit = clampLimit(limit, 20, 100);
	const conditions = [];
	const binds = [];
	if (search && search.trim()) {
		const q = search.trim();
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
	let sql = `SELECT c.id, c.name, c.phone, c.email, c.pricing_category AS pricingCategory,
                    c.note, c.created_at AS createdAt, c.updated_at AS updatedAt,
                    COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.customer_id = c.id), 0) AS bookingsCount,
                    (SELECT MAX(b.starts_at) FROM bookings b WHERE b.customer_id = c.id) AS lastBookingAt
               FROM customers c`;
	if (conditions.length > 0) sql += ` WHERE ` + conditions.join(" AND ");
	sql += ` ORDER BY c.created_at DESC, c.id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = await all(db, sql, ...binds);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null
	};
}
function mapRawToAdminBookingDto(row) {
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
			pricingCategory: row.pricingCategory
		},
		service: {
			id: row.serviceId,
			slug: row.serviceSlug || "",
			name: row.serviceName,
			durationMinutes: row.serviceDurationMinutes || 30
		},
		staff: row.staffId ? {
			id: row.staffId,
			name: row.staffName || ""
		} : null,
		customerNote: row.customerNote,
		adminNote: row.adminNote,
		rejectionReason: row.rejectionReason,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}
async function listAdminBookings(db, options = {}) {
	const safeLimit = clampLimit(options.limit, 20, 100);
	const conditions = [];
	const binds = [];
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
	if (options.serviceSlug) {
		conditions.push(`s.slug = ?`);
		binds.push(options.serviceSlug);
	}
	const queryStr = (options.q || options.search || "").trim();
	if (queryStr) {
		conditions.push(`(b.reference LIKE ? OR c.phone LIKE ? OR c.name LIKE ?)`);
		binds.push(`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`);
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
	if (conditions.length > 0) sql += ` WHERE ` + conditions.join(" AND ");
	sql += ` ORDER BY b.starts_at DESC, b.id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = (await all(db, sql, ...binds)).map(mapRawToAdminBookingDto);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last ? encodeCursor(last.startsAt, last.id) : null
	};
}
async function getAdminDashboard(db, todayStartIso, todayEndIso) {
	const [counts, rawTodayBookings] = await Promise.all([one(db, `SELECT
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
         SUM(CASE WHEN starts_at >= ? AND starts_at < ? THEN 1 ELSE 0 END) AS todayTotal,
         (SELECT COUNT(*) FROM customers) AS totalCustomers,
         (SELECT COUNT(*) FROM services WHERE active = 1) AS activeServices
       FROM bookings
       WHERE starts_at >= ? AND starts_at < ?`, todayStartIso, todayEndIso, todayStartIso, todayEndIso), all(db, `SELECT b.id, b.reference, b.customer_id AS customerId,
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
        LIMIT 50`, todayStartIso, todayEndIso)]);
	const todayBookings = rawTodayBookings.map(mapRawToAdminBookingDto);
	return {
		date: todayStartIso.slice(0, 10),
		today: {
			total: counts?.todayTotal ?? 0,
			pending: counts?.pending ?? 0,
			confirmed: counts?.confirmed ?? 0
		},
		counts: {
			pendingBookings: counts?.pending ?? 0,
			totalCustomers: counts?.totalCustomers ?? 0,
			activeServices: counts?.activeServices ?? 0
		},
		todayBookings
	};
}
async function listAuditLogs(db, limit = 50, cursor) {
	const safeLimit = clampLimit(limit, 50, 100);
	let sql = `SELECT a.id, a.actor_id AS actorId, u.display_name AS actorName,
                    a.action, a.entity_type AS entityType, a.entity_id AS entityId,
                    a.created_at AS createdAt
               FROM audit_logs a
          LEFT JOIN users u ON u.id = a.actor_id`;
	const binds = [];
	if (cursor) {
		const decoded = decodeCursor(cursor);
		if (decoded) {
			sql += ` WHERE a.created_at < ? OR (a.created_at = ? AND a.id < ?)`;
			binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
		}
	}
	sql += ` ORDER BY a.created_at DESC, a.id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = await all(db, sql, ...binds);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null
	};
}
async function listNotificationEvents(db, limit = 50, cursor) {
	const safeLimit = clampLimit(limit, 50, 100);
	let sql = `SELECT id, dedupe_key AS dedupeKey, event_type AS eventType,
                    booking_id AS bookingId, channel, status, attempts,
                    last_error AS lastError, created_at AS createdAt, sent_at AS sentAt
               FROM notification_events`;
	const binds = [];
	if (cursor) {
		const decoded = decodeCursor(cursor);
		if (decoded) {
			sql += ` WHERE created_at < ? OR (created_at = ? AND id < ?)`;
			binds.push(decoded.createdAt, decoded.createdAt, decoded.id);
		}
	}
	sql += ` ORDER BY created_at DESC, id DESC LIMIT ?`;
	binds.push(safeLimit + 1);
	const rows = await all(db, sql, ...binds);
	const hasMore = rows.length > safeLimit;
	const items = hasMore ? rows.slice(0, safeLimit) : rows;
	const last = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null
	};
}
async function writeAuditLog(db, actorId, action, entityType, entityId) {
	const id = crypto.randomUUID();
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	await run(db, `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`, id, actorId, action, entityType, entityId, createdAt);
}
//#endregion
export { loadPriceRowsForService as C, listScheduleExceptionsForDate as S, writeAuditLog as T, listFaqItems as _, getAllSettings as a, listPublicFaq as b, listAdminBlogPosts as c, listAdminFaq as d, listAdminServices as f, listBusinessHours as g, listAuditLogs as h, getAdminDashboard as i, listAdminBookings as l, listAllScheduleExceptions as m, findPublicBlogPostBySlug as n, getPublicSettings as o, listAdminStaff as p, findPublicServiceBySlug as r, getSettingValue as s, findOccupiedSlotStarts as t, listAdminCustomers as u, listNotificationEvents as v, toHoursRows as w, listPublicServices as x, listPublicBlogPosts as y };
