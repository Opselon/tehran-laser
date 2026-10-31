# Domain Cutover Runbook — `tehranlaser.ir`

**Status: BLOCKED (external)** — measured 2026-11-01.

The platform's canonical origin is and remains
`https://tehran-laser.samerkhaldounmarefi.workers.dev` until every check in
§3 passes. This document is the exact, evidence-based runbook for the day the
domain becomes available; do not skip it.

---

## 1. Current measured state (2026-11-01)

| Check                             | Result                                                                  | Evidence                      |
| --------------------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| DNS A record `tehranlaser.ir`     | ❌ `5.61.28.239` — not a Cloudflare edge IP                             | `nslookup tehranlaser.ir`     |
| DNS A record `www.tehranlaser.ir` | ❌ `5.61.28.239`                                                        | `nslookup www.tehranlaser.ir` |
| `https://tehranlaser.ir/`         | ❌ TLS handshake fails (curl exit 60, HTTP 000)                         | `curl -vI`                    |
| `http://tehranlaser.ir/`          | ❌ answers `Server: nginx/1.18.0 (Ubuntu)` — an unrelated origin        | `curl -sI`                    |
| Production worker                 | ✅ `GET /` → 200, `GET /api/health` → `{"status":"ok","database":"ok"}` | live probe                    |

Root cause: the registrar's DNS still points at a previous/foreign host.
No code change can fix this; it requires the domain owner's registrar login.

## 2. Code-side policy already in place (no action needed)

- `src/lib/seo/canonical.ts` — `resolveCanonicalOrigin()` prefers the `SITE_URL`
  wrangler var and falls back to the live workers origin; the vanity domain is
  deliberately never emitted while it is unreachable.
- `src/pages/sitemap.xml.ts` / `src/pages/robots.txt.ts` — emit `<loc>`/`Sitemap:`
  from that same resolver.
- Comments in all three files already document this policy.

## 3. Cutover checklist (execute in order; halt on first failure)

1. **Registrar/DNS (owner):** repoint `tehranlaser.ir` and `www` to the
   Cloudflare zone (proxied `A`/`CNAME` records on Cloudflare's edge).
2. **Cloudflare (owner):** add the Worker custom domain
   (Workers → tehran-laser → Settings → Domains & Routes → add
   `tehranlaser.ir` + `www.tehranlaser.ir`); wait for the universal-SSL cert.
3. **Verify TLS from an outside network:** `curl -sI https://tehranlaser.ir/`
   must return 200 over HTTPS with a Cloudflare certificate.
4. **Pick one canonical host** (recommended: apex `tehranlaser.ir`), and make the
   other a 301 redirect (`www` → apex) via a Cloudflare Redirect Rule.
5. **Set `SITE_URL`:** `wrangler vars put SITE_URL --name tehran-laser` →
   `https://tehranlaser.ir`. `resolveCanonicalOrigin()` picks it up at runtime.
6. **Verify SEO endpoints on the new origin:**
   - `curl -s https://tehranlaser.ir/sitemap.xml | head` — every `<loc>` must use the apex.
   - `curl -s https://tehranlaser.ir/robots.txt | tail -1` — `Sitemap: https://tehranlaser.ir/sitemap.xml`.
   - `<link rel="canonical">` and `og:url` on `/` must show the apex.
7. **Run the CD smoke suite** against the new origin (same route list as the
   post-deploy smoke step in `cd.yml`), plus the auth boundary checks.
8. **Update `DEFAULT_CANONICAL_ORIGIN` fallback** in `src/lib/seo/canonical.ts`
   only after step 7 passes, then re-verify.
9. **Search consoles:** submit the new sitemap in Google Search Console /
   Bing Webmaster; keep the workers.dev property until traffic moves.

## 4. Rollback

If anything fails after `SITE_URL` is changed: `wrangler vars delete SITE_URL --name tehran-laser`
restores the workers.dev canonical origin on the next deploy; the code needs no change.
