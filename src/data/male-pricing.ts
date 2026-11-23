/**
 * Male-price provenance register (Lane B, wave/b; refreshed by migration 0016).
 *
 * Single source of truth for *which* men's amounts came from the owner's list
 * and which were derived for the homepage/dashboard. The database is the
 * runtime source of truth; this register exists so the owner can review the
 * derived numbers and so the migration and the UI agree on provenance.
 *
 * Amounts are in THOUSANDS of IRT (370 renders as ۳۷۰٬۰۰۰ تومان).
 *
 * 2026-11-23 (migration 0016): the owner sent a full new price list for both
 * devices. Every men's Rado amount on that list replaced the older figure;
 * amounts NOT on the new list keep their previous value (marked derived or
 * with the older owner note). The Deka men's amounts from the same list live
 * in MALE_DEKA_PRICE_REGISTER below. The two separate services «زیرگردن» and
 * «پشت گردن» were merged into one combined service «زیر گردن و پشت سر»
 * (under-chin-back-neck) per the owner's single row.
 */

export type PriceProvenance = 'owner' | 'derived';

export interface MalePriceRegisterEntry {
  /** Existing/added service slug. */
  slug: string;
  /** Persian zone label as the owner lists it. */
  label: string;
  /** Men's amount in thousands of IRT. */
  amount: number;
  provenance: PriceProvenance;
  /** Human-readable source (owner quote or the derivation rule). */
  note: string;
}

/**
 * Zones that exist ONLY in the men's line. «زیرگردن» and «پشت گردن» are gone —
 * migration 0016 merged them into the combined «زیر گردن و پشت سر» service.
 */
export const MENS_ONLY_SLUGS = [
  'forehead',
  'beard-line',
  'ear',
  'behind-ear',
  'under-chin-back-neck',
  'shoulder',
] as const;

export type MensOnlySlug = (typeof MENS_ONLY_SLUGS)[number];

export const MENS_ONLY_SLUG_SET: ReadonlySet<string> = new Set(MENS_ONLY_SLUGS);

/** All men's Rado amounts currently in the database, with provenance. */
export const MALE_PRICE_REGISTER: MalePriceRegisterEntry[] = [
  // ── OWNER (list of 2026-11-23, device Rado Plus) ──
  {
    slug: 'ear',
    amount: 250,
    provenance: 'owner',
    label: 'گوش',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: گوش ۲۵۰',
  },
  {
    slug: 'beard-line',
    amount: 350,
    provenance: 'owner',
    label: 'خط ریش',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: خط ریش ۳۵۰',
  },
  {
    slug: 'under-chin-back-neck',
    amount: 450,
    provenance: 'owner',
    label: 'زیر گردن و پشت سر',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: زیر گردن و پشت سر ۴۵۰ — یک ردیف ترکیبی جایگزین زیرگردن و پشت گردن',
  },
  {
    slug: 'underarm',
    amount: 500,
    provenance: 'owner',
    label: 'زیر بغل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: زیر بغل ۵۰۰',
  },
  {
    slug: 'chest',
    amount: 600,
    provenance: 'owner',
    label: 'سینه',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: سینه ۶۰۰',
  },
  {
    slug: 'abdomen',
    amount: 550,
    provenance: 'owner',
    label: 'شکم',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: شکم ۵۵۰',
  },
  {
    slug: 'back',
    amount: 650,
    provenance: 'owner',
    label: 'کمر',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: کمر ۶۵۰',
  },
  {
    slug: 'full-arms',
    amount: 750,
    provenance: 'owner',
    label: 'دست کامل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: دست کامل ۷۵۰',
  },
  {
    slug: 'forearm',
    amount: 500,
    provenance: 'owner',
    label: 'ساق دست',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: ساق دست ۵۰۰',
  },
  {
    slug: 'full-legs',
    amount: 900,
    provenance: 'owner',
    label: 'پا کامل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: پا کامل ۹۰۰',
  },
  {
    slug: 'lower-leg',
    amount: 650,
    provenance: 'owner',
    label: 'ساق پا',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: ساق پا ۶۵۰',
  },
  {
    slug: 'full-body',
    amount: 3490,
    provenance: 'owner',
    label: 'کل بدن',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲: فول‌بادی آقایان ۳٬۴۹۰',
  },

  // ── OWNER (older lists, unchanged by the 2026-11-23 list) ──
  {
    slug: 'upper-arm',
    amount: 570,
    provenance: 'owner',
    label: 'بازو',
    note: 'لیست مالک ۱۴۰۴: بازو ۵۷۰ — در لیست جدید نیامده',
  },
  {
    slug: 'shoulder',
    amount: 590,
    provenance: 'owner',
    label: 'سرشانه',
    note: 'لیست مالک ۱۴۰۴: سرشانه ۵۹۰ — در لیست جدید نیامده',
  },
  {
    slug: 'thigh',
    amount: 390,
    provenance: 'owner',
    label: 'ران',
    note: 'لیست مالک: ران ۳۹۰ — در لیست جدید نیامده',
  },
  {
    slug: 'forehead',
    amount: 190,
    provenance: 'owner',
    label: 'پیشانی',
    note: 'لیست مالک: پیشانی ۱۹۰ — در لیست جدید نیامده',
  },
  {
    slug: 'behind-ear',
    amount: 100,
    provenance: 'owner',
    label: 'پشت گوش',
    note: 'لیست مالک: پشت گوش ۱۰۰ — در لیست جدید نیامده',
  },

  // ── DERIVED: the owner gave no new figure for these — previous value kept ──
  {
    slug: 'face',
    amount: 420,
    provenance: 'derived',
    label: 'صورت',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۳۱× ۳۲۰)',
  },
  {
    slug: 'upper-lip',
    amount: 130,
    provenance: 'derived',
    label: 'پشت لب',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۴۴× ۹۰)',
  },
  {
    slug: 'chin',
    amount: 190,
    provenance: 'derived',
    label: 'چانه',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۳۱× ۱۴۵)',
  },
  {
    slug: 'neck',
    amount: 250,
    provenance: 'derived',
    label: 'گردن',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۳۲× ۱۹۰)',
  },
  {
    slug: 'navel-line',
    amount: 230,
    provenance: 'derived',
    label: 'خط ناف',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۲۱× ۱۹۰)',
  },
  {
    slug: 'bikini',
    amount: 650,
    provenance: 'derived',
    label: 'بیکینی',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۱۰× ۵۹۰)',
  },
  {
    slug: 'buttocks',
    amount: 460,
    provenance: 'derived',
    label: 'باسن',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۲۱× ۳۸۰)',
  },
  {
    slug: 'gluteal-line',
    amount: 290,
    provenance: 'derived',
    label: 'خط باسن',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۲۱× ۲۴۰)',
  },
  {
    slug: 'inner-thigh',
    amount: 470,
    provenance: 'derived',
    label: 'کشاله ران',
    note: 'استخراجی: مقدار قبلی حفظ شده — مالک برای ۱۴۰۵ مبلغ جدید نداد (مبنای قدیم: ۱.۲۱× ۳۹۰)',
  },
];

