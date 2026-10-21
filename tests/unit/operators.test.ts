import { describe, expect, it } from 'vitest';
import {
  applyTemplate,
  averageTicket,
  buildInsights,
  canHardDelete,
  capacityMinutes,
  commissionAmount,
  completionRate,
  coverageSegments,
  deriveInitials,
  draftFromOperator,
  draftToPayload,
  emptyOperatorDraft,
  filterOperators,
  formatPhone,
  formatToman,
  hourlyCoverage,
  isOnShift,
  matchesOperatorQuery,
  nextOperatorCode,
  nextSortOrder,
  normalizeDisplayName,
  normalizePhoneInput,
  normalizeWorkdays,
  operatorStatusOf,
  shiftMinutes,
  sortOperators,
  summarizeOperators,
  utilizationPercent,
  validateOperatorDraft,
  validateShiftWindow,
  weeklyShiftMinutes,
  workdaysLabel,
} from '../../src/domain/operators/operators';
import { computeOperatorStats, rangeOfDays, topServices } from '../../src/domain/operators/stats';
import type { OperatorBookingRow } from '../../src/domain/operators/stats';
import type { OperatorDto } from '../../src/domain/operators/operators';
import {
  findOperatorRole,
  OPERATOR_ROLE_CATALOG,
  OPERATOR_TEMPLATES,
  findTemplate,
  workdayLabel,
  DEFAULT_WORKDAYS,
} from '../../src/domain/operators/catalog';
import {
  operatorCreateSchema,
  operatorListQuerySchema,
  operatorUpdateSchema,
} from '../../src/domain/validation/operators.schemas';

/** Build a full DTO with sensible defaults, so each test states only what it
 *  cares about. Keeps the suite readable when a new DTO field lands. */
function makeOperator(overrides: Partial<OperatorDto> = {}): OperatorDto {
  return {
    id: 'op_1',
    code: 'OP-01',
    displayName: 'سارا محمدی',
    phone: '+989121234567',
    email: null,
    roleKey: 'laser_technician',
    roleLabel: 'تکنسین لیزر',
    roleIcon: 'instant',
    title: 'اپراتور دستگاه لیزر',
    bio: null,
    initials: 'سم',
    avatarColor: '#d4af37',
    serviceIds: [],
    workdays: [0, 1, 2, 3, 4, 5],
    shiftStart: '09:00',
    shiftEnd: '20:00',
    commissionPercent: 10,
    monthlyTarget: 0,
    active: true,
    status: 'active',
    sortOrder: 10,
    account: null,
    stats: { sessions: 0, revenue: 0, upcoming: 0, utilization: 0 },
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    archivedAt: null,
    ...overrides,
  };
}

describe('operator identity', () => {
  it('derives two-grapheme initials and skips honorifics', () => {
    expect(deriveInitials('دکتر سارا محمدی')).toBe('سم');
    expect(deriveInitials('سارا')).toBe('سا');
    expect(deriveInitials('Dr. Sara Mohammadi')).toBe('SM');
    expect(deriveInitials('آقای رضا کریمی')).toBe('رک');
    expect(deriveInitials('   ')).toBe('؟');
  });

  it('normalizes whitespace and control characters but keeps ZWNJ', () => {
    expect(normalizeDisplayName('  سارا\t\n محمدی  ')).toBe('سارا محمدی');
    expect(normalizeDisplayName('سه‌شنبه')).toBe('سه‌شنبه');
    expect(normalizeDisplayName('x'.repeat(200))).toHaveLength(80);
  });

  it('canonicalises every Iranian phone shape to +98', () => {
    const expected = '+989121234567';
    for (const input of ['09121234567', '+989121234567', '00989121234567', '9121234567', '۰۹۱۲۱۲۳۴۵۶۷']) {
      expect(normalizePhoneInput(input)).toBe(expected);
    }
  });

  it('rejects impossible phone input instead of guessing', () => {
    expect(normalizePhoneInput('123')).toBeNull();
    expect(normalizePhoneInput('not-a-number')).toBeNull();
  });

  it('formats a canonical phone for display', () => {
    expect(formatPhone('+989121234567')).toBe('۰۹۱۲ ۱۲۳ ۴۵۶۷');
  });

  it('never reuses an operator code, even across gaps', () => {
    expect(nextOperatorCode([])).toBe('OP-01');
    expect(nextOperatorCode(['OP-01', 'OP-02'])).toBe('OP-03');
    expect(nextOperatorCode(['OP-01', 'OP-07'])).toBe('OP-08');
    // A hand-typed code outside the scheme must not shift the sequence.
    expect(nextOperatorCode(['OP-01', 'GUEST'])).toBe('OP-02');
  });
});

