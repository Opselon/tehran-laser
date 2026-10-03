import { describe, expect, it } from 'vitest';
import {
  calculateAvailability,
  effectiveDay,
  validateSlotStart,
  type AvailabilityInput,
} from '../../src/domain/schedule/availability';
import { occupiedSlotStarts } from '../../src/domain/booking/booking.slots';

const TZ = 'Asia/Tehran';
const SATURDAY = '2026-10-03'; // 2026-10-03 is a Saturday (weekday 0)

const hours = [
  {
    weekday: 0,
    segments: [
      { opensAt: '09:00', closesAt: '13:00' },
      { opensAt: '14:00', closesAt: '20:00' },
    ],
  },
];

function base(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    localDate: SATURDAY,
    timezone: TZ,
    hours,
    exceptions: [],
    durationMinutes: 30,
    granularityMinutes: 15,
    bufferMinutes: 0,
    occupiedSlots: new Set<string>(),
    nowIso: '2026-10-01T00:00:00.000Z',
    minLeadMinutes: 0,
    ...overrides,
  };
}

const startTimes = (input: AvailabilityInput): string[] =>
  calculateAvailability(input).map((slot) => slot.startsAt);

describe('calculateAvailability — working hours', () => {
  it('generates slots across both open segments only', () => {
    const slots = calculateAvailability(base());
    // 09:00–12:30 step 15 = 15 slots; 14:00–19:30 step 15 = 23 slots
    expect(slots).toHaveLength(38);
    expect(slots.every((slot) => slot.available)).toBe(true);
    expect(slots[0]?.startsAt).toBe('2026-10-03T05:30:00.000Z'); // 09:00 Tehran
    expect(slots.at(-1)?.startsAt).toBe('2026-10-03T16:00:00.000Z'); // 19:30 Tehran
  });

  it('never offers slots inside the lunch break (13:00–14:00)', () => {
    const times = startTimes(base());
    expect(times).toContain('2026-10-03T09:00:00.000Z'); // 12:30 — last start that fits before 13:00
    expect(times).not.toContain('2026-10-03T09:15:00.000Z'); // 12:45 would run into the break
    expect(times).not.toContain('2026-10-03T10:00:00.000Z'); // 13:30 break
    expect(times).toContain('2026-10-03T10:30:00.000Z'); // 14:00 — first afternoon start
  });

  it('returns nothing on a weekday with no open hours (Friday)', () => {
    expect(calculateAvailability(base({ localDate: '2026-10-09' }))).toHaveLength(0);
  });

  it('respects duration: a service must fit completely before closing', () => {
    expect(calculateAvailability(base({ durationMinutes: 60 })).length).toBeGreaterThan(0);
    const longDay = calculateAvailability(
      base({
        hours: [{ weekday: 0, segments: [{ opensAt: '09:00', closesAt: '10:00' }] }],
        durationMinutes: 75,
      }),
    );
    expect(longDay).toHaveLength(0);
  });
});

describe('calculateAvailability — exceptions', () => {
  it('closes on holiday and closed days', () => {
    for (const kind of ['holiday', 'closed'] as const) {
      expect(
        calculateAvailability(base({ exceptions: [{ date: SATURDAY, kind, opensAt: null, closesAt: null }] })),
      ).toHaveLength(0);
    }
  });

  it('replaces regular hours on special_hours', () => {
    const slots = calculateAvailability(
      base({
        exceptions: [
          { date: SATURDAY, kind: 'special_hours', opensAt: '10:00', closesAt: '12:00' },
        ],
      }),
    );
    // 10:00 → 11:30 step 15 (each 30-min service fits before 12:00)
    expect(slots).toHaveLength(7);
    expect(slots[0]?.startsAt).toBe('2026-10-03T06:30:00.000Z'); // 10:00
    expect(slots.at(-1)?.startsAt).toBe('2026-10-03T08:00:00.000Z'); // 11:30
  });

  it('subtracts blocked_time ranges', () => {
    const times = startTimes(
      base({
        exceptions: [
          { date: SATURDAY, kind: 'blocked_time', opensAt: '11:00', closesAt: '12:00' },
        ],
      }),
    );
    expect(times).toContain('2026-10-03T07:00:00.000Z'); // 10:30
    expect(times).not.toContain('2026-10-03T07:30:00.000Z'); // 11:00 blocked
    expect(times).not.toContain('2026-10-03T08:00:00.000Z'); // 11:30 blocked
    expect(times).toContain('2026-10-03T08:30:00.000Z'); // 12:00 free again
  });

  it('ignores exceptions belonging to other dates', () => {
    const slots = calculateAvailability(
      base({ exceptions: [{ date: '2026-10-04', kind: 'closed', opensAt: null, closesAt: null }] }),
    );
    expect(slots).toHaveLength(38);
  });
});

