/** Thin, typed helpers over D1 prepared statements (contract §98: UI never touches SQL).
 *
 *  Conventions every repository follows:
 *  - Alias columns to camelCase in SQL (`duration_minutes AS durationMinutes`) so rows
 *    arrive as domain shapes — no runtime row mapper, no magic key rewriting.
 *  - Always bind parameters; string concatenation of user input into SQL is forbidden (§196).
 *  - Select explicit columns, never `SELECT *` (§61); always bound LIMITs (§62).
 */

/** Values D1 accepts as bound parameters. */
export type SqlValue = string | number | null | ArrayBuffer | ArrayBufferView;

export interface Queryable {
  prepare(sql: string): D1PreparedStatement;
}

export interface Page<T> {
  items: T[];
  /** Opaque cursor for the next page, or null when the list is exhausted. */
  nextCursor: string | null;
}

/** All matching rows. Caller is responsible for an explicit column list + LIMIT. */
export async function all<T>(
  db: Queryable,
  sql: string,
  ...binds: SqlValue[]
): Promise<T[]> {
  const stmt = binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql);
  const result = await stmt.all<T>();
  return result.results as T[];
}

/** First matching row or null. */
export async function one<T>(
  db: Queryable,
  sql: string,
  ...binds: SqlValue[]
): Promise<T | null> {
  const stmt = binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql);
  return (await stmt.first<T>()) as T | null;
}

/** Execute a write. `meta` carries changes/last_row_id for callers that need it. */
export async function run(
  db: Queryable,
  sql: string,
  ...binds: SqlValue[]
): Promise<D1Result> {
  const stmt = binds.length > 0 ? db.prepare(sql).bind(...binds) : db.prepare(sql);
  return stmt.run();
}

/** Cursor = base64url("created_at|id"), stable and opaque to clients (§62, §243). */
export function encodeCursor(createdAt: string, id: string): string {
  const raw = `${createdAt}|${id}`;
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const padded = cursor.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const sep = raw.indexOf('|');
    if (sep <= 0) return null;
    const createdAt = raw.slice(0, sep);
    const id = raw.slice(sep + 1);
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

/** Clamp a client-supplied limit into a safe bounded page size (§166). */
export function clampLimit(limit: unknown, fallback = 20, max = 100): number {
  const n = typeof limit === 'number' ? limit : Number(limit);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.trunc(n), max);
}
