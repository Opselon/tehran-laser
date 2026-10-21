import { describe, it, expect, beforeAll } from 'vitest';
import worker from './worker';
import { ensureMigrated } from './helpers';

/**
 * The API envelope now carries request-correlation headers on every exit path
 * (200, 401, 404): `x-request-id` is how a user report maps to one log line,
 * and `server-timing` is how a browser waterfall separates Worker time from
 * network time.
 *
 * Cache HIT/MISS behaviour is pinned in `tests/unit/edge-cache.test.ts` (the
 * policy) and verified against a real `workerd` with `wrangler dev` (the
 * plumbing), because this sandbox's test entry does not run `caches.default`.
 */

describe('request correlation headers', () => {
  beforeAll(async () => {
    await ensureMigrated();
  });

  it('stamps x-request-id and server-timing on a public API response', async () => {
    const res = await worker.fetch(new Request('http://localhost/api/health'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    expect(res.headers.get('server-timing')).toMatch(/^app;dur=\d+$/);
  });

  it('honours an inbound request id so a trace keeps correlating', async () => {
    const res = await worker.fetch(
      new Request('http://localhost/api/health', {
        headers: { 'x-request-id': 'trace-test-1' },
      }),
    );
    expect(res.headers.get('x-request-id')).toBe('trace-test-1');
  });

  it('stamps the headers on an error path and on an auth rejection', async () => {
    const notFound = await worker.fetch(new Request('http://localhost/api/v1/services/nope'));
    expect(notFound.status).toBe(404);
    expect(notFound.headers.get('x-request-id')).toBeTruthy();

    const denied = await worker.fetch(new Request('http://localhost/api/v1/admin/dashboard'));
    expect(denied.status).toBe(401);
    expect(denied.headers.get('x-request-id')).toBeTruthy();
    expect(denied.headers.get('server-timing')).toMatch(/^app;dur=\d+$/);
  });

  it('keeps the public JSON envelope byte-identical across calls', async () => {
    const url = 'http://localhost/api/v1/faq';
    const first = await worker.fetch(new Request(url));
    const second = await worker.fetch(new Request(url));
    expect(first.status).toBe(200);
    expect(await second.json()).toEqual(await first.json());
  });
});
