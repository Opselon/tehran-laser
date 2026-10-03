/** Persian (Jalali) presentation helpers. Canonical data stays ISO/Gregorian —
 *  these are used only at presentation boundaries (src/lib/datetime/timezone.ts rule). */

import { toJalaali } from 'jalaali-js';
import { localDateOf, wallClockOf } from './timezone';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/** Gregorian 'YYYY-MM-DD' (or ISO string) → Jalali parts. */
export function toJalali(localDate: string): JalaliDate {
  if (!localDate) return { jy: 1405, jm: 1, jd: 1 };
  const clean = localDate.includes('T') ? localDate.slice(0, 10) : localDate.slice(0, 10);
  const parts = clean.split('-');
  const y = Number(parts[0]) || 2026;
  const m = Number(parts[1]) || 1;
  const d = Number(parts[2]) || 1;
  return toJalaali(y, m, d);
}

/** ISO instant → Jalali parts in the clinic timezone. */
export function jalaliOfInstant(instantIso: string, timeZone: string): JalaliDate {
  return toJalali(localDateOf(instantIso, timeZone));
}

/** 'YYYY-MM-DD' or ISO instant → '۱۴۰۵/۰۷/۱۲' */
export function formatJalaliDate(localDate: string): string {
  if (!localDate) return '-';
  const { jy, jm, jd } = toJalali(localDate);
  return toPersianDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`);
}

/** ISO instant → '۱۴۰۵/۰۷/۱۲' in the clinic timezone. */
export function formatJalaliOfInstant(instantIso: string, timeZone: string): string {
  return formatJalaliDate(localDateOf(instantIso, timeZone));
}

/** 'YYYY-MM-DD' → '۱۲ مهر ۱۴۰۵' */
export function formatJalaliDateLong(localDate: string): string {
  const { jy, jm, jd } = toJalali(localDate);
  const monthName = PERSIAN_MONTHS[jm - 1] ?? '';
  return toPersianDigits(`${jd} ${monthName} ${jy}`);
}

/** Persian weekday name for a Gregorian 'YYYY-MM-DD' (uses lib weekday rule). */
export function persianWeekday(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const iranianWeekday = (utcDay + 1) % 7;
  return PERSIAN_WEEKDAYS[iranianWeekday] ?? '';
}

/** 'HH:MM' → '۰۹:۳۰' */
export function formatTimeFa(timeOfDay: string): string {
  return toPersianDigits(timeOfDay);
}

/** Money: 2290 + 'تومان' → '۲٬۲۹۰ تومان' (Latin grouping, Persian digits). */
export function formatMoney(amount: number, currencyLabel: string): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const label = currencyLabel.trim();
  return label ? `${toPersianDigits(grouped)} ${label}` : toPersianDigits(grouped);
}

/** ISO instant → clinic-local 'HH:MM' (Persian digits). */
export function formatInstantTimeFa(instantIso: string, timeZone: string): string {
  const wall = wallClockOf(instantIso, timeZone);
  return toPersianDigits(`${String(wall.hour).padStart(2, '0')}:${String(wall.minute).padStart(2, '0')}`);
}
