/**
 * Edge HTML cache — the decisions, separated from the Workers plumbing.
 *
 * `src/middleware.ts` used to inline both. Splitting them means the rules that
 * actually matter for privacy (which requests may read a shared render, and
 * which responses may be stored) are pure functions that unit tests can pin
 * down without a Workers runtime — the failure mode we care about is not
 * "cache miss", it is "one visitor's render served to another".
 */

/** Anonymous pages may sit at the edge for a minute (see SECURITY.md §64). */
export const EDGE_TTL_S = 60;

/**
 * Public JSON reads that are byte-identical for every anonymous caller.
 *
 * The site is SSR-first, so these routes mainly serve API clients and the
 * contract tests — but they were `no-store`, which made every read pay a Worker
 * boot plus the D1 queries behind it. Caching them is the same bet the HTML
 * cache already makes, and the same rules decide who may read a shared copy.
 *
 * Deliberately absent: `/api/v1/availability` (date + service + staff specific,
 * real-time by definition), `/api/health`, and everything under `/api/v1/admin`.
 */
export const PUBLIC_API_CACHE_PATHS: readonly string[] = [
  '/api/v1/services',
  '/api/v1/faq',
  '/api/v1/blog',
  '/api/v1/clinic',
  '/api/v1/settings/public',
  '/api/v1/features',
];

/** Single-resource reads: `/api/v1/services/<slug>`, `/api/v1/blog/<slug>`. */
const PUBLIC_API_DETAIL_PATHS: readonly RegExp[] = [
  /^\/api\/v1\/services\/[^/]+$/,
  /^\/api\/v1\/blog\/[^/]+$/,
];

/** Is this an anonymous, publicly cacheable JSON route? */
export function isPublicApiCachePath(pathname: string): boolean {
  return (
    PUBLIC_API_CACHE_PATHS.includes(pathname) ||
    PUBLIC_API_DETAIL_PATHS.some((pattern) => pattern.test(pathname))
  );
}

/**
 * Public paths that must be purged whenever DB-backed marketing content changes.
 * Detail routes are appended by the writer when it knows the slug.
 */
export const PUBLIC_CACHE_PURGE_PATHS: readonly string[] = [
  '/',
  '/booking',
  '/blog',
  '/services',
  '/faq',
  '/clinic',
  '/contact',
  ...PUBLIC_API_CACHE_PATHS,
];

/** The subset of the Workers `Cache` API this module needs. */
export interface EdgeCacheStore {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

/**
 * May this request be answered from (and stored into) the shared edge cache?
 * Fail-closed by construction: anything personalised, stateful, or explicitly
 * uncached returns false.
 */
export function isEdgeCacheable(request: Request, pathname: string): boolean {
  if (request.method !== 'GET') return false;
  if (pathname.startsWith('/admin')) return false;
  const isApi = pathname.startsWith('/api');
  if (isApi) {
    // Only the JSON allowlist above is ever shared; everything else (health,
    // availability, mutations, admin) still goes straight to its handler.
    if (!isPublicApiCachePath(pathname)) return false;
    // A query string produces a cache key no write can enumerate for purge —
    // only the canonical (search-less) form of a public list is cached.
    if (new URL(request.url).search !== '') return false;
  }
  // A session cookie means the render can be personalised (the clinic greeting,
  // the basket, an admin preview) — never share it.
  if (request.headers.has('cookie') || request.headers.has('authorization')) return false;
  // Hard reload / DevTools "disable cache": bypass the read so a deploy is
  // immediately visible instead of after the TTL.
  if ((request.headers.get('cache-control') || '').includes('no-cache')) return false;
  return true;
}

/**
 * May this response be written to the shared cache? Only a complete, anonymous,
 * successful render — or, for an allowlisted public JSON route, its payload —
 * is safe to store.
 */
export function isStorableResponse(response: Response, url?: URL | string): boolean {
  if (response.status !== 200) return false;
  if (response.headers.has('set-cookie')) return false;
  const type = response.headers.get('content-type') || '';
  if (type.includes('text/html')) return true;
  if (!url) return false;
  let pathname: string;
  try {
    pathname =
      typeof url === 'string' ? new URL(url, 'https://invalid.local').pathname : url.pathname;
  } catch {
    return false;
  }
  return type.includes('application/json') && isPublicApiCachePath(pathname);
}

/** `caches.default` is absent outside the Workers runtime (plain `astro dev`,
 *  unit tests, Node). Returning null simply disables the cache. */
export function getEdgeCacheStore(): EdgeCacheStore | null {
  try {
    const store = (globalThis as { caches?: { default?: EdgeCacheStore } }).caches;
    return store?.default ?? null;
  } catch {
    return null;
  }
}

export function edgeCacheKey(url: URL): Request {
  return new Request(url.toString(), { method: 'GET' });
}

/** Returns the stored page, or null when there is nothing to serve. */
export async function readEdgeCache(store: EdgeCacheStore, url: URL): Promise<Response | null> {
  try {
    return (await store.match(edgeCacheKey(url))) ?? null;
  } catch {
    return null;
  }
}

/** Stores a copy of `response`. Never throws: a cache write is an optimisation. */
export async function writeEdgeCache(
  store: EdgeCacheStore,
  url: URL,
  response: Response,
): Promise<void> {
  if (!isStorableResponse(response, url)) return;
  try {
    // Awaited rather than streamed: a Workers cache write must own a complete
    // body, and a stream still being teed from the live response can land
    // truncated.
    const body = await response.clone().arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('cache-control', `public, max-age=${EDGE_TTL_S}, stale-while-revalidate=300`);
    headers.set('x-edge-cache', 'MISS');
    await store.put(edgeCacheKey(url), new Response(body, { status: 200, headers }));
  } catch {
    /* ignore — see the doc comment */
  }
}

/** The optional `delete` half of the Workers Cache API (absent in Node). */
export interface PurgeableCacheStore extends EdgeCacheStore {
  delete?(request: Request): Promise<boolean>;
}

/**
 * Best-effort purge of cached public HTML.
 *
 * A plugin toggle must be visible on the next request: waiting out the 60s TTL
 * reads to the admin as "the switch does nothing". Purges are fire-and-forget —
 * a cache miss costs one render, a failed purge must never fail the write.
 */
export async function purgeEdgeRoutes(origin: string, paths: readonly string[]): Promise<void> {
  const store = getEdgeCacheStore() as PurgeableCacheStore | null;
  if (!store?.delete) return;
  await Promise.all(
    paths.map(async (path) => {
      try {
        await store.delete!(edgeCacheKey(new URL(path, origin)));
      } catch {
        /* ignore — see the doc comment */
      }
    }),
  );
}
