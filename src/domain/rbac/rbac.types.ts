/** Role / permission model. Mirrors migrations/0002_rbac.sql — single source of truth
 *  for what the server enforces (src/server/auth/rbac.ts) and what the UI may hide. */

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

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'EDITOR'] as const;

export type RoleKey = (typeof ROLES)[number];

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
