/**
 * Feature-module registry — the single in-code source of truth for the
 * WordPress-style plugin hub (migration 0011).
 *
 * Everything public is GATED here: a section renders only when its module is
 * enabled. The DB (`feature_modules`) stores nothing but per-module OVERRIDES —
 * no row means "run the module exactly as declared below", so shipping a new
 * module never needs a data migration and deleting a row is a clean reset.
 *
 * Adding a module = one entry here. Adding an editable setting = one field.
 * The admin hub renders the form from these field definitions, and the server
 * validates writes with the schema derived from them — the three can never
 * drift apart.
 *
 * Layering: this file is pure data + derived zod schemas (no DB, no Astro),
 * so it is unit-testable in plain Node. Persistence lives in
 * src/server/features.ts; merge/render rules live in ./state.ts.
 */

import { z } from 'zod';

export type FeatureCategory = 'sections' | 'chrome' | 'social' | 'growth';

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  sections: 'سکشن‌های صفحه اصلی',
  chrome: 'نوارها و دکمه‌های سراسری',
  social: 'شبکه‌های اجتماعی',
  growth: 'رشد و بازاریابی',
};

export const CATEGORY_ORDER: readonly FeatureCategory[] = ['sections', 'chrome', 'social', 'growth'];

export interface FeatureFieldDef {
  /** camelCase key inside the module's JSON config. */
  key: string;
  /** Persian label rendered in the admin form. */
  label: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'boolean';
  default: string | number | boolean;
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  /**
   * Canonicalise a submitted value before it is validated and stored, so the
   * table never holds a "works but ugly" copy (e.g. `@Handle` vs `handle`).
   * Runs only for text-like fields and only on the write path.
   */
  normalize?: (raw: string) => string;
}

export interface FeatureModuleDef {
  /** Stable, URL-safe identifier; also the config URL segment. */
  key: string;
  name: string;
  description: string;
  /** Icon name from the shared Icon map (src/components/ui/Icon.astro). */
  icon: string;
  category: FeatureCategory;
  /** True ⇒ the hub marks it as a premium add-on. */
  premium: boolean;
  /** Ships enabled with no admin action. */
  defaultEnabled: boolean;
  /** Sort weight inside the hub (lower = first); DB override wins. */
  defaultOrder: number;
  /** Only affects admin surfaces; never rendered on the public site. */
  internal: boolean;
  /** Shown in the hub when the module is off. */
  offNote: string;
  /** Admin-editable settings; empty ⇒ toggle-only module. */
  fields: readonly FeatureFieldDef[];
}

/* ───────────────────────────── MODULES ───────────────────────────── */

