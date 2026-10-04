import { z } from 'zod';
import { PRICING_CATEGORIES } from '../booking/booking.types';

/** Validation shared by API routes and server services. Everything that crosses a
 *  boundary is parsed here — the client is never trusted. */

export const pricingCategorySchema = z.enum(PRICING_CATEGORIES);

/** Accepts 09121234567, +989****4567, 00989121234567, 9121234567 → canonical +989****4567.
 *  Persian/Arabic-Indic digits (۰-۹, ٠-٩) are normalised first — admins type them
 *  from the on-screen keypad and would otherwise be rejected as invalid input. */
export const phoneSchema = z
  .string()
  .trim()
  .min(4)
  .max(24)
  .transform((value) =>
    value
      .replace(/[\s\-().]/g, '')
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))),
  )
  .refine((value) => /^\+?\d{10,15}$/.test(value), { message: 'شماره تماس معتبر نیست.' })
  .transform((value) => {
    if (value.startsWith('0098')) return `+98${value.slice(4)}`;
    if (value.startsWith('+98')) return value;
    if (value.startsWith('98') && value.length === 12) return `+${value}`;
    if (value.startsWith('0')) return `+98${value.slice(1)}`;
    if (value.startsWith('9') && value.length === 10) return `+98${value}`;
    return `+${value}`;
  });

export const isoInstantSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'زمان نامعتبر است.' });

export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ باید به شکل YYYY-MM-DD باشد.')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number) as [number, number, number];
    if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, { message: 'تاریخ نامعتبر است.' });

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'اسلاگ باید انگلیسی و با خط تیره باشد.');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'نام باید حداقل ۲ حرف باشد.')
  .max(80, 'نام طولانی است.');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'ایمیل معتبر نیست.');

export const noteSchema = z.string().trim().max(500, 'متن طولانی است.');

/** ── Public booking creation ────────────────────────────────── */

export const createBookingSchema = z
  .object({
    serviceSlug: slugSchema.optional(),
    serviceSlugs: z.array(slugSchema).min(1).optional(),
    pricingCategory: pricingCategorySchema,
    startsAt: isoInstantSchema,
    customerName: nameSchema,
    customerPhone: phoneSchema,
    customerEmail: emailSchema.optional(),
    note: noteSchema.optional(),
    /** Client-generated token that dedupes accidental double submits. */
    idempotencyKey: z.string().trim().min(8).max(64).optional(),
  })
  .refine(
    (data) => Boolean(data.serviceSlug || (data.serviceSlugs && data.serviceSlugs.length > 0)),
    {
      message: 'حداقل یک خدمت باید انتخاب شود.',
      path: ['serviceSlug'],
    },
  );
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** ── Availability query ─────────────────────────────────────── */

export const availabilityQuerySchema = z
  .object({
    service: slugSchema.optional(),
    services: z.string().optional(),
    date: localDateSchema,
    category: pricingCategorySchema,
    staffId: z.string().trim().min(1).max(64).optional(),
  })
  .refine((data) => Boolean(data.service || data.services), {
    message: 'حداقل یک خدمت برای استعلام ظرفیت الزامی است.',
    path: ['service'],
  });
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

/** ── Admin booking actions ──────────────────────────────────── */

export const rejectBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const updateBookingSchema = z.object({
  adminNote: z.string().max(500).nullable().optional(),
  customerNote: z.string().max(500).nullable().optional(),
  quotedAmount: z.number().int().nonnegative().optional(),
});

export const rescheduleBookingSchema = z.object({
  startsAt: isoInstantSchema,
  staffId: z.string().trim().min(1).max(64).nullable().optional(),
});

export const adminBookingListQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show']).optional(),
  from: localDateSchema.optional(),
  to: localDateSchema.optional(),
  q: z.string().trim().min(1).max(80).optional(),
  serviceSlug: slugSchema.optional(),
  staffId: z.string().trim().min(1).max(64).optional(),
  cursor: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export type AdminBookingListQuery = z.infer<typeof adminBookingListQuerySchema>;

/** ── Auth ───────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر است.').max(200),
});

/** ── Services / pricing / staff (admin) ─────────────────────── */

export const serviceWriteSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().trim().max(2000),
  shortDescription: z.string().trim().max(200).nullable().optional(),
  durationMinutes: z.number().int().min(5).max(600),
  active: z.boolean(),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export const pricingWriteSchema = z.object({
  pricingCategory: pricingCategorySchema,
  amount: z.number().int().min(0).max(1_000_000_000),
});

export const staffWriteSchema = z.object({
  name: nameSchema,
  active: z.boolean(),
  serviceSlugs: z.array(slugSchema).max(100),
});

/** ── Schedule (admin) ───────────────────────────────────────── */

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'زمان باید HH:MM باشد.');

