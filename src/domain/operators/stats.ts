/**
 * Operator performance math.
 *
 * Pure aggregation over booking rows so the same numbers can be produced in the
 * API (from D1) and in a test (from literals). A metric that cannot be computed
 * from a row set does not belong in the profile: no hidden counters, no
 * denormalised totals to drift out of sync.
 *
 * Money rules (match the booking ledger):
 *  - revenue counts COMPLETED sessions only, net of discount, in Toman.
 *  - upcoming counts pending + confirmed sessions that start in the future.
 *  - booked minutes count completed + confirmed, which is what actually occupies
 *    the operator's shift capacity.
 */

import type { BookingStatus } from '../booking/booking.types';
import { addDays, localDateOf } from '../../lib/datetime/timezone';
import {
  averageTicket,
  capacityMinutes,
  commissionAmount,
  completionRate,
  utilizationPercent,
  weeklyShiftMinutes,
} from './operators';
import type {
  OperatorDailyPoint,
  OperatorDto,
  OperatorServiceStat,
  OperatorStatsDto,
} from './operators';

export interface OperatorBookingRow {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  quotedAmount: number;
  discountAmount: number;
  serviceId: string;
  serviceName: string;
  customerId: string;
}

export interface OperatorRange {
  /** Inclusive clinic-local date 'YYYY-MM-DD'. */
  from: string;
  /** Inclusive clinic-local date 'YYYY-MM-DD'. */
  to: string;
  days: number;
}

const COMPLETED: BookingStatus = 'completed';

function minutesBetweenIso(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  return Math.round((to - from) / 60_000);
}

function netAmount(row: OperatorBookingRow): number {
  return Math.max(0, (row.quotedAmount || 0) - (row.discountAmount || 0));
}

/** Zero-filled daily series over the range, in clinic-local dates. A missing
 *  day must render as an empty bar, not a gap in the axis. */
export function buildDailySeries(
  range: OperatorRange,
  rows: readonly OperatorBookingRow[],
  timezone: string,
): OperatorDailyPoint[] {
  const byDate = new Map<string, OperatorDailyPoint>();
  for (let offset = 0; offset < range.days; offset += 1) {
    const date = addDays(range.from, offset);
    byDate.set(date, { date, sessions: 0, revenue: 0, minutes: 0 });
  }

  for (const row of rows) {
    const date = localDateOf(row.startsAt, timezone);
    const point = byDate.get(date);
    if (!point) continue;
    if (row.status === COMPLETED) {
      point.sessions += 1;
      point.revenue += netAmount(row);
    }
    if (row.status === COMPLETED || row.status === 'confirmed') {
      point.minutes += minutesBetweenIso(row.startsAt, row.endsAt);
    }
  }

  return [...byDate.values()];
}

export function topServices(
  rows: readonly OperatorBookingRow[],
  limit = 5,
): OperatorServiceStat[] {
  const map = new Map<string, OperatorServiceStat>();
  for (const row of rows) {
    if (row.status !== COMPLETED) continue;
    const entry = map.get(row.serviceId) ?? {
      serviceId: row.serviceId,
      name: row.serviceName,
      sessions: 0,
      revenue: 0,
      share: 0,
    };
    entry.sessions += 1;
    entry.revenue += netAmount(row);
    map.set(row.serviceId, entry);
  }

  const total = [...map.values()].reduce((sum, entry) => sum + entry.sessions, 0);
  return [...map.values()]
    .map((entry) => ({ ...entry, share: total > 0 ? Math.round((entry.sessions / total) * 100) : 0 }))
    .sort((a, b) => b.sessions - a.sessions || b.revenue - a.revenue)
    .slice(0, limit);
}

export interface OperatorRankingEntry {
  operatorId: string;
  revenue: number;
}

/** Position 1..N among active operators by completed revenue in the same range.
 *  A brand-new operator is ranked last but never hidden. */
