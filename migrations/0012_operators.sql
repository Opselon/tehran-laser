-- 0012 — Operator profiles (team roster, clinic identity, session ownership)
--
-- Business rule: the clinic has no fixed operator list. Any number of operators
-- must be addable at any time from the dashboard, each with a full profile
-- (identity, clinical role, services they can perform, weekly shift, commission)
-- and optionally a login account. Nothing here is required for a booking to
-- exist: `bookings.operator_id` is nullable and older rows stay valid.
--
-- Deliberately NO seed rows. "Default IS the absence" — an empty roster is a
-- first-class state the UI onboards from, not a broken one.

-- ─────────────────────────────────────────────────────────────
-- RBAC: operator permissions + the OPERATOR role
-- ─────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO permissions (key, description) VALUES
  ('operator.read',    'View operators and their profiles'),
  ('operator.write',   'Create, edit, reorder and archive operators'),
  ('operator.account', 'Issue or reset an operator login account');

INSERT OR IGNORE INTO roles (id, key, name, description) VALUES
  ('role_operator', 'OPERATOR', 'Operator', 'Clinical operator: own profile, assigned sessions');

-- SUPER_ADMIN already holds every permission, but it was granted before these
-- keys existed, so grant the new ones explicitly.
INSERT OR IGNORE INTO role_permissions (role_id, permission_key)
SELECT 'role_super_admin', key FROM permissions WHERE key LIKE 'operator.%';

INSERT OR IGNORE INTO role_permissions (role_id, permission_key) VALUES
  ('role_admin',    'operator.read'), ('role_admin',    'operator.write'), ('role_admin',    'operator.account'),
  ('role_manager',  'operator.read'), ('role_manager',  'operator.write'),
  ('role_operator', 'operator.read');

-- An OPERATOR account that could not read its own bookings would be a login
-- with no purpose, so the role carries the front-line read/completion set.
INSERT OR IGNORE INTO role_permissions (role_id, permission_key) VALUES
  ('role_operator', 'booking.read'),
  ('role_operator', 'booking.complete'),
  ('role_operator', 'customer.read'),
  ('role_operator', 'pricing.read'),
  ('role_operator', 'schedule.read');

-- ─────────────────────────────────────────────────────────────
-- Operators
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS operators (
  id                 TEXT PRIMARY KEY,
  -- Optional login account. NULL = roster-only profile (a technician who never
  -- signs in). ON DELETE SET NULL keeps the clinical history when a user goes.
  user_id            TEXT REFERENCES users (id) ON DELETE SET NULL,
  -- Optional link to the legacy scheduling staff row.
  staff_id           TEXT REFERENCES staff (id) ON DELETE SET NULL,
  code               TEXT NOT NULL,                 -- 'OP-01', stable, human-readable
  display_name       TEXT NOT NULL,
  phone              TEXT NOT NULL,                 -- canonical +98…
  email              TEXT,
  role_key           TEXT NOT NULL CHECK (role_key IN
                       ('doctor', 'laser_technician', 'skin_specialist', 'receptionist', 'manager', 'assistant')),
  title              TEXT NOT NULL DEFAULT '',      -- professional title shown on the profile
  bio                TEXT,
  avatar_color       TEXT NOT NULL DEFAULT '#d4af37',
  initials           TEXT NOT NULL,                 -- precomputed, 1-2 graphemes
  service_ids        TEXT NOT NULL DEFAULT '[]',    -- JSON array of services.id
  workdays           TEXT NOT NULL DEFAULT '[0,1,2,3,4,5]',  -- JSON array, 0 = Saturday
  shift_start        TEXT NOT NULL DEFAULT '09:00', -- clinic-local wall clock
  shift_end          TEXT NOT NULL DEFAULT '20:00',
  commission_percent INTEGER NOT NULL DEFAULT 0 CHECK (commission_percent BETWEEN 0 AND 100),
  monthly_target     INTEGER NOT NULL DEFAULT 0 CHECK (monthly_target >= 0),
  active             INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  sort_order         INTEGER NOT NULL DEFAULT 0,
  archived_at        TEXT,                          -- soft delete, keeps booking history
  created_by         TEXT,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL,
  CHECK (shift_start < shift_end)
);

CREATE UNIQUE INDEX IF NOT EXISTS operators_code_unique ON operators (code);
-- A phone may be reused only after its operator is archived, so a departing
-- employee never blocks the number for their replacement.
CREATE UNIQUE INDEX IF NOT EXISTS operators_phone_unique ON operators (phone) WHERE archived_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS operators_user_unique ON operators (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS operators_roster_idx ON operators (archived_at, active, sort_order, display_name);

-- ─────────────────────────────────────────────────────────────
-- Session ownership
-- ─────────────────────────────────────────────────────────────

ALTER TABLE bookings ADD COLUMN operator_id TEXT REFERENCES operators (id) ON DELETE SET NULL;
ALTER TABLE customer_clinical_records ADD COLUMN operator_id TEXT REFERENCES operators (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_operator_starts_idx ON bookings (operator_id, starts_at);
CREATE INDEX IF NOT EXISTS clinical_records_operator_idx ON customer_clinical_records (operator_id, created_at);