export const scheduleWriteSchema = z.object({
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        segments: z
          .array(z.object({ opensAt: timeSchema, closesAt: timeSchema }))
          .max(4)
          .refine(
            (segments) => segments.every((s) => s.opensAt < s.closesAt),
            'ساعت شروع باید قبل از پایان باشد.',
          ),
      }),
    )
    .length(7),
  exceptions: z
    .array(
      z.object({
        date: localDateSchema,
        kind: z.enum(['holiday', 'closed', 'special_hours', 'blocked_time', 'temporary_change']),
        opensAt: timeSchema.nullable().optional(),
        closesAt: timeSchema.nullable().optional(),
        note: z.string().trim().max(300).nullable().optional(),
      }),
    )
    .max(400),
});

export const updateWeekdayHoursSchema = z.object({
  isOpen: z.boolean(),
  opensAt: timeSchema.optional(),
  closesAt: timeSchema.optional(),
});

export const createExceptionSchema = z.object({
  exceptionDate: localDateSchema,
  kind: z.enum(['holiday', 'closed', 'special_hours', 'blocked_time', 'temporary_change']),
  opensAt: timeSchema.nullable().optional(),
  closesAt: timeSchema.nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
});

/** ── Blog (admin) ───────────────────────────────────────────── */

export const blogWriteSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  excerpt: z.string().trim().max(400),
  content: z.string().max(100_000),
  coverImage: z.string().trim().max(500).nullable().optional(),
  categoryId: z.string().trim().max(64).nullable().optional(),
  author: z.string().trim().max(80).nullable().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  publishedAt: isoInstantSchema.nullable().optional(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(170).nullable().optional(),
  canonicalUrl: z.string().trim().max(300).nullable().optional(),
  ogTitle: z.string().trim().max(70).nullable().optional(),
  ogDescription: z.string().trim().max(200).nullable().optional(),
});

/** ── FAQ / settings / seo (admin) ───────────────────────────── */

export const faqWriteSchema = z.object({
  question: z.string().trim().min(2).max(200),
  answer: z.string().trim().min(2).max(2000),
  displayOrder: z.number().int().min(0).max(9999),
  active: z.boolean(),
});

export const settingsWriteSchema = z.object({
  settings: z.record(
    z.string().regex(/^[a-z_]{2,40}$/),
    z.string().max(1000),
  ),
});

export const seoWriteSchema = z.object({
  entityType: z.enum(['page', 'service', 'post']),
  entityId: z.string().trim().min(1).max(140),
  title: z.string().trim().min(2).max(70),
  description: z.string().trim().min(2).max(170),
  canonicalUrl: z.string().trim().max(300).nullable().optional(),
  ogImage: z.string().trim().max(500).nullable().optional(),
  noindex: z.boolean(),
});

/** ── Admin schema aliases / helpers ────────────────────────── */

export const createServiceSchema = serviceWriteSchema;
export const updateServiceSchema = serviceWriteSchema.partial();

export const updatePricingSchema = pricingWriteSchema.extend({
  currency: z.string().trim().max(10).optional(),
});

export const createStaffSchema = z.object({
  name: nameSchema,
  active: z.boolean().default(true),
  serviceIds: z.array(z.string().trim()).max(100).optional(),
});
export const updateStaffSchema = createStaffSchema.partial();

export const createBlogPostSchema = blogWriteSchema;
export const updateBlogPostSchema = blogWriteSchema.partial();

export const createFaqSchema = faqWriteSchema;
export const updateFaqSchema = faqWriteSchema.partial();

export const updateSettingsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export const updateCustomerSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  pricingCategory: z.enum(['female', 'male']).optional(),
  email: emailSchema.nullable().optional(),
  note: noteSchema.nullable().optional(),
});

/** ── Admin "operations console" endpoints (walk-in, CRM, accounting, SMS,
 *  lottery, festivals). These previously called request.json() unsafely; the
 *  schemas below match the payloads the admin pages actually submit, so no
 *  bad input can reach a D1 INSERT. ────────────────────────────────────── */

/* Must stay a subset of the D1 CHECK constraint:
   method IN ('pos', 'card_to_card', 'cash', 'online'), type IN ('income', 'expense', 'refund'). */
export const paymentMethodSchema = z.enum(['pos', 'cash', 'card_to_card', 'online']);
export const transactionTypeSchema = z.enum(['income', 'expense', 'refund']);
export const transactionCategorySchema = z.string().trim().min(1).max(60);

