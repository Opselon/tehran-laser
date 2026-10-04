/** Shared types, constants and tiny helpers for the booking wizard island.
 *
 *  Kept separate from BookingWizard.tsx so every step component can import
 *  them without a circular runtime dependency.
 */
import type { PublicServiceDto, AvailabilitySlotDto } from '../../domain/api/dto.types';
import type { PricingCategory } from '../../domain/booking/booking.types';

export const TOTAL_STEPS = 4;

export interface StepMeta {
  num: number;
  title: string;
}

export const STEP_META: readonly StepMeta[] = [
  { num: 1, title: 'خدمات' },
  { num: 2, title: 'زمان' },
  { num: 3, title: 'مشخصات' },
  { num: 4, title: 'تأیید' },
];

/** Rolling booking horizon: how many days ahead the clinic accepts bookings. */
export const BOOKING_HORIZON_DAYS = 90;

export interface QuoteTotals {
  /** Sum of the selected services for the chosen category (هزار تومان). */
  base: number;
  /** Full-body 15% package discount. */
  discount: number;
  final: number;
  /** True when the chosen category has no configured price for a selection. */
  missingPrice: boolean;
}

export interface CustomerDraft {
  name: string;
  phone: string;
  email: string;
  note: string;
}

export type CustomerFieldKey = keyof CustomerDraft;
export type CustomerErrors = Partial<Record<CustomerFieldKey, string>>;

export interface BookingSuccessResult {
  bookingId: string;
  reference: string;
  status: string;
  startsAt: string;
  serviceName: string;
  pricingCategory: PricingCategory;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
}

/* ── Dates ─────────────────────────────────────────────────────── */

/** Local 'YYYY-MM-DD' (no UTC shifting — matches what the API expects). */
export function isoDayOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Weekday index for an ISO day, Persian week order: 0 = شنبه … 6 = جمعه. */
export function persianWeekIndex(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) return 0;
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (utcDay + 1) % 7;
}

export function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/* ── Phone ─────────────────────────────────────────────────────── */

/** Persian / Arabic-Indic digits → ASCII so users can type either. */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

/** Loose client-side check mirroring the server's phoneSchema. */
export function isValidPhone(value: string): boolean {
  const clean = toEnglishDigits(value).replace(/[\s\-().]/g, '');
  return /^(\+98|0098)?0?9\d{9}$/.test(clean);
}

/** Rewrite a valid number to the familiar 0912… form for display. */
export function toLocalPhone(value: string): string {
  const clean = toEnglishDigits(value).replace(/[\s\-().]/g, '');
  if (!isValidPhone(clean)) return clean;
  if (clean.startsWith('+98')) return `0${clean.slice(3)}`;
  if (clean.startsWith('0098')) return `0${clean.slice(4)}`;
  if (/^9\d{9}$/.test(clean)) return `0${clean}`;
  return clean;
}

/** Client-side name check matching the server nameSchema intent. */
export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  return /^[\p{L}\p{M}\s'‌-]+$/u.test(trimmed);
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true; // optional field
  return trimmed.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/* ── Presentation ──────────────────────────────────────────────── */

/** '۲٬۲۹۰ هزار تومان' — same wording the rest of the public site uses. */
export function moneyFa(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} هزار تومان`;
}

/** '۰۹:۳۰' — clinic timezone wall clock. */
export function timeFa(isoInstant: string): string {
  return new Date(isoInstant).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
  });
}

export type { PublicServiceDto, AvailabilitySlotDto };
