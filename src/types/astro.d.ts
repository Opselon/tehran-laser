declare namespace App {
  interface Locals {
    /** Populated by src/middleware.ts for /admin, /api/v1/admin and /api/v1/me. */
    auth: import('../domain/rbac/rbac.types').AuthUser | null;
  }
}
