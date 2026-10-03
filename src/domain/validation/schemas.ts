import { z } from 'zod';
import { PRICING_CATEGORIES } from '../booking/booking.types';

/** Validation shared by API routes and server services. Everything that crosses a
 *  boundary is parsed here — the client is never trusted. */

export const pricingCategorySchema = z.enum(PRICING_CATEGORIES);

/** Accepts 09121234567, +989121234567, 00989121234567, 9121234567 → canonical +989121234567. */
export const phoneSchema = z
  .string()
  .trim()
  .min(4)
  .max(24)
  .transform((value) => value.replace(/[\s\-().]/g, ''))
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

export const createBookingSchema = z.object({
  serviceSlug: slugSchema,
  pricingCategory: pricingCategorySchema,
  startsAt: isoInstantSchema,
  customerName: nameSchema,
  customerPhone: phoneSchema,
  customerEmail: emailSchema.optional(),
  note: noteSchema.optional(),
  /** Client-generated token that dedupes accidental double submits. */
  idempotencyKey: z.string().trim().min(8).max(64).optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** ── Availability query ─────────────────────────────────────── */

export const availabilityQuerySchema = z.object({
  service: slugSchema,
  date: localDateSchema,
  category: pricingCategorySchema,
  staffId: z.string().trim().min(1).max(64).optional(),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

/** ── Admin booking actions ──────────────────────────────────── */

export const rejectBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
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
