globalThis.process ??= {};
globalThis.process.env ??= {};
//#region src/db/query.ts
/** All matching rows. Caller is responsible for an explicit column list + LIMIT. */
async function all(db, sql, ...binds) {
	return (await (binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql)).all()).results;
}
/** First matching row or null. */
async function one(db, sql, ...binds) {
	return await (binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql)).first();
}
/** Execute a write. `meta` carries changes/last_row_id for callers that need it. */
async function run(db, sql, ...binds) {
	return (binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql)).run();
}
/** Cursor = base64url("created_at|id"), stable and opaque to clients (§62, §243). */
function encodeCursor(createdAt, id) {
	const raw = `${createdAt}|${id}`;
	return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeCursor(cursor) {
	try {
		const padded = cursor.replace(/-/g, "+").replace(/_/g, "/");
		const raw = atob(padded + "=".repeat((4 - padded.length % 4) % 4));
		const sep = raw.indexOf("|");
		if (sep <= 0) return null;
		const createdAt = raw.slice(0, sep);
		const id = raw.slice(sep + 1);
		if (!createdAt || !id) return null;
		return {
			createdAt,
			id
		};
	} catch {
		return null;
	}
}
/** Clamp a client-supplied limit into a safe bounded page size (§166). */
function clampLimit(limit, fallback = 20, max = 100) {
	const n = typeof limit === "number" ? limit : Number(limit);
	if (!Number.isFinite(n) || n <= 0) return fallback;
	return Math.min(Math.trunc(n), max);
}
//#endregion
export { one as a, encodeCursor as i, clampLimit as n, run as o, decodeCursor as r, all as t };