export const walkinBookSchema = z.object({
  customerId: z.string().trim().min(1).max(64).optional(),
  customerName: nameSchema.optional(),
  customerPhone: phoneSchema.optional(),
  pricingCategory: pricingCategorySchema.optional(),
  serviceId: z.string().trim().max(64).optional(),
  startsAt: isoInstantSchema.optional(),
  amount: z.number().int().min(0).max(1_000_000_000).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  adminNote: z.string().trim().max(500).optional(),
  note: z.string().trim().max(500).optional(),
  sessionNumber: z.number().int().min(1).max(200).optional(),
  totalSessions: z.number().int().min(1).max(200).optional(),
  deviceModel: z.string().trim().max(120).optional(),
  joulesEnergy: z.number().finite().min(0).max(200).optional(),
  pulseWidthMs: z.number().finite().min(0).max(1000).optional(),
  shotCount: z.number().int().min(0).max(100_000).optional(),
  skinReaction: z.string().trim().max(200).optional(),
  operatorName: z.string().trim().max(80).optional(),
  doctorNotes: z.string().trim().max(2000).optional(),
  scheduleNextSession: z.boolean().optional(),
  nextSessionDate: z.string().trim().max(40).nullable().optional(),
});
export type WalkinBookInput = z.infer<typeof walkinBookSchema>;

export const clinicalRecordSchema = z.object({
  customerId: z.string().trim().min(1).max(64),
  bookingId: z.string().trim().min(1).max(64).nullable().optional(),
  sessionNumber: z.number().int().min(1).max(200).optional(),
  totalSessions: z.number().int().min(1).max(200).optional(),
  treatedAreas: z.string().trim().max(500).optional(),
  deviceModel: z.string().trim().max(120).optional(),
  joulesEnergy: z.number().finite().min(0).max(200).optional(),
  pulseWidthMs: z.number().finite().min(0).max(1000).optional(),
  shotCount: z.number().int().min(0).max(100_000).optional(),
  skinReaction: z.string().trim().max(200).optional(),
  operatorName: z.string().trim().max(80).optional(),
  doctorNotes: z.string().trim().max(2000).nullable().optional(),
  nextSessionRecommendedAt: z.string().trim().max(40).nullable().optional(),
});
export type ClinicalRecordInput = z.infer<typeof clinicalRecordSchema>;

export const accountingTransactionSchema = z.object({
  customerId: z.string().trim().min(1).max(64).nullable().optional(),
  bookingId: z.string().trim().min(1).max(64).nullable().optional(),
  amount: z.number().int().min(0).max(1_000_000_000, 'مبلغ سند نامعتبر است.'),
  type: transactionTypeSchema.optional(),
  method: paymentMethodSchema.optional(),
  category: transactionCategorySchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  trackingNumber: z.string().trim().max(80).nullable().optional(),
});
export type AccountingTransactionInput = z.infer<typeof accountingTransactionSchema>;

export const sendSmsSchema = z.object({
  phone: phoneSchema,
  message: z.string().trim().min(1).max(1200, 'متن پیامک طولانی است.'),
  customerId: z.string().trim().min(1).max(64).nullable().optional(),
  templateName: z.string().trim().min(1).max(60).optional(),
});
export type SendSmsInput = z.infer<typeof sendSmsSchema>;

export const lotteryCampaignSchema = z.object({
  title: z.string().trim().min(2, 'عنوان دوره الزامی است.').max(120),
  prize: z.string().trim().min(1, 'جایزه الزامی است.').max(200),
  minSpending: z.number().finite().min(0).max(1_000_000_000).optional(),
  drawDate: z.string().trim().max(40).nullable().optional(),
});
export type LotteryCampaignInput = z.infer<typeof lotteryCampaignSchema>;

export const lotteryDrawSchema = z.object({
  campaignId: z.string().trim().min(1).max(64),
});
export type LotteryDrawInput = z.infer<typeof lotteryDrawSchema>;

export const discountFestivalSchema = z.object({
  title: z.string().trim().min(2, 'عنوان جشنواره الزامی است.').max(120),
  slug: slugSchema.optional(),
  /** D1 CHECK: discount_percent BETWEEN 1 AND 100, starts_at/ends_at NOT NULL. */
  discountPercent: z.number().int().min(1).max(100).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  bannerImage: z.string().trim().max(500).nullable().optional(),
  startsAt: z.string().trim().min(1).max(40),
  endsAt: z.string().trim().min(1).max(40),
  active: z.boolean().optional(),
});
export type DiscountFestivalInput = z.infer<typeof discountFestivalSchema>;

export const instagramSettingsSchema = z.object({
  username: z.string().trim().max(60).optional(),
  bioLink: z.string().trim().max(300).optional(),
  promoCode: z.string().trim().max(40).optional(),
  latestReel: z.string().trim().max(300).optional(),
  discountPercent: z.number().finite().min(0).max(100).optional(),
});
export type InstagramSettingsInput = z.infer<typeof instagramSettingsSchema>;
