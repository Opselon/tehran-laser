/** D1-backed fixed-window rate limiting (free-tier friendly: one atomic upsert per
 *  limited request, no external service — contract §57).
 *
 *  Policy format: "10/600" = 10 requests per 600 seconds (settings values). */

export interface RateLimitPolicy {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function parseRateLimitPolicy(raw: string | undefined, fallback: RateLimitPolicy): RateLimitPolicy {
  if (!raw) return fallback;
  const match = /^(\d{1,6})\/(\d{1,6})$/.exec(raw.trim());
  if (!match) return fallback;
  const limit = Number.parseInt(match[1] ?? '', 10);
  const windowSeconds = Number.parseInt(match[2] ?? '', 10);
  if (limit < 1 || windowSeconds < 1) return fallback;
  return { limit, windowSeconds };
}

interface Row {
  count: number;
  expires_at: string;
}

/** Atomically consume one unit of the budget for `key`. */
export async function consumeRateLimit(
  db: D1Database,
  key: string,
  policy: RateLimitPolicy,
  now: Date,
): Promise<RateLimitResult> {
  const nowIso = now.toISOString();
  const expiresIso = new Date(now.getTime() + policy.windowSeconds * 1000).toISOString();

  const statement = db
    .prepare(
      `INSERT INTO rate_limits (key, window_started_at, count, expires_at)
         VALUES (?1, ?2, 1, ?3)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.expires_at <= ?2 THEN 1 ELSE rate_limits.count + 1 END,
         window_started_at = CASE WHEN rate_limits.expires_at <= ?2 THEN ?2 ELSE rate_limits.window_started_at END,
         expires_at = CASE WHEN rate_limits.expires_at <= ?2 THEN ?3 ELSE rate_limits.expires_at END
       RETURNING count, expires_at`,
    )
    .bind(key, nowIso, expiresIso);

  const row = (await statement.first<Row>()) ?? { count: 1, expires_at: expiresIso };

  // Opportunistic cleanup of expired windows keeps the table tiny.
  if (Math.random() < 0.02) {
    await db.prepare('DELETE FROM rate_limits WHERE expires_at <= ?1').bind(nowIso).run();
  }

  const allowed = row.count <= policy.limit;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((Date.parse(row.expires_at) - now.getTime()) / 1000),
  );
  return {
    allowed,
    remaining: Math.max(0, policy.limit - row.count),
    retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
  };
}
