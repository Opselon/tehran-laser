-- Real service catalogue and women's price list supplied by the clinic
-- (message of 2026-10-03). Men's prices were not supplied: no male price rows are
-- created, so those services display as "price on request" until configured in
-- admin → pricing. duration_minutes = 30 is a neutral placeholder — set real
-- durations in admin → services before going live.

INSERT INTO services (id, name, slug, description, short_description, duration_minutes, active, featured, display_order, created_at, updated_at) VALUES
  ('svc_face',        'صورت',      'face',         'لیزر موهای زائد کل ناحیه صورت',            'پوشش کامل صورت',              30, 1, 0,  1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_upper_lip',   'پشت لب',    'upper-lip',    'لیزر موهای زائد پشت لب',                  'ناحیه کوچک و پرکاربرد',        30, 1, 0,  2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_chin',        'چانه',      'chin',         'لیزر موهای زائد چانه',                    'ناحیه چانه',                   30, 1, 0,  3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_neck',        'گردن',      'neck',         'لیزر موهای زائد گردن',                    'جلو و پشت گردن',               30, 1, 0,  4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_underarm',    'زیر بغل',   'underarm',     'لیزر موهای زائد زیر بغل',                 'هر دو زیر بغل',                30, 1, 0,  5, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_full_arms',   'دست کامل',  'full-arms',    'لیزر موهای زائد هر دو دست تا مچ',          'هر دو دست، شانه تا مچ',        30, 1, 0,  6, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_upper_arm',   'بازو',      'upper-arm',    'لیزر موهای زائد بازو',                    'بازوی هر دو دست',              30, 1, 0,  7, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_forearm',     'ساق',       'forearm',      'لیزر موهای زائد ساق دست',                 'از آرنج تا مچ دست',            30, 1, 0,  8, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_chest',       'دور سینه',  'chest',        'لیزر موهای زائد دور سینه',                'ناحیه دور سینه',               30, 1, 0,  9, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_abdomen',     'شکم',       'abdomen',      'لیزر موهای زائد شکم',                     'ناحیه شکم',                    30, 1, 0, 10, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_navel_line',  'خط ناف',    'navel-line',   'لیزر موهای زائد خط ناف',                  'خط دور ناف',                   30, 1, 0, 11, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_back',        'کمر',       'back',         'لیزر موهای زائد کمر',                     'ناحیه کمر',                    30, 1, 0, 12, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_bikini',      'بیکینی',    'bikini',       'لیزر موهای زائد بیکینی',                  'ناحیه بیکینی',                 30, 1, 0, 13, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_buttocks',    'باسن',      'buttocks',     'لیزر موهای زائد باسن',                    'باسن هر دو سمت',               30, 1, 0, 14, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_gluteal_line','خط باسن',   'gluteal-line', 'لیزر موهای زائد خط باسن',                 'خط بین باسن',                  30, 1, 0, 15, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_full_legs',   'پا کامل',   'full-legs',    'لیزر موهای زائد هر دو پا تا مچ',           'هر دو پا، ران تا مچ پا',       30, 1, 0, 16, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_thigh',       'ران',       'thigh',        'لیزر موهای زائد ران',                     'ران هر دو پا',                 30, 1, 0, 17, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_inner_thigh', 'کشاله ران', 'inner-thigh',  'لیزر موهای زائد کشاله ران',               'داخل ران هر دو پا',            30, 1, 0, 18, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_lower_leg',   'ساق پا',    'lower-leg',    'لیزر موهای زائد ساق پا',                  'از زانو تا مچ پا',             30, 1, 0, 19, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('svc_full_body',   'کل بدن',    'full-body',    'لیزر موهای زائد کل بدن',                  'پوشش کامل بدن',                30, 1, 0, 20, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Women's price list (pricing_category = 'female'). Amounts are stored exactly as
-- supplied by the clinic; display unit is governed by settings.currency_label.
INSERT INTO service_prices (id, service_id, pricing_category, amount, currency, created_at, updated_at) VALUES
  ('price_face_female',         'svc_face',         'female', 320, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_upper_lip_female',    'svc_upper_lip',    'female',  90, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_chin_female',         'svc_chin',         'female', 145, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_neck_female',         'svc_neck',         'female', 190, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_underarm_female',     'svc_underarm',     'female', 390, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_full_arms_female',    'svc_full_arms',    'female', 570, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_upper_arm_female',    'svc_upper_arm',    'female', 370, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_forearm_female',      'svc_forearm',      'female', 320, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_chest_female',        'svc_chest',        'female', 145, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_abdomen_female',      'svc_abdomen',      'female', 470, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_navel_line_female',   'svc_navel_line',   'female', 190, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_back_female',         'svc_back',         'female', 540, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_bikini_female',       'svc_bikini',       'female', 590, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_buttocks_female',     'svc_buttocks',     'female', 380, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_gluteal_line_female', 'svc_gluteal_line', 'female', 240, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_full_legs_female',    'svc_full_legs',    'female', 790, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_thigh_female',        'svc_thigh',        'female', 570, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_inner_thigh_female',  'svc_inner_thigh',  'female', 390, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_lower_leg_female',    'svc_lower_leg',    'female', 480, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('price_full_body_female',    'svc_full_body',    'female', 2290, 'IRT', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
