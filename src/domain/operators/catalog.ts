/**
 * Operator catalog — the closed vocabulary of the team module.
 *
 * Everything the dashboard offers (clinical roles, avatar accents, weekday
 * labels, ready-made roster entries) is declared here once. The API validates
 * against these keys, the form renders these labels, and the profile page
 * reads the same icons; a new role is one entry, not five edits.
 *
 * No DB rows mirror this file: `operators.role_key` stores the key, and the
 * label/icon/accent are resolved at read time. That keeps a wording change a
 * deploy-only change instead of a migration.
 */

import type { RoleKey } from '../rbac/rbac.types';

/** Clinical role. Distinct from the RBAC role (`RoleKey`): a laser technician
 *  is a clinical identity, OPERATOR is what their login may do. */
export const OPERATOR_ROLE_KEYS = [
  'doctor',
  'laser_technician',
  'skin_specialist',
  'receptionist',
  'manager',
  'assistant',
] as const;

export type OperatorRoleKey = (typeof OPERATOR_ROLE_KEYS)[number];

export interface OperatorRoleDefinition {
  key: OperatorRoleKey;
  /** Persian label — the only string the UI should show for this role. */
  label: string;
  short: string;
  /** Default professional title prefilled into the create form. */
  defaultTitle: string;
  /** Icon.astro glyph name. */
  icon: string;
  /** Default avatar accent (hex) for a new operator of this role. */
  accent: string;
  /** RBAC role granted when a login account is issued. */
  accessRole: RoleKey;
  /** Whether this role can own a treatment session (drives the agenda copy). */
  performsSessions: boolean;
  /** One-line explanation used by the role picker. */
  hint: string;
}

export const OPERATOR_ROLE_CATALOG: readonly OperatorRoleDefinition[] = [
  {
    key: 'doctor',
    label: 'پزشک',
    short: 'پزشک',
    defaultTitle: 'متخصص پوست، مو و زیبایی',
    icon: 'doctor',
    accent: '#38bdf8',
    accessRole: 'MANAGER',
    performsSessions: true,
    hint: 'تأیید پروتکل درمانی، نظارت بالینی و ویزیت',
  },
  {
    key: 'laser_technician',
    label: 'تکنسین لیزر',
    short: 'تکنسین',
    defaultTitle: 'اپراتور دستگاه لیزر',
    icon: 'instant',
    accent: '#d4af37',
    accessRole: 'OPERATOR',
    performsSessions: true,
    hint: 'اجرای جلسات لیزر و ثبت پرونده بالینی',
  },
  {
    key: 'skin_specialist',
    label: 'کارشناس پوست',
    short: 'کارشناس',
    defaultTitle: 'کارشناس ارشد پوست',
    icon: 'droplet',
    accent: '#f0abfc',
    accessRole: 'OPERATOR',
    performsSessions: true,
    hint: 'آنالیز پوست، مشاوره و پیگیری درمان',
  },
  {
    key: 'receptionist',
    label: 'پذیرش',
    short: 'پذیرش',
    defaultTitle: 'مسئول پذیرش و نوبت‌دهی',
    icon: 'customers',
    accent: '#34d399',
    accessRole: 'STAFF',
    performsSessions: false,
    hint: 'پذیرش مراجع، هماهنگی نوبت و صندوق',
  },
  {
    key: 'manager',
    label: 'مدیر کلینیک',
    short: 'مدیر',
    defaultTitle: 'مدیر عملیات کلینیک',
    icon: 'shield',
    accent: '#fbbf24',
    accessRole: 'MANAGER',
    performsSessions: false,
    hint: 'نظارت بر تیم، شیفت‌ها و شاخص‌های عملکرد',
  },
  {
    key: 'assistant',
    label: 'دستیار',
    short: 'دستیار',
    defaultTitle: 'دستیار اپراتور',
    icon: 'users',
    accent: '#94a3b8',
    accessRole: 'OPERATOR',
    performsSessions: false,
    hint: 'آماده‌سازی اتاق، پشتیبانی جلسه و ابزار',
  },
];

const ROLE_BY_KEY = new Map<string, OperatorRoleDefinition>(
  OPERATOR_ROLE_CATALOG.map((role) => [role.key, role]),
);

export function findOperatorRole(key: string | null | undefined): OperatorRoleDefinition | null {
  if (!key) return null;
  return ROLE_BY_KEY.get(key) ?? null;
}

/** Never throws: an unknown key (a row written by a future deploy, then rolled
 *  back) falls back to the first catalog entry so a profile still renders. */
export function operatorRoleOrDefault(key: string | null | undefined): OperatorRoleDefinition {
  return findOperatorRole(key) ?? OPERATOR_ROLE_CATALOG[0]!;
}

export function isOperatorRoleKey(value: unknown): value is OperatorRoleKey {
  return typeof value === 'string' && ROLE_BY_KEY.has(value);
}

/** Avatar accent palette. Restrained on purpose: the roster is a wall of small
 *  circles, so colours must differentiate without competing with the gold UI. */
export interface OperatorAccent {
  hex: string;
  label: string;
}