export const FEATURE_MODULES: readonly FeatureModuleDef[] = [
  {
    key: 'hero',
    name: 'هیرو و تیتر اصلی',
    description: 'بخش نخست صفحه اصلی با تصویر دستگاه، مشخصات فنی و دکمه‌های رزرو.',
    icon: 'sparkles',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 10,
    internal: false,
    offNote: 'هیرو غیرفعال است؛ صفحه اصلی از بخش بعدی آغاز می‌شود.',
    fields: [],
  },
  {
    key: 'device-showcase',
    name: 'معرفی دستگاه رادو پلاس',
    description: 'معرفی طول موج‌ها، سرمایش TEC و مزیت‌های لیزر تماسی.',
    icon: 'target',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 20,
    internal: false,
    offNote: 'معرفی دستگاه نمایش داده نمی‌شود.',
    fields: [],
  },
  {
    key: 'trust-strip',
    name: 'نوار اعتماد',
    description: 'چهار کارت اعتماد: اپراتور، بهداشت، تعرفه شفاف و گارانتی اثربخشی.',
    icon: 'shield',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 30,
    internal: false,
    offNote: 'نوار اعتماد پنهان است.',
    fields: [],
  },
  {
    key: 'clinic-gallery',
    name: 'گالری فضای کلینیک',
    description: 'تصاویر فضای کلینیک برای اعتماد بصری مراجعین.',
    icon: 'image',
    category: 'sections',
    premium: true,
    defaultEnabled: true,
    defaultOrder: 40,
    internal: false,
    offNote: 'گالری کلینیک پنهان است.',
    fields: [],
  },
  {
    key: 'pricing-table',
    name: 'جدول تعرفه و پیشنهاد ویژه',
    description: 'تعرفه بانوان و آقایان کنار هم، به‌همراه کارت پیشنهاد طلایی.',
    icon: 'services',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 50,
    internal: false,
    offNote: 'جدول تعرفه پنهان است؛ رزرو همچنان از منوی سایت در دسترس است.',
    fields: [
      {
        key: 'promoTitle',
        label: 'عنوان کارت پیشنهاد',
        type: 'text',
        default: 'پکیج طلایی کل بدن بانوان (Full Body)',
        maxLength: 90,
      },
      {
        key: 'promoBadge',
        label: 'برچسب روی کارت',
        type: 'text',
        default: 'پیشنهاد طلایی رزرو آنلاین',
        maxLength: 40,
      },
      {
        key: 'promoOldPrice',
        label: 'قیمت قبل از تخفیف (تومان)',
        type: 'text',
        default: '۲٬۲۹۰٬۰۰۰',
        maxLength: 20,
        help: 'فقط برای نمایش؛ ارقام فارسی مجاز است.',
      },
      {
        key: 'promoNewPrice',
        label: 'قیمت پس از تخفیف (تومان)',
        type: 'text',
        default: '۱٬۹۴۰٬۰۰۰',
        maxLength: 20,
      },
      {
        key: 'promoDiscountLabel',
        label: 'متن تخفیف',
        type: 'text',
        default: '۱۵٪ تخفیف اختصاصی رزرو سایت',
        maxLength: 60,
      },
      {
        key: 'promoServiceSlug',
        label: 'نامک خدمت مقصد دکمه',
        type: 'text',
        default: 'full-body',
        maxLength: 60,
        help: 'باید با نامک یکی از خدمات (مثلاً full-body) برابر باشد.',
      },
    ],
  },
  {
    key: 'mens-line',
    name: 'لاین اختصاصی آقایان',
    description: 'نوار معرفی خدمات لیزر آقایان، فضای مجزا و حریم خصوصی.',
    icon: 'users',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 60,
    internal: false,
    offNote: 'نوار لاین آقایان پنهان است.',
    fields: [
      {
        key: 'title',
        label: 'عنوان',
        type: 'text',
        default: 'خدمات اختصاصی لیزر آقایان در فضای مجزا',
        maxLength: 90,
      },
      {
        key: 'description',
        label: 'توضیح',
        type: 'textarea',
        default:
          'کلینیک تهران لیزر مجهز به لاین اختصاصی آقایان با فضای کاملاً مجزا و پروتکل‌های ویژه موهای ضخیم می‌باشد. نواحی آنکارد ریش، خط گردن و گونه، پشت، شانه‌ها، سینه و پکیج کامل کل بدن با تعیین وقت قبلی و در کمال حریم شخصی ارائه می‌گردد.',
        maxLength: 600,
      },
    ],
  },
  {
    key: 'protocol',
    name: 'پروتکل درمانی',
    description: 'مراحل استاندارد جلسه، از تست‌شات تا مراقبت پس از لیزر.',
    icon: 'list',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 70,
    internal: false,
    offNote: 'بخش پروتکل پنهان است.',
    fields: [],
  },
  {
    key: 'testimonials',
    name: 'نظرات مراجعین',
    description: 'تجربه واقعی مراجعین با امتیاز پنج‌ستاره برای اعتمادسازی.',
    icon: 'star',
    category: 'sections',
    premium: true,
    defaultEnabled: true,
    defaultOrder: 80,
    internal: false,
    offNote: 'بخش نظرات مراجعین پنهان است.',
    fields: [],
  },
  {
    key: 'faq',
    name: 'سوالات متداول',
    description: 'آکاردئون پرسش‌های پرتکرار، متصل به داده زنده D1 و اسکیمای FAQ.',
    icon: 'info',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 90,
    internal: false,
    offNote: 'بخش سوالات متداول پنهان است.',
    fields: [
      {
        key: 'title',
        label: 'عنوان سکشن',
        type: 'text',
        default: 'سوالات متداول مراجعین تهران لیزر',
        maxLength: 90,
      },
      {
        key: 'subtitle',
        label: 'زیرعنوان',
        type: 'text',
        default: 'پاسخ به سوالات پرتکرار',
        maxLength: 60,
      },
    ],
  },
  {
    key: 'location',
    name: 'موقعیت و مسیریابی',
    description: 'نشانی، تلفن پذیرش و دکمه مسیریابی روی نقشه.',
    icon: 'pin',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 100,
    internal: false,
    offNote: 'بخش موقعیت مکانی پنهان است.',
    fields: [],
  },
  {
    key: 'stat-band',
    name: 'نوار آمار کلینیک',
    description: 'شمارنده‌های اعتماد (تعداد مراجع، جلسات، امتیاز و سال فعالیت).',
    icon: 'chart',
    category: 'sections',
    premium: true,
    defaultEnabled: false,
    defaultOrder: 110,
    internal: false,
    offNote: 'ماژول آمار فعال نیست.',
    fields: [
      { key: 'clients', label: 'تعداد مراجعین', type: 'text', default: '۱۲٬۰۰۰+', maxLength: 20 },
      { key: 'sessions', label: 'جلسات انجام‌شده', type: 'text', default: '۴۵٬۰۰۰+', maxLength: 20 },
      { key: 'rating', label: 'امتیاز رضایت', type: 'text', default: '۴.۹', maxLength: 10 },
      { key: 'years', label: 'سال فعالیت', type: 'text', default: '۹', maxLength: 10 },
    ],
  },
  {
    key: 'instagram-hub',
    name: 'هاب اینستاگرام',
    description: 'پروفایل، ریلز و کد تخفیف فالوورها؛ کاملاً قابل تنظیم از پنل.',
    icon: 'instagram',
    category: 'social',
    premium: true,
    defaultEnabled: true,
    defaultOrder: 120,
    internal: false,
    offNote: 'بخش اینستاگرام غیرفعال است؛ تا فعال‌سازی، چیزی در سایت نمایش داده نمی‌شود.',
    fields: [
      {
        key: 'handle',
        label: 'نام کاربری اینستاگرام',
        type: 'text',
        default: 'tehranlaser_clinic',
        maxLength: 30,
        placeholder: 'tehranlaser_clinic',
        help: 'بدون @ — فقط حروف انگلیسی، نقطه و زیرخط.',
        normalize: normalizeInstagramHandle,
      },
      {
        key: 'promoCode',
        label: 'کد تخفیف فالوورها',
        type: 'text',
        default: 'INSTA20',
        maxLength: 24,
      },
      {
        key: 'promoDiscountPercent',
        label: 'درصد تخفیف فالوورها',
        type: 'number',
        default: 15,
        min: 0,
        max: 90,
      },
      {
        key: 'bioLink',
        label: 'لینک ویژه بایو',
        type: 'url',
        default: '',
        maxLength: 300,
        placeholder: 'https://…',
        help: 'خالی بگذارید تا دکمه «لینک ویژه فالوورها» نمایش داده نشود.',
      },
      {
        key: 'latestReelUrl',
        label: 'آدرس آخرین ریلز',
        type: 'url',
        default: '',
        maxLength: 500,
        placeholder: 'https://www.instagram.com/reel/…',
      },
    ],
  },
  {
    key: 'announcement-bar',
    name: 'نوار اعلان بالای سایت',
    description: 'پیام تخفیف/اطلاعیه بالای هدر با دکمه اقدام؛ تا فعال نشود نمایش داده نمی‌شود.',
    icon: 'bell',
    category: 'chrome',
    premium: true,
    defaultEnabled: false,
    defaultOrder: 130,
    internal: false,
    offNote: 'نوار اعلان خاموش است.',
    fields: [
      {
        key: 'message',
        label: 'متن اعلان',
        type: 'text',
        default: 'جشنواره پاییزه تهران لیزر: ۱۵٪ تخفیف ویژه پکیج کل بدن در رزرو آنلاین',
        maxLength: 160,
      },
      { key: 'ctaLabel', label: 'متن دکمه', type: 'text', default: 'رزرو با تخفیف', maxLength: 30 },
      { key: 'ctaHref', label: 'مقصد دکمه', type: 'url', default: '/booking', maxLength: 200 },
    ],
  },
  {
    key: 'sticky-booking-cta',
    name: 'نوار رزرو چسبان موبایل',
    description: 'نوار پایین صفحه در موبایل با دکمه رزرو و برچسب تخفیف.',
    icon: 'mobile',
    category: 'chrome',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 140,
    internal: false,
    offNote: 'نوار رزرو چسبان پنهان است.',
    fields: [
      { key: 'label', label: 'متن دکمه', type: 'text', default: 'رزرو آنلاین نوبت', maxLength: 40 },
      { key: 'badge', label: 'برچسب تخفیف', type: 'text', default: '۱۵٪ تخفیف', maxLength: 20 },
      {
        key: 'desktop',
        label: 'نمایش در دسکتاپ',
        type: 'boolean',
        default: false,
        help: 'به‌صورت پیش‌فرض این نوار فقط در موبایل دیده می‌شود.',
      },
    ],
  },
  {
    key: 'closing-cta',
    name: 'فراخوان پایانی صفحه',
    description: 'بخش پایانی صفحه اصلی با دعوت به رزرو و تماس.',
    icon: 'phone',
    category: 'sections',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 150,
    internal: false,
    offNote: 'فراخوان پایانی پنهان است.',
    fields: [
      { key: 'title', label: 'عنوان', type: 'text', default: 'آماده‌اید شروع کنید؟', maxLength: 60 },
      {
        key: 'description',
        label: 'توضیح',
        type: 'textarea',
        default:
          'اولین مشاوره رایگان است؛ همین حالا نوبت بگیرید و ۱۵٪ تخفیف رزرو آنلاین را از دست ندهید.',
        maxLength: 300,
      },
      { key: 'badge', label: 'برچسب دکمه رزرو', type: 'text', default: ' (۱۵٪ تخفیف)', maxLength: 30 },
    ],
  },
  {
    key: 'whatsapp-float',
    name: 'دکمه شناور واتساپ',
    description: 'دکمه شناور واتساپ در گوشه صفحه برای گفتگوی سریع با پذیرش.',
    icon: 'whatsapp',
    category: 'chrome',
    premium: true,
    defaultEnabled: false,
    defaultOrder: 160,
    internal: false,
    offNote: 'دکمه شناور واتساپ خاموش است.',
    fields: [
      {
        key: 'phone',
        label: 'شماره واتساپ',
        type: 'text',
        default: '989035555090',
        maxLength: 20,
        help: 'با کد کشور و بدون + یا صفر ابتدایی.',
      },
      {
        key: 'message',
        label: 'پیام پیش‌فرض',
        type: 'text',
        default: 'سلام، برای رزرو نوبت لیزر راهنمایی می‌خواهم.',
        maxLength: 120,
      },
    ],
  },
  {
    key: 'online-booking',
    name: 'رزرو آنلاین نوبت',
    description: 'فرم رزرو اینترنتی، ظرفیت‌سنجی زنده و تخفیف رزرو آنلاین.',
    icon: 'calendar',
    category: 'growth',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 170,
    internal: false,
    offNote: 'رزرو آنلاین غیرفعال است؛ مراجعین باید تلفنی نوبت بگیرند.',
    fields: [],
  },
  {
    key: 'content-blog',
    name: 'بلاگ و مقالات سئو',
    description: 'انتشار مقالات آموزشی و لینک‌سازی داخلی برای سئو.',
    icon: 'blog',
    category: 'growth',
    premium: false,
    defaultEnabled: true,
    defaultOrder: 180,
    internal: false,
    offNote: 'بخش مقالات غیرفعال است.',
    fields: [],
  },
  {
    key: 'sms-campaigns',
    name: 'پنل پیامک و یادآوری',
    description: 'یادآوری نوبت، تبریک تولد و کمپین پیامکی مشتریان (فقط پنل مدیریت).',
    icon: 'sms',
    category: 'growth',
    premium: true,
    defaultEnabled: false,
    defaultOrder: 190,
    internal: true,
    offNote: 'ماژول پیامک خاموش است.',
    fields: [],
  },
] as const;