describe('shifts and workdays', () => {
  it('accepts a normal window and rejects inverted / zero / oversized ones', () => {
    expect(validateShiftWindow('09:00', '20:00')).toBe('ok');
    expect(validateShiftWindow('20:00', '09:00')).toBe('invalid_format');
    expect(validateShiftWindow('09:00', '09:00')).toBe('empty_window');
    expect(validateShiftWindow('09:00', '09:15')).toBe('too_short');
    expect(validateShiftWindow('06:00', '23:00')).toBe('too_long');
    expect(validateShiftWindow('24:00', '20:00')).toBe('invalid_format');
    expect(validateShiftWindow('09:60', '20:00')).toBe('invalid_format');
  });

  it('computes shift and weekly minutes', () => {
    const op = makeOperator({ shiftStart: '09:30', shiftEnd: '20:00', workdays: [0, 1, 2] });
    expect(shiftMinutes(op)).toBe(630);
    expect(weeklyShiftMinutes(op)).toBe(1890);
    expect(capacityMinutes(weeklyShiftMinutes(op), 7)).toBe(1890);
    expect(capacityMinutes(1890, 3)).toBe(810);
  });

  it('deduplicates, sorts and drops invalid workdays', () => {
    expect(normalizeWorkdays([3, 1, 3, 9, -1, 2.4])).toEqual([1, 2, 3]);
    expect(normalizeWorkdays([])).toEqual([]);
  });

  it('answers "on shift" only inside the window', () => {
    const op = makeOperator({ workdays: [1], shiftStart: '09:00', shiftEnd: '17:00' });
    expect(isOnShift(op, 1)).toBe(true);
    expect(isOnShift(op, 1, 540)).toBe(true); // 09:00
    expect(isOnShift(op, 1, 1020)).toBe(false); // 17:00 exclusive
    expect(isOnShift(op, 2, 600)).toBe(false);
  });

  it('compresses consecutive weekdays into ranges', () => {
    expect(workdaysLabel([])).toBe('بدون روز کاری');
    expect(workdaysLabel([0, 1, 2, 3, 4, 5, 6])).toBe('هر روز هفته');
    expect(workdaysLabel(DEFAULT_WORKDAYS)).toBe('شنبه تا پنجشنبه');
    expect(workdaysLabel([1, 3])).toBe('یکشنبه، سه‌شنبه');
    expect(workdaysLabel([0, 1])).toBe('شنبه و یکشنبه');
    expect(workdaysLabel([6])).toBe('جمعه');
  });

  it('has a label for every weekday index', () => {
    for (let day = 0; day <= 6; day += 1) {
      expect(workdayLabel(day)).not.toBe('—');
    }
  });
});

