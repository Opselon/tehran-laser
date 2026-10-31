/**
 * Operator service — the only place that reads or writes `operators`.
 *
 * Rules encoded here rather than in the router:
 *  - a profile is created with a generated, never-reused `OP-NN` code;
 *  - phone numbers are unique among non-archived operators (a departing
 *    operator's number may be reused by their replacement);
 *  - archiving is a soft delete: bookings and clinical records keep pointing at
 *    the profile, the linked login is deactivated and revoked immediately;
 *  - issuing an account is idempotent-ish: first call creates the login, later
 *    calls reset the password of the same linked user instead of creating a
 *    second identity.
 *
 * Everything returns domain DTOs (`OperatorDto`), never raw rows.
 */

import { all, one, run } from '../db/query';
import type { Queryable, SqlValue } from '../db/query';
import { ApiError } from '../lib/api/errors';
import { hashPassword } from '../lib/security/password';
import { revokeAllSessionsForUser } from './auth/session';
import { writeAuditLog } from './repositories';
import { addDays, localDateOf, zonedTimeToUtc } from '../lib/datetime/timezone';
import {
  DEFAULT_ACCENT,
  DEFAULT_WORKDAYS,
  findOperatorRole,
  isOperatorRoleKey,
  operatorRoleOrDefault,
} from '../domain/operators/catalog';
import type { OperatorRoleKey } from '../domain/operators/catalog';
import {
  deriveInitials,
  normalizeDisplayName,
  normalizeWorkdays,
  nextOperatorCode,
  nextSortOrder,
  capacityMinutes,
  shiftMinutes,
  summarizeOperators,
  utilizationPercent,
  buildInsights,
  canHardDelete,
  nextOperatorCode as _nextOperatorCode,
} from '../domain/operators/operators';
import type {
  OperatorAccountInfo,
  OperatorAgendaItem,
  OperatorCreateInput,
  OperatorDto,
  OperatorListFilters,
  OperatorListMeta,
  OperatorStatsDto,
  OperatorUpdateInput,
} from '../domain/operators/operators';
import { computeOperatorStats, rangeOfDays } from '../domain/operators/stats';
import type {
  OperatorBookingRow,
  OperatorRankingEntry,
  OperatorRange,
} from '../domain/operators/stats';
import type { RoleKey } from '../domain/rbac/rbac.types';
import type { BookingStatus } from '../domain/booking/booking.types';

void _nextOperatorCode;

/* ── Rows ────────────────────────────────────────────────────────────────── */

interface OperatorRow {
  id: string;
  code: string;
  displayName: string;
  phone: string;
  email: string | null;
  roleKey: string;
  title: string;
  bio: string | null;
  avatarColor: string;
  initials: string;
  serviceIds: string;
  workdays: string;
  shiftStart: string;
  shiftEnd: string;
  commissionPercent: number;
  monthlyTarget: number;
  active: number;
  sortOrder: number;
  userId: string | null;
  accountEmail: string | null;
  accountActive: number | null;
  accountLastSeen: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  sessions: number | null;
  revenue: number | null;
  upcoming: number | null;
  bookedMinutes: number | null;
}

/** Selected columns + all-time aggregate. The aggregate is a single grouped
 *  subquery so a 200-operator roster is still one round-trip, not N+1. */
const OPERATOR_SELECT = `
  SELECT o.id, o.code, o.display_name AS displayName, o.phone, o.email,
         o.role_key AS roleKey, o.title, o.bio, o.avatar_color AS avatarColor,
         o.initials, o.service_ids AS serviceIds, o.workdays,
         o.shift_start AS shiftStart, o.shift_end AS shiftEnd,
         o.commission_percent AS commissionPercent, o.monthly_target AS monthlyTarget,
         o.active, o.sort_order AS sortOrder, o.user_id AS userId,
         u.email AS accountEmail, u.active AS accountActive,
         (SELECT MAX(s.last_seen_at) FROM sessions s WHERE s.user_id = o.user_id) AS accountLastSeen,
         o.created_at AS createdAt, o.updated_at AS updatedAt, o.archived_at AS archivedAt,
         COALESCE(a.sessions, 0) AS sessions,
         COALESCE(a.revenue, 0) AS revenue,
         COALESCE(a.upcoming, 0) AS upcoming,
         COALESCE(a.bookedMinutes, 0) AS bookedMinutes
    FROM operators o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN (
      SELECT operator_id,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS sessions,
             SUM(CASE WHEN status = 'completed'
                      THEN MAX(0, quoted_amount - discount_amount) ELSE 0 END) AS revenue,
             SUM(CASE WHEN status IN ('pending', 'confirmed') AND starts_at >= ?1 THEN 1 ELSE 0 END) AS upcoming,
             SUM(CASE WHEN status IN ('completed', 'confirmed') AND starts_at >= ?2
                      THEN (julianday(ends_at) - julianday(starts_at)) * 1440 ELSE 0 END) AS bookedMinutes
        FROM bookings
       WHERE operator_id IS NOT NULL
       GROUP BY operator_id
    ) a ON a.operator_id = o.id`;

