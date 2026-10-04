/** Typed settings keys — the single list the server, admin UI and validators share.
 *
 *  SECURITY INVARIANT (§56): `scope` is derived from this registry, never from the
 *  request body. Only keys in PUBLIC_SETTING_KEYS may ever be readable by an
 *  unauthenticated caller via GET /api/v1/settings/public; credentials and cost
 *  factors live in PRIVATE_SETTING_KEYS. Unknown keys are rejected outright, so a
 *  typo or a probe can never create a new row — least of all a 'public' one.
 */

export const PUBLIC_SETTING_KEYS = [
  'business_name',
  'business_name_en',
  'phone',
  'support_phone',
  'address',
  'note',
  'timezone',
  'currency',
  'currency_label',
  'discount_percent',
  'site_discount_percent',
  'booking_enabled',
  'slot_granularity_minutes',
  'booking_buffer_minutes',
  'min_lead_minutes',
  'max_advance_days',
  'telegram_enabled',
  'whatsapp_enabled',
  // Outbound channel routing/identity (the non-secret halves of the integration).
  'sms_provider',
  'sms_sender_number',
  'sms_booking_confirm_enabled',
  'sms_reminder_24h_enabled',
  'sms_birthday_enabled',
  'sms_next_session_enabled',
  // Instagram promo surface — rendered on the public site.
  'instagram_username',
  'instagram_bio_link',
  'instagram_promo_code',
  'instagram_latest_reel_url',
  'instagram_follower_discount_percent',
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

export const PRIVATE_SETTING_KEYS = [
  'session_ttl_hours',
  'password_iterations',
  'rate_limit_login',
  'rate_limit_booking',
  'rate_limit_public_form',
  // Credentials: never public, never returned by the public settings endpoint.
  'sms_api_key',
  'telegram_bot_token',
  'telegram_chat_id',
  'whatsapp_api_key',
  'whatsapp_api_url',
] as const;

export type PrivateSettingKey = (typeof PRIVATE_SETTING_KEYS)[number];

export type SettingKey = PublicSettingKey | PrivateSettingKey;

export const ALL_SETTING_KEYS: readonly SettingKey[] = [
  ...PUBLIC_SETTING_KEYS,
  ...PRIVATE_SETTING_KEYS,
];

export function isPublicSettingKey(key: string): key is PublicSettingKey {
  return (PUBLIC_SETTING_KEYS as readonly string[]).includes(key);
}

export function isPrivateSettingKey(key: string): key is PrivateSettingKey {
  return (PRIVATE_SETTING_KEYS as readonly string[]).includes(key);
}

export function isSettingKey(key: string): key is SettingKey {
  return isPublicSettingKey(key) || isPrivateSettingKey(key);
}

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
