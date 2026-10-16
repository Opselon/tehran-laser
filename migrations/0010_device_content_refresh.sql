-- Migration 0010: refresh DB-resident content for the Rado Plus contact-laser direction.
--
-- Why this exists as a migration rather than a source edit: the blog posts are
-- STORED IN D1 (seeded by 0006_seed_blog.sql) and rendered at runtime, so
-- changing src/ cannot update the already-published rows on the live database.
-- 0006 is left untouched (editing an applied migration rewrites history and
-- would not re-run); these UPDATEs are keyed by slug so they are idempotent and
-- safe to apply to any database that already holds the original seed.
--
-- Device change: the marceted device is now the contact (touch) laser
-- «رادو پلاس» with three wavelengths 755/808/1064 nm, TEC Double cooling,
-- 1600 W output. Alexandrite 755 nm remains accurate as ONE of its three
-- wavelengths, so technology references to it are kept where correct.

-- 1) Guide post: retitle + retarget the technology section and cooling note.
UPDATE blog_posts
SET
  title = 'راهنمای جامع لیزر موهای زائد با دستگاه لیزر تماسی رادو پلاس',
  excerpt = 'بررسی دقیق عملکرد لیزر تماسی رادو پلاس با سه طول موج ۷۵۵ و ۸۰۸ و ۱۰۶۴ نانومتر، مراقبت‌های طلایی قبل و بعد از جلسات و استانداردهای کلینیکال در مرکز تخصصی تهران لیزر.',
  content = replace(
    replace(
      replace(
        content,
        '<h2>مقدمه و مکانیسم اثر لیزر الکساندرایت</h2>',
        '<h2>مقدمه و مکانیسم اثر لیزر تماسی رادو پلاس</h2>'
      ),
      'لیزر موهای زائد با طول موج ۷۵۵ نانومتر (الکساندرایت) به عنوان استاندارد طلایی (Gold Standard) در رفع موهای زائد در کلینیک‌های پیشرفته جهان شناخته می‌شود.',
      'لیزر تماسی (لمسی) رادو پلاس با سه طول موج ۷۵۵ و ۸۰۸ و ۱۰۶۴ نانومتر به عنوان یکی از پیشرفته‌ترین روش‌های رفع موهای زائد شناخته می‌شود. در این روش هندپیس مستقیماً روی پوست حرکت می‌کند و امواج از نزدیک‌ترین فاصله به فولیکول می‌رسند.'
    ),
    'سیستم کولینگ هوای سرد داینامیک (DCD) در دستگاه‌های کلینیک، دمای سطح پوست را در کسر ثانیه تا زیر صفر درجه خنک کرده و تجربه‌ای کاملاً بدون درد و بدون سوختگی برای مراجعین رقم می‌زند.',
    'سیستم خنک‌کننده دوگانه TEC Double همراه با ژل خنک‌کننده در دستگاه‌های کلینیک، دمای سطح پوست را پایین نگه داشته، پخش انرژی را یکنواخت می‌کند و تجربه‌ای بدون درد و بدون سوختگی برای مراجعین رقم می‌زند.'
  ),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE slug = 'laser-hair-removal-complete-guide';

-- 2) Skin-preparation post: its title/excerpt also named the old device.
UPDATE blog_posts
SET
  title = 'اصول آمادگی پوست و نکات حیاتی پیش از شروع جلسات لیزر تماسی',
  excerpt = 'نکات کلیدی پیرامون سلامت پوست، تداخلات دارویی رایج و فواصل استاندارد جلسات لیزر تماسی برای دستیابی به حداکثر راندمان.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE slug = 'skin-preparation-and-laser-safety';
