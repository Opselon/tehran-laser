-- Business settings + default working hours.
--
-- NOTE FOR OPERATORS: working hours below are PLACEHOLDERS (Sat–Thu 09:00–13:00 /
-- 14:00–20:00, Friday closed) so the availability engine has something to compute
-- against out of the box. Confirm/replace them in admin → schedule before going live.

INSERT INTO settings (key, value, scope, updated_at) VALUES
  ('business_name',            'تهران لیزر',                                            'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('business_name_en',         'Tehran Laser',                                          'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('phone',                    '+989035555090',                                         'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('address',                  'تهران، پاسداران، خیابان پایدارفرد، نبش بوستان هفتم',      'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('timezone',                 'Asia/Tehran',                                           'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('currency',                 'IRT',                                                   'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- Prices are stored exactly as supplied by the clinic's price list (which quotes
  -- plain numbers: صورت ۳۲۰, کل بدن ۲/۲۹۰); the list is in thousands of toman.
  -- Confirm with the clinic if needed — this label is admin-editable.
  ('currency_label',           'هزار تومان',                                             'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- 15% site discount as stated in the clinic's own price message; set to 0 to disable.
  ('discount_percent',         '15',                                                    'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('booking_enabled',          'true',                                                  'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('slot_granularity_minutes', '15',                                                    'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('booking_buffer_minutes',   '0',                                                     'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('min_lead_minutes',         '0',                                                     'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('max_advance_days',         '90',                                                    'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('telegram_enabled',         'false',                                                 'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('whatsapp_enabled',         'false',                                                 'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('session_ttl_hours',        '168',                                                   'private', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('password_iterations',      '100000',                                                'private', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('rate_limit_login',         '10/600',                                                'private', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('rate_limit_booking',       '20/600',                                                'private', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('rate_limit_public_form',   '30/600',                                                'private', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Placeholder open hours (0 = Saturday … 6 = Friday). Friday intentionally has no rows.
INSERT INTO business_hours (id, weekday, opens_at, closes_at, display_order) VALUES
  ('bh_0_0', 0, '09:00', '13:00', 0),
  ('bh_0_1', 0, '14:00', '20:00', 1),
  ('bh_1_0', 1, '09:00', '13:00', 0),
  ('bh_1_1', 1, '14:00', '20:00', 1),
  ('bh_2_0', 2, '09:00', '13:00', 0),
  ('bh_2_1', 2, '14:00', '20:00', 1),
  ('bh_3_0', 3, '09:00', '13:00', 0),
  ('bh_3_1', 3, '14:00', '20:00', 1),
  ('bh_4_0', 4, '09:00', '13:00', 0),
  ('bh_4_1', 4, '14:00', '20:00', 1),
  ('bh_5_0', 5, '09:00', '13:00', 0),
  ('bh_5_1', 5, '14:00', '20:00', 1);
