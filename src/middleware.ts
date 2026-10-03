import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { loadAuthUser } from './server/auth/session';
import { readSessionCookie } from './lib/security/session-cookie';
import { fail } from './lib/api/respond';

/** Routes that must never render or respond before authentication is established (§326). */
function needsAuth(pathname: string): boolean {
  if (pathname.startsWith('/api/v1/admin') || pathname.startsWith('/api/v1/me')) return true;
  if (!pathname.startsWith('/admin')) return false;
  return pathname !== '/admin/login';
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (needsAuth(pathname)) {
    const token = readSessionCookie(context.request);
    const auth = token ? await loadAuthUser(env.DB, token) : null;
    context.locals.auth = auth;

    if (!auth) {
      if (pathname.startsWith('/api/')) {
        return fail('AUTH_REQUIRED', 'ابتدا وارد حساب مدیریت شوید.');
      }
      const nextParam = encodeURIComponent(pathname + context.url.search);
      return context.redirect(`/admin/login?next=${nextParam}`, 302);
    }
  } else {
    context.locals.auth = null;
  }

  return next();
});
