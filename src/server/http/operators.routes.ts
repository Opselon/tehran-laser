/**
 * Operator API — the whole team surface under /api/v1/admin/operators, plus the
 * self-service pair under /api/v1/me/operator.
 *
 * Extracted from `router.ts` on purpose: the roster has twelve endpoints and the
 * central router is already ~1.6k lines, so keeping the team contract in one
 * reviewable file is what makes "API first" real rather than a slogan. The
 * router stays a flat table of `if (pathname …)` checks and delegates here.
 *
 * Rules that hold for every route below:
 *  - permissions are enforced server-side (`operator.read|write|account`), never
 *    inferred from what the dashboard chose to render;
 *  - every write returns the freshly read DTO, so the client never has to guess
 *    how the server merged a partial update;
 *  - list/collection responses carry the roster `meta` + the server's idea of
 *    "today" in clinic time, because a browser in another timezone must not
 *    compute the on-shift count itself;
 *  - no route returns a password: the one-time temporary password appears only in
 *    the response that generated it, and is never logged.
 */

import { env } from 'cloudflare:workers';
import { requireAuth, requirePermission } from '../auth/guard';
import { ApiError } from '../../lib/api/errors';
import { getSearchParams, ok, okWithStatus, parseBody, parseValue } from '../../lib/api/respond';
import { getPublicSettings } from '../repositories';
import {
  archiveOperator,
  assignBookingOperator,
  createOperator,
  deleteOperatorPermanently,
  getOperatorAgenda,
  getOperatorById,
  getOperatorByUserId,
  getOperatorStats,
  getRosterSnapshot,
  issueOperatorAccount,
  listOperators,
  listTeamRoles,
  listUnassignedSessions,
  reorderOperators,
  restoreOperator,
  setOperatorActive,
  updateOperator,
  updateOwnOperatorProfile,
} from '../operators';
import {
  operatorAccountSchema,
  operatorAssignSchema,
  operatorCreateSchema,
  operatorListQuerySchema,
  operatorReorderSchema,
  operatorSelfUpdateSchema,
  operatorStatusUpdateSchema,
  operatorUpdateSchema,
} from '../../domain/validation/operators.schemas';
import {
  OPERATOR_ACCENTS,
  OPERATOR_SORTS,
  OPERATOR_SORT_LABELS,
  OPERATOR_STATUSES,
  OPERATOR_STATUS_LABELS,
  OPERATOR_TEMPLATES,
  SHIFT_PRESETS,
  WORKDAYS,
  isOperatorRoleKey,
  workdayLabel,
} from '../../domain/operators/catalog';
import {
  coverageSegments,
  hourlyCoverage,
  roleOptions,
  summarizeOperators,
  todayWeekday,
} from '../../domain/operators/operators';
import type { OperatorCreateInput } from '../../domain/operators/operators';
import type { OperatorRoleKey } from '../../domain/operators/catalog';
import { localDateOf } from '../../lib/datetime/timezone';

const BASE = '/api/v1/admin/operators';
const BULK_REORDER = `${BASE}/reorder`;
const CATALOG = `${BASE}/catalog`;
const COVERAGE = `${BASE}/coverage`;
const UNASSIGNED = '/api/v1/admin/sessions/unassigned';
const BY_ID = /^\/api\/v1\/admin\/operators\/([^/]+)$/;
const BY_ID_ACTION = /^\/api\/v1\/admin\/operators\/([^/]+)\/(status|archive|restore|account|stats|agenda)$/;
const BOOKING_OPERATOR = /^\/api\/v1\/admin\/bookings\/([^/]+)\/operator$/;

/** Query params read by the roster list. Everything else is ignored rather than
 *  rejected: a cache-busting `_t` must not turn a valid listing into a 422. */
const LIST_KEYS = ['q', 'role', 'status', 'serviceId', 'weekday', 'sort'] as const;

function pick(source: Record<string, string>, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Clinic timezone, read once per request with a safe fallback. A broken settings
 *  row must not take the roster down — wrong "today" is better than a 500. */
async function resolveTimezone(): Promise<string> {
  try {
    const settings = await getPublicSettings(env.DB);
    return settings.timezone || 'Asia/Tehran';
  } catch {
    return 'Asia/Tehran';
  }
}

function weekdayOfQuery(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
    throw new ApiError('VALIDATION_ERROR', 'روز هفته معتبر نیست.', {
      fields: { weekday: ['عدد روز هفته باید بین ۰ تا ۶ باشد.'] },
    });
  }
  return parsed;
}

function localDateOfQuery(raw: string | undefined, fallback: string): string {
  if (raw === undefined || raw === '') return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new ApiError('VALIDATION_ERROR', 'تاریخ معتبر نیست.', {
      fields: { date: ['تاریخ باید به شکل YYYY-MM-DD باشد.'] },
    });
  }
  return raw;
}

function daysOfQuery(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new ApiError('VALIDATION_ERROR', 'بازه گزارش معتبر نیست.', {
      fields: { days: ['بازه باید یک عدد باشد.'] },
    });
  }
  return Math.max(1, Math.min(365, Math.trunc(parsed)));
}

