import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMinutes,
  localDateOf,
  minutesBetween,
  overlaps,
  weekdayOf,
  zonedTimeToUtc,
} from '../../src/lib/datetime/timezone';
import {
  formatJalaliDate,
  formatMoney,
  toEnglishDigits,
  toPersianDigits,
} from '../../src/lib/datetime/jalali';

const TZ = 'Asia/Tehran'; // UTC+3:30, no DST

describe('timezone math', () => {
  it('converts Tehran wall time to UTC', () => {
    expect(zonedTimeToUtc('2026-10-03', '09:00', TZ)).toBe('2026-10-03T05:30:00.000Z');
    expect(zonedTimeToUtc('2026-10-03', '00:00', TZ)).toBe('2026-10-02T20:30:00.000Z');
  });

  it('rolls the local date across midnight', () => {
    expect(localDateOf('2026-10-03T20:45:00.000Z', TZ)).toBe('2026-10-04');
    expect(localDateOf('2026-10-03T20:15:00.000Z', TZ)).toBe('2026-10-03');
  });

  it('maps the Iranian week (0 = Saturday … 6 = Friday)', () => {
    expect(weekdayOf('2026-10-03')).toBe(0); // Saturday
    expect(weekdayOf('2026-10-08')).toBe(5); // Thursday
    expect(weekdayOf('2026-10-09')).toBe(6); // Friday
  });

  it('does calendar arithmetic without DST drift', () => {
    expect(addDays('2026-10-03', 7)).toBe('2026-10-10');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addMinutes('2026-10-03T05:30:00.000Z', 90)).toBe('2026-10-03T07:00:00.000Z');
    expect(minutesBetween('2026-10-03T05:30:00.000Z', '2026-10-03T06:30:00.000Z')).toBe(60);
  });

  it('detects interval overlap', () => {
    expect(
      overlaps('2026-10-03T10:00:00Z', '2026-10-03T11:00:00Z', '2026-10-03T10:30:00Z', '2026-10-03T11:30:00Z'),
    ).toBe(true);
    expect(
      overlaps('2026-10-03T10:00:00Z', '2026-10-03T11:00:00Z', '2026-10-03T11:00:00Z', '2026-10-03T12:00:00Z'),
    ).toBe(false);
    expect(
      overlaps('2026-10-03T10:00:00Z', '2026-10-03T11:00:00Z', '2026-10-03T09:00:00Z', '2026-10-03T10:00:00Z'),
    ).toBe(false);
  });
});

describe('Persian presentation', () => {
  it('formats Jalali dates', () => {
    expect(formatJalaliDate('2026-10-03')).toBe('۱۴۰۵/۰۷/۱۱');
    expect(formatJalaliDate('2026-03-21')).toBe('۱۴۰۵/۰۱/۰۱');
  });

  it('converts digits both ways', () => {
    expect(toPersianDigits('S1 2')).toBe('S۱ ۲');
    expect(toEnglishDigits('۱۴۰۵')).toBe('1405');
    expect(toEnglishDigits('٠١٢')).toBe('012');
  });

  it('formats money with Persian grouping', () => {
    expect(formatMoney(2290, 'تومان')).toBe('۲٬۲۹۰ تومان');
    expect(formatMoney(320, '')).toBe('۳۲۰');
  });
});
