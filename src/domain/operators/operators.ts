/**
 * Operator domain — pure functions shared by the API, the roster island and the
 * profile page.
 *
 * Nothing here touches D1, fetch or the DOM, which is deliberate: the rules that
 * decide whether a shift is valid, how initials are derived, how a roster sorts
 * and how utilization is computed are unit-tested once and then reused on both
 * sides of the wire. If a rule needs a database round-trip it belongs in
 * `src/server/operators.ts`, not here.
 */

import type { RoleKey } from '../rbac/rbac.types';
import {
  DEFAULT_ACCENT,
  DEFAULT_WORKDAYS,
  OPERATOR_ROLE_CATALOG,
  WORKDAYS,
  findOperatorRole,
  isOperatorRoleKey,
  operatorRoleOrDefault,
  workdayLabel,
} from './catalog';
import type { OperatorRoleKey, OperatorSortKey, OperatorStatus } from './catalog';

/* ── Wire types ──────────────────────────────────────────────────────────── */

/** Compact performance block shown on every roster card. */
export interface OperatorStatsSummary {
  /** Completed sessions, all time. */
  sessions: number;
  /** Net revenue of completed sessions, Toman, all time. */
  revenue: number;
  /** Pending + confirmed sessions from now on. */
  upcoming: number;
  /** 0-100, completed minutes / scheduled shift capacity over the last 30 days. */
  utilization: number;
}

export interface OperatorAccountInfo {
  userId: string;
  email: string;
  active: boolean;
  roles: RoleKey[];
  lastSeenAt: string | null;
}

/** Full operator profile as the API returns it. */
export interface OperatorDto {
  id: string;
  code: string;
  displayName: string;
  phone: string;
  email: string | null;
  roleKey: OperatorRoleKey;
  roleLabel: string;
  roleIcon: string;
  title: string;
  bio: string | null;
  initials: string;
  avatarColor: string;
  serviceIds: string[];
  workdays: number[];
  shiftStart: string;
  shiftEnd: string;
  commissionPercent: number;
  monthlyTarget: number;
  active: boolean;
  status: OperatorStatus;
  sortOrder: number;
  account: OperatorAccountInfo | null;
  stats: OperatorStatsSummary;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface OperatorListMeta {
  total: number;
  active: number;
  archived: number;
  /** Operators whose weekly workdays include today (clinic timezone). */
  onShiftToday: number;
  linkedAccounts: number;
  roles: Partial<Record<OperatorRoleKey, number>>;
}

export interface OperatorListResponse {
  items: OperatorDto[];
  meta: OperatorListMeta;
  /** Server-side "today" so the client never guesses the clinic weekday. */
  today: { weekday: number; label: string; localDate: string };
  capabilities: OperatorCapabilities;
}

export interface OperatorCapabilities {
  canWrite: boolean;
  canManageAccounts: boolean;
  currentUserId: string | null;
}

export interface OperatorDailyPoint {
  /** Clinic-local 'YYYY-MM-DD'. */
  date: string;
  sessions: number;
  revenue: number;
  /** Minutes occupied by completed + confirmed sessions that day. */
  minutes: number;
}

export interface OperatorServiceStat {
  serviceId: string;
  name: string;
  sessions: number;
  revenue: number;
  share: number;
}

export interface OperatorStatsDto {
  operatorId: string;
  range: { from: string; to: string; days: number };
  totals: {
    sessions: number;
    revenue: number;
    upcoming: number;
    cancelled: number;
    noShow: number;
    netRevenue: number;
    averageTicket: number;
    commission: number;
    commissionPercent: number;
    bookedMinutes: number;
    capacityMinutes: number;
    utilization: number;
    completionRate: number;
    uniqueClients: number;
  };
  daily: OperatorDailyPoint[];
  topServices: OperatorServiceStat[];
  ranking: { position: number; total: number; revenue: number };
  insights: OperatorInsight[];
}

export interface OperatorInsight {
  tone: 'good' | 'warn' | 'info';
  text: string;
}

export interface OperatorAgendaItem {
  id: string;
  reference: string;
  startsAt: string;
  endsAt: string;
  status: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  pricingCategory: string;
  quotedAmount: number;
  currency: string;
}

/** Input accepted by POST /admin/operators. Optional fields mirror the form. */
export interface OperatorCreateInput {
  displayName: string;
  phone: string;
  /** Optional keys spell out `| undefined` because zod's parsed output hands us
   *  explicit undefined for a field the caller omitted, and this project compiles
   *  with exactOptionalPropertyTypes. */
  email?: string | null | undefined;
  roleKey: OperatorRoleKey;
  title?: string | undefined;
  bio?: string | null | undefined;
  avatarColor?: string | undefined;
  serviceIds?: string[] | undefined;
  workdays?: number[] | undefined;
  shiftStart?: string | undefined;
  shiftEnd?: string | undefined;
  commissionPercent?: number | undefined;
  monthlyTarget?: number | undefined;
  active?: boolean | undefined;
}

/** Every create field, optional and explicitly undefined-able (a parsed zod
 *  partial hands us `{ shiftStart: undefined }` for omitted keys). */
export type OperatorUpdateInput = {
  [K in keyof OperatorCreateInput]?: OperatorCreateInput[K] | undefined;
} & {
  sortOrder?: number | undefined;
};

export interface OperatorListFilters {
  q?: string;
  role?: OperatorRoleKey | 'all';
  status?: OperatorStatus | 'all';
  serviceId?: string;
  weekday?: number | null;
  sort?: OperatorSortKey;
}

/* ── Persian formatting ──────────────────────────────────────────────────── */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '۰';
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value);
}