export const OPERATOR_ACCENTS: readonly OperatorAccent[] = [
  { hex: '#d4af37', label: 'طلایی' },
  { hex: '#38bdf8', label: 'آبی' },
  { hex: '#34d399', label: 'سبز' },
  { hex: '#a78bfa', label: 'بنفش' },
  { hex: '#fb7185', label: 'سرخ' },
  { hex: '#fbbf24', label: 'کهربایی' },
  { hex: '#2dd4bf', label: 'فیروزه‌ای' },
  { hex: '#f0abfc', label: 'ارغوانی' },
  { hex: '#94a3b8', label: 'خاکستری' },
  { hex: '#fb923c', label: 'نارنجی' },
];

export const DEFAULT_ACCENT = '#d4af37';

export function isKnownAccent(hex: string): boolean {
  return OPERATOR_ACCENTS.some((accent) => accent.hex.toLowerCase() === hex.toLowerCase());
}

/** Weekday catalog. 0 = Saturday … 6 = Friday, matching business_hours. */
export interface WorkdayDefinition {
  index: number;
  label: string;
  short: string;
  en: string;
}

export const WORKDAYS: readonly WorkdayDefinition[] = [
  { index: 0, label: 'شنبه', short: 'ش', en: 'Saturday' },
  { index: 1, label: 'یکشنبه', short: 'ی', en: 'Sunday' },
  { index: 2, label: 'دوشنبه', short: 'د', en: 'Monday' },
  { index: 3, label: 'سه‌شنبه', short: 'س', en: 'Tuesday' },
  { index: 4, label: 'چهارشنبه', short: 'چ', en: 'Wednesday' },
  { index: 5, label: 'پنجشنبه', short: 'پ', en: 'Thursday' },
  { index: 6, label: 'جمعه', short: 'ج', en: 'Friday' },
];

export const DEFAULT_WORKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5];

export function workdayLabel(index: number): string {
  return WORKDAYS.find((day) => day.index === index)?.label ?? '—';
}

export const OPERATOR_STATUSES = ['active', 'inactive', 'archived'] as const;
export type OperatorStatus = (typeof OPERATOR_STATUSES)[number];

export const OPERATOR_STATUS_LABELS: Record<OperatorStatus, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  archived: 'بایگانی‌شده',
};

/** Sort options exposed by the roster toolbar. */
export const OPERATOR_SORTS = ['order', 'name', 'sessions', 'revenue', 'utilization', 'recent'] as const;
export type OperatorSortKey = (typeof OPERATOR_SORTS)[number];

export const OPERATOR_SORT_LABELS: Record<OperatorSortKey, string> = {
  order: 'چیدمان دلخواه',
  name: 'نام (الفبا)',
  sessions: 'بیشترین جلسه',
  revenue: 'بیشترین درآمد',
  utilization: 'بیشترین بهره‌وری',
  recent: 'تازه‌ترین',
};

/** Shift presets offered as one-tap chips in the form. */
export const SHIFT_PRESETS: readonly { label: string; start: string; end: string }[] = [
  { label: 'صبح', start: '09:00', end: '14:00' },
  { label: 'عصر', start: '15:00', end: '20:00' },
  { label: 'تمام‌وقت', start: '09:00', end: '20:00' },
  { label: 'شیفت بلند', start: '10:00', end: '21:00' },
];

/** One-tap roster entries for the empty state. Additive: they prefill the form,
 *  the operator is still created by a real POST. */
export interface OperatorTemplate {
  key: string;
  label: string;
  description: string;
  roleKey: OperatorRoleKey;
  workdays: number[];
  shiftStart: string;
  shiftEnd: string;
  commissionPercent: number;
}

export const OPERATOR_TEMPLATES: readonly OperatorTemplate[] = [
  {
    key: 'laser-tech',
    label: 'تکنسین لیزر',
    description: 'شیفت صبح تا عصر، کمیسیون ۱۵٪',
    roleKey: 'laser_technician',
    workdays: [0, 1, 2, 3, 4, 5],
    shiftStart: '09:00',
    shiftEnd: '20:00',
    commissionPercent: 15,
  },
  {
    key: 'doctor',
    label: 'پزشک کلینیک',
    description: 'سه روز در هفته، شیفت عصر',
    roleKey: 'doctor',
    workdays: [1, 3, 5],
    shiftStart: '16:00',
    shiftEnd: '21:00',
    commissionPercent: 25,
  },
  {
    key: 'reception',
    label: 'پذیرش',
    description: 'شیفت صبح، بدون کمیسیون درمان',
    roleKey: 'receptionist',
    workdays: [0, 1, 2, 3, 4, 5],
    shiftStart: '09:30',
    shiftEnd: '17:00',
    commissionPercent: 0,
  },
  {
    key: 'assistant',
    label: 'دستیار',
    description: 'پشتیبانی جلسات، شیفت عصر',
    roleKey: 'assistant',
    workdays: [0, 2, 4],
    shiftStart: '15:00',
    shiftEnd: '21:00',
    commissionPercent: 5,
  },
];

export function findTemplate(key: string): OperatorTemplate | null {
  return OPERATOR_TEMPLATES.find((template) => template.key === key) ?? null;
}
