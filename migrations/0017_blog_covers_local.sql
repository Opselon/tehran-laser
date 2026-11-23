-- 0017_blog_covers_local.sql
--
-- The two seeded blog covers were Unsplash URLs, but the public image CSP is
-- `img-src 'self' data: blob:` — so `cspSafeCover` treated them as absent and
-- the homepage journal strip, the blog index and the article pages rendered
-- no cover image at all. The images are now self-hosted under
-- public/images/blog/ (same photos, downloaded from Unsplash) and the rows
-- point at the local paths, which pass the CSP.
--
-- Data-only migration: no schema change. Safe to re-run (idempotent UPDATEs
-- keyed on the published slugs; exact equality, no LIKE — D1 rejects the
-- long LIKE pattern as too complex).

UPDATE blog_posts
SET cover_image = '/images/blog/laser-hair-removal-guide-1200.jpg'
WHERE slug = 'laser-hair-removal-complete-guide'
  AND cover_image = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80';

UPDATE blog_posts
SET cover_image = '/images/blog/skin-preparation-laser-safety-1200.jpg'
WHERE slug = 'skin-preparation-and-laser-safety'
  AND cover_image = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80';
