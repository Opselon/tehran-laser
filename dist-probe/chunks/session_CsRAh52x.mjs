globalThis.process ??= {};
globalThis.process.env ??= {};
//#region src/lib/security/session-cookie.ts
/** Opaque tokens, session cookies, password hashing surface for auth.

*  Cookie rules (contract §56): HttpOnly + Secure + SameSite=Lax, server-managed,
*  no localStorage, rotated by revoking the old session and issuing a new token.
*/
var SESSION_COOKIE_NAME = "tl_session";
function randomToken(bytes = 32) {
	return base64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}
function base64Url(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sha256Hex(value) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function buildSessionCookie(token, options) {
	const parts = [
		`${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`
	];
	if (options.secure) parts.push("Secure");
	return parts.join("; ");
}
function clearSessionCookie(secure) {
	const parts = [
		`${SESSION_COOKIE_NAME}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0"
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}
function readSessionCookie(request) {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const chunk of header.split(";")) {
		const eq = chunk.indexOf("=");
		if (eq === -1) continue;
		if (chunk.slice(0, eq).trim() !== "tl_session") continue;
		const raw = chunk.slice(eq + 1).trim();
		try {
			return decodeURIComponent(raw);
		} catch {
			return null;
		}
	}
	return null;
}
function isSecureRequest(request) {
	if (request.url.startsWith("https://")) return true;
	return request.headers.get("x-forwarded-proto") === "https";
}
async function createSession(db, userId, ttlHours = 168, now = /* @__PURE__ */ new Date()) {
	const token = randomToken(32);
	const id = await sha256Hex(token);
	const nowIso = now.toISOString();
	const expiresAt = new Date(now.getTime() + Math.max(1, ttlHours) * 36e5).toISOString();
	await db.prepare(`INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at)
       VALUES (?1, ?2, ?3, ?3, ?4)`).bind(id, userId, nowIso, expiresAt).run();
	return {
		token,
		expiresAt
	};
}
/** Resolve a cookie token into a fully permissioned user, or null. One bounded query. */
async function loadAuthUser(db, token, now = /* @__PURE__ */ new Date()) {
	if (!token) return null;
	const sessionId = await sha256Hex(token);
	const nowIso = now.toISOString();
	const { results } = await db.prepare(`SELECT s.id, s.user_id, u.email, u.display_name, s.expires_at, s.revoked_at, s.last_seen_at,
              r.key AS role_key, p.key AS permission_key
       FROM sessions s
       JOIN users u ON u.id = s.user_id AND u.active = 1
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       JOIN role_permissions rp ON rp.role_id = r.id
       JOIN permissions p ON p.key = rp.permission_key
       WHERE s.id = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2
       ORDER BY r.key, p.key`).bind(sessionId, nowIso).all();
	if (results.length === 0) return null;
	const first = results[0];
	if (!first) return null;
	const roles = /* @__PURE__ */ new Set();
	const permissions = /* @__PURE__ */ new Set();
	for (const row of results) {
		roles.add(row.role_key);
		permissions.add(row.permission_key);
	}
	const lastSeen = Date.parse(first.last_seen_at);
	if (Number.isFinite(lastSeen) && now.getTime() - lastSeen > 36e5) await db.prepare("UPDATE sessions SET last_seen_at = ?2 WHERE id = ?1").bind(sessionId, nowIso).run();
	return {
		id: first.user_id,
		email: first.email,
		displayName: first.display_name,
		roles: [...roles],
		permissions: [...permissions]
	};
}
async function revokeSession(db, token, now = /* @__PURE__ */ new Date()) {
	if (!token) return;
	const sessionId = await sha256Hex(token);
	await db.prepare("UPDATE sessions SET revoked_at = ?2 WHERE id = ?1 AND revoked_at IS NULL").bind(sessionId, now.toISOString()).run();
}
//#endregion
export { clearSessionCookie as a, buildSessionCookie as i, loadAuthUser as n, isSecureRequest as o, revokeSession as r, readSessionCookie as s, createSession as t };
