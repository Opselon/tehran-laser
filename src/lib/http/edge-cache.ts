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
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) return false;
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
 * successful HTML render is safe to store.
 */
export function isStorableResponse(response: Response): boolean {
  if (response.status !== 200) return false;
  if (response.headers.has('set-cookie')) return false;
  const type = response.headers.get('content-type') || '';
  return type.includes('text/html');
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
  if (!isStorableResponse(response)) return;
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