describe('coverage', () => {
  const roster = [
    makeOperator({ id: 'a', displayName: 'الف', workdays: [1], shiftStart: '09:00', shiftEnd: '13:00' }),
    makeOperator({ id: 'b', displayName: 'ب', workdays: [1], shiftStart: '11:00', shiftEnd: '17:00' }),
    makeOperator({ id: 'c', displayName: 'ج', workdays: [1], shiftStart: '15:00', shiftEnd: '20:00' }),
    makeOperator({ id: 'd', displayName: 'د', workdays: [2], shiftStart: '09:00', shiftEnd: '20:00' }),
    makeOperator({ id: 'e', displayName: 'ه', workdays: [1], shiftStart: '09:00', shiftEnd: '20:00', active: false }),
  ];

  it('merges overlapping windows into headcount segments', () => {
    const segments = coverageSegments(roster, 1);
    expect(segments).toEqual([
      { start: '09:00', end: '11:00', count: 1, operators: ['الف'] },
      { start: '11:00', end: '13:00', count: 2, operators: ['الف', 'ب'] },
      { start: '13:00', end: '15:00', count: 1, operators: ['ب'] },
      { start: '15:00', end: '17:00', count: 2, operators: ['ب', 'ج'] },
      { start: '17:00', end: '20:00', count: 1, operators: ['ج'] },
    ]);
  });

  it('ignores inactive operators and other weekdays', () => {
    expect(coverageSegments(roster, 2)).toEqual([
      { start: '09:00', end: '20:00', count: 1, operators: ['د'] },
    ]);
    expect(coverageSegments([], 1)).toEqual([]);
  });

  it('builds 24 hourly slots for the heat strip', () => {
    const slots = hourlyCoverage(roster, 1);
    expect(slots).toHaveLength(24);
    expect(slots[8]).toBe(0); // 08:00–09:00
    expect(slots[9]).toBe(1); // 09:00–10:00
    expect(slots[11]).toBe(2); // 11:00–12:00
    expect(slots[19]).toBe(1); // 19:00–20:00
    expect(slots[21]).toBe(0);
  });
});

describe('roster shaping', () => {
  const roster = [
    makeOperator({ id: 'a', displayName: 'بهنام', sortOrder: 20, stats: { sessions: 5, revenue: 500, upcoming: 1, utilization: 40 } }),
    makeOperator({ id: 'b', displayName: 'آرش', sortOrder: 10, stats: { sessions: 9, revenue: 900, upcoming: 0, utilization: 80 } }),
    makeOperator({ id: 'c', displayName: 'سارا', sortOrder: 30, archivedAt: '2026-10-10T00:00:00.000Z', active: false }),
    makeOperator({ id: 'd', displayName: 'مینا', active: false, status: 'inactive' }),
  ];

  it('derives status from flags, never from a stored label', () => {
    expect(operatorStatusOf(roster[0]!)).toBe('active');
    expect(operatorStatusOf(roster[2]!)).toBe('archived');
    expect(operatorStatusOf(roster[3]!)).toBe('inactive');
  });

  it('filters by status, role, service and weekday together', () => {
    expect(filterOperators(roster, { status: 'active' }).map((o) => o.id)).toEqual(['a', 'b']);
    expect(filterOperators(roster, { status: 'archived' }).map((o) => o.id)).toEqual(['c']);
    expect(filterOperators(roster, { role: 'laser_technician' })).toHaveLength(4);
    expect(filterOperators(roster, { serviceId: 'svc_x' })).toHaveLength(0);
    expect(filterOperators([makeOperator({ serviceIds: ['svc_x'] })], { serviceId: 'svc_x' })).toHaveLength(1);
  });

  it('searches name, code, phone and ASCII/Persian digits alike', () => {
    const op = makeOperator({ displayName: 'سارا محمدی', code: 'OP-07', phone: '+989121234567' });
    expect(matchesOperatorQuery(op, 'سارا')).toBe(true);
    expect(matchesOperatorQuery(op, 'op-07')).toBe(true);
    expect(matchesOperatorQuery(op, '0912')).toBe(true);
    expect(matchesOperatorQuery(op, '۰۹۱۲')).toBe(true);
    expect(matchesOperatorQuery(op, 'رضا')).toBe(false);
  });

  it('sorts by the requested metric with a stable tiebreak', () => {
    // b and d share the default sortOrder 10, so the Persian name breaks the tie.
    expect(sortOperators(roster, 'order').map((o) => o.id)).toEqual(['b', 'd', 'a', 'c']);
    expect(sortOperators(roster, 'sessions').map((o) => o.id).slice(0, 2)).toEqual(['b', 'a']);
    expect(sortOperators(roster, 'revenue').map((o) => o.id).slice(0, 2)).toEqual(['b', 'a']);
    expect(sortOperators(roster, 'utilization').map((o) => o.id).slice(0, 2)).toEqual(['b', 'a']);
  });

  it('summarizes the roster without double counting', () => {
    const meta = summarizeOperators(roster, 1);
    expect(meta.total).toBe(4);
    expect(meta.active).toBe(2);
    expect(meta.archived).toBe(1);
    expect(meta.onShiftToday).toBe(2);
    expect(meta.linkedAccounts).toBe(0);
    expect(meta.roles.laser_technician).toBe(4);
  });

  it('appends new operators at the end of the manual order', () => {
    expect(nextSortOrder([])).toBe(10);
    expect(nextSortOrder([{ sortOrder: 10 }, { sortOrder: 40 }])).toBe(50);
  });

  it('only allows hard delete for a never-used profile', () => {
    expect(canHardDelete({ sessions: 0, revenue: 0, upcoming: 0, utilization: 0 })).toBe(true);
    expect(canHardDelete({ sessions: 1, revenue: 0, upcoming: 0, utilization: 0 })).toBe(false);
    expect(canHardDelete({ sessions: 0, revenue: 0, upcoming: 1, utilization: 0 })).toBe(false);
  });
});

