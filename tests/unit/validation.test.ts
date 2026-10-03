import { describe, expect, it } from 'vitest';
import { phoneSchema, slugSchema, localDateSchema } from '../../src/domain/validation/schemas';
import { parseOperationalSettings } from '../../src/domain/settings/settings.types';

describe('phone normalization', () => {
  const cases: [string, string][] = [
    ['09121234567', '+989121234567'],
    ['+989121234567', '+989121234567'],
    ['+98 912 123 4567', '+989121234567'],
    ['00989121234567', '+989121234567'],
    ['9121234567', '+989121234567'],
    ['989121234567', '+989121234567'],
    ['0903 555 5090', '+989035555090'],
    ['+98 903 555 5090', '+989035555090'],
  ];

  it.each(cases)('normalizes %s to %s', (input, expected) => {
    expect(phoneSchema.parse(input)).toBe(expected);
  });

  it('rejects non-numeric junk', () => {
    expect(phoneSchema.safeParse('call-me').success).toBe(false);
    expect(phoneSchema.safeParse('123').success).toBe(false);
  });
});

describe('slug validation', () => {
  it('accepts kebab-case latin slugs', () => {
    expect(slugSchema.safeParse('full-body').success).toBe(true);
    expect(slugSchema.safeParse('upper-lip').success).toBe(true);
  });

  it('rejects Persian or spaced slugs', () => {
    expect(slugSchema.safeParse('صورت').success).toBe(false);
    expect(slugSchema.safeParse('full body').success).toBe(false);
    expect(slugSchema.safeParse('Full-Body').success).toBe(false);
  });
});

describe('local date validation', () => {
  it('accepts real dates only', () => {
    expect(localDateSchema.safeParse('2026-10-03').success).toBe(true);
    expect(localDateSchema.safeParse('2026-02-30').success).toBe(false);
    expect(localDateSchema.safeParse('2026-10-3').success).toBe(false);
  });
});

describe('parseOperationalSettings', () => {
  it('parses and clamps persisted values', () => {
    const parsed = parseOperationalSettings({
      timezone: 'Asia/Tehran',
      currency: 'IRT',
      currency_label: 'تومان',
      discount_percent: '15',
      booking_enabled: 'true',
      slot_granularity_minutes: '20',
      booking_buffer_minutes: '10',
      min_lead_minutes: '30',
      max_advance_days: '90',
    });
    expect(parsed.discountPercent).toBe(15);
    expect(parsed.bookingEnabled).toBe(true);
    expect(parsed.slotGranularityMinutes).toBe(20);
    expect(parsed.maxAdvanceDays).toBe(90);
  });

  it('falls back to safe defaults for garbage', () => {
    const parsed = parseOperationalSettings({ discount_percent: 'abc', booking_enabled: 'yes' });
    expect(parsed.discountPercent).toBe(0);
    expect(parsed.bookingEnabled).toBe(false);
    expect(parsed.timezone).toBe('Asia/Tehran');
  });
});
