/**
 * High-converting SEO keywords, metadata defaults, and geo-targeting coordinates
 * for Tehran Laser Clinic (تهران لیزر)
 */

export const DEFAULT_SEO_TITLE =
  'کلینیک تهران لیزر — مرکز تخصصی لیزر موهای زائد با رادو پلاس در پاسداران';

export const DEFAULT_SEO_DESCRIPTION =
  'کلینیک تخصصی تهران لیزر در خیابان پایدارفرد پاسداران. مجهز به دستگاه لیزر تماسی رادو پلاس با سه طول موج ۷۵۵ و ۸۰۸ و ۱۰۶۴ نانومتر، کاور یکبار مصرف استریل، سرمایش بدون درد، تعرفه شفاف و ۱۵٪ تخفیف رزرو آنلاین.';

export const PRIMARY_KEYWORDS = [
  'لیزر موهای زائد تهران',
  'لیزر پاسداران',
  'لیزر تماسی رادو پلاس',
  'کلینیک لیزر پایدارفرد',
  'لیزر تماسی تهران',
  'قیمت لیزر فول بادی بانوان',
  'لیزر بدون درد با کولینگ',
  'رزرو آنلاین لیزر پاسداران',
  'بهترین مرکز لیزر شمال شرق تهران',
  'لیزر موهای زائد آقایان و بانوان',
];

export const CLINIC_GEO_LOCATION = {
  region: 'IR-07', // Tehran province ISO 3166-2
  placename: 'Tehran, Pasdaran',
  position: '35.7645;51.4628',
  icbm: '35.7645, 51.4628',
};

/**
 * Single source of truth for the clinic's NAP + contact facts. Layout markup
 * (header phone chip, footer, drawer) and the JSON-LD node both read from here
 * so a changed phone number or address can never drift between the two.
 */
export const CLINIC_CONTACT = {
  /** Human-readable, Persian-digit display form. Always rendered inside <bdi dir="ltr">. */
  phoneDisplay: '۰۹۰۳ ۵۵۵ ۵۰۹۰',
  /** E.164 dial string for tel: links and schema.org telephone. */
  telephone: '+989035555090',
  streetAddress: 'خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم',
  addressLocality: 'تهران',
  addressRegion: 'منطقه ۴ - پاسداران',
  postalCode: '1666612345',
  addressCountry: 'IR',
  latitude: 35.7645,
  longitude: 51.4628,
  /** Public social/contact profiles — only verified, live handles belong here. */
  sameAs: ['https://www.instagram.com/tehranlaser_clinic/', 'https://wa.me/989035555090'],
} as const;

/**
 * Opening hours in schema.org shape, plus the Persian copy the footer prints.
 * Both derive from the same table so the visible hours and the machine-readable
 * hours cannot disagree (a mismatch is a Google "business hours" penalty risk).
 */
export const CLINIC_HOURS = {
  weekdays: {
    days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
    opens: '09:00',
    closes: '20:00',
  },
  thursday: { days: ['Thursday'], opens: '09:00', closes: '18:00' },
} as const;

/** Persian-localized weekday→hours copy, used by the footer block. */
export const CLINIC_HOURS_FA = [
  'شنبه تا چهارشنبه: ۰۹:۰۰ الی ۲۰:۰۰',
  'پنجشنبه‌ها: ۰۹:۰۰ الی ۱۸:۰۰',
  'جمعه‌ها: تعطیل',
] as const;

/**
 * The clinic's three treatment wavelengths, in nanometres. Kept here (not in a
 * page) because JSON-LD, the device copy and badge markup all cite them.
 */
export const DEVICE_WAVELENGTHS_NM = [755, 808, 1064] as const;

/**
 * Absolute default share image. Social crawlers reject relative og:image URLs;
 * keep the canonical-origin resolution in one place (see buildOgImageUrl).
 */
export const DEFAULT_OG_IMAGE_PATH = '/images/og-share.jpg';
export const DEFAULT_OG_IMAGE_ALT = 'کلینیک تخصصی تهران لیزر — مرکز لیزر موهای زائد پاسداران';

/** Persian digits helper for metadata that must read as Persian numerals. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] ?? d);
}

/**
 * Resolve a share-image path to an absolute URL on the canonical origin.
 * Accepts an already-absolute URL and returns it untouched.
 */
export function buildOgImageUrl(imagePath: string | undefined, origin: string): string {
  const path = imagePath && imagePath.trim() ? imagePath.trim() : DEFAULT_OG_IMAGE_PATH;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin.replace(/\/+$/, '')}${normalized}`;
}