describe('metrics', () => {
  it('computes utilization, commission, average ticket and completion rate', () => {
    expect(utilizationPercent(300, 600)).toBe(50);
    expect(utilizationPercent(900, 600)).toBe(100);
    expect(utilizationPercent(10, 0)).toBe(0);
    expect(commissionAmount(1_000_000, 15)).toBe(150_000);
    expect(commissionAmount(1_000_000, 0)).toBe(0);
    expect(commissionAmount(1_000_000, 140)).toBe(1_000_000);
    expect(averageTicket(1000, 4)).toBe(250);
    expect(averageTicket(1000, 0)).toBe(0);
    expect(completionRate(8, 1, 1)).toBe(80);
    expect(completionRate(0, 0, 0)).toBe(0);
  });

  it('formats money compactly with an explicit unit', () => {
    expect(formatToman(0)).toBe('۰ تومان');
    expect(formatToman(1_500_000)).toContain('میلیون تومان');
    expect(formatToman(2_500_000_000)).toContain('میلیارد تومان');
  });
});

describe('performance stats', () => {
  const rows: OperatorBookingRow[] = [
    { id: '1', startsAt: '2026-10-10T06:00:00.000Z', endsAt: '2026-10-10T06:30:00.000Z', status: 'completed', quotedAmount: 1000, discountAmount: 100, serviceId: 's1', serviceName: 'لیزر', customerId: 'c1' },
    { id: '2', startsAt: '2026-10-11T06:00:00.000Z', endsAt: '2026-10-11T07:00:00.000Z', status: 'completed', quotedAmount: 2000, discountAmount: 0, serviceId: 's1', serviceName: 'لیزر', customerId: 'c2' },
    { id: '3', startsAt: '2026-10-12T06:00:00.000Z', endsAt: '2026-10-12T07:00:00.000Z', status: 'confirmed', quotedAmount: 3000, discountAmount: 0, serviceId: 's2', serviceName: 'پکیج', customerId: 'c3' },
    { id: '4', startsAt: '2026-10-12T08:00:00.000Z', endsAt: '2026-10-12T08:30:00.000Z', status: 'cancelled', quotedAmount: 500, discountAmount: 0, serviceId: 's2', serviceName: 'پکیج', customerId: 'c4' },
    { id: '5', startsAt: '2026-10-13T08:00:00.000Z', endsAt: '2026-10-13T08:30:00.000Z', status: 'no_show', quotedAmount: 500, discountAmount: 0, serviceId: 's2', serviceName: 'پکیج', customerId: 'c5' },
    { id: '6', startsAt: '2026-11-20T08:00:00.000Z', endsAt: '2026-11-20T08:30:00.000Z', status: 'pending', quotedAmount: 800, discountAmount: 0, serviceId: 's1', serviceName: 'لیزر', customerId: 'c6' },
  ];

  const operator = makeOperator({ id: 'op_1', workdays: [0, 1, 2, 3, 4, 5, 6], shiftStart: '09:00', shiftEnd: '17:00' });

  it('counts completed revenue net of discount only', () => {
    const stats = computeOperatorStats({
      operator,
      rows,
      range: { from: '2026-10-10', to: '2026-10-16', days: 7 },
      timezone: 'Asia/Tehran',
      nowIso: '2026-10-15T00:00:00.000Z',
      ranking: [{ operatorId: 'op_1', revenue: 2900 }],
    });
    expect(stats.totals.sessions).toBe(2);
    expect(stats.totals.revenue).toBe(2900);
    expect(stats.totals.averageTicket).toBe(1450);
    expect(stats.totals.upcoming).toBe(1); // only #6 is in the future
    expect(stats.totals.cancelled).toBe(1);
    expect(stats.totals.noShow).toBe(1);
    expect(stats.totals.completionRate).toBe(50);
    expect(stats.totals.uniqueClients).toBe(2);
    // Completed 30 + 60 and confirmed 60 = 150 occupied minutes against 8h × 7d.
    expect(stats.totals.bookedMinutes).toBe(150);
    expect(stats.totals.capacityMinutes).toBe(3360);
    expect(stats.totals.commission).toBe(290); // 10 %
  });

  it('zero-fills every day of the range so the chart has no gaps', () => {
    const stats = computeOperatorStats({
      operator,
      rows,
      range: { from: '2026-10-10', to: '2026-10-16', days: 7 },
      timezone: 'Asia/Tehran',
      nowIso: '2026-10-15T00:00:00.000Z',
      ranking: [],
    });
    expect(stats.daily).toHaveLength(7);
    expect(stats.daily[0]).toEqual({ date: '2026-10-10', sessions: 1, revenue: 900, minutes: 30 });
    expect(stats.daily[6]).toEqual({ date: '2026-10-16', sessions: 0, revenue: 0, minutes: 0 });
  });

  it('ranks by completed revenue and never hides a newcomer', () => {
    const stats = computeOperatorStats({
      operator,
      rows,
      range: { from: '2026-10-10', to: '2026-10-16', days: 7 },
      timezone: 'Asia/Tehran',
      nowIso: '2026-10-15T00:00:00.000Z',
      ranking: [
        { operatorId: 'other', revenue: 9900 },
        { operatorId: 'op_1', revenue: 2900 },
      ],
    });
    expect(stats.ranking).toEqual({ position: 2, total: 2, revenue: 2900 });
  });

  it('ranks top services by completed sessions with share', () => {
    const services = topServices(rows);
    expect(services[0]).toMatchObject({ serviceId: 's1', sessions: 2, revenue: 2900, share: 100 });
    expect(services).toHaveLength(1); // confirmed sessions do not count as delivered
  });

  it('derives a last-N-days range ending today in clinic time', () => {
    const range = rangeOfDays(7, 'Asia/Tehran', new Date('2026-10-20T20:00:00.000Z'));
    expect(range.days).toBe(7);
    expect(range.to).toBe('2026-10-20');
    expect(range.from).toBe('2026-10-14');
    expect(rangeOfDays(0, 'Asia/Tehran').days).toBe(1);
    expect(rangeOfDays(900, 'Asia/Tehran').days).toBe(365);
  });

  it('explains an empty or unhealthy profile in the operator’s language', () => {
    const insights = buildInsights(
      { active: true, archivedAt: null, account: null, workdays: [], serviceIds: [], commissionPercent: 10 },
      { totals: { sessions: 0 } as never },
    );
    expect(insights.some((i) => i.text.includes('حساب ورود ندارد'))).toBe(true);
    expect(insights.some((i) => i.text.includes('روز کاری'))).toBe(true);
    expect(insights.length).toBeLessThanOrEqual(4);
  });
});