/** Toman amounts, compacted above 1,000 so a card never overflows on a 360px
 *  screen. The unit is always spelled out — never a bare number. */
export function formatToman(amount: number): string {
  if (!Number.isFinite(amount)) return '۰ تومان';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(amount / 1_000_000_000)} میلیارد تومان`;
  }
  if (abs >= 1_000_000) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(amount / 1_000_000)} میلیون تومان`;
  }
  if (abs >= 1_000) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(amount / 1_000)} هزار تومان`;
  }
  return `${formatNumber(amount)} تومان`;
}

export function formatPercent(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  return `٪${toPersianDigits(safe)}`;
}

/** 24h clock 'HH:MM' → Persian-friendly '۰۹:۳۰'. */
export function formatClockLabel(clock: string): string {
  return toPersianDigits(clock);
}

/* ── Identity ────────────────────────────────────────────────────────────── */

const HONORIFICS = new Set([
  'dr',
  'dr.',
  'doctor',
  'prof',
  'prof.',
  'professor',
  'دکتر',
  'خانم',
  'آقای',
  'آقا',
  'جناب',
  'سرکار',
  'مهندس',
  'استاد',
  'بیمار',
]);

/** Trim, drop control characters and collapse whitespace. Persian ZWNJ is kept:
 *  removing it turns «سه‌شنبه» into a different word. */
export function normalizeDisplayName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/**
 * Two-grapheme initials for the avatar.
 * «دکتر سارا محمدی» → «سم», «سارا» → «سا», «Dr. Sara Mohammadi» → «SM».
 * Honorifics are skipped so every doctor's avatar is not a «د».
 */
export function deriveInitials(rawName: string): string {
  const cleaned = normalizeDisplayName(rawName);
  if (!cleaned) return '؟';

  const tokens = cleaned.split(' ').filter((token) => token.length > 0);
  const significant = tokens.filter((token) => !HONORIFICS.has(token.toLowerCase()));
  const pool = significant.length > 0 ? significant : tokens;

  const first = pool[0] ?? '';
  if (pool.length === 1) {
    const chars = Array.from(first);
    return (chars.length > 1 ? chars.slice(0, 2).join('') : first).toUpperCase();
  }
  const second = pool[1] ?? '';
  const a = Array.from(first)[0] ?? '';
  const b = Array.from(second)[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

/** Persian/Arabic-Indic digits → ASCII, strip separators, canonicalise to +98… .
 *  Returns null when the result cannot be a phone number. Mirrors the server
 *  schema so the form can show the error before the request leaves the device. */
export function normalizePhoneInput(raw: string): string | null {
  const ascii = raw
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s\-().\u200c]/g, '');
  if (!/^\+?\d{10,15}$/.test(ascii)) return null;
  if (ascii.startsWith('0098')) return `+98${ascii.slice(4)}`;
  if (ascii.startsWith('+98')) return ascii;
  if (ascii.startsWith('98') && ascii.length === 12) return `+${ascii}`;
  if (ascii.startsWith('0')) return `+98${ascii.slice(1)}`;
  if (ascii.startsWith('9') && ascii.length === 10) return `+98${ascii}`;
  return `+${ascii}`;
}

/** Human display for a canonical phone: +989121234567 → ۰۹۱۲ ۱۲۳ ۴۵۶۷. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/^\+?98/, '0');
  if (digits.length === 11) {
    return toPersianDigits(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
  }
  return toPersianDigits(digits);
}

export function normalizeOperatorCode(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!cleaned) return 'OP-01';
  return cleaned.startsWith('OP-') ? cleaned.slice(0, 24) : `OP-${cleaned}`.slice(0, 24);
}

/** Next free `OP-NN`. Gaps are not reused: a code that appeared on a printed
 *  card stays attached to that person forever, archived or not. */
export function nextOperatorCode(existing: readonly string[]): string {
  let max = 0;
  for (const code of existing) {
    const match = /^OP-(\d{1,4})$/i.exec(code.trim());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `OP-${String(max + 1).padStart(2, '0')}`;
}

/* ── Shift / schedule ────────────────────────────────────────────────────── */

export function parseClock(clock: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClockFromMinutes(totalMinutes: number): string {
  const safe = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export type ShiftValidation = 'ok' | 'invalid_format' | 'empty_window' | 'too_short' | 'too_long';

export const MIN_SHIFT_MINUTES = 30;
export const MAX_SHIFT_MINUTES = 16 * 60;

export function validateShiftWindow(start: string, end: string): ShiftValidation {
  const from = parseClock(start);
  const to = parseClock(end);
  if (from === null || to === null) return 'invalid_format';
  const span = to - from;
  if (span === 0) return 'empty_window';
  if (span < 0) return 'invalid_format';
  if (span < MIN_SHIFT_MINUTES) return 'too_short';
  if (span > MAX_SHIFT_MINUTES) return 'too_long';
  return 'ok';
}

export const SHIFT_ERROR_MESSAGES: Record<Exclude<ShiftValidation, 'ok'>, string> = {
  invalid_format: 'ساعت پایان باید بعد از ساعت شروع باشد (قالب ۲۴ ساعته).',
  empty_window: 'شیفت نمی‌تواند صفر دقیقه باشد.',
  too_short: 'حداقل طول شیفت ۳۰ دقیقه است.',
  too_long: 'حداکثر طول شیفت ۱۶ ساعت است.',
};

export function shiftMinutes(operator: Pick<OperatorDto, 'shiftStart' | 'shiftEnd'>): number {
  const from = parseClock(operator.shiftStart);
  const to = parseClock(operator.shiftEnd);
  if (from === null || to === null) return 0;
  return Math.max(0, to - from);
}

export function weeklyShiftMinutes(
  operator: Pick<OperatorDto, 'shiftStart' | 'shiftEnd' | 'workdays'>,
): number {
  return shiftMinutes(operator) * operator.workdays.length;
}

export function normalizeWorkdays(input: readonly number[]): number[] {
  const seen = new Set<number>();
  for (const value of input) {
    const n = Math.trunc(Number(value));
    if (Number.isInteger(n) && n >= 0 && n <= 6) seen.add(n);
  }
  return [...seen].sort((a, b) => a - b);
}

export function isOnShift(
  operator: Pick<OperatorDto, 'workdays' | 'shiftStart' | 'shiftEnd'>,
  weekday: number,
  minuteOfDay?: number,
): boolean {
  if (!operator.workdays.includes(weekday)) return false;
  if (minuteOfDay === undefined) return true;
  const from = parseClock(operator.shiftStart);
  const to = parseClock(operator.shiftEnd);
  if (from === null || to === null) return false;
  return minuteOfDay >= from && minuteOfDay < to;
}

/** Compress consecutive weekdays into a readable range.
 *  [0,1,2,3,4,5] → «شنبه تا پنجشنبه»; [1,3] → «یکشنبه، سه‌شنبه». */
export function workdaysLabel(workdays: readonly number[]): string {
  const days = normalizeWorkdays(workdays);
  if (days.length === 0) return 'بدون روز کاری';
  if (days.length === 7) return 'هر روز هفته';

  const runs: number[][] = [];
  for (const day of days) {
    const last = runs[runs.length - 1];
    if (last && day === (last[last.length - 1] ?? -99) + 1) last.push(day);
    else runs.push([day]);
  }

  return runs
    .map((run) => {
      const first = run[0] ?? 0;
      const last = run[run.length - 1] ?? first;
      if (first === last) return workdayLabel(first);
      if (last === first + 1) return `${workdayLabel(first)} و ${workdayLabel(last)}`;
      return `${workdayLabel(first)} تا ${workdayLabel(last)}`;
    })
    .join('، ');
}

/** Iranian weekday index (0 = Saturday) for a clinic-local date. */
export function weekdayOfLocalDate(localDate: string): number {
  const date = new Date(`${localDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return 0;
  const jsDay = date.getUTCDay(); // 0 = Sunday
  return (jsDay + 1) % 7; // Sat → 0, Sun → 1, … Fri → 6
}