/** Normalise a user-entered Instagram handle: strip @, URL host, punctuation. */
export function normalizeInstagramHandle(value: string): string {
  const trimmed = value.trim().replace(/^@/, '');
  // Accept a pasted profile URL by taking its last path segment.
  const cleaned = /^https?:\/\//i.test(trimmed) ? (trimmed.split('/').filter(Boolean).pop() ?? '') : trimmed;
  return cleaned.replace(/[^A-Za-z0-9._]/g, '').slice(0, 30);
}

const REGISTRY = new Map<string, FeatureModuleDef>(FEATURE_MODULES.map((m) => [m.key, m]));

export const FEATURE_MODULE_KEYS: readonly string[] = FEATURE_MODULES.map((m) => m.key);

export function getModuleDef(key: string): FeatureModuleDef | null {
  return REGISTRY.get(key) ?? null;
}

export function isKnownModuleKey(key: string): boolean {
  return REGISTRY.has(key);
}

/** JSON shape persisted in feature_modules.config. */
export type ModuleConfig = Record<string, string | number | boolean>;

/** Effective module state used by every public/admin surface. */
export interface ModuleState {
  key: string;
  enabled: boolean;
  order: number;
  config: ModuleConfig;
}

/** Admin hub view = state + registry metadata. */
export interface AdminModuleView extends ModuleState {
  name: string;
  description: string;
  icon: string;
  category: FeatureCategory;
  premium: boolean;
  internal: boolean;
  hasOverride: boolean;
  offNote: string;
  fields: readonly FeatureFieldDef[];
}