describe('draft → payload contract', () => {
  it('starts a new operator on the clinic default shift', () => {
    const draft = emptyOperatorDraft();
    expect(draft.roleKey).toBe('laser_technician');
    expect(draft.shiftStart).toBe('09:00');
    expect(draft.shiftEnd).toBe('20:00');
    expect(draft.workdays).toEqual([...DEFAULT_WORKDAYS]);
    expect(findOperatorRole(draft.roleKey)).not.toBeNull();
  });

  it('round-trips a DTO into a draft and back into a normalized payload', () => {
    const operator = makeOperator({ email: 'SARA@Example.COM', serviceIds: ['s1', 's1'], workdays: [2, 1] });
    const draft = draftFromOperator(operator);
    const payload = draftToPayload(draft);
    expect(payload.email).toBe('sara@example.com');
    expect(payload.serviceIds).toEqual(['s1']);
    expect(payload.workdays).toEqual([1, 2]);
    expect(payload.phone).toBe('+989121234567');
  });

  it('reports every invalid field in one pass instead of failing fast', () => {
    const draft = { ...emptyOperatorDraft(), displayName: 'x', phone: '123', email: 'nope', workdays: [], shiftStart: '20:00', shiftEnd: '09:00', commissionPercent: 120 };
    const errors = validateOperatorDraft(draft);
    expect(Object.keys(errors).sort()).toEqual(
      ['commissionPercent', 'displayName', 'email', 'phone', 'shift', 'workdays'].sort(),
    );
  });

  it('applies a template without touching the identity fields already typed', () => {
    const draft = { ...emptyOperatorDraft(), displayName: 'مینا رضایی' };
    const template = findTemplate('doctor');
    expect(template).not.toBeNull();
    const applied = applyTemplate(draft, template!);
    expect(applied.displayName).toBe('مینا رضایی');
    expect(applied.roleKey).toBe('doctor');
    expect(applied.commissionPercent).toBe(25);
    expect(applied.title).toBe(findOperatorRole('doctor')!.defaultTitle);
  });

  it('keeps every template pointing at a real catalog role', () => {
    for (const template of OPERATOR_TEMPLATES) {
      expect(findOperatorRole(template.roleKey)).not.toBeNull();
      expect(template.shiftStart < template.shiftEnd).toBe(true);
    }
    expect(OPERATOR_ROLE_CATALOG.length).toBeGreaterThanOrEqual(6);
  });
});

