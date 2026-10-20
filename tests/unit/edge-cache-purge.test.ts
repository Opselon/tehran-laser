/**
 * Edge-cache purge helper.
 *
 * The plugin hub's promise is "toggle it and the site changes now". The page
 * cache would otherwise keep serving the old render for up to 60 s, which reads
 * to an admin as a broken switch — so every feature write purges the public
 * routes. These tests pin the three properties that matter:
 *
 *  1. it deletes the exact cache keys the middleware reads,
 *  2. it is a no-op outside the Workers runtime (Node, unit tests),
 *  3. it never throws — a failed purge must not fail the admin's write.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { purgeEdgeRoutes, type PurgeableCacheStore } from '../../src/lib/http/edge-cache';

const ORIGIN = 'https://tehran-laser.example';

function fakeStore(behaviour: 'ok' | 'throw' = 'ok') {
  const deleted: string[] = [];
  const store: PurgeableCacheStore = {
    match: async () => undefined,
    put: async () => {},
    delete: async (request: Request) => {
      if (behaviour === 'throw') throw new Error('cache delete exploded');
      deleted.push(request.url);
      return true;
    },
  };
  return { store, deleted };
}

function installCaches(store: unknown): void {
  (globalThis as { caches?: unknown }).caches = { default: store };
}

afterEach(() => {
  delete (globalThis as { caches?: unknown }).caches;
  vi.restoreAllMocks();
});

describe('purgeEdgeRoutes', () => {
  it('deletes the absolute cache keys for every public route it is given', async () => {
    const { store, deleted } = fakeStore();
    installCaches(store);

    await purgeEdgeRoutes(ORIGIN, ['/', '/booking', '/blog']);

    expect(deleted.sort()).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/blog`,
      `${ORIGIN}/booking`,
    ]);
  });

  it('builds cache keys with GET and no headers, matching the middleware key', async () => {
    const seen: Request[] = [];
    installCaches({
      match: async () => undefined,
      put: async () => {},
      delete: async (request: Request) => {
        seen.push(request);
        return true;
      },
    });

    await purgeEdgeRoutes(ORIGIN, ['/']);

    expect(seen).toHaveLength(1);
    expect(seen[0]!.method).toBe('GET');
    expect(seen[0]!.url).toBe(`${ORIGIN}/`);
  });

  it('is a silent no-op when caches.default is unavailable (plain Node)', async () => {
    await expect(purgeEdgeRoutes(ORIGIN, ['/'])).resolves.toBeUndefined();
  });

  it('is a silent no-op when the store has no delete implementation', async () => {
    installCaches({ match: async () => undefined, put: async () => {} });
    await expect(purgeEdgeRoutes(ORIGIN, ['/'])).resolves.toBeUndefined();
  });

  it('never rejects when a delete throws — the write that triggered it must succeed', async () => {
    const { store } = fakeStore('throw');
    installCaches(store);
    await expect(purgeEdgeRoutes(ORIGIN, ['/', '/booking'])).resolves.toBeUndefined();
  });

  it('handles an empty route list without touching the cache', async () => {
    const { store, deleted } = fakeStore();
    installCaches(store);
    await purgeEdgeRoutes(ORIGIN, []);
    expect(deleted).toEqual([]);
  });
});
