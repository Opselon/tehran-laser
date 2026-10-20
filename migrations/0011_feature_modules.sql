-- 0011_feature_modules.sql — WordPress-style plugin/module registry.
--
-- The authoritative list of installable modules is IN CODE
-- (src/domain/features/registry.ts): the DB stores only per-module OVERRIDES,
-- so a row missing here means "run the module exactly as the registry defines
-- it". A row is written on the first admin change (enable/disable, config edit,
-- reorder) and DELETE /api/v1/admin/features/:key removes it again (reset).
--
-- Kept deliberately minimal so a module can never carry unvalidated state:
-- every write is validated against the registry's zod schema for that module's
-- config fields before it touches this table.

CREATE TABLE IF NOT EXISTS feature_modules (
  key           TEXT PRIMARY KEY,
  enabled       INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  config        TEXT NOT NULL DEFAULT '{}',
  updated_at    TEXT NOT NULL,
  updated_by    TEXT
);