export function todayWeekday(timezone: string, now: Date = new Date()): number {
  const local = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return weekdayOfLocalDate(local);
}

/** Union of shift windows for a weekday, with a live headcount per window. */
export interface CoverageSegment {
  start: string;
  end: string;
  count: number;
  operators: string[];
}

export function coverageSegments(
  operators: readonly Pick<
    OperatorDto,
    'id' | 'displayName' | 'workdays' | 'shiftStart' | 'shiftEnd' | 'active'
  >[],
  weekday: number,
): CoverageSegment[] {
  const boundaries = new Set<number>();
  const windows = operators
    .filter((op) => op.active && op.workdays.includes(weekday))
    .map((op) => ({
      id: op.id,
      name: op.displayName,
      from: parseClock(op.shiftStart),
      to: parseClock(op.shiftEnd),
    }))
    .filter(
      (w): w is { id: string; name: string; from: number; to: number } =>
        w.from !== null && w.to !== null && w.to > w.from,
    );

  for (const window of windows) {
    boundaries.add(window.from);
    boundaries.add(window.to);
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const segments: CoverageSegment[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i]!;
    const to = points[i + 1]!;
    const active = windows.filter((window) => window.from <= from && window.to >= to);
    if (active.length === 0) continue;
    segments.push({
      start: formatClockFromMinutes(from),
      end: formatClockFromMinutes(to),
      count: active.length,
      operators: active.map((window) => window.name),
    });
  }

  // Merge adjacent segments that carry the same headcount, so the UI draws one
  // block per coverage level instead of one per boundary.
  const merged: CoverageSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (last && last.end === segment.start && last.count === segment.count) {
      last.end = segment.end;
      last.operators = [...new Set([...last.operators, ...segment.operators])];
    } else {
      merged.push({ ...segment });
    }
  }
  return merged;
}