function parseStringList(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

function parseWorkdayList(raw: string): number[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_WORKDAYS];
    return normalizeWorkdays(parsed.filter((value): value is number => typeof value === 'number'));
  } catch {
    return [...DEFAULT_WORKDAYS];
  }
}

function roleKeysForUsers(rows: { userId: string; roleKey: string }[]): Map<string, RoleKey[]> {
  const map = new Map<string, RoleKey[]>();
  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    if (!list.includes(row.roleKey as RoleKey)) list.push(row.roleKey as RoleKey);
    map.set(row.userId, list);
  }
  return map;
}

function accountOf(row: OperatorRow, roles: Map<string, RoleKey[]>): OperatorAccountInfo | null {
  if (!row.userId) return null;
  return {
    userId: row.userId,
    email: row.accountEmail ?? row.email ?? '',
    active: row.accountActive === 1,
    roles: roles.get(row.userId) ?? [],
    lastSeenAt: row.accountLastSeen,
  };
}

function mapOperatorRow(row: OperatorRow, roles: Map<string, RoleKey[]>): OperatorDto {
  const role = operatorRoleOrDefault(row.roleKey);
  const workdays = parseWorkdayList(row.workdays);
  const weekly =
    shiftMinutes({ shiftStart: row.shiftStart, shiftEnd: row.shiftEnd }) * workdays.length;
  // Utilization on the roster card is a 30-day rolling view, matching the profile
  // default so the two never disagree.
  const monthlyCapacity = capacityMinutes(weekly, 30);
  return {
    id: row.id,
    code: row.code,
    displayName: row.displayName,
    phone: row.phone,
    email: row.email,
    roleKey: role.key,
    roleLabel: role.label,
    roleIcon: role.icon,
    title: row.title,
    bio: row.bio,
    initials: row.initials || deriveInitials(row.displayName),
    avatarColor: row.avatarColor || DEFAULT_ACCENT,
    serviceIds: parseStringList(row.serviceIds),
    workdays,
    shiftStart: row.shiftStart,
    shiftEnd: row.shiftEnd,
    commissionPercent: row.commissionPercent,
    monthlyTarget: row.monthlyTarget,
    active: row.active === 1,
    status: row.archivedAt ? 'archived' : row.active === 1 ? 'active' : 'inactive',
    sortOrder: row.sortOrder,
    account: accountOf(row, roles),
    stats: {
      sessions: Math.max(0, Math.round(row.sessions ?? 0)),
      revenue: Math.max(0, Math.round(row.revenue ?? 0)),
      upcoming: Math.max(0, Math.round(row.upcoming ?? 0)),
      utilization: utilizationPercent(row.bookedMinutes ?? 0, monthlyCapacity),
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
  };
}

async function loadAccountRoles(db: Queryable, userIds: string[]): Promise<Map<string, RoleKey[]>> {
  if (userIds.length === 0) return new Map();
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await all<{ userId: string; roleKey: string }>(
    db,
    `SELECT ur.user_id AS userId, r.key AS roleKey
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id IN (${placeholders})`,
    ...userIds,
  );
  return roleKeysForUsers(rows);
}

/* ── Reads ───────────────────────────────────────────────────────────────── */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Search pattern that matches what people actually type: Persian/Arabic digits
 *  are folded to ASCII (the column stores ASCII) and LIKE wildcards are escaped. */
function likePattern(query: string): string {
  const normalized = query
    .replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)))
    .replace(/[\\%_]/g, (match) => `\\${match}`);
  return `%${normalized}%`;
}

