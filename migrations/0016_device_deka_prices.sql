-- 0016_device_deka_prices.sql — Two devices (Rado Plus + Deka) + owner price refresh
--
-- Source: the clinic's own price message (Kishlaser, 2026-11-23, WhatsApp).
-- Every amount below carries the owner's verbatim figure — no derived amounts
-- in this file. Amounts are in thousands of IRT (هزار تومان), same as 0004/0009/0014.
--
-- WHAT CHANGES
--   1. service_prices gains a `device` dimension ('rado' | 'deka'). SQLite cannot
--      ALTER a UNIQUE constraint, so the table is rebuilt: the old
--      UNIQUE(service_id, pricing_category) becomes
--      UNIQUE(service_id, pricing_category, device). All existing rows become
--      device='rado' — the site's only device until now.
--   2. bookings gains a `device` column (default 'rado') so the clinic can see
--      which device a reservation was made for.
--   3. Women's + men's Rado Plus prices are refreshed to the owner's new list.
--   4. Deka prices are inserted for exactly the zones the owner listed.
--   5. The men's list merges «زیر گردن» and «پشت سر» into ONE row
--      («زیر گردن و پشت سر» ۴۵۰ رادو / ۶۰۰ دکا). The site had them as two
--      separate services (svc_under_chin, svc_back_neck, 240 each) — a new
--      combined service (svc_under_chin_back_neck, display_order 108) replaces
--      them; the two old services are deactivated (their price rows stay as
--      history; existing bookings are unaffected).
--
-- NOT IN THE OWNER'S LIST (left at their 0004/0009/0014 values, editable in the
-- dashboard; no Deka row — Deka shows as «استعلام قیمت» for these zones):
--   Women: بازو (svc_upper_arm, 370), دور سینه (svc_chest, 145),
--          ران (svc_thigh, 570), کشاله ران (svc_inner_thigh, 390).
--   Men:   صورت (420)، پشت لب (130)، چانه (190)، گردن (250)، خط ناف (230)،
--          بیکینی (650)، باسن (460)، خط باسن (290)، ران (390)، کشاله ران (470)،
--          پیشانی (190)، پشت گوش (100)، سرشانه (590)، بازو (570).
-- The 15% online discount in settings (discount_percent=15, migration 0003)
-- matches the owner's «از سایت رزو بشه ۱۵٪ تخفیف» note and stays as-is.
-- The owner's «توان دستگاه ۱۸۰۰» note needs no change: the site already says
-- ۱۶۰۰ وات everywhere (DeviceShowcase + clinic page + 0010 content); no 1800
-- exists in code, DB or the live site.
--
-- SAFETY: price UPDATEs set absolute values (idempotent). Deka INSERTs use
-- deterministic ids. Re-running the file would fail on the PK/UNIQUE of the
-- INSERTs — migrations run once (wrangler journal), same as 0004/0009.

-- ── 1. Rebuild service_prices with the device dimension ──────────────
CREATE TABLE service_prices_new (
  id               TEXT PRIMARY KEY,
  service_id       TEXT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
  pricing_category TEXT NOT NULL CHECK (pricing_category IN ('male', 'female')),
  device           TEXT NOT NULL DEFAULT 'rado' CHECK (device IN ('rado', 'deka')),
  amount           INTEGER NOT NULL CHECK (amount >= 0),
  currency         TEXT NOT NULL DEFAULT 'IRT',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  UNIQUE (service_id, pricing_category, device)
);

INSERT INTO service_prices_new
  (id, service_id, pricing_category, device, amount, currency, created_at, updated_at)
SELECT id, service_id, pricing_category, 'rado', amount, currency, created_at, updated_at
  FROM service_prices;

DROP TABLE service_prices;
ALTER TABLE service_prices_new RENAME TO service_prices;

-- ── 2. Bookings carry the chosen device ───────────────────────────────
ALTER TABLE bookings
  ADD COLUMN device TEXT NOT NULL DEFAULT 'rado' CHECK (device IN ('rado', 'deka'));

-- ── 3. Combined men's neck service; deactivate the two split ones ─────
INSERT INTO services
  (id, name, slug, description, short_description, duration_minutes, active, featured, display_order, created_at, updated_at)