/** 24-slot headcount strip (one value per hour) for the coverage heat row. */
export function hourlyCoverage(
  operators: readonly Pick<OperatorDto, 'workdays' | 'shiftStart' | 'shiftEnd' | 'active'>[],
  weekday: number,
): number[] {
  const slots = new Array<number>(24).fill(0);
  for (const operator of operators) {
    if (!operator.active || !operator.workdays.includes(weekday)) continue;
    const from = parseClock(operator.shiftStart);
    const to = parseClock(operator.shiftEnd);
    if (from === null || to === null) continue;
    for (let hour = 0; hour < 24; hour += 1) {
      const slotStart = hour * 60;
      const slotEnd = slotStart + 60;
      if (from < slotEnd && to > slotStart) slots[hour] = (slots[hour] ?? 0) + 1;
    }
  }
  return slots;
}

/* ── Roster shaping ──────────────────────────────────────────────────────── */

export function operatorStatusOf(
  operator: Pick<OperatorDto, 'active' | 'archivedAt'>,
): OperatorStatus {
  if (operator.archivedAt) return 'archived';
  return operator.active ? 'active' : 'inactive';
}

export const OPERATOR_STATUS_TONE: Record<OperatorStatus, 'good' | 'muted' | 'warn'> = {
  active: 'good',
  inactive: 'warn',
  archived: 'muted',
};

