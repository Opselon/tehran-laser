# Platform Transformation Audit — Phase 0

**Date:** 2026-11-01
**Scope:** Full-repository investigation (pages, islands, API, domain, D1, tests, CI/CD, production), production smoke checks, and verified local baselines.
**Method:** Direct code inspection with `file:line` evidence + production probes against `https://tehran-laser.samerkhaldounmarefi.workers.dev` + locally reproduced quality-gate runs. Every claim below was executed, not assumed.

---

## 1. Executive summary

The platform is in substantially better shape than a typical pre-transformation state: 14 prior transformation PRs (mobile-first redesign, feature-module hub, operators module, UX v3–v5, edge caching, W4/W5 refactors) have already landed. The architecture (Astro 7 SSR → router → domain → repositories → D1) is clean, server-authoritative, and protected by genuine double-booking safeguards.

**What remains broken is concentrated in the quality gates, not the product:**

| #   | Finding                                                                                                                                                                                                                                                                                                                                        | Severity                      | Evidence                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| A1  | 7 high-severity dependency vulnerabilities in **production** deps (Zod memory exhaustion, GHSA-mrhx-c7xc-m3w5)                                                                                                                                                                                                                                 | **Critical**                  | `npm audit --omit=dev` on the cloned tree                          |
| A2  | ESLint fails on main: 61 errors / 9 warnings — every `.astro` file fails to parse (missing `eslint-plugin-astro`), 6× `no-explicit-any` in `AdminDashboard.tsx`, 2× stale `react-hooks/exhaustive-deps` disables (plugin not installed), `require()` in dev tools                                                                              | **Major**                     | `npx eslint .` reproduced locally                                  |
| A3  | Prettier check fails: `prettier-plugin-astro` missing (`Couldn't resolve parser "astro"`) + 3 unformatted files                                                                                                                                                                                                                                | **Major**                     | `npm run format:check` reproduced locally                          |
| A4  | CI (`ci.yml`) never runs lint, format, or dependency audit — A2/A3/A1 are invisible to the green pipeline                                                                                                                                                                                                                                      | **Major**                     | `.github/workflows/ci.yml` (typecheck+test+build only)             |
| A5  | CD deploys without post-deployment smoke verification of public routes / health / auth boundary                                                                                                                                                                                                                                                | **Major**                     | `.github/workflows/cd.yml` (deploy → "Report deployment" only)     |
| A6  | Custom domain `tehranlaser.ir` serves an unrelated `nginx/1.18.0 (Ubuntu)` host (5.61.28.239); HTTPS handshake fails from this network. Domain cutover is **externally blocked** until DNS is repointed to Cloudflare                                                                                                                          | **Major (external)**          | `curl`/`nslookup` probes, 2026-11-01                               |
| A7  | CSS payload: `PublicLayout` ships **183.5 KB minified CSS** (tokens+base+components+`public.css`+`site-v2.css`+`ux-v3.css` layered v1→v2→v3 override chain) to every public page; AdminLayout ships 94.9 KB                                                                                                                                    | Minor→Major (maintainability) | `dist/client/_astro/PublicLayout.*.css` size after `npm run build` |
| A8  | Repo-hygiene leftovers: `cd-cycle.sh` — a legacy local deploy loop that **commits directly to `main` and runs `wrangler deploy` locally**, bypassing the CI/CD gates the repo itself now defines; `DEPLOY_LOG.txt` (ops artifact in git); `tools-extract.cjs` + byte-identical duplicate `.tools/extract.cjs` (one-off W5 CSS extraction tool) | Minor→Major (process risk)    | `cd-cycle.sh:7-23`, root listing                                   |
| A9  | 23 TypeScript hints from `astro check` (unused vars / minor)                                                                                                                                                                                                                                                                                   | Minor                         | `npm run typecheck` output                                         |

**Verified-healthy areas** (do not redo): booking atomicity + concurrency-race test, server-authoritative pricing, RBAC enforcement in middleware+router, security headers/CSP/HSTS, edge cache rules, sitemap/robots/canonical engine, Jalali date handling, notifications state tracking, all admin feature modules wired to real endpoints, 232 unit + 81 integration tests passing, typecheck 0 errors.

---

## 2. Verified baseline (local reproduction, branch `main` @ `8e21ce6`)

| Gate                                                              | Result                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `npm run typecheck`                                               | ✅ 0 errors, 0 warnings, 23 hints (142 files)                         |
| `npm test` (unit)                                                 | ✅ 15 files, **232 passed**                                           |
| `npm test` (D1 integration via `@cloudflare/vitest-pool-workers`) | ✅ 6 files, **81 passed**                                             |
| `npm run build`                                                   | ✅ succeeds (lightningcss warnings about `:global` in print CSS only) |
| `npm run lint`                                                    | ❌ 70 problems (61 errors, 9 warnings)                                |
| `npm run format:check`                                            | ❌ parser missing + 3 files unformatted                               |
| `npm audit --omit=dev`                                            | ❌ **7 high severity** (Zod GHSA-mrhx-c7xc-m3w5)                      |

Production build asset measurements (minified, raw bytes):

| Asset                         | Shipped to        | Size      |
| ----------------------------- | ----------------- | --------- |
| `PublicLayout.*.css`          | every public page | 183,534 B |
| `AdminLayout.*.css`           | every admin page  | 94,861 B  |
| `client.*.js` (React runtime) | every island page | 212,991 B |
| `BookingWizard.*.js`          | `/booking`        | 31,547 B  |
| Total CSS across all bundles  | —                 | 597,705 B |
| Total JS across all bundles   | —                 | 417,018 B |