VALUES
  ('svc_under_chin_back_neck', 'زیر گردن و پشت سر', 'under-chin-back-neck',
   'لیزر موهای زائد زیر گردن و پشت سر — ناحیه ترکیبی',
   'زیر گردن و پشت سر', 30, 1, 0, 108,
   strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

UPDATE services
   SET active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE id IN ('svc_under_chin', 'svc_back_neck');

INSERT INTO service_prices
  (id, service_id, pricing_category, device, amount, currency, created_at, updated_at)
VALUES
  ('sp_rado_m_under_chin_back_neck', 'svc_under_chin_back_neck', 'male', 'rado', 450, 'IRT',
   strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('sp_deka_m_under_chin_back_neck', 'svc_under_chin_back_neck', 'male', 'deka', 600, 'IRT',
   strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- ── 4. Women's Rado Plus prices (OWNER, 2026-11-23) ───────────────────
UPDATE service_prices SET amount = 390,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_face'         AND pricing_category = 'female' AND device = 'rado'; -- OWNER «صورت کامل ۳۹۰»
UPDATE service_prices SET amount = 200,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_upper_lip'    AND pricing_category = 'female' AND device = 'rado'; -- OWNER «پشت لب ۲۰۰»
UPDATE service_prices SET amount = 140,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_chin'         AND pricing_category = 'female' AND device = 'rado'; -- OWNER «چانه ۱۴۰»
UPDATE service_prices SET amount = 250,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_neck'         AND pricing_category = 'female' AND device = 'rado'; -- OWNER «گردن ۲۵۰»
UPDATE service_prices SET amount = 400,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_underarm'     AND pricing_category = 'female' AND device = 'rado'; -- OWNER «زیر بغل ۴۰۰»
UPDATE service_prices SET amount = 590,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_arms'    AND pricing_category = 'female' AND device = 'rado'; -- OWNER «دست کامل ۵۹۰»
UPDATE service_prices SET amount = 450,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_forearm'      AND pricing_category = 'female' AND device = 'rado'; -- OWNER «ساق دست ۴۵۰»
UPDATE service_prices SET amount = 350,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_abdomen'      AND pricing_category = 'female' AND device = 'rado'; -- OWNER «شکم ۳۵۰»
UPDATE service_prices SET amount = 150,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_navel_line'   AND pricing_category = 'female' AND device = 'rado'; -- OWNER «خط ناف ۱۵۰»
UPDATE service_prices SET amount = 450,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_back'         AND pricing_category = 'female' AND device = 'rado'; -- OWNER «کمر ۴۵۰»
UPDATE service_prices SET amount = 550,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_bikini'       AND pricing_category = 'female' AND device = 'rado'; -- OWNER «بیکینی ۵۵۰»
UPDATE service_prices SET amount = 350,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_buttocks'     AND pricing_category = 'female' AND device = 'rado'; -- OWNER «باسن کامل ۳۵۰»
UPDATE service_prices SET amount = 200,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_gluteal_line' AND pricing_category = 'female' AND device = 'rado'; -- OWNER «خط باسن ۲۰۰»
UPDATE service_prices SET amount = 500,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_lower_leg'    AND pricing_category = 'female' AND device = 'rado'; -- OWNER «ساق پا ۵۰۰»
UPDATE service_prices SET amount = 2980, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_body'    AND pricing_category = 'female' AND device = 'rado'; -- OWNER «فول‌بادی بانوان ۲٬۹۸۰٬۰۰۰»

-- ── 5. Men's Rado Plus prices (OWNER, 2026-11-23) ─────────────────────
UPDATE service_prices SET amount = 250,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_ear'         AND pricing_category = 'male' AND device = 'rado'; -- OWNER «گوش ۲۵۰»
UPDATE service_prices SET amount = 350,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_beard_line'  AND pricing_category = 'male' AND device = 'rado'; -- OWNER «خط ریش ۳۵۰»
UPDATE service_prices SET amount = 500,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_underarm'    AND pricing_category = 'male' AND device = 'rado'; -- OWNER «زیر بغل ۵۰۰»
UPDATE service_prices SET amount = 600,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_chest'       AND pricing_category = 'male' AND device = 'rado'; -- OWNER «سینه ۶۰۰»
UPDATE service_prices SET amount = 550,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_abdomen'     AND pricing_category = 'male' AND device = 'rado'; -- OWNER «شکم ۵۵۰»
UPDATE service_prices SET amount = 650,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_back'        AND pricing_category = 'male' AND device = 'rado'; -- OWNER «کمر ۶۵۰»
UPDATE service_prices SET amount = 750,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_arms'   AND pricing_category = 'male' AND device = 'rado'; -- OWNER «دست کامل ۷۵۰»
UPDATE service_prices SET amount = 500,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_forearm'     AND pricing_category = 'male' AND device = 'rado'; -- OWNER «ساق دست ۵۰۰»
UPDATE service_prices SET amount = 900,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_legs'   AND pricing_category = 'male' AND device = 'rado'; -- OWNER «پا کامل ۹۰۰»
UPDATE service_prices SET amount = 650,  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_lower_leg'   AND pricing_category = 'male' AND device = 'rado'; -- OWNER «ساق پا ۶۵۰»
UPDATE service_prices SET amount = 3490, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_body'   AND pricing_category = 'male' AND device = 'rado'; -- OWNER «فول‌بادی آقایان ۳٬۴۹۰٬۰۰۰»

-- ── 6. Women's Deka prices (OWNER, 2026-11-23) ────────────────────────
INSERT INTO service_prices
  (id, service_id, pricing_category, device, amount, currency, created_at, updated_at)
VALUES
  ('sp_deka_f_face',         'svc_face',         'female', 'deka', 650,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «صورت کامل ۶۵۰»
  ('sp_deka_f_upper_lip',    'svc_upper_lip',    'female', 'deka', 300,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پشت لب ۳۰۰»
  ('sp_deka_f_chin',         'svc_chin',         'female', 'deka', 220,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «چانه ۲۲۰»
  ('sp_deka_f_neck',         'svc_neck',         'female', 'deka', 400,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «گردن ۴۰۰»
  ('sp_deka_f_underarm',     'svc_underarm',     'female', 'deka', 650,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «زیر بغل ۶۵۰»
  ('sp_deka_f_full_arms',    'svc_full_arms',    'female', 'deka', 950,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «دست کامل ۹۵۰»
  ('sp_deka_f_forearm',      'svc_forearm',      'female', 'deka', 700,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق دست ۷۰۰»
  ('sp_deka_f_abdomen',      'svc_abdomen',      'female', 'deka', 550,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «شکم ۵۵۰»
  ('sp_deka_f_navel_line',   'svc_navel_line',   'female', 'deka', 250,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «خط ناف ۲۵۰»
  ('sp_deka_f_back',         'svc_back',         'female', 'deka', 750,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «کمر ۷۵۰»
  ('sp_deka_f_bikini',       'svc_bikini',       'female', 'deka', 850,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «بیکینی ۸۵۰»
  ('sp_deka_f_buttocks',     'svc_buttocks',     'female', 'deka', 500,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «باسن کامل ۵۰۰»
  ('sp_deka_f_gluteal_line', 'svc_gluteal_line', 'female', 'deka', 300,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «خط باسن ۳۰۰»
  ('sp_deka_f_full_legs',    'svc_full_legs',    'female', 'deka', 1250, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پا کامل ۱٬۲۵۰»
  ('sp_deka_f_lower_leg',    'svc_lower_leg',    'female', 'deka', 800,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق پا ۸۰۰»
  ('sp_deka_f_full_body',    'svc_full_body',    'female', 'deka', 4980, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')); -- OWNER «فول‌بادی بانوان دکا ۴٬۹۸۰٬۰۰۰»

-- ── 7. Men's Deka prices (OWNER, 2026-11-23) ──────────────────────────
INSERT INTO service_prices
  (id, service_id, pricing_category, device, amount, currency, created_at, updated_at)
VALUES
  ('sp_deka_m_ear',        'svc_ear',        'male', 'deka', 350,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «گوش ۳۵۰»
  ('sp_deka_m_beard_line', 'svc_beard_line', 'male', 'deka', 500,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «خط ریش ۵۰۰»
  ('sp_deka_m_underarm',   'svc_underarm',   'male', 'deka', 700,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «زیر بغل ۷۰۰»
  ('sp_deka_m_chest',      'svc_chest',      'male', 'deka', 900,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «سینه ۹۰۰»
  ('sp_deka_m_abdomen',    'svc_abdomen',    'male', 'deka', 750,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «شکم ۷۵۰»
  ('sp_deka_m_back',       'svc_back',       'male', 'deka', 900,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «کمر ۹۰۰»
  ('sp_deka_m_full_arms',  'svc_full_arms',  'male', 'deka', 1150, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «دست کامل ۱٬۱۵۰»
  ('sp_deka_m_forearm',    'svc_forearm',    'male', 'deka', 750,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق دست ۷۵۰»
  ('sp_deka_m_full_legs',  'svc_full_legs',  'male', 'deka', 1400, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پا کامل ۱٬۴۰۰»
  ('sp_deka_m_lower_leg',  'svc_lower_leg',  'male', 'deka', 900,  'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق پا ۹۰۰»
  ('sp_deka_m_full_body',  'svc_full_body',  'male', 'deka', 5980, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')); -- OWNER «فول‌بادی آقایان دکا ۵٬۹۸۰٬۰۰۰»

-- ── 8. Homepage golden-package card config ────────────────────────────
-- The promo card's prices live in the pricing-table module config (registry
-- defaults updated in code alongside this migration). If an admin ever saved
-- an override holding the old prices, refresh it here; a missing row is a
-- no-op and the new registry defaults apply.
UPDATE feature_modules
   SET config = json_set(config, '$.promoOldPrice', '۲٬۹۸۰٬۰۰۰', '$.promoNewPrice', '۲٬۵۳۰٬۰۰۰'),
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pricing-table'
   AND json_extract(config, '$.promoOldPrice') = '۲٬۲۹۰٬۰۰۰';
