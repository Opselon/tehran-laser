-- ─────────────────────────────────────────────────────────────────────────────
-- 0009_male_prices.sql — Men's price catalogue + men's-only zones
-- Tehran Laser UI/UX wave — Lane B (worktree .w-b / branch wave/b)
--
-- WHAT THIS DOES
--   1. Adds the 7 men's-only zones the owner listed that have no existing
--      service row: پیشانی / خط ریش / گوش / پشت گوش / زیرگردن / پشت گردن / سرشانه.
--      (The owner's remaining men's item, «ساق دست», maps to the EXISTING
--      `forearm` slug — no duplicate zone is created.)
--   2. Populates a `male` amount for every existing zone that supports it, so
--      the public table can render ویژه بانوان | ویژه آقایان side by side and
--      the already-built admin male-price editor has rows to edit.
--
-- AMOUNTS ARE IN THOUSANDS OF IRT (330 renders as ۳۳۰٬۰۰۰ تومان).
--
-- PROVENANCE — OWNER vs DERIVED (see src/data/male-pricing.ts for the register):
--   • OWNER   = figure taken verbatim from the owner's combined list.
--   • DERIVED = no owner figure existed; derived for the Iranian market at
--               1.0–1.5× the women's amount. The owner should confirm these.
--   Bikini & gluteal-line are female-only anatomically; a men's amount is still
--   stored (DERIVED) so the dashboard can edit or clear it, and so the unified
--   table never has a silent hole.
--
-- SAFETY: touches only `services` and `service_prices`. No users/sessions rows.
-- Idempotent: INSERT OR IGNORE against the existing unique indexes
--   (services.slug UNIQUE, service_prices UNIQUE(service_id, pricing_category)).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Men's-only zones (display_order 101+ keeps them after the 20 women's zones) ──
INSERT OR IGNORE INTO services
  (id, name, slug, description, short_description, duration_minutes, active, featured, display_order, created_at, updated_at)
VALUES
  ('svc_forehead',   'پیشانی',   'forehead',   'لیزر موهای زائد پیشانی — لاین اختصاصی آقایان',   'ناحیه پیشانی',      15, 1, 0, 101, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_beard_line', 'خط ریش',   'beard-line', 'لیزر و خط‌گیری ریش و گونه — لاین اختصاصی آقایان', 'خط ریش و گونه',     20, 1, 0, 102, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_ear',        'گوش',      'ear',        'لیزر موهای زائد گوش — لاین اختصاصی آقایان',      'هر دو گوش',         15, 1, 0, 103, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_behind_ear', 'پشت گوش',  'behind-ear', 'لیزر موهای زائد پشت گوش — لاین اختصاصی آقایان',  'پشت هر دو گوش',     15, 1, 0, 104, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_under_chin', 'زیرگردن',  'under-chin', 'لیزر موهای زائد زیرگردن — لاین اختصاصی آقایان',  'زیر چانه و گردن',   20, 1, 0, 105, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_back_neck',  'پشت گردن', 'back-neck',  'لیزر موهای زائد پشت گردن — لاین اختصاصی آقایان', 'پشت گردن',          15, 1, 0, 106, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_shoulder',   'سرشانه',   'shoulder',   'لیزر موهای زائد سرشانه — لاین اختصاصی آقایان',   'شانه هر دو دست',    20, 1, 0, 107, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- ── 2. Men's amounts for the 20 existing zones (OWNER where supplied, else DERIVED) ──
INSERT OR IGNORE INTO service_prices (id, service_id, pricing_category, amount, currency, created_at, updated_at) VALUES
  ('price_face_female_zone_male',       'svc_face',         'male',  420, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.31x women's 320)
  ('price_upper_lip_male',              'svc_upper_lip',    'male',  130, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.44x 90)
  ('price_chin_male',                   'svc_chin',         'male',  190, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.31x 145)
  ('price_neck_male',                   'svc_neck',         'male',  250, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.32x 190)
  ('price_underarm_male',               'svc_underarm',     'male',  370, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «زیر بغل ۳۷۰»
  ('price_full_arms_male',              'svc_full_arms',    'male',  770, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «دست کامل ۷۷۰»
  ('price_upper_arm_male',              'svc_upper_arm',    'male',  360, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «بازو ۳۶۰»
  ('price_forearm_male',                'svc_forearm',      'male',  360, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق دست ۳۶۰»
  ('price_chest_male',                  'svc_chest',        'male',  360, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «سینه کامل ۳۶۰»
  ('price_abdomen_male',                'svc_abdomen',      'male',  390, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «شکم ۳۹۰»
  ('price_navel_line_male',             'svc_navel_line',   'male',  230, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.21x 190)
  ('price_back_male',                   'svc_back',         'male',  460, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «کمر ۴۶۰»
  ('price_bikini_male',                 'svc_bikini',       'male',  650, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.10x 590) — confirm/clear in admin
  ('price_buttocks_male',               'svc_buttocks',     'male',  460, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.21x 380)
  ('price_gluteal_line_male',           'svc_gluteal_line', 'male',  290, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.21x 240) — confirm/clear in admin
  ('price_full_legs_male',              'svc_full_legs',    'male',  740, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «کل پا ۷۴۰»
  ('price_thigh_male',                  'svc_thigh',        'male',  390, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ران ۳۹۰»
  ('price_inner_thigh_male',            'svc_inner_thigh',  'male',  470, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- DERIVED (1.21x 390)
  ('price_lower_leg_male',              'svc_lower_leg',    'male',  390, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «ساق پا ۳۹۰»
  ('price_full_body_male',              'svc_full_body',    'male', 2400, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')); -- DERIVED (1.05x 2290)

-- ── 3. Men's amounts for the 7 new men's-only zones (all OWNER figures) ──
INSERT OR IGNORE INTO service_prices (id, service_id, pricing_category, amount, currency, created_at, updated_at) VALUES
  ('price_forehead_male',   'svc_forehead',   'male', 190, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پیشانی ۱۹۰»
  ('price_beard_line_male', 'svc_beard_line', 'male', 220, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «خط ریش ۲۲۰»
  ('price_ear_male',        'svc_ear',        'male', 100, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «گوش ۱۰۰»
  ('price_behind_ear_male', 'svc_behind_ear', 'male', 100, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پشت گوش ۱۰۰»
  ('price_under_chin_male', 'svc_under_chin', 'male', 220, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «زیرگردن ۲۲۰»
  ('price_back_neck_male',  'svc_back_neck',  'male', 220, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), -- OWNER «پشت گردن ۲۲۰»
  ('price_shoulder_male',   'svc_shoulder',   'male', 360, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')); -- OWNER «سرشانه ۳۶۰»