/**
 * Men's Deka amounts (owner list of 2026-11-23, migration 0016). Zones the
 * owner did not price for Deka have NO row here — the site shows
 * «استعلام قیمت» and the booking form refuses a Deka booking for them.
 */
export const MALE_DEKA_PRICE_REGISTER: MalePriceRegisterEntry[] = [
  {
    slug: 'ear',
    amount: 350,
    provenance: 'owner',
    label: 'گوش',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): گوش ۳۵۰',
  },
  {
    slug: 'beard-line',
    amount: 500,
    provenance: 'owner',
    label: 'خط ریش',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): خط ریش ۵۰۰',
  },
  {
    slug: 'under-chin-back-neck',
    amount: 600,
    provenance: 'owner',
    label: 'زیر گردن و پشت سر',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): زیر گردن و پشت سر ۶۰۰',
  },
  {
    slug: 'underarm',
    amount: 700,
    provenance: 'owner',
    label: 'زیر بغل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): زیر بغل ۷۰۰',
  },
  {
    slug: 'chest',
    amount: 900,
    provenance: 'owner',
    label: 'سینه',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): سینه ۹۰۰',
  },
  {
    slug: 'abdomen',
    amount: 750,
    provenance: 'owner',
    label: 'شکم',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): شکم ۷۵۰',
  },
  {
    slug: 'back',
    amount: 900,
    provenance: 'owner',
    label: 'کمر',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): کمر ۹۰۰',
  },
  {
    slug: 'full-arms',
    amount: 1150,
    provenance: 'owner',
    label: 'دست کامل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): دست کامل ۱٬۱۵۰',
  },
  {
    slug: 'forearm',
    amount: 750,
    provenance: 'owner',
    label: 'ساق دست',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): ساق دست ۷۵۰',
  },
  {
    slug: 'full-legs',
    amount: 1400,
    provenance: 'owner',
    label: 'پا کامل',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): پا کامل ۱٬۴۰۰',
  },
  {
    slug: 'lower-leg',
    amount: 900,
    provenance: 'owner',
    label: 'ساق پا',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): ساق پا ۹۰۰',
  },
  {
    slug: 'full-body',
    amount: 5980,
    provenance: 'owner',
    label: 'کل بدن',
    note: 'لیست مالک ۱۴۰۵/۰۹/۰۲ (دکا): فول‌بادی آقایان ۵٬۹۸۰',
  },
];

/** Slugs whose men's amount was derived, not supplied — surface these to the owner. */
export const DERIVED_MALE_SLUGS: ReadonlySet<string> = new Set(
  MALE_PRICE_REGISTER.filter((e) => e.provenance === 'derived').map((e) => e.slug),
);