export async function listOperators(
  db: Queryable,
  filters: OperatorListFilters = {},
  now: Date = new Date(),
): Promise<OperatorDto[]> {
  const nowIso = now.toISOString();
  const cutoff = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const conditions: string[] = ['1 = 1'];
  const binds: SqlValue[] = [nowIso, cutoff];

  switch (filters.status ?? 'all') {
    case 'active':
      conditions.push('o.archived_at IS NULL AND o.active = 1');
      break;
    case 'inactive':
      conditions.push('o.archived_at IS NULL AND o.active = 0');
      break;
    case 'archived':
      conditions.push('o.archived_at IS NOT NULL');
      break;
    default:
      break;
  }

  if (filters.role && filters.role !== 'all') {
    conditions.push(`o.role_key = ?${binds.length + 1}`);
    binds.push(filters.role);
  }
  if (filters.serviceId) {
    conditions.push(
      `EXISTS (SELECT 1 FROM json_each(o.service_ids) WHERE json_each.value = ?${binds.length + 1})`,
    );
    binds.push(filters.serviceId);
  }
  if (filters.weekday !== null && filters.weekday !== undefined) {
    conditions.push(
      `EXISTS (SELECT 1 FROM json_each(o.workdays) WHERE json_each.value = ?${binds.length + 1})`,
    );
    binds.push(filters.weekday);
  }
  if (filters.q && filters.q.trim()) {
    const pattern = likePattern(filters.q.trim());
    const index = binds.length + 1;
    conditions.push(
      `(o.display_name LIKE ?${index} ESCAPE '\\' OR o.code LIKE ?${index} ESCAPE '\\'
        OR o.phone LIKE ?${index} ESCAPE '\\' OR COALESCE(o.email, '') LIKE ?${index} ESCAPE '\\'
        OR o.title LIKE ?${index} ESCAPE '\\'
        -- '+98912…' typed as '0912…' must find the same person.
        OR REPLACE(o.phone, '+98', '0') LIKE ?${index} ESCAPE '\\')`,
    );
    binds.push(pattern);
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case 'name':
        return 'o.display_name COLLATE NOCASE ASC';
      case 'sessions':
        return 'sessions DESC, o.sort_order ASC';
      case 'revenue':
        return 'revenue DESC, o.sort_order ASC';
      case 'utilization':
        return '(CAST(COALESCE(a.bookedMinutes, 0) AS REAL)) DESC, o.sort_order ASC';
      case 'recent':
        return 'o.created_at DESC';
      case 'order':
      default:
        return 'o.sort_order ASC, o.display_name COLLATE NOCASE ASC';
    }
  })();

  const rows = await all<OperatorRow>(
    db,
    `${OPERATOR_SELECT}
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT 500`,
    ...binds,
  );

  const roles = await loadAccountRoles(
    db,
    rows.map((row) => row.userId).filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) => mapOperatorRow(row, roles));
}

export async function getOperatorById(db: Queryable, id: string): Promise<OperatorDto | null> {
  const now = new Date();
  const row = await one<OperatorRow>(
    db,
    `${OPERATOR_SELECT} WHERE o.id = ?3 LIMIT 1`,
    now.toISOString(),
    new Date(now.getTime() - 30 * 86_400_000).toISOString(),
    id,
  );
  if (!row) return null;
  const roles = await loadAccountRoles(db, row.userId ? [row.userId] : []);
  return mapOperatorRow(row, roles);
}

export async function getOperatorByUserId(
  db: Queryable,
  userId: string,
): Promise<OperatorDto | null> {
  const now = new Date();
  const row = await one<OperatorRow>(
    db,
    `${OPERATOR_SELECT} WHERE o.user_id = ?3 LIMIT 1`,
    now.toISOString(),
    new Date(now.getTime() - 30 * 86_400_000).toISOString(),
    userId,
  );
  if (!row) return null;
  const roles = await loadAccountRoles(db, [userId]);
  return mapOperatorRow(row, roles);
}

