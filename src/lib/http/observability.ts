/**
 * Request correlation and structured logs — deliberately tiny, and pure enough
 * to unit-test.
 *
 * Workers logs are the only post-mortem signal for a request that a user says
 * "failed"; a bare `console.error` with no id cannot be tied to the response the
 * caller saw. Every response therefore carries `x-request-id` (inbound value
 * honoured so a retry/trace keeps the same id) and API traffic logs one JSON
 * line with the same id. Paths are logged without their query string: the query
 * can carry a customer's phone or booking token and has no place in a log line.
 */

/** Header echoed on every response and included in every structured log line. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Longest inbound id we will trust — anything longer is truncated, not reused. */
const MAX_REQUEST_ID_LENGTH = 96;

/** Crockford-ish: alphanumerics and dashes only, so a header cannot forge logs. */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]+$/;

/**
 * Reuse the caller's id when it is sane, otherwise mint one.
 *
 * `crypto.randomUUID` needs a secure context; the fallback keeps local `astro
 * dev` and tests working instead of throwing inside the request path.
 */
export function resolveRequestId(request: Request): string {
  const provided = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (provided && provided.length <= MAX_REQUEST_ID_LENGTH && SAFE_REQUEST_ID.test(provided)) {
    return provided;
  }
  try {
    return crypto.randomUUID();
  } catch {
    return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export interface RequestLogInput {
  requestId: string;
  method: string;
  pathname: string;
  status: number;
  durationMs: number;
  /** `HIT` means the edge answered without touching the handler. */
  cache?: 'HIT' | 'MISS';
  /** Present only when an authenticated session answered the request. */
  userId?: string;
}

/** The fixed-shape JSON object written for one API request. */
export function buildRequestLog(input: RequestLogInput): Record<string, string | number> {
  const entry: Record<string, string | number> = {
    evt: 'http.request',
    id: input.requestId,
    method: input.method,
    path: input.pathname,
    status: input.status,
    ms: Math.max(0, Math.round(input.durationMs)),
  };
  if (input.cache) entry.cache = input.cache;
  if (input.userId) entry.user = input.userId;
  return entry;
}

/**
 * Log one request. Only `/api` traffic is logged: SSR page views are already
 * counted by Workers analytics, and logging every anonymous page would drown
 * the lines that matter (5xx, slow reads, auth failures).
 */
export function logRequest(input: RequestLogInput): void {
  if (!input.pathname.startsWith('/api')) return;
  try {
    /* eslint-disable-next-line no-console -- structured JSON request log: Workers
       logpush/tail capture requires console output; `warn`/`error` would skew severity. */
    console.log(JSON.stringify(buildRequestLog(input)));
  } catch {
    /* a logging failure must never fail a request */
  }
}

/** `server-timing` value so a browser waterfall shows the Worker's own time. */
export function serverTimingHeader(durationMs: number): string {
  return `app;dur=${Math.max(0, Math.round(durationMs))}`;
}
