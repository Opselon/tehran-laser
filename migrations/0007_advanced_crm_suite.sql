-- 0007_advanced_crm_suite.sql: CRM, Dossier, Accounting, SMS, Lottery, Festivals

CREATE TABLE IF NOT EXISTS customer_clinical_records (
  id                          TEXT PRIMARY KEY,
  customer_id                 TEXT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  booking_id                  TEXT REFERENCES bookings (id) ON DELETE SET NULL,
  session_number              INTEGER NOT NULL DEFAULT 1,
  total_sessions              INTEGER NOT NULL DEFAULT 8,
  treated_areas               TEXT NOT NULL,
  device_model                TEXT NOT NULL DEFAULT 'الکساندرایت کندلا جنتل پرو مکس ۲۰۲۶',
  joules_energy               REAL DEFAULT 14.0,
  pulse_width_ms              REAL DEFAULT 3.0,
  shot_count                  INTEGER DEFAULT 450,
  skin_reaction               TEXT DEFAULT 'مختصری اریتم طبیعی و خفیف',
  operator_name               TEXT NOT NULL DEFAULT 'تیم اپراتور کلینیک',
  doctor_notes                TEXT,
  next_session_recommended_at TEXT,
  created_at                  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS customer_clinical_records_cust_idx ON customer_clinical_records (customer_id);

CREATE TABLE IF NOT EXISTS accounting_transactions (
  id              TEXT PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  customer_id     TEXT REFERENCES customers (id) ON DELETE SET NULL,
  booking_id      TEXT REFERENCES bookings (id) ON DELETE SET NULL,
  amount          INTEGER NOT NULL, -- هزار تومان
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense', 'refund')),
  method          TEXT NOT NULL CHECK (method IN ('pos', 'card_to_card', 'cash', 'online')),
  category        TEXT NOT NULL,
  description     TEXT,
  tracking_number TEXT,
  created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS accounting_transactions_created_idx ON accounting_transactions (created_at);

CREATE TABLE IF NOT EXISTS sms_logs (
  id            TEXT PRIMARY KEY,
  phone         TEXT NOT NULL,
  customer_id   TEXT REFERENCES customers (id) ON DELETE SET NULL,
  message       TEXT NOT NULL,
  template_name TEXT NOT NULL DEFAULT 'custom',
  status        TEXT NOT NULL CHECK (status IN ('delivered', 'sent', 'failed')),
  cost          INTEGER NOT NULL DEFAULT 150, -- ریال
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sms_logs_created_idx ON sms_logs (created_at);

CREATE TABLE IF NOT EXISTS lottery_campaigns (
  id                 TEXT PRIMARY KEY,
  title              TEXT NOT NULL,
  prize              TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('active', 'completed', 'upcoming')),
  min_spending       INTEGER NOT NULL DEFAULT 0,
  winner_customer_id TEXT REFERENCES customers (id) ON DELETE SET NULL,
  winner_name        TEXT,
  winner_phone       TEXT,
  draw_date          TEXT,
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discount_festivals (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  description      TEXT,
  banner_image     TEXT,
  starts_at        TEXT NOT NULL,
  ends_at          TEXT NOT NULL,
  active           INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL
);

-- Seed initial records so panels have realistic initial state
INSERT OR IGNORE INTO discount_festivals (
  id, title, slug, discount_percent, description, banner_image, starts_at, ends_at, active, created_at
) VALUES (
  'fest_autumn_2026',
  'جشنواره طلایی پاییزه تهران لیزر',
  'autumn-laser-gala',
  20,
  'تخفیف استثنایی ۲۰ درصدی برای پکیج‌های فول بادی و مراجعین اولی با دستگاه الکساندرایت کندلا ۲۰۲۶',
  'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80',
  '2026-09-23T00:00:00Z',
  '2026-11-21T23:59:59Z',
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO lottery_campaigns (
  id, title, prize, status, min_spending, draw_date, created_at
) VALUES (
  'lottery_mhr_1405',
  'قرعه‌کشی بزرگ مراجعین مهر ماه ۱۴۰۵',
  'یک پکیج کامل فول‌بادی رایگان + ۳ بن تخفیف ۵۰٪ برای همراه',
  'active',
  300,
  '2026-10-30',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO sms_logs (
  id, phone, message, template_name, status, cost, created_at
) VALUES (
  'sms_sample_1',
  '+989016807808',
  'مراجع گرامی، نوبت لیزر شما در کلینیک تهران لیزر برای فردا ساعت ۱۹:۳۰ تأیید گردید. نشانی: پاسداران، خ پایدارفرد.',
  'booking_confirm',
  'delivered',
  140,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO accounting_transactions (
  id, reference, amount, type, method, category, description, tracking_number, created_at
) VALUES 
  ('tx_sample_1', 'TX-80412', 1940, 'income', 'pos', 'laser_service', 'دریافت هزینه نوبت پکیج کل بدن بانوان', 'POS-89421', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('tx_sample_2', 'TX-80413', 320, 'income', 'card_to_card', 'laser_service', 'بیعانه نوبت لیزر صورت', 'CARD-11029', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('tx_sample_3', 'TX-80414', 450, 'expense', 'pos', 'device_maintenance', 'تهیه عینک محافظ و تجهیزات بهداشتی یکبارمصرف', 'POS-33100', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
