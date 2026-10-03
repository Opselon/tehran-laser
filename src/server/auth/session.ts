/** D1-backed session store. The cookie carries an opaque random token; the database
 *  only ever holds sha256(token), so a DB leak cannot be replayed as a live session. */

import type { AuthUser } from '../../domain/rbac/rbac.types';
import { randomToken, sha256Hex } from '../../lib/security/session-cookie';

export interface CreatedSession {
  token: string;
  expiresAt: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string;
  role_key: string;
  permission_key: string;
}

export const DEFAULT_SESSION_TTL_HOURS = 168; // 7 days

export async function createSession(
  db: D1Database,
  userId: string,
  ttlHours: number,
  now: Date = new Date(),
): Promise<CreatedSession> {
  const token = randomToken(32);
  const id = await sha256Hex(token);
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + Math.max(1, ttlHours) * 3_600_000).toISOString();
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at)
       VALUES (?1, ?2, ?3, ?3, ?4)`,
    )
    .bind(id, userId, nowIso, expiresAt)
    .run();
  return { token, expiresAt };
}

/** Resolve a cookie token into a fully permissioned user, or null. One bounded query. */
export async function loadAuthUser(
  db: D1Database,
  token: string,
  now: Date = new Date(),
): Promise<AuthUser | null> {
  if (!token) return null;
  const sessionId = await sha256Hex(token);
  const nowIso = now.toISOString();

  const { results } = await db
    .prepare(
      `SELECT s.id, s.user_id, u.email, u.display_name, s.expires_at, s.revoked_at, s.last_seen_at,
              r.key AS role_key, p.key AS permission_key
       FROM sessions s
       JOIN users u ON u.id = s.user_id AND u.active = 1
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       JOIN role_permissions rp ON rp.role_id = r.id
       JOIN permissions p ON p.key = rp.permission_key
       WHERE s.id = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2
       ORDER BY r.key, p.key`,
    )
    .bind(sessionId, nowIso)
    .all<SessionRow>();

  if (results.length === 0) return null;

  const first = results[0];
  if (!first) return null;

  const roles = new Set<string>();
  const permissions = new Set<string>();
  for (const row of results) {
    roles.add(row.role_key);
    permissions.add(row.permission_key);
  }

  // Lazy activity touch (at most one small write per hour per session).
  const lastSeen = Date.parse(first.last_seen_at);
  if (Number.isFinite(lastSeen) && now.getTime() - lastSeen > 3_600_000) {
    await db
      .prepare('UPDATE sessions SET last_seen_at = ?2 WHERE id = ?1')
      .bind(sessionId, nowIso)
      .run();
  }

  return {
    id: first.user_id,
    email: first.email,
    displayName: first.display_name,
    roles: [...roles] as AuthUser['roles'],
    permissions: [...permissions] as AuthUser['permissions'],
  };
}

export async function revokeSession(db: D1Database, token: string, now: Date = new Date()): Promise<void> {
  if (!token) return;
  const sessionId = await sha256Hex(token);
  await db
    .prepare('UPDATE sessions SET revoked_at = ?2 WHERE id = ?1 AND revoked_at IS NULL')
    .bind(sessionId, now.toISOString())
    .run();
}

/** Used on password change / forced logout. */
export async function revokeAllSessionsForUser(
  db: D1Database,
  userId: string,
  now: Date = new Date(),
): Promise<void> {
  await db
    .prepare('UPDATE sessions SET revoked_at = ?2 WHERE user_id = ?1 AND revoked_at IS NULL')
    .bind(userId, now.toISOString())
    .run();
}