Production probes (2026-11-01):

- `GET /` → 200; `GET /api/health` → `{"status":"ok","database":"ok"}`.
- `tehranlaser.ir` DNS → `5.61.28.239` (not Cloudflare); `https://` handshake fails (`curl` exit 60); `http://` answers `nginx/1.18.0 (Ubuntu)`. **Canonical origin must remain the workers.dev origin** — `src/lib/seo/canonical.ts` already implements exactly this policy.

---

## 3. Findings detail & root causes

### A1 — Zod memory-exhaustion advisory (Critical)

`npm audit --omit=dev` reports GHSA-mrhx-c7xc-m3w5 ("Zod can exhaust memory while validating oversized constrained collections") against the locked `zod@4.6.5`. Zod is the input-validation boundary for every API route (`src/server/http/router.ts:31-69`, `src/lib/api/respond.ts parseBody`). Fix: `npm audit fix` (semver-compatible bump), re-run the full suite — validation behavior is covered by 14 unit tests (`tests/unit/validation.test.ts`) + integration contracts.

### A2/A3 — Broken lint/format toolchain (Major)

Root cause: the ESLint/Prettier configs (`eslint.config.mjs`, `.prettierrc.json`) reference `.astro` files but the corresponding plugins were never installed (`eslint-plugin-astro`, `prettier-plugin-astro`), and `eslint-plugin-react-hooks` is absent while inline disable comments reference its rules (`OperatorForm.tsx:64`, `OperatorsApp.tsx:106`). Six real `any` leaks exist in `AdminDashboard.tsx` (now typed against the canonical `ApiResponse<T>` envelope). One-off dev tools (`tools-extract.cjs`, `.tools/extract.cjs`) use CommonJS `require` and are not lint-exempted. `src/lib/http/observability.ts:75` uses `console.log` for its structured request log (only `warn`/`error` allowed).

### A4 — CI blind spots (Major)

`ci.yml` gates typecheck+test+build. Lint/format/audit failures (A1–A3) therefore never block a merge. Fix: add the three gates as blocking steps.

### A5 — CD lacks smoke verification (Major)

`cd.yml` pins the validated commit and handles missing credentials honestly, but verifies nothing after `wrangler deploy`. Fix: post-deploy job step probing `/`, `/services`, `/booking`, `/clinic`, `/faq`, `/blog`, `/contact`, `/admin/login`, `/api/health`, `/sitemap.xml`, `/robots.txt` (200 + JSON envelope shape) and the anonymous-auth boundary (`/admin` must redirect, `/api/v1/admin/*` must 401). Read-only, non-destructive.

### A6 — Domain cutover externally blocked (Major, external)

See §2 probes. Full cutover runbook recorded in `docs/DOMAIN-CUTOVER.md`. No code change can repoint registrar DNS; canonical policy correctly stays on workers.dev until then.

### A7 — Layered CSS override chain (Minor→Major, deferred with evidence)

`PublicLayout.astro:2-12` imports the full stack (v1 `public.css` → v2 `site-v2.css` → v3 `ux-v3.css`) globally; per-page sheets add 17–28 KB more. This is a maintainability and payload cost inherited from incremental passes. **Deliberately not rewritten in this cycle:** a byte-safe unification requires visual-regression coverage that does not exist yet; blind rule-stripping would violate the "never deploy untested code" rule. Recorded as the next phase with measurements (§5).

### A8 — Root hygiene (Minor→Major, process risk)

`cd-cycle.sh` predates the GitHub Actions pipeline and does `git push origin main` + local `npx wrangler deploy` in a loop from a hardcoded local path — it can ship unvalidated code and contradicts `DEPLOYMENT.md`/`cd.yml`. Removed in this PR (the gated `cd.yml` workflow replaces it). `DEPLOY_LOG.txt` (its log file) is removed from git; `tools-extract.cjs` was a byte-identical duplicate of `.tools/extract.cjs`, so the root copy is removed and `.tools/` is lint-exempted.

---

## 4. Implementation plan (this PR)

1. **Security:** bump Zod past GHSA-mrhx-c7xc-m3w5; full suite green after.
2. **Toolchain:** install `eslint-plugin-astro`, `eslint-plugin-react-hooks`, `prettier-plugin-astro`; wire them into `eslint.config.mjs` / `.prettierrc.json`; fix the 6 `any`s, the stale disables, the console rule, dev-tool exemptions; run `npm run format`.
3. **CI gates:** add `lint`, `format:check`, `npm audit --omit=dev --audit-level=high` as blocking steps in `ci.yml`.
4. **CD smoke tests:** post-deploy verification of all public routes, health JSON, SEO endpoints, and the anonymous auth boundary.
5. **Hygiene + docs:** remove duplicate `.tools/`, relocate `DEPLOY_LOG.txt` under `docs/`, add `docs/DOMAIN-CUTOVER.md` (runbook + evidence), `docs/PERFORMANCE-REPORT.md` (baseline numbers above), and this audit.

Deferred (recorded, not silently dropped): CSS override-chain unification behind visual-regression coverage; `astro check` hints cleanup; PWA gap review.

---

## 5. Verification method

Every change in this PR is verified by running, on this machine:

- `npm run typecheck && npm run lint && npm run format:check` (all must exit 0)
- `npm test` (232 unit + 81 integration must stay green)
- `npm run build` (must succeed; bundle sizes recorded before/after)
- `npm audit --omit=dev` (must report 0 high/critical after the Zod bump)
- CI on the PR must be green; CD smoke step must pass on deploy.
