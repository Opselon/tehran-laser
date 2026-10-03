-- Tehran Laser — initial schema
-- Conventions:
--   * IDs are opaque TEXT (crypto.randomUUID() or stable seeded ids like 'svc_face').
--   * Timestamps are ISO-8601 UTC strings ('2026-10-03T09:30:00.000Z') — sortable as text.
--   * weekday: 0 = Saturday … 6 = Friday (Iranian week).
--   * Times of day ('HH:MM') are clinic-local wall clock in BUSINESS_TIMEZONE.
--   * Booleans are INTEGER 0/1 with CHECK constraints.

-- ─────────────────────────────────────────────────────────────
-- Users & RBAC
-- ─────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE UNIQUE INDEX users_email_unique ON users (email);

CREATE TABLE roles (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE permissions (
  key         TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

CREATE TABLE role_permissions (
  role_id        TEXT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES permissions (key) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Server-managed sessions. The cookie holds a raw random token; we persist only
-- its SHA-256 hash, so a database leak cannot be replayed as a session.
CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,        -- sha256(token)
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT
);

CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expires_idx ON sessions (expires_at);

-- ─────────────────────────────────────────────────────────────
-- Catalog: services & pricing
-- ─────────────────────────────────────────────────────────────

CREATE TABLE services (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 600),
  active            INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  featured          INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  display_order     INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE UNIQUE INDEX services_slug_unique ON services (slug);
CREATE INDEX services_active_order_idx ON services (active, display_order);

CREATE TABLE service_prices (
  id               TEXT PRIMARY KEY,
  service_id       TEXT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
  pricing_category TEXT NOT NULL CHECK (pricing_category IN ('male', 'female')),
  amount           INTEGER NOT NULL CHECK (amount >= 0),
  currency         TEXT NOT NULL DEFAULT 'IRT',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  UNIQUE (service_id, pricing_category)
);

-- ─────────────────────────────────────────────────────────────
-- Staff & schedule
-- ─────────────────────────────────────────────────────────────

CREATE TABLE staff (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  active     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE staff_services (
  staff_id   TEXT NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- Open hours per weekday as one or more segments (e.g. 09:00-13:00, 14:00-20:00).
-- A weekday with no rows is closed.
CREATE TABLE business_hours (
  id            TEXT PRIMARY KEY,
  weekday       INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at      TEXT NOT NULL,
  closes_at     TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  CHECK (opens_at < closes_at)
);

CREATE INDEX business_hours_weekday_idx ON business_hours (weekday, opens_at);

-- Day-level overrides: holidays, closed days, special hours, blocked time.
CREATE TABLE schedule_exceptions (
  id             TEXT PRIMARY KEY,
  exception_date TEXT NOT NULL,            -- 'YYYY-MM-DD' clinic-local
  kind           TEXT NOT NULL CHECK (kind IN
                     ('holiday', 'closed', 'special_hours', 'blocked_time', 'temporary_change')),
  opens_at       TEXT,                     -- required for special_hours / temporary_change / blocked_time
  closes_at      TEXT,
  note           TEXT,
  created_at     TEXT NOT NULL
);

CREATE INDEX schedule_exceptions_date_idx ON schedule_exceptions (exception_date);

-- ─────────────────────────────────────────────────────────────
-- Customers & bookings
-- ─────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,          -- canonical: +989035555090
  email            TEXT,
  pricing_category TEXT NOT NULL CHECK (pricing_category IN ('male', 'female')),
  note             TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE INDEX customers_phone_idx ON customers (phone);
CREATE INDEX customers_name_idx ON customers (name);

CREATE TABLE bookings (
  id               TEXT PRIMARY KEY,
  reference        TEXT NOT NULL,          -- human-friendly 'TL-8F4K2'
  customer_id      TEXT NOT NULL REFERENCES customers (id),
  service_id       TEXT NOT NULL REFERENCES services (id),
  staff_id         TEXT REFERENCES staff (id),   -- NULL = unassigned (clinic-level slot)
  pricing_category TEXT NOT NULL CHECK (pricing_category IN ('male', 'female')),
  starts_at        TEXT NOT NULL,          -- ISO UTC
  ends_at          TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN
                       ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show')),
  quoted_amount    INTEGER NOT NULL CHECK (quoted_amount >= 0),
  discount_amount  INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  currency         TEXT NOT NULL,
  customer_note    TEXT,
  admin_note       TEXT,
  rejection_reason TEXT,
  idempotency_key  TEXT,                   -- client-supplied, dedupes double submits
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  CHECK (starts_at < ends_at)
);

CREATE UNIQUE INDEX bookings_reference_unique ON bookings (reference);
CREATE UNIQUE INDEX bookings_idempotency_unique ON bookings (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX bookings_starts_at_idx ON bookings (starts_at);
CREATE INDEX bookings_status_starts_idx ON bookings (status, starts_at);
CREATE INDEX bookings_customer_idx ON bookings (customer_id, starts_at);
CREATE INDEX bookings_staff_starts_idx ON bookings (staff_id, starts_at);

-- Concurrency guard: one row per occupied slot (slot granularity from settings).
-- PRIMARY KEY (staff_key, slot_start) is the exclusion constraint — two bookings can
-- never claim the same slot, because booking + slots are written in one D1 batch and
-- a duplicate slot aborts the whole batch. staff_key = 'clinic' | 'staff:<id>'.
CREATE TABLE booking_slots (
  staff_key   TEXT NOT NULL,
  slot_start  TEXT NOT NULL,               -- ISO UTC, aligned to slot granularity
  booking_id  TEXT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  PRIMARY KEY (staff_key, slot_start)
);

CREATE INDEX booking_slots_booking_idx ON booking_slots (booking_id);

-- Operational activity timeline for a booking (no duplicated row snapshots).
CREATE TABLE booking_events (
  id         TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                -- created|confirmed|rejected|cancelled|rescheduled|completed|no_show|staff_changed
  actor_id   TEXT,                         -- users.id or NULL (customer/system)
  detail     TEXT,                         -- small, human-readable (e.g. '17:00 → 18:30')
  created_at TEXT NOT NULL
);

CREATE INDEX booking_events_booking_idx ON booking_events (booking_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- Content
-- ─────────────────────────────────────────────────────────────

CREATE TABLE blog_categories (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE blog_posts (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  excerpt         TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL,           -- portable markdown
  cover_image     TEXT,
  category_id     TEXT REFERENCES blog_categories (id) ON DELETE SET NULL,
  author          TEXT,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at    TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  canonical_url   TEXT,
  og_title        TEXT,
  og_description  TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE UNIQUE INDEX blog_posts_slug_unique ON blog_posts (slug);
CREATE INDEX blog_posts_status_published_idx ON blog_posts (status, published_at);

CREATE TABLE faq_items (
  id            TEXT PRIMARY KEY,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  updated_at    TEXT NOT NULL
);

CREATE INDEX faq_items_order_idx ON faq_items (active, display_order);

-- Per-entity SEO overrides (page = static route key, service/post = entity id).
CREATE TABLE seo_metadata (
  id           TEXT PRIMARY KEY,
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('page', 'service', 'post')),
  entity_id    TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  canonical_url TEXT,
  og_image     TEXT,
  noindex      INTEGER NOT NULL DEFAULT 0 CHECK (noindex IN (0, 1)),
  updated_at   TEXT NOT NULL,
  UNIQUE (entity_type, entity_id)
);

-- ─────────────────────────────────────────────────────────────
-- Settings, notifications, audit, rate limiting
-- ─────────────────────────────────────────────────────────────

-- scope='public' values may be served to browsers; scope='private' never leaves the server.
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  scope      TEXT NOT NULL CHECK (scope IN ('public', 'private')),
  updated_at TEXT NOT NULL
);

CREATE TABLE notification_events (
  id          TEXT PRIMARY KEY,
  dedupe_key  TEXT NOT NULL UNIQUE,        -- e.g. 'booking.confirmed:bookingid:telegram'
  event_type  TEXT NOT NULL,
  booking_id  TEXT REFERENCES bookings (id) ON DELETE CASCADE,
  channel     TEXT NOT NULL CHECK (channel IN ('telegram', 'whatsapp')),
  status      TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  attempts    INTEGER NOT NULL DEFAULT 0,
  last_error  TEXT,
  created_at  TEXT NOT NULL,
  sent_at     TEXT
);

CREATE INDEX notification_events_status_idx ON notification_events (status, created_at);
CREATE INDEX notification_events_booking_idx ON notification_events (booking_id);

CREATE TABLE audit_logs (
  id          TEXT PRIMARY KEY,
  actor_id    TEXT,
  action      TEXT NOT NULL,               -- 'booking.accepted', 'service.updated', 'admin.login' …
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX audit_logs_created_idx ON audit_logs (created_at);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);

-- Fixed-window counters for login / booking / public form rate limiting.
CREATE TABLE rate_limits (
  key               TEXT PRIMARY KEY,
  window_started_at TEXT NOT NULL,
  count             INTEGER NOT NULL DEFAULT 0,
  expires_at        TEXT NOT NULL
);

CREATE INDEX rate_limits_expires_idx ON rate_limits (expires_at);
