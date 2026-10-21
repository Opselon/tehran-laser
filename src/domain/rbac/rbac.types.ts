/** Role / permission model. Mirrors migrations/0001_init.sql + 0002_rbac.sql + 0012_operators.sql
 *  — single source of truth for what the server enforces (src/server/auth/guard.ts) and
 *  what the UI may hide. Adding a permission here without a matching row in a migration
 *  means the UI believes it can do something the server will refuse: keep them in lockstep. */

export const PERMISSIONS = [
  'booking.read',
  'booking.create',
  'booking.update',
  'booking.accept',
  'booking.reject',
  'booking.cancel',
  'booking.reschedule',
  'booking.complete',
  'customer.read',
  'customer.update',
  'service.read',
  'service.write',
  'pricing.read',
  'pricing.write',
  'staff.read',
  'staff.write',
  'operator.read',
  'operator.write',
  'operator.account',
  'schedule.read',
  'schedule.write',
  'blog.read',
  'blog.write',
  'blog.publish',
  'seo.read',
  'seo.write',
  'settings.read',
  'settings.write',
  'audit.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'OPERATOR', 'EDITOR'] as const;

export type RoleKey = (typeof ROLES)[number];

/** Human labels for the dashboard. The UI reads these instead of branching on
 *  a hardcoded role string, so a new role never renders as a raw key. */
export const ROLE_LABELS: Record<RoleKey, { fa: string; en: string }> = {
  SUPER_ADMIN: { fa: 'مدیر ارشد', en: 'Super admin' },
  ADMIN: { fa: 'مدیر سیستم', en: 'Administrator' },
  MANAGER: { fa: 'مدیر کلینیک', en: 'Manager' },
  STAFF: { fa: 'پذیرش', en: 'Front desk' },
  OPERATOR: { fa: 'اپراتور', en: 'Operator' },
  EDITOR: { fa: 'نویسنده محتوا', en: 'Editor' },
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  'booking.read': 'مشاهده نوبت‌ها',
  'booking.create': 'ثبت نوبت',
  'booking.update': 'ویرایش نوبت',
  'booking.accept': 'تأیید نوبت',
  'booking.reject': 'رد نوبت',
  'booking.cancel': 'لغو نوبت',
  'booking.reschedule': 'جابه‌جایی نوبت',
  'booking.complete': 'ثبت انجام جلسه',
  'customer.read': 'مشاهده مراجعین',
  'customer.update': 'ویرایش مراجعین',
  'service.read': 'مشاهده خدمات',
  'service.write': 'مدیریت خدمات',
  'pricing.read': 'مشاهده تعرفه‌ها',
  'pricing.write': 'ویرایش تعرفه‌ها',
  'staff.read': 'مشاهده کارکنان',
  'staff.write': 'مدیریت کارکنان',
  'operator.read': 'مشاهده تیم اپراتور',
  'operator.write': 'مدیریت تیم اپراتور',
  'operator.account': 'صدور حساب اپراتور',
  'schedule.read': 'مشاهده برنامه کاری',
  'schedule.write': 'ویرایش برنامه کاری',
  'blog.read': 'مشاهده مقالات',
  'blog.write': 'نوشتن مقاله',
  'blog.publish': 'انتشار مقاله',
  'seo.read': 'مشاهده سئو',
  'seo.write': 'ویرایش سئو',
  'settings.read': 'مشاهده تنظیمات',
  'settings.write': 'تغییر تنظیمات',
  'audit.read': 'مشاهده گزارش وقایع',
};

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: RoleKey[];
  permissions: Permission[];
}

export function hasPermission(user: Pick<AuthUser, 'permissions'>, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/** True when the user holds at least one of the given permissions. Used by pages
 *  that render one surface for several roles (read-only vs editable). */
export function hasAnyPermission(
  user: Pick<AuthUser, 'permissions'>,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => user.permissions.includes(permission));
}
