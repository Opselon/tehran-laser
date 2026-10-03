/** Server-side authorization. Hiding a button is never authorization (contract §55) —
 *  every admin route re-checks authentication + permission here. */

import type { AuthUser, Permission } from '../../domain/rbac/rbac.types';
import { ApiError } from '../../lib/api/errors';

export function currentAuth(locals: App.Locals): AuthUser | null {
  return locals.auth ?? null;
}

export function requireAuth(locals: App.Locals): AuthUser {
  const auth = currentAuth(locals);
  if (!auth) throw new ApiError('AUTH_REQUIRED', 'ابتدا وارد شوید.');
  return auth;
}

export function requirePermission(locals: App.Locals, permission: Permission): AuthUser {
  const auth = requireAuth(locals);
  if (!auth.permissions.includes(permission)) {
    throw new ApiError('FORBIDDEN', 'شما مجوز انجام این عملیات را ندارید.');
  }
  return auth;
}
