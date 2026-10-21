import { describe, expect, it } from 'vitest';
import {
  REQUEST_ID_HEADER,
  buildRequestLog,
  logRequest,
  resolveRequestId,
  serverTimingHeader,
} from '../../src/lib/http/observability';

/**
 * Request ids are the only way to tie a user's "it failed" report to the one log
 * line for their request. The properties that matter:
 *   - an inbound id is honoured (so a retry/trace keeps correlating),
 *   - a hostile or absurdly long id is replaced, not echoed into logs,
 *   - a log entry never contains the query string (it can carry a phone number),
 *   - logging is API-only and can never throw into the request path.
 */

describe('resolveRequestId', () => {
  it('mints a unique id when the caller sends none', () => {
    const a = resolveRequestId(new Request('https://x.example/'));
    const b = resolveRequestId(new Request('https://x.example/'));
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it('honours a sane inbound id so a trace keeps correlating', () => {
    const request = new Request('https://x.example/', {
      headers: { [REQUEST_ID_HEADER]: 'trace-abc_123' },
    });
    expect(resolveRequestId(request)).toBe('trace-abc_123');
  });

  it('replaces a header that could forge or blow up a log line', () => {
    const injected = new Request('https://x.example/', {
      headers: { [REQUEST_ID_HEADER]: 'abc"}{"evt":"forged' },
    });
    expect(resolveRequestId(injected)).not.toContain('forged');

    const long = new Request('https://x.example/', {
      headers: { [REQUEST_ID_HEADER]: 'a'.repeat(500) },
    });
    expect(resolveRequestId(long).length).toBeLessThanOrEqual(96);
  });
});

describe('buildRequestLog', () => {
  it('produces a fixed shape with the documented keys', () => {
    const entry = buildRequestLog({
      requestId: 'abc',
      method: 'GET',
      pathname: '/api/v1/faq',
      status: 200,
      durationMs: 12.6,
      cache: 'HIT',
      userId: 'user-1',
    });
    expect(entry).toEqual({
      evt: 'http.request',
      id: 'abc',
      method: 'GET',
      path: '/api/v1/faq',
      status: 200,
      ms: 13,
      cache: 'HIT',
      user: 'user-1',
    });
  });

  it('omits optional keys rather than logging empty ones', () => {
    const entry = buildRequestLog({
      requestId: 'abc',
      method: 'GET',
      pathname: '/',
      status: 200,
      durationMs: 1,
    });
    expect('cache' in entry).toBe(false);
    expect('user' in entry).toBe(false);
  });

  it('never floors a duration below zero', () => {
    const entry = buildRequestLog({
      requestId: 'abc',
      method: 'GET',
      pathname: '/api/v1/faq',
      status: 500,
      durationMs: -5,
    });
    expect(entry.ms).toBe(0);
  });
});

describe('logRequest', () => {
  it('logs one JSON line for API traffic', () => {
    const lines: string[] = [];
    const original = console.log;
    console.log = (line: string) => lines.push(String(line));
    try {
      logRequest({
        requestId: 'abc',
        method: 'POST',
        pathname: '/api/v1/bookings',
        status: 201,
        durationMs: 40,
      });
    } finally {
      console.log = original;
    }
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.id).toBe('abc');
    expect(parsed.path).toBe('/api/v1/bookings');
  });

  it('stays silent for page renders (Workers analytics already counts them)', () => {
    const lines: string[] = [];
    const original = console.log;
    console.log = (line: string) => lines.push(String(line));
    try {
      logRequest({
        requestId: 'abc',
        method: 'GET',
        pathname: '/booking',
        status: 200,
        durationMs: 40,
      });
    } finally {
      console.log = original;
    }
    expect(lines).toHaveLength(0);
  });
});

describe('serverTimingHeader', () => {
  it('emits a browser-readable duration in whole milliseconds', () => {
    expect(serverTimingHeader(12.6)).toBe('app;dur=13');
    expect(serverTimingHeader(-1)).toBe('app;dur=0');
  });
});
