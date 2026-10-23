-- 0013 — editorial cleanup for already-seeded content.
--
-- Migration 0006 seeded the blog with an unverified "doctor" byline and two
-- doctor-attributed tips. Editing 0006 only fixes fresh databases; the live D1
-- already holds those rows, so the correction has to be a forward migration.
--
-- Same for feature-module overrides: an admin may have saved the retired
-- "male operator" copy into `feature_modules.config`. The registry defaults are
-- fixed in code, but a stored override wins at render time, so scrub the stored
-- JSON text too. This is deliberately a text replace, not a JSON rewrite: the
-- config shape stays untouched and the statement is idempotent.

-- Blog bylines: no unverified medical title may survive in the author field.
UPDATE blog_posts
SET author = 'تیم محتوای تهران لیزر'
WHERE author LIKE '%دکتر%'
   OR author LIKE '%پزشک%';

-- Blog bodies: soften doctor-attributed advice to the clinic's voice.
UPDATE blog_posts
SET content = replace(
                replace(
                  replace(content,
                    'توصیه پزشک کلینیک',
                    'توصیه کلینیک تهران لیزر'),
                  'هشدار پزشکی مهم',
                  'هشدار مهم'),
                'به اپراتور یا پزشک کلینیک اطلاع دهید',
                'به کارشناس کلینیک اطلاع دهید')
WHERE content LIKE '%پزشک%';

-- Feature-module overrides: drop the male-operator persona, keep men's services.
UPDATE feature_modules
SET config = replace(
               replace(
                 replace(
                   replace(config,
                     'با اپراتورهای مجرب آقا',
                     'با فضای کاملاً مجزا'),
                   'با اپراتور آقا',
                   'در فضای مجزا'),
                 'اپراتور دارای گواهینامه پزشکی آقا',
                 'پروتکل اختصاصی موهای ضخیم آقایان'),
               'اپراتور ارشد آقا',
               'کارشناس پذیرش')
WHERE config LIKE '%اپراتور%آقا%';