export function matchesOperatorQuery(operator: OperatorDto, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  // The canonical phone is +98912…, but people search "0912…". Include the
  // local form so both spellings hit the same person.
  const phoneAliases = [operator.phone, operator.phone.replace(/^\+98/, '0')].join(' ');
  const haystack = [
    operator.displayName,
    operator.code,
    phoneAliases,
    operator.email ?? '',
    operator.title,
    operator.roleLabel,
  ]
    .join(' ')
    .toLowerCase();
  // ASCII digits typed for a Persian-digit phone still match.
  const asciiHaystack = haystack.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  const asciiQuery = query.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  return haystack.includes(query) || asciiHaystack.includes(asciiQuery);
}

export function filterOperators(
  operators: readonly OperatorDto[],
  filters: OperatorListFilters,
): OperatorDto[] {
  const status = filters.status ?? 'all';
  const role = filters.role ?? 'all';
  return operators.filter((operator) => {
    if (status !== 'all' && operatorStatusOf(operator) !== status) return false;
    if (role !== 'all' && operator.roleKey !== role) return false;
    if (filters.serviceId && !operator.serviceIds.includes(filters.serviceId)) return false;
    if (filters.weekday !== null && filters.weekday !== undefined) {
      if (!operator.workdays.includes(filters.weekday)) return false;
    }
    if (filters.q && !matchesOperatorQuery(operator, filters.q)) return false;
    return true;
  });
}

export function sortOperators(
  operators: readonly OperatorDto[],
  sort: OperatorSortKey = 'order',
): OperatorDto[] {
  const copy = [...operators];
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => a.displayName.localeCompare(b.displayName, 'fa'));
    case 'sessions':
      return copy.sort((a, b) => b.stats.sessions - a.stats.sessions || a.sortOrder - b.sortOrder);
    case 'revenue':
      return copy.sort((a, b) => b.stats.revenue - a.stats.revenue || a.sortOrder - b.sortOrder);
    case 'utilization':
      return copy.sort(
        (a, b) => b.stats.utilization - a.stats.utilization || a.sortOrder - b.sortOrder,
      );
    case 'recent':
      return copy.sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
      );
    case 'order':
    default:
      return copy.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.displayName.localeCompare(b.displayName, 'fa'),
      );
  }
}

export function summarizeOperators(
  operators: readonly OperatorDto[],
  todayIndex: number,
): OperatorListMeta {
  const meta: OperatorListMeta = {
    total: 0,
    active: 0,
    archived: 0,
    onShiftToday: 0,
    linkedAccounts: 0,
    roles: {},
  };
  for (const operator of operators) {
    meta.total += 1;
    const status = operatorStatusOf(operator);
    if (status === 'active') {
      meta.active += 1;
      if (operator.workdays.includes(todayIndex)) meta.onShiftToday += 1;
    }
    if (status === 'archived') meta.archived += 1;
    if (operator.account) meta.linkedAccounts += 1;
    meta.roles[operator.roleKey] = (meta.roles[operator.roleKey] ?? 0) + 1;
  }
  return meta;
}

export function nextSortOrder(operators: readonly Pick<OperatorDto, 'sortOrder'>[]): number {
  return operators.reduce((max, op) => Math.max(max, op.sortOrder), 0) + 10;
}

/** Only an operator that never owned a session can be hard-deleted; everything
 *  else is archived so clinical history keeps its author. */
export function canHardDelete(stats: OperatorStatsSummary): boolean {
  return stats.sessions === 0 && stats.upcoming === 0;
}

/* ── Metrics ─────────────────────────────────────────────────────────────── */

export function utilizationPercent(bookedMinutes: number, capacityMinutes: number): number {
  if (!Number.isFinite(bookedMinutes) || !Number.isFinite(capacityMinutes) || capacityMinutes <= 0)
    return 0;
  return Math.max(0, Math.min(100, Math.round((bookedMinutes / capacityMinutes) * 100)));
}

export function commissionAmount(revenue: number, percent: number): number {
  if (!Number.isFinite(revenue) || !Number.isFinite(percent)) return 0;
  const safePercent = Math.max(0, Math.min(100, percent));
  return Math.round((revenue * safePercent) / 100);
}

export function averageTicket(revenue: number, sessions: number): number {
  if (sessions <= 0) return 0;
  return Math.round(revenue / sessions);
}

/** completed / (completed + cancelled + no_show), 0-100. */
export function completionRate(completed: number, cancelled: number, noShow: number): number {
  const touched = completed + cancelled + noShow;
  if (touched <= 0) return 0;
  return Math.round((completed / touched) * 100);
}

