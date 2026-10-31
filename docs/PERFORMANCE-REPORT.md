# Performance Report — measured baselines

All numbers are **measured**, not estimated. Re-measure with the same commands
before claiming an improvement.

---

## 1. Bundle baseline (branch `main` @ `8e21ce6`, 2026-11-01)

Measured via `npm run build` → `dist/client/_astro/*` (minified, raw bytes):

| Asset                         | Shipped to        | Raw size  |
| ----------------------------- | ----------------- | --------- |
| `PublicLayout.*.css`          | every public page | 183,534 B |
| `AdminLayout.*.css`           | every admin page  | 94,861 B  |
| `clinic.*.css`                | `/clinic`         | 28,065 B  |
| `utilities.*.css`             | shared            | 24,197 B  |
| `booking.*.css`               | `/booking`        | 22,354 B  |
| `client.*.js` (React runtime) | every island page | 212,991 B |
| `useRoster.*.js`              | admin operators   | 31,845 B  |
| `BookingWizard.*.js`          | `/booking`        | 31,547 B  |
| `AdminDashboard.*.js`         | admin dashboard   | 25,782 B  |
| **Total CSS (all bundles)**   | —                 | 597,705 B |
| **Total JS (all bundles)**    | —                 | 417,018 B |

Reproduce:

```bash
npm run build
find dist/client/_astro -name '*.css' -exec du -b {} + | sort -rn | head
find dist/client/_astro -name '*.js'  -exec du -b {} + | sort -rn | head
```

## 2. Lighthouse baseline — mobile, production homepage (2026-11-01)

`npx lighthouse@12 https://tehran-laser.samerkhaldounmarefi.workers.dev/ --form-factor=mobile --chrome-flags="--headless=new"` (full JSON archived outside the repo):

| Category       | Score   |
| -------------- | ------- |
| Performance    | **83**  |
| Accessibility  | **100** |
| Best Practices | **100** |
| SEO            | **100** |

| Metric                   | Value     | Target   |
| ------------------------ | --------- | -------- |
| First Contentful Paint   | 3.0 s     | —        |
| Largest Contentful Paint | **3.5 s** | ≤ 2.5 s  |
| Total Blocking Time      | **0 ms**  | ≤ 200 ms |
| Cumulative Layout Shift  | **0**     | ≤ 0.1    |
| Speed Index              | 4.6 s     | —        |

TBT 0 / CLS 0 confirm the SSR-first architecture (no hydration blocking, no layout
instability). The LCP gap is dominated by network latency from the measurement
vantage point plus the §3 CSS payload and hero image weight; the §3 CSS
reconciliation and image weight trim are the identified levers.

Production behavior (2026-11-01 probes):

- `GET /` on `tehran-laser.samerkhaldounmarefi.workers.dev` → **HTTP 200**.
- `GET /api/health` → `{"status":"ok","database":"ok",...}`.
- Anonymous page renders sit behind the edge-HTML cache
  (`caches.default`, 60 s TTL + SWR — see `src/middleware.ts:64-83` and
  `src/lib/http/edge-cache.ts`); cache state is observable via `x-edge-cache: HIT|MISS`.

## 3. Known payload concern — CSS override chain (deferred with evidence)

`PublicLayout.astro:2-12` imports the full public stack globally:
`tokens` → `base` → `components` → `public.css` (v1) → `site-v2.css` (v2) →
`ux-v3.css` (v3). Later layers override earlier ones, so the browser downloads
and applies ~183 KB minified CSS per public page, including rules for surfaces
only one page uses (per-page sheets add 17–28 KB more).

**Why not rewritten in the 2026-11-01 cycle:** a byte-safe unification requires
visual-regression coverage (pixel diffs across all 11 public pages × breakpoints)
that the repo does not yet have. Blind rule removal risks silent visual breakage,
which violates the transformation rules ("never deploy untested code"). The safe
sequence, when scheduled:

1. Add Playwright screenshot coverage for all public pages at 360/768/1280 px
   (or pixel-verified `verify-ui` runs recorded per pass, as W5 did).
2. Reconcile `public.css` + `site-v2.css` overlap mechanically (the W5 tooling in
   `.tools/extract.cjs` reports selector/body collisions), moving page-specific
   rules into their page sheets.
3. Re-measure `PublicLayout.*.css`; target: shared shell only (tokens + base +
   genuinely shared components), ≤ ~60 KB raw before gzip.

## 4. What is already optimized (verified, keep as-is)

- SSR-only public pages; React hydration only for the booking wizard and admin
  islands (`client:*` directives in `src/pages/booking.astro`, admin pages).
- Font: self-hosted `@fontsource-variable/vazirmatn` (arabic + latin subsets,
  woff2) — no third-party font request.
- Images: AVIF/WebP variants exist alongside JPG sources
  (`scripts/optimize-images.mjs`), responsive lazy-loading ladder landed in #14.
- Edge-HTML cache for anonymous page views with explicit purge on content writes.
- `server-timing` + `x-request-id` on every response for waterfall diagnosis.
