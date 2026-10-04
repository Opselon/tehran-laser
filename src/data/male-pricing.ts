/**
 * Male-price provenance register (Lane B, wave/b).
 *
 * Single source of truth for *which* men's amounts came from the owner's list
 * and which were derived for the homepage/dashboard. The database is the
 * runtime source of truth; this register exists so the owner can review the
 * derived numbers and so the migration and the UI agree on provenance.
 *
 * Amounts are in THOUSANDS of IRT (370 renders as ۳۷۰٬۰۰۰ تومان).
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
 * Zones that exist ONLY in the men's line. The owner listed these men's-only
 * items; «ساق دست» is not here because it maps to the existing `forearm` zone.
 */
export const MENS_ONLY_SLUGS = [
  'forehead',
  'beard-line',
  'ear',
  'behind-ear',
  'under-chin',
  'back-neck',
  'shoulder',
] as const;

export type MensOnlySlug = (typeof MENS_ONLY_SLUGS)[number];

export const MENS_ONLY_SLUG_SET: ReadonlySet<string> = new Set(MENS_ONLY_SLUGS);

/** All men's amounts written by migrations/0009_male_prices.sql, with provenance. */
export const MALE_PRICE_REGISTER: MalePriceRegisterEntry[] = [
  // ── OWNER: taken verbatim from the owner's combined list ──
  { slug: 'underarm', amount: 370, provenance: 'owner', label: 'زیر بغل', note: 'لیست مالک: زیر بغل ۳۷۰' },
  { slug: 'full-arms', amount: 770, provenance: 'owner', label: 'دست کامل', note: 'لیست مالک: دست کامل ۷۷۰' },
  { slug: 'upper-arm', amount: 360, provenance: 'owner', label: 'بازو', note: 'لیست مالک: بازو ۳۶۰' },
  { slug: 'forearm', amount: 360, provenance: 'owner', label: 'ساق دست', note: 'لیست مالک: ساق دست ۳۶۰ (نقشه‌برداری به ناحیه موجود «ساق»)' },
  { slug: 'chest', amount: 360, provenance: 'owner', label: 'سینه کامل', note: 'لیست مالک: سینه کامل ۳۶۰' },
  { slug: 'abdomen', amount: 390, provenance: 'owner', label: 'شکم', note: 'لیست مالک: شکم ۳۹۰' },
  { slug: 'back', amount: 460, provenance: 'owner', label: 'کمر', note: 'لیست مالک: کمر ۴۶۰' },
  { slug: 'full-legs', amount: 740, provenance: 'owner', label: 'کل پا', note: 'لیست مالک: کل پا ۷۴۰' },
  { slug: 'thigh', amount: 390, provenance: 'owner', label: 'ران', note: 'لیست مالک: ران ۳۹۰' },
  { slug: 'lower-leg', amount: 390, provenance: 'owner', label: 'ساق پا', note: 'لیست مالک: ساق پا ۳۹۰' },
  { slug: 'forehead', amount: 190, provenance: 'owner', label: 'پیشانی', note: 'لیست مالک: پیشانی ۱۹۰' },
  { slug: 'beard-line', amount: 220, provenance: 'owner', label: 'خط ریش', note: 'لیست مالک: خط ریش ۲۲۰' },
  { slug: 'ear', amount: 100, provenance: 'owner', label: 'گوش', note: 'لیست مالک: گوش ۱۰۰' },
  { slug: 'behind-ear', amount: 100, provenance: 'owner', label: 'پشت گوش', note: 'لیست مالک: پشت گوش ۱۰۰' },
  { slug: 'under-chin', amount: 220, provenance: 'owner', label: 'زیرگردن', note: 'لیست مالک: زیرگردن ۲۲۰' },
  { slug: 'back-neck', amount: 220, provenance: 'owner', label: 'پشت گردن', note: 'لیست مالک: پشت گردن ۲۲۰' },
  { slug: 'shoulder', amount: 360, provenance: 'owner', label: 'سرشانه', note: 'لیست مالک: سرشانه ۳۶۰' },

  // ── DERIVED: no owner figure — Iranian-market factor 1.0–1.5× the women's amount ──
  { slug: 'face', amount: 420, provenance: 'derived', label: 'صورت', note: 'استخراجی: ۱.۳۱× تعرفه بانوان (۳۲۰)' },
  { slug: 'upper-lip', amount: 130, provenance: 'derived', label: 'پشت لب', note: 'استخراجی: ۱.۴۴× تعرفه بانوان (۹۰)' },
  { slug: 'chin', amount: 190, provenance: 'derived', label: 'چانه', note: 'استخراجی: ۱.۳۱× تعرفه بانوان (۱۴۵)' },
  { slug: 'neck', amount: 250, provenance: 'derived', label: 'گردن', note: 'استخراجی: ۱.۳۲× تعرفه بانوان (۱۹۰)' },
  { slug: 'navel-line', amount: 230, provenance: 'derived', label: 'خط ناف', note: 'استخراجی: ۱.۲۱× تعرفه بانوان (۱۹۰)' },
  { slug: 'bikini', amount: 650, provenance: 'derived', label: 'بیکینی', note: 'استخراجی: ۱.۱۰× تعرفه بانوان (۵۹۰) — در داشبورد تأیید یا صفر شود' },
  { slug: 'buttocks', amount: 460, provenance: 'derived', label: 'باسن', note: 'استخراجی: ۱.۲۱× تعرفه بانوان (۳۸۰)' },
  { slug: 'gluteal-line', amount: 290, provenance: 'derived', label: 'خط باسن', note: 'استخراجی: ۱.۲۱× تعرفه بانوان (۲۴۰) — در داشبورد تأیید یا صفر شود' },
  { slug: 'inner-thigh', amount: 470, provenance: 'derived', label: 'کشاله ران', note: 'استخراجی: ۱.۲۱× تعرفه بانوان (۳۹۰)' },
  { slug: 'full-body', amount: 2400, provenance: 'derived', label: 'کل بدن', note: 'استخراجی: ۱.۰۵× تعرفه بانوان (۲۲۹۰)' },
];

/** Slugs whose men's amount was derived, not supplied — surface these to the owner. */
export const DERIVED_MALE_SLUGS: ReadonlySet<string> = new Set(
  MALE_PRICE_REGISTER.filter((e) => e.provenance === 'derived').map((e) => e.slug),
);