export function listMeta(
  operators: readonly OperatorDto[],
  todayWeekday: number,
): OperatorListMeta {
  return summarizeOperators(operators, todayWeekday);
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

function validationError(fields: Record<string, string[]>): never {
  throw new ApiError('VALIDATION_ERROR', 'اطلاعات واردشده معتبر نیست.', { fields });
}

async function assertPhoneAvailable(
  db: Queryable,
  phone: string,
  excludeId: string | null,
): Promise<void> {
  const existing = await one<{ id: string; displayName: string }>(
    db,
    `SELECT id, display_name AS displayName
       FROM operators
      WHERE phone = ? AND archived_at IS NULL ${excludeId ? 'AND id <> ?' : ''}
      LIMIT 1`,
    ...(excludeId ? [phone, excludeId] : [phone]),
  );
  if (existing) {
    validationError({
      phone: [`این شماره قبلاً برای ${existing.displayName} ثبت شده است.`],
    });
  }
}

async function assertEmailAvailable(
  db: Queryable,
  email: string | null,
  excludeId: string | null,
): Promise<void> {
  if (!email) return;
  const existing = await one<{ id: string; displayName: string }>(
    db,
    `SELECT id, display_name AS displayName
       FROM operators
      WHERE lower(email) = lower(?) AND archived_at IS NULL ${excludeId ? 'AND id <> ?' : ''}
      LIMIT 1`,
    ...(excludeId ? [email, excludeId] : [email]),
  );
  if (existing) {
    validationError({ email: [`این ایمیل قبلاً برای ${existing.displayName} ثبت شده است.`] });
  }
}

function assertRole(roleKey: string): OperatorRoleKey {
  if (!isOperatorRoleKey(roleKey)) {
    validationError({ roleKey: ['نقش انتخابی معتبر نیست.'] });
  }
  return roleKey;
}

async function allExistingCodes(db: Queryable): Promise<string[]> {
  const rows = await all<{ code: string }>(db, `SELECT code FROM operators`);
  return rows.map((row) => row.code);
}

export async function createOperator(
  db: Queryable,
  input: OperatorCreateInput,
  actor: { id: string; displayName: string },
  now: Date = new Date(),
): Promise<OperatorDto> {
  const nowIso = now.toISOString();
  const roleKey = assertRole(input.roleKey);
  const displayName = normalizeDisplayName(input.displayName);
  const phone = input.phone.trim();
  const email = input.email ? input.email.trim().toLowerCase() : null;

  await assertPhoneAvailable(db, phone, null);
  await assertEmailAvailable(db, email, null);

  const code = nextOperatorCode(await allExistingCodes(db));
  const workdays = normalizeWorkdays(input.workdays ?? [...DEFAULT_WORKDAYS]);
  if (workdays.length === 0) validationError({ workdays: ['حداقل یک روز کاری انتخاب کنید.'] });

  const id = crypto.randomUUID();
  const role = operatorRoleOrDefault(roleKey);

  await run(
    db,
    `INSERT INTO operators (
       id, user_id, staff_id, code, display_name, phone, email, role_key, title, bio,
       avatar_color, initials, service_ids, workdays, shift_start, shift_end,
       commission_percent, monthly_target, active, sort_order, archived_at, created_by,
       created_at, updated_at
     ) VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
    id,
    code,
    displayName,
    phone,
    email,
    roleKey,
    (input.title ?? role.defaultTitle).slice(0, 80),
    input.bio ?? null,
    input.avatarColor ?? role.accent ?? DEFAULT_ACCENT,
    deriveInitials(displayName),
    JSON.stringify([...new Set(input.serviceIds ?? [])]),
    JSON.stringify(workdays),
    input.shiftStart ?? '09:00',
    input.shiftEnd ?? '20:00',
    input.commissionPercent ?? 0,
    input.monthlyTarget ?? 0,
    input.active === false ? 0 : 1,
    nextSortOrder(
      await all<{ sortOrder: number }>(db, `SELECT sort_order AS sortOrder FROM operators`),
    ),
    actor.id,
    nowIso,
    nowIso,
  );

  await writeAuditLog(db, actor.id, 'operator.created', 'operator', id);

  const created = await getOperatorById(db, id);
  if (!created)
    throw new ApiError('INTERNAL_ERROR', 'ثبت اپراتور انجام نشد. لطفاً دوباره تلاش کنید.');
  return created;
}

export async function updateOperator(
  db: Queryable,
  id: string,
  input: OperatorUpdateInput,
  actor: { id: string; displayName: string },
  now: Date = new Date(),
): Promise<OperatorDto> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');

  const sets: string[] = [];
  const binds: SqlValue[] = [];

  const push = (column: string, value: SqlValue): void => {
    sets.push(`${column} = ?`);
    binds.push(value);
  };

  if (input.displayName !== undefined) {
    const name = normalizeDisplayName(input.displayName);
    if (name.length < 2)
      validationError({ displayName: ['نام و نام خانوادگی را کامل وارد کنید.'] });
    push('display_name', name);
    push('initials', deriveInitials(name));
  }
  if (input.phone !== undefined) {
    await assertPhoneAvailable(db, input.phone, id);
    push('phone', input.phone);
  }
  if (input.email !== undefined) {
    const email = input.email ? input.email.trim().toLowerCase() : null;
    await assertEmailAvailable(db, email, id);
    push('email', email);
  }
  if (input.roleKey !== undefined) {
    push('role_key', assertRole(input.roleKey));
  }
  if (input.title !== undefined) push('title', input.title);
  if (input.bio !== undefined) push('bio', input.bio);
  if (input.avatarColor !== undefined) push('avatar_color', input.avatarColor);
  if (input.serviceIds !== undefined) {
    push('service_ids', JSON.stringify([...new Set(input.serviceIds)]));
  }
  if (input.workdays !== undefined) {
    const workdays = normalizeWorkdays(input.workdays);
    if (workdays.length === 0) validationError({ workdays: ['حداقل یک روز کاری انتخاب کنید.'] });
    push('workdays', JSON.stringify(workdays));
  }
  if (input.shiftStart !== undefined) push('shift_start', input.shiftStart);
  if (input.shiftEnd !== undefined) push('shift_end', input.shiftEnd);
  if (input.commissionPercent !== undefined) push('commission_percent', input.commissionPercent);
  if (input.monthlyTarget !== undefined) push('monthly_target', input.monthlyTarget);
  if (input.active !== undefined) push('active', input.active ? 1 : 0);
  if (input.sortOrder !== undefined) push('sort_order', input.sortOrder);

  if (sets.length === 0) return existing;

  // Re-validate the MERGED state: a partial PUT can still produce an invalid
  // window (shiftStart moved past the stored shiftEnd).
  const mergedStart = input.shiftStart ?? existing.shiftStart;
  const mergedEnd = input.shiftEnd ?? existing.shiftEnd;
  if (mergedStart >= mergedEnd) {
    validationError({ shiftEnd: ['ساعت پایان باید بعد از ساعت شروع باشد.'] });
  }

  push('updated_at', now.toISOString());
  binds.push(id);

  await run(db, `UPDATE operators SET ${sets.join(', ')} WHERE id = ?`, ...binds);
  await writeAuditLog(db, actor.id, 'operator.updated', 'operator', id);

  const updated = await getOperatorById(db, id);
  if (!updated) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  return updated;
}

export async function setOperatorActive(
  db: Queryable,
  id: string,
  active: boolean,
  actor: { id: string },
  now: Date = new Date(),
): Promise<OperatorDto> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  if (existing.archivedAt) {
    throw new ApiError('VALIDATION_ERROR', 'ابتدا پروفایل بایگانی‌شده را بازیابی کنید.', {
      fields: { active: ['پروفایل بایگانی‌شده را نمی‌توان فعال یا غیرفعال کرد.'] },
    });
  }
  await run(
    db,
    `UPDATE operators SET active = ?, updated_at = ? WHERE id = ?`,
    active ? 1 : 0,
    now.toISOString(),
    id,
  );
  if (!active && existing.account) {
    // An inactive operator must not keep a live session: the roster and the login
    // are two views of the same person.
    await revokeAllSessionsForUser(db, existing.account.userId, now);
  }
  await writeAuditLog(
    db,
    actor.id,
    active ? 'operator.activated' : 'operator.deactivated',
    'operator',
    id,
  );
  const updated = await getOperatorById(db, id);
  if (!updated) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  return updated;
}

export async function archiveOperator(
  db: Queryable,
  id: string,
  actor: { id: string },
  now: Date = new Date(),
): Promise<{ id: string; archived: true }> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  if (existing.archivedAt) return { id, archived: true };

  const nowIso = now.toISOString();
  await run(
    db,
    `UPDATE operators SET archived_at = ?, active = 0, updated_at = ? WHERE id = ?`,
    nowIso,
    nowIso,
    id,
  );
  if (existing.account) {
    await run(
      db,
      `UPDATE users SET active = 0, updated_at = ? WHERE id = ?`,
      nowIso,
      existing.account.userId,
    );
    await revokeAllSessionsForUser(db, existing.account.userId, now);
  }
  await writeAuditLog(db, actor.id, 'operator.archived', 'operator', id);
  return { id, archived: true };
}

/**
 * Permanent removal, allowed only for a profile that never owned a session.
 * Anything else is archived instead, because `bookings.operator_id` and clinical
 * records are part of the patient's history — deleting the person must never
 * delete the evidence of the treatment.
 */
export async function deleteOperatorPermanently(
  db: Queryable,
  id: string,
  actor: { id: string },
  now: Date = new Date(),
): Promise<{ id: string; deleted: true }> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');

  if (!canHardDelete(existing.stats)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'این اپراتور سابقه جلسه دارد و حذف قطعی مجاز نیست؛ پروفایل را بایگانی کنید.',
      { fields: { id: ['برای حفظ سابقه بالینی، این پروفایل فقط بایگانی می‌شود.'] } },
    );
  }

  if (existing.account) {
    // The roster profile goes, but a login left behind would be an orphan identity.
    await revokeAllSessionsForUser(db, existing.account.userId, now);
    await run(db, `DELETE FROM user_roles WHERE user_id = ?`, existing.account.userId);
    await run(db, `DELETE FROM users WHERE id = ?`, existing.account.userId);
  }

  await run(db, `DELETE FROM operators WHERE id = ?`, id);
  await writeAuditLog(db, actor.id, 'operator.deleted', 'operator', id);
  return { id, deleted: true };
}

export async function restoreOperator(
  db: Queryable,
  id: string,
  actor: { id: string },
  now: Date = new Date(),
): Promise<OperatorDto> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');

  // The phone of an archived profile may have been handed to a replacement. The
  // partial unique index would turn that into a raw constraint error (500), so
  // check first and explain the conflict as a validation failure.
  await assertPhoneAvailable(db, existing.phone, id);
  await assertEmailAvailable(db, existing.email, id);

  const nowIso = now.toISOString();
  await run(
    db,
    `UPDATE operators SET archived_at = NULL, active = 1, updated_at = ? WHERE id = ?`,
    nowIso,
    id,
  );
  if (existing.account) {
    await run(
      db,
      `UPDATE users SET active = 1, updated_at = ? WHERE id = ?`,
      nowIso,
      existing.account.userId,
    );
  }
  await writeAuditLog(db, actor.id, 'operator.restored', 'operator', id);
  const restored = await getOperatorById(db, id);
  if (!restored) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  return restored;
}

export async function reorderOperators(
  db: Queryable,
  order: readonly { id: string; sortOrder: number }[],
  actor: { id: string },
  now: Date = new Date(),
): Promise<OperatorDto[]> {
  const nowIso = now.toISOString();
  for (const entry of order) {
    await run(
      db,
      `UPDATE operators SET sort_order = ?, updated_at = ? WHERE id = ?`,
      entry.sortOrder,
      nowIso,
      entry.id,
    );
  }
  await writeAuditLog(db, actor.id, 'operator.reordered', 'operator', null);
  return listOperators(db, { status: 'all', sort: 'order' }, now);
}

/* ── Accounts ────────────────────────────────────────────────────────────── */

const TEMP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Readable one-time password: no 0/O/1/I, grouped so it can be read over the
 *  phone to an operator standing at the front desk. */
export function generateTemporaryPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = [...bytes].map((byte) => TEMP_ALPHABET[byte % TEMP_ALPHABET.length] ?? 'A');
  return `TL-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`;
}

export interface IssuedAccount {
  mode: 'created' | 'reset';
  userId: string;
  email: string;
  /** Only present when the server generated it. Never logged, never stored. */
  temporaryPassword: string | null;
  roles: RoleKey[];
}

export async function issueOperatorAccount(
  db: Queryable,
  id: string,
  input: {
    email?: string | undefined;
    role?: RoleKey | undefined;
    password?: string | undefined;
  },
  actor: { id: string },
  now: Date = new Date(),
): Promise<IssuedAccount> {
  const existing = await getOperatorById(db, id);
  if (!existing) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  if (existing.archivedAt) {
    throw new ApiError('VALIDATION_ERROR', 'برای پروفایل بایگانی‌شده حساب صادر نمی‌شود.', {
      fields: { email: ['ابتدا پروفایل را بازیابی کنید.'] },
    });
  }

  const email = (input.email ?? existing.email ?? '').trim().toLowerCase();
  if (!email) {
    validationError({ email: ['برای صدور حساب، ایمیل الزامی است.'] });
  }

  const roleKey: RoleKey =
    input.role ?? findOperatorRole(existing.roleKey)?.accessRole ?? 'OPERATOR';
  const contact = await one<{ id: string }>(
    db,
    `SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1`,
    email,
  );

  if (contact && (!existing.account || contact.id !== existing.account.userId)) {
    validationError({ email: ['این ایمیل قبلاً برای حساب دیگری استفاده شده است.'] });
  }

  const generated = input.password ? null : generateTemporaryPassword();
  const password = input.password ?? generated ?? generateTemporaryPassword();
  const passwordHash = await hashPassword(password);
  const nowIso = now.toISOString();

  let userId: string;
  let mode: 'created' | 'reset';

  if (existing.account) {
    userId = existing.account.userId;
    mode = 'reset';
    await run(
      db,
      `UPDATE users SET email = ?, display_name = ?, password_hash = ?, active = 1, updated_at = ? WHERE id = ?`,
      email,
      existing.displayName,
      passwordHash,
      nowIso,
      userId,
    );
    // A password reset is a security event: every existing session dies.
    await revokeAllSessionsForUser(db, userId, now);
  } else {
    userId = crypto.randomUUID();
    mode = 'created';
    await run(
      db,
      `INSERT INTO users (id, email, password_hash, display_name, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      userId,
      email,
      passwordHash,
      existing.displayName,
      nowIso,
      nowIso,
    );
    await run(
      db,
      `UPDATE operators SET user_id = ?, updated_at = ? WHERE id = ?`,
      userId,
      nowIso,
      id,
    );
  }

  await run(db, `DELETE FROM user_roles WHERE user_id = ?`, userId);
  await run(
    db,
    `INSERT INTO user_roles (user_id, role_id)
     SELECT ?, id FROM roles WHERE key = ?`,
    userId,
    roleKey,
  );

  await writeAuditLog(
    db,
    actor.id,
    mode === 'created' ? 'operator.account_created' : 'operator.account_reset',
    'user',
    userId,
  );

  return { mode, userId, email, temporaryPassword: generated, roles: [roleKey] };
}

/* ── Stats & agenda ──────────────────────────────────────────────────────── */

export async function getOperatorStats(
  db: Queryable,
  id: string,
  options: { days?: number; timezone?: string; now?: Date } = {},
): Promise<OperatorStatsDto> {
  const timezone = options.timezone ?? 'Asia/Tehran';
  const now = options.now ?? new Date();
  const operator = await getOperatorById(db, id);
  if (!operator) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');

  const range = rangeOfDays(options.days ?? 30, timezone, now);
  const fromIso = zonedTimeToUtc(range.from, '00:00', timezone);
  const toIso = zonedTimeToUtc(addDays(range.to, 1), '00:00', timezone);

  const rows = await all<{
    id: string;
    startsAt: string;
    endsAt: string;
    status: BookingStatus;
    quotedAmount: number;
    discountAmount: number;
    serviceId: string;
    serviceName: string;
    customerId: string;
  }>(
    db,
    `SELECT b.id, b.starts_at AS startsAt, b.ends_at AS endsAt, b.status,
            b.quoted_amount AS quotedAmount, b.discount_amount AS discountAmount,
            b.service_id AS serviceId, s.name AS serviceName, b.customer_id AS customerId
       FROM bookings b
       JOIN services s ON s.id = b.service_id
      WHERE b.operator_id = ?
        AND b.starts_at >= ?
        AND b.starts_at < ?
      ORDER BY b.starts_at DESC
      LIMIT 2000`,
    id,
    fromIso,
    toIso,
  );

  const revenueRows = await all<{ operatorId: string; revenue: number }>(
    db,
    `SELECT b.operator_id AS operatorId,
            COALESCE(SUM(MAX(0, b.quoted_amount - b.discount_amount)), 0) AS revenue
       FROM bookings b
      WHERE b.status = 'completed'
        AND b.operator_id IS NOT NULL
        AND b.starts_at >= ?
        AND b.starts_at < ?
      GROUP BY b.operator_id`,
    fromIso,
    toIso,
  );

  const activeRows = await all<{ id: string }>(
    db,
    `SELECT id FROM operators WHERE archived_at IS NULL ORDER BY sort_order ASC LIMIT 500`,
  );
  const ranking: OperatorRankingEntry[] = activeRows.map((row) => ({
    operatorId: row.id,
    revenue: revenueRows.find((entry) => entry.operatorId === row.id)?.revenue ?? 0,
  }));
  if (!ranking.some((entry) => entry.operatorId === id)) {
    ranking.push({ operatorId: id, revenue: 0 });
  }

  const bookingRows: OperatorBookingRow[] = rows.map((row) => ({
    id: row.id,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status,
    quotedAmount: row.quotedAmount,
    discountAmount: row.discountAmount,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    customerId: row.customerId,
  }));

  const stats = computeOperatorStats({
    operator,
    rows: bookingRows,
    range,
    timezone,
    nowIso: now.toISOString(),
    ranking,
  });

  // The reporting range looks backwards, but "upcoming" looks forwards: a session
  // booked for next week is the one the clinic must staff, and counting it inside
  // a last-N-days window would always report zero.
  const upcomingRow = await one<{ upcoming: number }>(
    db,
    `SELECT COUNT(*) AS upcoming
       FROM bookings
      WHERE operator_id = ?
        AND status IN ('pending', 'confirmed')
        AND starts_at >= ?`,
    id,
    now.toISOString(),
  );
  stats.totals.upcoming = Math.max(0, Math.round(upcomingRow?.upcoming ?? 0));

  stats.insights = buildInsights(operator, stats);
  return stats;
}

export async function getOperatorAgenda(
  db: Queryable,
  id: string,
  localDate: string,
  timezone = 'Asia/Tehran',
): Promise<OperatorAgendaItem[]> {
  const fromIso = zonedTimeToUtc(localDate, '00:00', timezone);
  const toIso = zonedTimeToUtc(addDays(localDate, 1), '00:00', timezone);
  return all<OperatorAgendaItem>(
    db,
    `SELECT b.id, b.reference, b.starts_at AS startsAt, b.ends_at AS endsAt, b.status,
            s.name AS serviceName, c.name AS customerName, c.phone AS customerPhone,
            b.pricing_category AS pricingCategory, b.quoted_amount AS quotedAmount, b.currency
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN services s ON s.id = b.service_id
      WHERE b.operator_id = ?
        AND b.starts_at >= ?
        AND b.starts_at < ?
      ORDER BY b.starts_at ASC
      LIMIT 100`,
    id,
    fromIso,
    toIso,
  );
}

/** Sessions of one clinic-local day that nobody owns yet: the pool an operator
 *  can pick from on their profile page. */
export async function listUnassignedSessions(
  db: Queryable,
  localDate: string,
  timezone = 'Asia/Tehran',
): Promise<OperatorAgendaItem[]> {
  const fromIso = zonedTimeToUtc(localDate, '00:00', timezone);
  const toIso = zonedTimeToUtc(addDays(localDate, 1), '00:00', timezone);
  return all<OperatorAgendaItem>(
    db,
    `SELECT b.id, b.reference, b.starts_at AS startsAt, b.ends_at AS endsAt, b.status,
            s.name AS serviceName, c.name AS customerName, c.phone AS customerPhone,
            b.pricing_category AS pricingCategory, b.quoted_amount AS quotedAmount, b.currency
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN services s ON s.id = b.service_id
      WHERE b.operator_id IS NULL
        AND b.status IN ('pending', 'confirmed')
        AND b.starts_at >= ?
        AND b.starts_at < ?
      ORDER BY b.starts_at ASC
      LIMIT 100`,
    fromIso,
    toIso,
  );
}

/* ── Booking ↔ operator ──────────────────────────────────────────────────── */

export async function assignBookingOperator(
  db: Queryable,
  bookingId: string,
  operatorId: string | null,
  actor: { id: string },
  now: Date = new Date(),
): Promise<{ bookingId: string; operatorId: string | null; operatorName: string | null }> {
  const booking = await one<{ id: string; reference: string }>(
    db,
    `SELECT id, reference FROM bookings WHERE id = ? LIMIT 1`,
    bookingId,
  );
  if (!booking) throw new ApiError('NOT_FOUND', 'نوبت مورد نظر یافت نشد.');

  let operatorName: string | null = null;
  if (operatorId) {
    const operator = await getOperatorById(db, operatorId);
    if (!operator) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
    if (operator.archivedAt) {
      throw new ApiError('VALIDATION_ERROR', 'پروفایل بایگانی‌شده قابل تخصیص نیست.', {
        fields: { operatorId: ['این اپراتور بایگانی شده است.'] },
      });
    }
    if (!operator.active) {
      throw new ApiError('VALIDATION_ERROR', 'اپراتور غیرفعال قابل تخصیص نیست.', {
        fields: { operatorId: ['این اپراتور غیرفعال است.'] },
      });
    }
    operatorName = operator.displayName;
  }

  const nowIso = now.toISOString();
  await run(
    db,
    `UPDATE bookings SET operator_id = ?, updated_at = ? WHERE id = ?`,
    operatorId,
    nowIso,
    bookingId,
  );
  await run(
    db,
    `INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
     VALUES (?, ?, 'operator_changed', ?, ?, ?)`,
    crypto.randomUUID(),
    bookingId,
    actor.id,
    operatorName ?? 'بدون اپراتور',
    nowIso,
  );
  await writeAuditLog(db, actor.id, 'booking.operator_changed', 'booking', bookingId);

  return { bookingId, operatorId, operatorName };
}

/* ── Self profile ────────────────────────────────────────────────────────── */

export async function updateOwnOperatorProfile(
  db: Queryable,
  userId: string,
  input: {
    phone?: string | undefined;
    email?: string | null | undefined;
    bio?: string | null | undefined;
    avatarColor?: string | undefined;
    title?: string | undefined;
  },
  actor: { id: string },
  now: Date = new Date(),
): Promise<OperatorDto> {
  const existing = await getOperatorByUserId(db, userId);
  if (!existing) throw new ApiError('NOT_FOUND', 'برای حساب شما پروفایل اپراتور ثبت نشده است.');

  const sets: string[] = [];
  const binds: SqlValue[] = [];
  if (input.phone !== undefined) {
    await assertPhoneAvailable(db, input.phone, existing.id);
    sets.push('phone = ?');
    binds.push(input.phone);
  }
  if (input.email !== undefined) {
    const email = input.email ? input.email.trim().toLowerCase() : null;
    await assertEmailAvailable(db, email, existing.id);
    sets.push('email = ?');
    binds.push(email);
  }
  if (input.bio !== undefined) {
    sets.push('bio = ?');
    binds.push(input.bio);
  }
  if (input.avatarColor !== undefined) {
    sets.push('avatar_color = ?');
    binds.push(input.avatarColor);
  }
  if (input.title !== undefined) {
    sets.push('title = ?');
    binds.push(input.title);
  }
  if (sets.length === 0) return existing;

  sets.push('updated_at = ?');
  binds.push(now.toISOString(), existing.id);
  await run(db, `UPDATE operators SET ${sets.join(', ')} WHERE id = ?`, ...binds);
  await writeAuditLog(db, actor.id, 'operator.self_updated', 'operator', existing.id);

  const updated = await getOperatorById(db, existing.id);
  if (!updated) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
  return updated;
}

/* ── Role matrix (for the account dialog) ────────────────────────────────── */

export interface TeamRoleDefinition {
  key: RoleKey;
  name: string;
  description: string;
  permissions: string[];
}

export async function listTeamRoles(db: Queryable): Promise<TeamRoleDefinition[]> {
  const rows = await all<{
    key: RoleKey;
    name: string;
    description: string;
    permission: string | null;
  }>(
    db,
    `SELECT r.key, r.name, r.description, p.key AS permission
       FROM roles r
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.key = rp.permission_key
      ORDER BY r.key, p.key`,
  );
  const map = new Map<RoleKey, TeamRoleDefinition>();
  for (const row of rows) {
    const entry = map.get(row.key) ?? {
      key: row.key,
      name: row.name,
      description: row.description,
      permissions: [],
    };
    if (row.permission) entry.permissions.push(row.permission);
    map.set(row.key, entry);
  }
  return [...map.values()];
}

/** Small helper for the dashboard strip: today's coverage without loading the
 *  whole roster twice. */
export async function getRosterSnapshot(
  db: Queryable,
  timezone: string,
  now: Date = new Date(),
): Promise<{
  total: number;
  active: number;
  onShiftToday: number;
  weekday: number;
  localDate: string;
}> {
  const localDate = localDateOf(now.toISOString(), timezone);
  const weekday = (new Date(`${localDate}T00:00:00.000Z`).getUTCDay() + 1) % 7;
  const operators = await listOperators(db, {}, now);
  const meta = summarizeOperators(operators, weekday);
  return {
    total: meta.total,
    active: meta.active,
    onShiftToday: meta.onShiftToday,
    weekday,
    localDate,
  };
}

export type { OperatorRange };
