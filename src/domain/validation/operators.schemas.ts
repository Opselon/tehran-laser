/**
 * Operator write schemas.
 *
 * Same contract as the rest of `domain/validation`: everything that crosses the
 * boundary is parsed, unknown keys are refused (`.strict()`), and field messages
 * are Persian because they surface verbatim in the form.
 *
 * The create schema validates the *whole* operator, while the update schema is a
 * partial: PUT merges onto the stored row and the merged result is re-validated
 * server-side, so `{ "shiftStart": "08:00" }` alone is a legal request but an
 * illegal final state is still refused.
 */

import { z } from 'zod';
import { ROLES } from '../rbac/rbac.types';
import { OPERATOR_ROLE_KEYS, isOperatorRoleKey } from '../operators/catalog';
import {
  EMAIL_PATTERN,
  normalizeDisplayName,
  normalizePhoneInput,
  normalizeWorkdays,
  validateShiftWindow,
} from '../operators/operators';

export const operatorRoleSchema = z.enum(OPERATOR_ROLE_KEYS);

/** Persian/Arabic digits and 09… forms are accepted; the output is canonical +98. */
export const operatorPhoneSchema = z
  .string()
  .trim()
  .min(4)
  .max(24)
  .transform((value, ctx) => {
    const canonical = normalizePhoneInput(value);
    if (!canonical) {
      ctx.addIssue({ code: 'custom', message: 'شماره تماس معتبر نیست.' });
      return z.NEVER;
    }
    return canonical;
  });

export const operatorEmailSchema = z
  .string()
  .trim()
  .max(160)
  .refine((value) => value === '' || EMAIL_PATTERN.test(value.toLowerCase()), {
    message: 'ایمیل معتبر نیست.',
  })
  .transform((value) => value.toLowerCase());

export const operatorClockSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'ساعت باید به شکل HH:MM باشد.');

export const operatorWorkdaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1, 'حداقل یک روز کاری انتخاب کنید.')
  .max(7)
  .transform((days) => normalizeWorkdays(days));

export const operatorShiftSchema = z
  .object({ shiftStart: operatorClockSchema, shiftEnd: operatorClockSchema })
  .refine((value) => validateShiftWindow(value.shiftStart, value.shiftEnd) === 'ok', {
    message: 'بازه شیفت معتبر نیست؛ پایان باید بعد از شروع و حداکثر ۱۶ ساعت باشد.',
    path: ['shiftEnd'],
  });

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'رنگ باید کد هگز شش‌رقمی باشد.');

const serviceIdListSchema = z
  .array(z.string().trim().min(1).max(64))
  .max(40)
  .transform((ids) => [...new Set(ids)]);

export const operatorCreateSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'نام و نام خانوادگی را کامل وارد کنید.')
      .max(80)
      .transform((value) => normalizeDisplayName(value)),
    phone: operatorPhoneSchema,
    email: operatorEmailSchema.nullable().optional(),
    roleKey: operatorRoleSchema,
    title: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(600).nullable().optional(),
    avatarColor: hexColorSchema.optional(),
    serviceIds: serviceIdListSchema.optional(),
    workdays: operatorWorkdaysSchema.optional(),
    shiftStart: operatorClockSchema.optional(),
    shiftEnd: operatorClockSchema.optional(),
    commissionPercent: z.number().int().min(0).max(100).optional(),
    monthlyTarget: z.number().int().min(0).max(100_000_000_000).optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.shiftStart === undefined && value.shiftEnd === undefined) return;
    const start = value.shiftStart ?? '09:00';
    const end = value.shiftEnd ?? '20:00';
    const result = validateShiftWindow(start, end);
    if (result !== 'ok') {
      ctx.addIssue({
        code: 'custom',
        message: 'بازه شیفت معتبر نیست؛ پایان باید بعد از شروع و بین ۳۰ دقیقه تا ۱۶ ساعت باشد.',
        path: ['shiftStart'],
      });
    }
  });

export type OperatorCreateParsed = z.infer<typeof operatorCreateSchema>;

export const operatorUpdateSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'نام و نام خانوادگی را کامل وارد کنید.')
      .max(80)
      .transform((value) => normalizeDisplayName(value))
      .optional(),
    phone: operatorPhoneSchema.optional(),
    email: operatorEmailSchema.nullable().optional(),
    roleKey: operatorRoleSchema.optional(),
    title: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(600).nullable().optional(),
    avatarColor: hexColorSchema.optional(),
    serviceIds: serviceIdListSchema.optional(),
    workdays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
    shiftStart: operatorClockSchema.optional(),
    shiftEnd: operatorClockSchema.optional(),
    commissionPercent: z.number().int().min(0).max(100).optional(),
    monthlyTarget: z.number().int().min(0).max(100_000_000_000).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(100_000).optional(),
  })
  .strict();

export type OperatorUpdateParsed = z.infer<typeof operatorUpdateSchema>;

/** Self-service edits: an operator may fix their own contact details and look,
 *  but never their role, commission or shift (that is the manager's call). */
export const operatorSelfUpdateSchema = z
  .object({
    phone: operatorPhoneSchema.optional(),
    email: operatorEmailSchema.nullable().optional(),
    bio: z.string().trim().max(600).nullable().optional(),
    avatarColor: hexColorSchema.optional(),
    title: z.string().trim().max(80).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.phone !== undefined ||
      value.email !== undefined ||
      value.bio !== undefined ||
      value.avatarColor !== undefined ||
      value.title !== undefined,
    { message: 'حداقل یک فیلد برای ویرایش لازم است.' },
  );

/** Active/inactive flip. Separate from PUT so the roster toggle is a single
 *  field write with its own audit action, not a partial profile update. */
export const operatorStatusUpdateSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

export const operatorReorderSchema = z
  .object({
    order: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(64),
          sortOrder: z.number().int().min(0).max(100_000),
        }),
      )
      .min(1)
      .max(100),
  })
  .strict();

export const operatorAccountSchema = z
  .object({
    email: operatorEmailSchema.optional(),
    /** RBAC role for the issued login. Defaults to the clinical role's mapping. */
    role: z.enum(ROLES).optional(),
    /** Optional explicit password; omitted → the server generates one and returns
     *  it exactly once in the response. */
    password: z.string().min(10, 'رمز عبور حداقل ۱۰ کاراکتر است.').max(72).optional(),
  })
  .strict();

export const operatorAssignSchema = z
  .object({
    operatorId: z.string().trim().min(1).max(64).nullable(),
  })
  .strict();

/** Query for the roster endpoint. Values arrive as strings, hence the coercion. */
export const operatorListQuerySchema = z
  .object({
    q: z.string().trim().max(80).optional(),
    role: z.string().trim().max(40).optional(),
    status: z.enum(['all', 'active', 'inactive', 'archived']).optional(),
    serviceId: z.string().trim().max(64).optional(),
    weekday: z.coerce.number().int().min(0).max(6).optional(),
    sort: z.enum(['order', 'name', 'sessions', 'revenue', 'utilization', 'recent']).optional(),
  })
  .strict();

export function isOperatorRoleValue(value: string | undefined): boolean {
  return value === undefined || isOperatorRoleKey(value);
}