/** Capacity for a window: weekly shift minutes × (days / 7). */
export function capacityMinutes(weeklyMinutes: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round(weeklyMinutes * (days / 7));
}

export function buildInsights(
  operator: Pick<
    OperatorDto,
    'active' | 'archivedAt' | 'account' | 'workdays' | 'serviceIds' | 'commissionPercent'
  >,
  stats: Pick<OperatorStatsDto, 'totals'>,
): OperatorInsight[] {
  const insights: OperatorInsight[] = [];
  if (operator.archivedAt) {
    insights.push({
      tone: 'warn',
      text: 'این پروفایل بایگانی شده است؛ در نوبت‌دهی و فهرست فعال دیده نمی‌شود.',
    });
  } else if (!operator.active) {
    insights.push({
      tone: 'warn',
      text: 'پروفایل غیرفعال است و در پیشنهاد شیفت امروز ظاهر نمی‌شود.',
    });
  }
  if (!operator.account) {
    insights.push({
      tone: 'info',
      text: 'حساب ورود ندارد؛ برای ثبت جلسه توسط خود او یک حساب صادر کنید.',
    });
  }
  if (operator.workdays.length === 0) {
    insights.push({
      tone: 'warn',
      text: 'هیچ روز کاری انتخاب نشده است؛ ظرفیت هفتگی صفر محاسبه می‌شود.',
    });
  }
  if (operator.serviceIds.length === 0) {
    insights.push({
      tone: 'info',
      text: 'خدمتی به این پروفایل وصل نشده؛ در انتخاب اپراتور برای آن خدمات پیشنهاد نمی‌شود.',
    });
  }
  if (stats.totals.sessions === 0) {
    insights.push({
      tone: 'info',
      text: 'هنوز جلسه‌ای به این اپراتور تخصیص نیافته است؛ از تب برنامه، نوبت‌ها را وصل کنید.',
    });
  } else if (stats.totals.utilization >= 85) {
    insights.push({
      tone: 'warn',
      text: 'ظرفیت شیفت تقریباً پر است؛ برای جذب مراجع بیشتر شیفت را گسترش دهید.',
    });
  } else if (stats.totals.utilization > 0 && stats.totals.utilization < 25) {
    insights.push({ tone: 'info', text: 'بهره‌وری شیفت پایین است؛ توزیع نوبت‌ها را متعادل کنید.' });
  }
  if (stats.totals.commission > 0) {
    insights.push({
      tone: 'good',
      text: `کمیسیون تخمینی این بازه ${formatToman(stats.totals.commission)} است.`,
    });
  }
  return insights.slice(0, 4);
}

/* ── Draft validation (mirrors the server zod schemas) ───────────────────── */

export interface OperatorDraft {
  displayName: string;
  phone: string;
  email: string;
  roleKey: OperatorRoleKey;
  title: string;
  bio: string;
  avatarColor: string;
  serviceIds: string[];
  workdays: number[];
  shiftStart: string;
  shiftEnd: string;
  commissionPercent: number;
  monthlyTarget: number;
  active: boolean;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emptyOperatorDraft(): OperatorDraft {
  return {
    displayName: '',
    phone: '',
    email: '',
    roleKey: 'laser_technician',
    title: operatorRoleOrDefault('laser_technician').defaultTitle,
    bio: '',
    avatarColor: operatorRoleOrDefault('laser_technician').accent,
    serviceIds: [],
    workdays: [...DEFAULT_WORKDAYS],
    shiftStart: '09:00',
    shiftEnd: '20:00',
    commissionPercent: 10,
    monthlyTarget: 0,
    active: true,
  };
}

export function draftFromOperator(operator: OperatorDto): OperatorDraft {
  return {
    displayName: operator.displayName,
    phone: operator.phone,
    email: operator.email ?? '',
    roleKey: operator.roleKey,
    title: operator.title,
    bio: operator.bio ?? '',
    avatarColor: operator.avatarColor,
    serviceIds: [...operator.serviceIds],
    workdays: [...operator.workdays],
    shiftStart: operator.shiftStart,
    shiftEnd: operator.shiftEnd,
    commissionPercent: operator.commissionPercent,
    monthlyTarget: operator.monthlyTarget,
    active: operator.active,
  };
}

/** Field errors keyed exactly like the API's `error.fields`, so the form shows a
 *  local error and a server error through the same code path. */
export function validateOperatorDraft(draft: OperatorDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = normalizeDisplayName(draft.displayName);
  if (name.length < 2) errors.displayName = 'نام و نام خانوادگی را کامل وارد کنید.';
  if (name.length > 80) errors.displayName = 'نام حداکثر ۸۰ حرف است.';

  if (!normalizePhoneInput(draft.phone)) errors.phone = 'شماره تماس معتبر نیست.';

  const email = draft.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) errors.email = 'ایمیل معتبر نیست.';