describe('operator zod schemas', () => {
  it('accepts a minimal operator and fills the optional fields', () => {
    const parsed = operatorCreateSchema.parse({
      displayName: '  سارا   محمدی ',
      phone: '09121234567',
      roleKey: 'laser_technician',
    });
    expect(parsed.displayName).toBe('سارا محمدی');
    expect(parsed.phone).toBe('+989121234567');
    expect(parsed.workdays).toBeUndefined();
  });

  it('refuses unknown keys instead of silently dropping them', () => {
    const result = operatorCreateSchema.safeParse({
      displayName: 'سارا محمدی',
      phone: '09121234567',
      roleKey: 'doctor',
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it('refuses a shift whose end is before its start', () => {
    const result = operatorCreateSchema.safeParse({
      displayName: 'سارا محمدی',
      phone: '09121234567',
      roleKey: 'doctor',
      shiftStart: '20:00',
      shiftEnd: '09:00',
    });
    expect(result.success).toBe(false);
  });

  it('accepts an empty workday list only at the partial-update layer', () => {
    expect(operatorUpdateSchema.safeParse({ workdays: [] }).success).toBe(true);
    expect(operatorCreateSchema.safeParse({ workdays: [] }).success).toBe(false);
  });

  it('parses roster query strings, including Persian weekday digits', () => {
    const parsed = operatorListQuerySchema.parse({ weekday: '2', status: 'active', sort: 'revenue' });
    expect(parsed).toMatchObject({ weekday: 2, status: 'active', sort: 'revenue' });
    expect(operatorListQuerySchema.safeParse({ weekday: '9' }).success).toBe(false);
    expect(operatorListQuerySchema.safeParse({ sort: 'nope' }).success).toBe(false);
  });
});
