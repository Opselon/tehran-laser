import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { loadAuthUser } from './server/auth/session';
import { readSessionCookie } from './lib/security/session-cookie';
import { fail } from './lib/api/respond';
import type { AuthUser } from './domain/rbac/rbac.types';

/** Routes that must never render or respond before authentication is established (§326).
 *  `/admin/login` is the gate itself and stays public; everything else under `/admin`,
 *  the whole admin API, and `/api/v1/me` require a live session. */
function needsAuth(pathname: string): boolean {
  if (pathname.startsWith('/api/v1/admin') || pathname.startsWith('/api/v1/me')) return true;
  if (!pathname.startsWith('/admin')) return false;
  return pathname !== '/admin/login';
}

/** CSP exceptions are documented in SECURITY.md — keep them in sync. 'unsafe-inline'
 *  for scripts is required by Astro's inline hydration preamble and React island bootstrap;
 *  'unsafe-eval' is deliberately absent (§86). */
function applySecurityHeaders(response: Response): void {
  const h = response.headers;
  if (!h.has('content-security-policy')) {
    h.set(
      'content-security-policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    );
  }
  if (!h.has('referrer-policy')) h.set('referrer-policy', 'strict-origin-when-cross-origin');
  if (!h.has('x-content-type-options')) h.set('x-content-type-options', 'nosniff');
  if (!h.has('permissions-policy')) {
    h.set('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  }
  if (!h.has('strict-transport-security')) {
    h.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }
}

/** Anonymous public pages may sit at the edge for a minute (§64). Anything authenticated,
 *  admin, or API is untouched — API handlers set their own cache-control header. */
function applyPublicCache(response: Response, request: Request, pathname: string): void {
  if (request.method !== 'GET') return;
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) return;
  if (response.status !== 200) return;
  if (response.headers.has('cache-control')) return;
  response.headers.set('cache-control', 'public, max-age=60, stale-while-revalidate=300');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const token = readSessionCookie(context.request);

  const auth: AuthUser | null = token ? await loadAuthUser(env.DB, token) : null;

  /* Authentication is a hard gate (§54, SECURITY.md): an anonymous caller must never reach
     an admin handler. API callers get the 401 envelope, browsers are sent to the login
     screen. Never substitute a synthetic admin user — that made every admin route (and
     every customer record, booking and setting behind it) readable and writable by anyone
     on the internet, and left `requirePermission` unreachable as a control. */
  if (needsAuth(pathname) && !auth) {
    const blocked = pathname.startsWith('/api/')
      ? fail('AUTH_REQUIRED', 'ابتدا وارد حساب مدیریت شوید.')
      : context.redirect(
          `/admin/login?next=${encodeURIComponent(pathname + context.url.search)}`,
          302,
        );
    applySecurityHeaders(blocked);
    return blocked;
  }

  context.locals.auth = auth;

  const response = await next();
  applySecurityHeaders(response);
  // A session cookie on a public route can still mean a personalized render: never cache it.
  if (!token) applyPublicCache(response, context.request, pathname);
  return response;
});
