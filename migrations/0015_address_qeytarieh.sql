-- 0015_address_qeytarieh.sql — Clinic relocation: Pasdaran → Qeytarieh
--
-- Source: the clinic owner (Kishlaser, 2026-11-16): new address is Qeytarieh,
-- Qalandari Shomali, corner of 14th alley; map pin 35.785564, 51.440842
-- (Balad link supplied by the owner). The public site's single source of truth
-- for the address is src/lib/seo/meta.ts (CLINIC_CONTACT); this migration only
-- keeps the live D1 `settings.address` row — read by the admin settings page
-- and the booking SMS fallback — in sync with it.
--
-- SAFETY: touches only the settings.address value and the faq_location
-- answer. Phone, hours, prices and business_name are unchanged. Idempotent:
-- re-running yields the same values.
--
-- NOTE: migration 0007 also seeds a sample SMS *log* row (sms_sample_1) with
-- the old address. That is a historical delivery record, not a template, so it
-- is deliberately left untouched.

UPDATE settings
SET value = 'تهران، قیطریه، خیابان قلندری شمالی، نبش کوچه چهاردهم',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE key = 'address';

UPDATE faq_items
SET answer = 'تهران، قیطریه، خیابان قلندری شمالی، نبش کوچه چهاردهم. ساعات کاری و راهنمای مسیر در صفحه «کلینیک» در دسترس است.',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'faq_location';
