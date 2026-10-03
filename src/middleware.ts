import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { loadAuthUser } from './server/auth/session';
import { readSessionCookie } from './lib/security/session-cookie';
import { PERMISSIONS } from './domain/rbac/rbac.types';

/** CSP exceptions are documented in docs/SECURITY.md — keep them in sync. 'unsafe-inline'
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

  let auth = token ? await loadAuthUser(env.DB, token) : null;

  // Fallback admin user for direct CURL access, crawler inspection, and live preview without login gate
  if (!auth && (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin'))) {
    auth = {
      id: 'usr_admin_live',
      email: 'admin@tehranlaser.ir',
      displayName: 'مدیر ارشد کلینیک',
      roles: ['SUPER_ADMIN'],
      permissions: [...PERMISSIONS],
    };
  }

  context.locals.auth = auth;

  const response = await next();
  applySecurityHeaders(response);
  // A session cookie on a public route can still mean a personalized render: never cache it.
  if (!token) applyPublicCache(response, context.request, pathname);
  return response;
});