/**
 * Handle one operator request, or return null when the path is not ours.
 *
 * Returning null keeps the central router the single dispatcher: no route is
 * registered twice, and an unknown sub-path still falls through to its 404.
 */
export async function handleOperatorRoutes(
  request: Request,
  locals: App.Locals,
  pathname: string,
  method: string,
): Promise<Response | null> {
  const isOperatorsBase = pathname === BASE || pathname.startsWith(`${BASE}/`);

  /* ── Self service: /api/v1/me/operator ─────────────────────────────── */

  if (pathname === '/api/v1/me/operator' && method === 'GET') {
    const auth = requireAuth(locals);
    const operator = await getOperatorByUserId(env.DB, auth.id);
    return ok({ operator });
  }

  if (pathname === '/api/v1/me/operator' && method === 'PATCH') {
    const auth = requireAuth(locals);
    const body = await parseBody(request, operatorSelfUpdateSchema);
    const operator = await updateOwnOperatorProfile(env.DB, auth.id, body, auth);
    return ok({ operator });
  }

  if (!isOperatorsBase && !BOOKING_OPERATOR.test(pathname)) return null;

  /* ── Static sub-paths first: they must never be read as an operator id ── */

  if (pathname === CATALOG && method === 'GET') {
    requirePermission(locals, 'operator.read');
    const teamRoles = await listTeamRoles(env.DB);
    return ok({
      roles: roleOptions(),
      workdays: WORKDAYS,
      accents: OPERATOR_ACCENTS,
      templates: OPERATOR_TEMPLATES,
      shifts: SHIFT_PRESETS,
      statuses: OPERATOR_STATUSES.map((key) => ({ key, label: OPERATOR_STATUS_LABELS[key] })),
      sorts: OPERATOR_SORTS.map((key) => ({ key, label: OPERATOR_SORT_LABELS[key] })),
      teamRoles,
    });
  }

  if (pathname === COVERAGE && method === 'GET') {
    requirePermission(locals, 'operator.read');
    const timezone = await resolveTimezone();
    const today = todayWeekday(timezone, new Date());
    const params = getSearchParams(request);
    const weekday = weekdayOfQuery(params.weekday, today);
    const operators = await listOperators(env.DB, { status: 'all', sort: 'order' }, new Date());
    return ok({
      weekday,
      label: workdayLabel(weekday),
      segments: coverageSegments(operators, weekday),
      hourly: hourlyCoverage(operators, weekday),
      roster: operators
        .filter((operator) => operator.active && operator.workdays.includes(weekday))
        .map((operator) => ({
          id: operator.id,
          displayName: operator.displayName,
          initials: operator.initials,
          avatarColor: operator.avatarColor,
          roleLabel: operator.roleLabel,
          shiftStart: operator.shiftStart,
          shiftEnd: operator.shiftEnd,
        })),
    });
  }

  if (pathname === BULK_REORDER && method === 'POST') {
    const auth = requirePermission(locals, 'operator.write');
    const body = await parseBody(request, operatorReorderSchema);
    const items = await reorderOperators(env.DB, body.order, auth);
    return ok({ items, meta: summarizeOperators(items, todayWeekday(await resolveTimezone())) });
  }

  /* ── Collection ────────────────────────────────────────────────────── */

  if (pathname === BASE && method === 'GET') {
    requirePermission(locals, 'operator.read');
    const auth = requireAuth(locals);
    const query = parseValue(
      operatorListQuerySchema,
      pick(getSearchParams(request), LIST_KEYS),
    );
    const timezone = await resolveTimezone();
    const now = new Date();
    const weekday = todayWeekday(timezone, now);
    const roleFilter = query.role && query.role !== 'all' ? query.role : null;
    if (roleFilter && !isOperatorRoleKey(roleFilter)) {
      throw new ApiError('VALIDATION_ERROR', 'نقش انتخابی معتبر نیست.', {
        fields: { role: ['نقش باید یکی از نقش‌های فهرست تیم باشد.'] },
      });
    }
    const items = await listOperators(
      env.DB,
      {
        ...(query.q ? { q: query.q } : {}),
        ...(roleFilter ? { role: roleFilter as OperatorRoleKey } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.serviceId ? { serviceId: query.serviceId } : {}),
        ...(query.weekday !== undefined ? { weekday: query.weekday } : {}),
        ...(query.sort ? { sort: query.sort } : {}),
      },
      now,
    );
    return ok({
      items,
      meta: summarizeOperators(items, weekday),
      today: { weekday, label: workdayLabel(weekday), localDate: localDateOf(now.toISOString(), timezone) },
      capabilities: {
        canWrite: auth.permissions.includes('operator.write'),
        canManageAccounts: auth.permissions.includes('operator.account'),
        currentUserId: auth.id,
      },
    });
  }

  if (pathname === BASE && method === 'POST') {
    const auth = requirePermission(locals, 'operator.write');
    const body = await parseBody(request, operatorCreateSchema);
    const operator = await createOperator(env.DB, body as OperatorCreateInput, auth);
    return okWithStatus({ operator }, 201);
  }

  /* ── Booking ↔ operator assignment ─────────────────────────────────── */

  const bookingMatch = BOOKING_OPERATOR.exec(pathname);
  if (bookingMatch && method === 'POST') {
    const auth = requirePermission(locals, 'booking.update');
    const body = await parseBody(request, operatorAssignSchema);
    const assignment = await assignBookingOperator(
      env.DB,
      decodeURIComponent(bookingMatch[1] ?? ''),
      body.operatorId,
      auth,
    );
    return ok(assignment);
  }

  /* ── Unassigned session pool ───────────────────────────────────────── */

  if (pathname === UNASSIGNED && method === 'GET') {
    requirePermission(locals, 'operator.read');
    const timezone = await resolveTimezone();
    const params = getSearchParams(request);
    const localDate = localDateOfQuery(params.date, localDateOf(new Date().toISOString(), timezone));
    const items = await listUnassignedSessions(env.DB, localDate, timezone);
    return ok({ localDate, items });
  }

  /* ── Roster snapshot (dashboard strip) ─────────────────────────────── */

  if (pathname === `${BASE}/snapshot` && method === 'GET') {
    requirePermission(locals, 'operator.read');
    const timezone = await resolveTimezone();
    const snapshot = await getRosterSnapshot(env.DB, timezone);
    return ok(snapshot);
  }

  /* ── Single operator ───────────────────────────────────────────────── */

  const actionMatch = BY_ID_ACTION.exec(pathname);
  if (actionMatch) {
    const id = decodeURIComponent(actionMatch[1] ?? '');
    const action = actionMatch[2];

    if (action === 'stats' && method === 'GET') {
      requirePermission(locals, 'operator.read');
      const timezone = await resolveTimezone();
      const params = getSearchParams(request);
      const days = daysOfQuery(params.days, 30);
      const stats = await getOperatorStats(env.DB, id, { days, timezone });
      return ok({ stats });
    }

    if (action === 'agenda' && method === 'GET') {
      requirePermission(locals, 'operator.read');
      const timezone = await resolveTimezone();
      const params = getSearchParams(request);
      const localDate = localDateOfQuery(params.date, localDateOf(new Date().toISOString(), timezone));
      const items = await getOperatorAgenda(env.DB, id, localDate, timezone);
      return ok({ localDate, items });
    }

    if (action === 'status' && method === 'POST') {
      const auth = requirePermission(locals, 'operator.write');
      const body = await parseBody(request, operatorStatusUpdateSchema);
      const operator = await setOperatorActive(env.DB, id, body.active, auth);
      return ok({ operator });
    }

    if (action === 'archive' && method === 'POST') {
      const auth = requirePermission(locals, 'operator.write');
      const result = await archiveOperator(env.DB, id, auth);
      return ok(result);
    }

    if (action === 'restore' && method === 'POST') {
      const auth = requirePermission(locals, 'operator.write');
      const operator = await restoreOperator(env.DB, id, auth);
      return ok({ operator });
    }

    if (action === 'account' && method === 'POST') {
      const auth = requirePermission(locals, 'operator.account');
      const body = await parseBody(request, operatorAccountSchema);
      const account = await issueOperatorAccount(env.DB, id, body, auth);
      const operator = await getOperatorById(env.DB, id);
      return ok({ account, operator });
    }
  }

  const idMatch = BY_ID.exec(pathname);
  if (idMatch) {
    const id = decodeURIComponent(idMatch[1] ?? '');

    if (method === 'GET') {
      requirePermission(locals, 'operator.read');
      const timezone = await resolveTimezone();
      const now = new Date();
      const localDate = localDateOf(now.toISOString(), timezone);
      const operator = await getOperatorById(env.DB, id);
      if (!operator) throw new ApiError('NOT_FOUND', 'اپراتور مورد نظر یافت نشد.');
      const [stats, agenda, unassigned] = await Promise.all([
        getOperatorStats(env.DB, id, { days: 30, timezone, now }),
        getOperatorAgenda(env.DB, id, localDate, timezone),
        listUnassignedSessions(env.DB, localDate, timezone),
      ]);
      return ok({
        operator,
        stats,
        agenda,
        unassigned,
        today: {
          weekday: todayWeekday(timezone, now),
          label: workdayLabel(todayWeekday(timezone, now)),
          localDate,
        },
      });
    }

    if (method === 'PUT') {
      const auth = requirePermission(locals, 'operator.write');
      const body = await parseBody(request, operatorUpdateSchema);
      const operator = await updateOperator(env.DB, id, body, auth);
      return ok({ operator });
    }

    if (method === 'DELETE') {
      const auth = requirePermission(locals, 'operator.write');
      const params = getSearchParams(request);
      if (params.hard === '1' || params.hard === 'true') {
        const result = await deleteOperatorPermanently(env.DB, id, auth);
        return ok(result);
      }
      const result = await archiveOperator(env.DB, id, auth);
      return ok(result);
    }
  }

  return null;
}