  if (!isOperatorRoleKey(draft.roleKey)) errors.roleKey = 'نقش انتخابی معتبر نیست.';

  if (normalizeWorkdays(draft.workdays).length === 0)
    errors.workdays = 'حداقل یک روز کاری انتخاب کنید.';

  const shift = validateShiftWindow(draft.shiftStart, draft.shiftEnd);
  if (shift !== 'ok') errors.shift = SHIFT_ERROR_MESSAGES[shift];

  if (
    !Number.isInteger(draft.commissionPercent) ||
    draft.commissionPercent < 0 ||
    draft.commissionPercent > 100
  ) {
    errors.commissionPercent = 'کمیسیون باید عددی بین ۰ تا ۱۰۰ باشد.';
  }
  if (!Number.isFinite(draft.monthlyTarget) || draft.monthlyTarget < 0) {
    errors.monthlyTarget = 'هدف ماهانه نمی‌تواند منفی باشد.';
  }
  if (draft.title.length > 80) errors.title = 'عنوان حداکثر ۸۰ حرف است.';
  if (draft.bio.length > 600) errors.bio = 'معرفی کوتاه حداکثر ۶۰۰ حرف است.';
  if (draft.serviceIds.length > 40) errors.serviceIds = 'حداکثر ۴۰ خدمت قابل انتخاب است.';

  return errors;
}

/** Payload for POST/PUT — sends normalized values, never the raw draft. */
export function draftToPayload(draft: OperatorDraft): OperatorCreateInput {
  const phone = normalizePhoneInput(draft.phone);
  return {
    displayName: normalizeDisplayName(draft.displayName),
    phone: phone ?? draft.phone.trim(),
    email: draft.email.trim() ? draft.email.trim().toLowerCase() : null,
    roleKey: draft.roleKey,
    title: draft.title.trim(),
    bio: draft.bio.trim() ? draft.bio.trim() : null,
    avatarColor: draft.avatarColor || DEFAULT_ACCENT,
    serviceIds: [...new Set(draft.serviceIds)],
    workdays: normalizeWorkdays(draft.workdays),
    shiftStart: draft.shiftStart,
    shiftEnd: draft.shiftEnd,
    commissionPercent: Math.round(draft.commissionPercent),
    monthlyTarget: Math.round(draft.monthlyTarget),
    active: draft.active,
  };
}

export function applyTemplate(
  draft: OperatorDraft,
  template: {
    roleKey: OperatorRoleKey;
    workdays: number[];
    shiftStart: string;
    shiftEnd: string;
    commissionPercent: number;
  },
): OperatorDraft {
  const role = findOperatorRole(template.roleKey) ?? operatorRoleOrDefault(template.roleKey);
  return {
    ...draft,
    roleKey: template.roleKey,
    title: role.defaultTitle,
    avatarColor: role.accent,
    workdays: [...template.workdays],
    shiftStart: template.shiftStart,
    shiftEnd: template.shiftEnd,
    commissionPercent: template.commissionPercent,
  };
}

/* ── Presentation helpers ────────────────────────────────────────────────── */

export function roleOptions(): Array<{
  key: OperatorRoleKey;
  label: string;
  icon: string;
  accent: string;
  hint: string;
  defaultTitle: string;
  accessRole: RoleKey;
}> {
  return OPERATOR_ROLE_CATALOG.map((role) => ({
    key: role.key,
    label: role.label,
    icon: role.icon,
    accent: role.accent,
    hint: role.hint,
    defaultTitle: role.defaultTitle,
    accessRole: role.accessRole,
  }));
}

export function workdayOptions(): Array<{ index: number; label: string; short: string }> {
  return WORKDAYS.map((day) => ({ index: day.index, label: day.label, short: day.short }));
}
