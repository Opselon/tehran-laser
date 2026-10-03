/** Typed settings keys — the single list the server, admin UI and validators share. */

export const PUBLIC_SETTING_KEYS = [
  'business_name',
  'business_name_en',
  'phone',
  'address',
  'timezone',
  'currency',
  'currency_label',
  'discount_percent',
  'booking_enabled',
  'slot_granularity_minutes',
  'booking_buffer_minutes',
  'min_lead_minutes',
  'max_advance_days',
  'telegram_enabled',
  'whatsapp_enabled',
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

export const PRIVATE_SETTING_KEYS = [
  'session_ttl_hours',
  'password_iterations',
  'rate_limit_login',
  'rate_limit_booking',
  'rate_limit_public_form',
] as const;

export type PrivateSettingKey = (typeof PRIVATE_SETTING_KEYS)[number];

export type SettingKey = PublicSettingKey | PrivateSettingKey;

/** Parsed, typed view of the numeric/boolean settings the engine consumes. */
export interface OperationalSettings {
  timezone: string;
  currency: string;
  currencyLabel: string;
  discountPercent: number;
  bookingEnabled: boolean;
  slotGranularityMinutes: number;
  bookingBufferMinutes: number;
  minLeadMinutes: number;
  maxAdvanceDays: number;
}

export function parseOperationalSettings(raw: Record<string, string>): OperationalSettings {
  const num = (key: string, fallback: number, min: number, max: number): number => {
    const parsed = Number.parseInt(raw[key] ?? '', 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  };
  return {
    timezone: raw['timezone'] ?? 'Asia/Tehran',
    currency: raw['currency'] ?? 'IRT',
    currencyLabel: raw['currency_label'] ?? 'تومان',
    discountPercent: num('discount_percent', 0, 0, 100),
    bookingEnabled: (raw['booking_enabled'] ?? 'false') === 'true',
    slotGranularityMinutes: num('slot_granularity_minutes', 15, 5, 120),
    bookingBufferMinutes: num('booking_buffer_minutes', 0, 0, 120),
    minLeadMinutes: num('min_lead_minutes', 0, 0, 60 * 24 * 30),
    maxAdvanceDays: num('max_advance_days', 90, 1, 365),
  };
}
