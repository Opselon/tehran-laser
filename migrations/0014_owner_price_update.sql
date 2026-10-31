-- 0014_owner_price_update.sql — Men's price list refresh (OWNER figures)
--
-- Source: the clinic's own price message (Kishlaser, 2026-10-03). Every UPDATE
-- below carries the owner's verbatim figure — no derived amounts in this file.
--
-- VERIFIED UNCHANGED: all 20 women's (female) amounts in the owner's list match
-- the 0004 seeds exactly (صورت ۳۲۰ … کل بدن ۲۲۹۰) — no female rows are touched.
-- The 15% online discount in settings (discount_percent=15, migration 0003)
-- matches the owner's «سایت تخفیف خورده، ۱۵٪ تخفیف» note and stays as-is.
--
-- NOT IN THE OWNER'S LIST (left at their 0009 values, editable in the dashboard):
--   پیشانی (svc_forehead, male 190), پشت گوش (svc_behind_ear, male 100), and the
--   DERIVED male amounts for zones the men's list does not mention.
-- SAFETY: touches only service_prices.amount for pricing_category='male'.
-- Idempotent: re-running yields the same values.

UPDATE service_prices SET amount = 390, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_beard_line'  AND pricing_category = 'male'; -- OWNER «خط ریش ۳۹۰»
UPDATE service_prices SET amount = 240, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_ear'         AND pricing_category = 'male'; -- OWNER «گوش ۲۴۰»
UPDATE service_prices SET amount = 240, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_under_chin' AND pricing_category = 'male'; -- OWNER «زیر گردن ۲۴۰»
UPDATE service_prices SET amount = 240, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_back_neck'  AND pricing_category = 'male'; -- OWNER «پشت گردن ۲۴۰»
UPDATE service_prices SET amount = 570, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_underarm'   AND pricing_category = 'male'; -- OWNER «زیربغل ۵۷۰»
UPDATE service_prices SET amount = 590, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_shoulder'   AND pricing_category = 'male'; -- OWNER «سرشانه ۵۹۰»
UPDATE service_prices SET amount = 980, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_full_arms'  AND pricing_category = 'male'; -- OWNER «دست کامل ۹۸۰»
UPDATE service_prices SET amount = 570, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_upper_arm'  AND pricing_category = 'male'; -- OWNER «بازو ۵۷۰»
UPDATE service_prices SET amount = 570, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_forearm'    AND pricing_category = 'male'; -- OWNER «ساق ۵۷۰»
UPDATE service_prices SET amount = 590, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_chest'      AND pricing_category = 'male'; -- OWNER «سینه ۵۹۰»
UPDATE service_prices SET amount = 590, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_abdomen'    AND pricing_category = 'male'; -- OWNER «شکم ۵۹۰»
UPDATE service_prices SET amount = 980, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_back'       AND pricing_category = 'male'; -- OWNER «کمر ۹۸۰»
UPDATE service_prices SET amount = 890, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE service_id = 'svc_lower_leg'  AND pricing_category = 'male'; -- OWNER «ساق پا ۸۹۰»