export function rankOf(
  operatorId: string,
  entries: readonly OperatorRankingEntry[],
): { position: number; total: number; revenue: number } {
  const sorted = [...entries].sort((a, b) => b.revenue - a.revenue);
  const index = sorted.findIndex((entry) => entry.operatorId === operatorId);
  const own = sorted[index]?.revenue ?? 0;
  if (index === -1) return { position: sorted.length + 1, total: sorted.length + 1, revenue: own };
  return { position: index + 1, total: sorted.length, revenue: own };
}

export function computeOperatorStats(options: {
  operator: Pick<
    OperatorDto,
    'id' | 'displayName' | 'commissionPercent' | 'shiftStart' | 'shiftEnd' | 'workdays'
  >;
  rows: readonly OperatorBookingRow[];
  range: OperatorRange;
  timezone: string;
  nowIso: string;
  ranking: readonly OperatorRankingEntry[];
}): OperatorStatsDto {
  const { operator, rows, range, timezone, nowIso, ranking } = options;

  const completed = rows.filter((row) => row.status === COMPLETED);
  const revenue = completed.reduce((sum, row) => sum + netAmount(row), 0);
  const upcoming = rows.filter(
    (row) => (row.status === 'pending' || row.status === 'confirmed') && row.startsAt >= nowIso,
  ).length;
  const cancelled = rows.filter((row) => row.status === 'cancelled').length;
  const noShow = rows.filter((row) => row.status === 'no_show').length;

  const bookedMinutes = rows
    .filter((row) => row.status === COMPLETED || row.status === 'confirmed')
    .reduce((sum, row) => sum + minutesBetweenIso(row.startsAt, row.endsAt), 0);

  const capacity = capacityMinutes(weeklyShiftMinutes(operator), range.days);
  const percent = operator.commissionPercent;

  const totals = {
    sessions: completed.length,
    revenue,
    upcoming,
    cancelled,
    noShow,
    netRevenue: revenue,
    averageTicket: averageTicket(revenue, completed.length),
    commission: commissionAmount(revenue, percent),
    commissionPercent: percent,
    bookedMinutes,
    capacityMinutes: capacity,
    utilization: utilizationPercent(bookedMinutes, capacity),
    completionRate: completionRate(completed.length, cancelled, noShow),
    uniqueClients: new Set(completed.map((row) => row.customerId)).size,
  };

  const stats: OperatorStatsDto = {
    operatorId: operator.id,
    range,
    totals,
    daily: buildDailySeries(range, rows, timezone),
    topServices: topServices(rows),
    ranking: rankOf(operator.id, ranking),
    // Filled by the caller, which knows the account/services state the insights
    // talk about; this module only knows numbers.
    insights: [],
  };

  return stats;
}

/** Compact card stats derived from an all-time aggregate query. Utilization is
 *  filled in by the caller when it has shift capacity handy. */
export function summaryFromAggregate(aggregate: {
  sessions: number;
  revenue: number;
  upcoming: number;
  utilization?: number;
}): {
  sessions: number;
  revenue: number;
  upcoming: number;
  utilization: number;
} {
  return {
    sessions: Math.max(0, Math.round(aggregate.sessions || 0)),
    revenue: Math.max(0, Math.round(aggregate.revenue || 0)),
    upcoming: Math.max(0, Math.round(aggregate.upcoming || 0)),
    utilization: Math.max(0, Math.min(100, Math.round(aggregate.utilization ?? 0))),
  };
}

/** Last-N-days range ending today (clinic-local), inclusive. */
export function rangeOfDays(days: number, timezone: string, now: Date = new Date()): OperatorRange {
  const safeDays = Math.max(1, Math.min(365, Math.trunc(days)));
  const today = localDateOf(now.toISOString(), timezone);
  const to = today;
  const from = addDays(to, -(safeDays - 1));
  return { from, to, days: safeDays };
}
