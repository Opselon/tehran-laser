/** Test-only fetch entry. Mirrors src/middleware.ts (locals.auth, the request-id
 *  envelope) and then delegates to the production API router so every
 *  integration test exercises the real request path. */

import { env } from 'cloudflare:workers';
import { handleApiRequest } from '../../src/server/http/router';
import { readSessionCookie } from '../../src/lib/security/session-cookie';
import { logRequest, resolveRequestId, serverTimingHeader } from '../../src/lib/http/observability';
import { loadAuthUser } from '../../src/server/auth/session';
import type { AuthUser } from '../../src/domain/rbac/rbac.types';

/** Routes authenticated by middleware before any handler runs (must match src/middleware.ts). */
function needsAuth(pathname: string): boolean {
  if (pathname.startsWith('/api/v1/admin') || pathname.startsWith('/api/v1/me')) return true;
  if (!pathname.startsWith('/admin')) return false;
  return pathname !== '/admin/login';
}

async function buildLocals(request: Request, pathname: string): Promise<App.Locals> {
  if (!needsAuth(pathname)) return { auth: null } as unknown as App.Locals;
  const token = readSessionCookie(request);
  const auth: AuthUser | null = token ? await loadAuthUser(env.DB, token) : null;
  return { auth } as unknown as App.Locals;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const startedAt = Date.now();
    const requestId = resolveRequestId(request);
    const { pathname } = new URL(request.url);

    /** Every exit path carries the correlation headers, exactly as the real
     *  middleware does (src/middleware.ts `finish`). */
    const finish = (response: Response): Response => {
      response.headers.set('x-request-id', requestId);
      response.headers.set('server-timing', serverTimingHeader(Date.now() - startedAt));
      logRequest({
        requestId,
        method: request.method,
        pathname,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    };

    const locals = await buildLocals(request, pathname);
    // Middleware rejects anonymous callers before handlers run; do the same here so the
    // 401 envelope behaves exactly like production.
    if (needsAuth(pathname) && !locals.auth) {
      return finish(
        new Response(
          JSON.stringify({
            data: null,
            error: { code: 'AUTH_REQUIRED', message: 'ابتدا وارد حساب مدیریت شوید.' },
            meta: {},
          }),
          { status: 401, headers: { 'content-type': 'application/json; charset=utf-8' } },
        ),
      );
    }
    return finish(await handleApiRequest(request, locals, pathname));
  },
};
