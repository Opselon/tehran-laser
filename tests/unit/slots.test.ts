import { describe, expect, it } from 'vitest';
import {
  canonicalSlotStart,
  conflictsWithOccupied,
  generateReference,
  occupiedSlotStarts,
  staffSlotKey,
} from '../../src/domain/booking/booking.slots';

const TZ = 'Asia/Tehran';

describe('slot grid', () => {
  it('canonicalises arbitrary instants onto the granularity grid', () => {
    // 10:17 local = 06:47Z → floor to 10:15 local = 06:45Z
    expect(canonicalSlotStart('2026-10-03T06:47:00.000Z', TZ, 15)).toBe(
      '2026-10-03T06:45:00.000Z',
    );
    expect(canonicalSlotStart('2026-10-03T06:45:00.000Z', TZ, 15)).toBe(
      '2026-10-03T06:45:00.000Z',
    );
  });

  it('claims every slot a booking occupies', () => {
    const slots = occupiedSlotStarts({
      startsAt: '2026-10-03T06:30:00.000Z', // 10:00
      durationMinutes: 45,
      bufferMinutes: 0,
      timezone: TZ,
      granularityMinutes: 15,
    });
    expect(slots).toEqual([
      '2026-10-03T06:30:00.000Z',
      '2026-10-03T06:45:00.000Z',
      '2026-10-03T07:00:00.000Z',
    ]);
  });

  it('extends claims through the buffer', () => {
    const slots = occupiedSlotStarts({
      startsAt: '2026-10-03T06:30:00.000Z',
      durationMinutes: 30,
      bufferMinutes: 15,
      timezone: TZ,
      granularityMinutes: 15,
    });
    expect(slots).toHaveLength(3);
  });

  it('detects conflicts against an occupied set', () => {
    const occupied = new Set(occupiedSlotStarts({
      startsAt: '2026-10-03T06:30:00.000Z',
      durationMinutes: 30,
      bufferMinutes: 0,
      timezone: TZ,
      granularityMinutes: 15,
    }));
    expect(
      conflictsWithOccupied(
        {
          startsAt: '2026-10-03T06:45:00.000Z',
          durationMinutes: 30,
          bufferMinutes: 0,
          timezone: TZ,
          granularityMinutes: 15,
        },
        occupied,
      ),
    ).toBe(true);
    expect(
      conflictsWithOccupied(
        {
          startsAt: '2026-10-03T07:00:00.000Z',
          durationMinutes: 30,
          bufferMinutes: 0,
          timezone: TZ,
          granularityMinutes: 15,
        },
        occupied,
      ),
    ).toBe(false);
  });

  it('keys slots per staff member and clinic-wide when unassigned', () => {
    expect(staffSlotKey(null)).toBe('clinic');
    expect(staffSlotKey('abc')).toBe('staff:abc');
  });
});

describe('generateReference', () => {
  it('produces collision-safe, human-friendly codes', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateReference()).toMatch(/^TL-[0-9A-HJKMNP-TV-Z]{6}$/);
    }
  });

  it('is deterministic for a given random sequence', () => {
    const makeRandom = (): (() => number) => {
      let call = 0;
      return () => {
        call += 1;
        return (call % 10) / 10;
      };
    };
    expect(generateReference(makeRandom())).toBe(generateReference(makeRandom()));
  });
});