describe('calculateAvailability — occupancy, buffer, lead time', () => {
  /** Build the occupied set exactly like the booking writer does. */
  const booked = (startsAt: string, bufferMinutes = 0): Set<string> =>
    new Set(
      occupiedSlotStarts({
        startsAt,
        durationMinutes: 30,
        bufferMinutes,
        timezone: TZ,
        granularityMinutes: 15,
      }),
    );

  it('removes starts that collide with occupied slots', () => {
    const times = startTimes(base({ occupiedSlots: booked('2026-10-03T06:30:00.000Z') })); // 10:00
    expect(times).not.toContain('2026-10-03T06:30:00.000Z'); // 10:00 taken
    expect(times).not.toContain('2026-10-03T06:45:00.000Z'); // 10:15 overlaps 10:00–10:30
    expect(times).toContain('2026-10-03T07:00:00.000Z'); // 10:30 free
  });

  it('applies buffer minutes after a booking', () => {
    const times = startTimes(
      base({ bufferMinutes: 15, occupiedSlots: booked('2026-10-03T06:30:00.000Z', 15) }),
    );
    expect(times).not.toContain('2026-10-03T07:00:00.000Z'); // 10:30 still buffered
    expect(times).toContain('2026-10-03T07:15:00.000Z'); // 10:45 free
  });

  it('enforces minimum lead time', () => {
    // now = 2026-10-03T06:30Z (10:00 local), lead 60 min → nothing before 11:00
    const times = startTimes(base({ nowIso: '2026-10-03T06:30:00.000Z', minLeadMinutes: 60 }));
    expect(times).toContain('2026-10-03T07:30:00.000Z'); // 11:00
    expect(times).not.toContain('2026-10-03T07:15:00.000Z'); // 10:45 too soon
    expect(times.every((time) => Date.parse(time) >= Date.parse('2026-10-03T07:30:00.000Z'))).toBe(true);
  });
});

describe('effectiveDay', () => {
  it('treats a closed day as no segments even if regular hours exist', () => {
    const day = effectiveDay({
      localDate: SATURDAY,
      timezone: TZ,
      hours,
      exceptions: [{ date: SATURDAY, kind: 'closed', opensAt: null, closesAt: null }],
    });
    expect(day.segments).toHaveLength(0);
  });
});

describe('validateSlotStart', () => {
  it('accepts a real available start', () => {
    expect(validateSlotStart(base(), '2026-10-03T06:30:00.000Z')).toEqual({ ok: true });
  });

  it('rejects a start inside the break', () => {
    expect(validateSlotStart(base(), '2026-10-03T10:00:00.000Z')).toEqual({
      ok: false,
      reason: 'outside_hours',
    });
  });

  it('rejects off-grid starts', () => {
    expect(validateSlotStart(base(), '2026-10-03T06:47:00.000Z')).toEqual({
      ok: false,
      reason: 'outside_hours',
    });
  });

  it('rejects occupied starts', () => {
    const occupied = new Set(
      occupiedSlotStarts({
        startsAt: '2026-10-03T06:30:00.000Z',
        durationMinutes: 30,
        bufferMinutes: 0,
        timezone: TZ,
        granularityMinutes: 15,
      }),
    );
    expect(validateSlotStart(base({ occupiedSlots: occupied }), '2026-10-03T06:45:00.000Z')).toEqual({
      ok: false,
      reason: 'occupied',
    });
  });

  it('rejects past and too-soon starts', () => {
    const now = '2026-10-03T07:30:00.000Z';
    expect(validateSlotStart(base({ nowIso: now }), '2026-10-03T06:30:00.000Z')).toEqual({
      ok: false,
      reason: 'past',
    });
    expect(
      validateSlotStart(base({ nowIso: now, minLeadMinutes: 120 }), '2026-10-03T08:30:00.000Z'),
    ).toEqual({ ok: false, reason: 'too_soon' });
  });

  it('rejects starts on a closed day', () => {
    expect(validateSlotStart(base({ localDate: '2026-10-09' }), '2026-10-09T05:30:00.000Z')).toEqual({
      ok: false,
      reason: 'outside_hours',
    });
  });
});
