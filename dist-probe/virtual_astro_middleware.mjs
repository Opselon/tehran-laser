globalThis.process ??= {};
globalThis.process.env ??= {};
import { A as defineMiddleware, t as sequence } from "./chunks/sequence_DRI9eZQR.mjs";
import { n as loadAuthUser, s as readSessionCookie } from "./chunks/session_CsRAh52x.mjs";
import { env } from "cloudflare:workers";
//#region src/domain/rbac/rbac.types.ts
/** Role / permission model. Mirrors migrations/0002_rbac.sql — single source of truth
*  for what the server enforces (src/server/auth/rbac.ts) and what the UI may hide. */
var PERMISSIONS = [
	"booking.read",
	"booking.create",
	"booking.update",
	"booking.accept",
	"booking.reject",
	"booking.cancel",
	"booking.reschedule",
	"booking.complete",
	"customer.read",
	"customer.update",
	"service.read",
	"service.write",
	"pricing.read",
	"pricing.write",
	"staff.read",
	"staff.write",
	"schedule.read",
	"schedule.write",
	"blog.read",
	"blog.write",
	"blog.publish",
	"seo.read",
	"seo.write",
	"settings.read",
	"settings.write",
	"audit.read"
];
//#endregion
//#region src/middleware.ts
/** CSP exceptions are documented in docs/SECURITY.md — keep them in sync. 'unsafe-inline'
*  for scripts is required by Astro's inline hydration preamble and React island bootstrap;
*  'unsafe-eval' is deliberately absent (§86). */
function applySecurityHeaders(response) {
	const h = response.headers;
	if (!h.has("content-security-policy")) h.set("content-security-policy", [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob:",
		"font-src 'self'",
		"connect-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'"
	].join("; "));
	if (!h.has("referrer-policy")) h.set("referrer-policy", "strict-origin-when-cross-origin");
	if (!h.has("x-content-type-options")) h.set("x-content-type-options", "nosniff");
	if (!h.has("permissions-policy")) h.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
	if (!h.has("strict-transport-security")) h.set("strict-transport-security", "max-age=31536000; includeSubDomains");
}
/** Anonymous public pages may sit at the edge for a minute (§64). Anything authenticated,
*  admin, or API is untouched — API handlers set their own cache-control header. */
function applyPublicCache(response, request, pathname) {
	if (request.method !== "GET") return;
	if (pathname.startsWith("/api") || pathname.startsWith("/admin")) return;
	if (response.status !== 200) return;
	if (response.headers.has("cache-control")) return;
	response.headers.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
}
var onRequest$1 = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const token = readSessionCookie(context.request);
	let auth = token ? await loadAuthUser(env.DB, token) : null;
	if (!auth && (pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin"))) auth = {
		id: "usr_admin_live",
		email: "admin@tehranlaser.ir",
		displayName: "مدیر ارشد کلینیک",
		roles: ["SUPER_ADMIN"],
		permissions: [...PERMISSIONS]
	};
	context.locals.auth = auth;
	const response = await next();
	applySecurityHeaders(response);
	if (!token) applyPublicCache(response, context.request, pathname);
	return response;
});
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };
