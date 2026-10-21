import { describe, expect, it } from 'vitest';
import {
  type EdgeCacheStore,
  isEdgeCacheable,
  isStorableResponse,
  readEdgeCache,
  writeEdgeCache,
} from '../../src/lib/http/edge-cache';

/**
 * The edge cache exists to cut a full SSR + D1 render from every anonymous page
 * view. These tests pin the two things that could go badly wrong:
 *   1. a personalised or non-GET request reading a shared render, and
 *   2. a response that must not be shared (session cookie, non-HTML, error)
 *      being written to the cache.
 * Both are security properties, not performance ones.
 */

function fakeStore() {
  const map = new Map<string, Response>();
  const store: EdgeCacheStore = {
    async match(req) {
      return map.get(req.url)?.clone();
    },
    async put(req, res) {
      map.set(req.url, res);
    },
  };
  return { store, map };
}

const html = (headers: Record<string, string> = {}) =>
  new Response('<html>ok</html>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', ...headers },
  });

describe('isEdgeCacheable', () => {
  const url = 'https://tehran-laser.example/';

  it('allows an anonymous GET of a public page', () => {
    expect(isEdgeCacheable(new Request(url), '/')).toBe(true);
    expect(isEdgeCacheable(new Request('https://x.example/services'), '/services')).toBe(true);
  });

  it('refuses any non-GET method', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
      expect(isEdgeCacheable(new Request(url, { method }), '/')).toBe(false);
    }
  });

  it('refuses the admin surface', () => {
    expect(isEdgeCacheable(new Request(url), '/admin')).toBe(false);
    expect(isEdgeCacheable(new Request(url), '/admin/login')).toBe(false);
  });

  it('allows only the public JSON allowlist', () => {
    for (const path of [
      '/api/v1/services',
      '/api/v1/services/full-body',
      '/api/v1/faq',
      '/api/v1/blog',
      '/api/v1/blog/some-post',
      '/api/v1/clinic',
      '/api/v1/settings/public',
      '/api/v1/features',
    ]) {
      expect(isEdgeCacheable(new Request(`https://x.example${path}`), path), path).toBe(true);
    }
    for (const path of [
      '/api/health',
      '/api/v1/availability',
      '/api/v1/bookings',
      '/api/v1/me',
      '/api/v1/admin/dashboard',
      '/api/v1/services/full-body/extra',
    ]) {
      expect(isEdgeCacheable(new Request(`https://x.example${path}`), path), path).toBe(false);
    }
  });

  it('does not cache a public JSON read carrying a query string', () => {
    const path = '/api/v1/blog';
    expect(isEdgeCacheable(new Request('https://x.example/api/v1/blog?limit=5'), path)).toBe(false);
    // …while the canonical, query-less form is shared.
    expect(isEdgeCacheable(new Request('https://x.example/api/v1/blog'), path)).toBe(true);
  });

  it('refuses requests carrying a session cookie or an Authorization header', () => {
    expect(isEdgeCacheable(new Request(url, { headers: { cookie: 'tl_session=abc' } }), '/')).toBe(
      false,
    );
    expect(isEdgeCacheable(new Request(url, { headers: { authorization: 'Bearer t' } }), '/')).toBe(
      false,
    );
  });

  it('bypasses the cache for a hard reload', () => {
    expect(
      isEdgeCacheable(new Request(url, { headers: { 'cache-control': 'no-cache' } }), '/'),
    ).toBe(false);
  });
});

describe('isStorableResponse', () => {
  const json = (headers: Record<string, string> = {}) =>
    new Response('{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
    });

  it('stores a plain 200 HTML render', () => {
    expect(isStorableResponse(html())).toBe(true);
  });

  it('never stores a response that sets a cookie', () => {
    expect(isStorableResponse(html({ 'set-cookie': 'tl_session=abc; HttpOnly' }))).toBe(false);
  });

  it('never stores an error or a non-HTML payload', () => {
    expect(isStorableResponse(new Response('boom', { status: 500 }))).toBe(false);
    expect(
      isStorableResponse(
        new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    ).toBe(false);
  });

  it('stores public JSON only when the URL is on the allowlist', () => {
    const allowed = new URL('https://x.example/api/v1/faq');
    expect(isStorableResponse(json(), allowed)).toBe(true);
    expect(isStorableResponse(json(), 'https://x.example/api/v1/services/x')).toBe(true);
    // an admin or realtime payload is never shared
    expect(isStorableResponse(json(), '/api/v1/admin/dashboard')).toBe(false);
    expect(isStorableResponse(json(), '/api/v1/availability')).toBe(false);
    // and a JSON payload is not stored without a URL to judge it by
    expect(isStorableResponse(json())).toBe(false);
  });
});

describe('writeEdgeCache / readEdgeCache', () => {
  it('round-trips the page with a cache header and a bounded max-age', async () => {
    const { store } = fakeStore();
    const url = new URL('https://tehran-laser.example/');

    await writeEdgeCache(store, url, html());
    const hit = await readEdgeCache(store, url);

    expect(hit).not.toBeNull();
    expect(hit!.headers.get('x-edge-cache')).toBe('MISS');
    expect(hit!.headers.get('cache-control')).toContain('max-age=60');
    expect(await hit!.text()).toContain('ok');
  });

  it('stores a public JSON read with the shared TTL', async () => {
    const { store, map } = fakeStore();
    const url = new URL('https://tehran-laser.example/api/v1/faq');
    const res = new Response('{"data":[]}', {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });

    await writeEdgeCache(store, url, res);
    const hit = await readEdgeCache(store, url);

    expect(map.size).toBe(1);
    expect(hit!.headers.get('cache-control')).toContain('max-age=60');
    expect(hit!.headers.get('x-edge-cache')).toBe('MISS');
    expect(await hit!.text()).toBe('{"data":[]}');
  });

  it('does not store a JSON payload from a non-public API route', async () => {
    const { store, map } = fakeStore();
    const url = new URL('https://tehran-laser.example/api/v1/availability?date=2026-10-21');

    await writeEdgeCache(
      store,
      url,
      new Response('{"data":{}}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(map.size).toBe(0);
  });

  it('does not store a response that must not be shared', async () => {
    const { store, map } = fakeStore();
    const url = new URL('https://tehran-laser.example/admin');

    await writeEdgeCache(store, url, html({ 'set-cookie': 'tl_session=abc' }));
    expect(map.size).toBe(0);
    expect(await readEdgeCache(store, url)).toBeNull();
  });

  it('survives a store that throws on write', async () => {
    const store: EdgeCacheStore = {
      async match() {
        return undefined;
      },
      async put() {
        throw new Error('cache write failed');
      },
    };
    await expect(
      writeEdgeCache(store, new URL('https://x.example/'), html()),
    ).resolves.toBeUndefined();
  });
});