/* ─────────────────────── DERIVED VALIDATION ─────────────────────── */

function fieldSchema(field: FeatureFieldDef): z.ZodTypeAny {
  switch (field.type) {
    case 'number': {
      // An empty <input> submits '', which must mean "not provided" rather
      // than 0 — otherwise clearing a price field silently writes zero.
      let schema = z.coerce.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      return z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());
    }
    case 'boolean':
      // HTML form posts arrive as 'true'/'on'/'1'; accept both shapes so the
      // API contract does not depend on how the caller serialises a checkbox.
      return z.preprocess((v) => {
        if (typeof v === 'boolean') return v;
        if (v === undefined || v === null || v === '') return undefined;
        const s = String(v).trim().toLowerCase();
        if (['true', '1', 'on', 'yes'].includes(s)) return true;
        if (['false', '0', 'off', 'no'].includes(s)) return false;
        return v;
      }, z.boolean().optional());
    case 'url':
      // Accept an absolute https URL or a site-relative path; anything else
      // (javascript:, data:, protocol-relative //host) is refused so a config
      // value can never become an executable href.
      return z
        .string()
        .max(field.maxLength ?? 500)
        .refine((v) => v === '' || /^https:\/\//i.test(v) || /^\/(?!\/)/.test(v), {
          message: 'فقط آدرس https یا مسیر داخلی سایت مجاز است.',
        });
    case 'textarea':
      return z.string().max(field.maxLength ?? 1200);
    case 'text':
    default:
      return z.string().max(field.maxLength ?? 200);
  }
}

/** zod schema for one module's config, built from its field list. */
export function buildConfigSchema(def: FeatureModuleDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  // Every key is optional: a partial update merges onto the stored/default
  // config (server/features.ts). `.strict()` still refuses unknown keys, so a
  // typo'd key is an error instead of a silently dropped setting.
  for (const field of def.fields) shape[field.key] = fieldSchema(field).optional();
  return z.object(shape).strict();
}

/** Registry defaults for a module's config. */
export function defaultConfig(def: FeatureModuleDef): ModuleConfig {
  const out: ModuleConfig = {};
  for (const field of def.fields) out[field.key] = field.default;
  return out;
}
