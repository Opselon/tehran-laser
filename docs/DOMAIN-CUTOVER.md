# Domain & Account Cutover — `tehranlesar.ir`

**Status: LIVE on the owner's Cloudflare account** (verified 2026-11-01).

---

## 1. Measured state

| Check                                                 | Result                                                                                                                                | Evidence               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| DNS `tehranlesar.ir`                                  | ✅ Cloudflare edge (`188.114.99.0`)                                                                                                   | `nslookup`, 2026-11-01 |
| `https://tehranlesar.ir/`                             | ✅ HTTP 200, `server: cloudflare`, TLS OK                                                                                             | `curl`                 |
| Serves THIS worker                                    | ✅ `/api/health` envelope, `x-request-id`, `server-timing`, brand markup                                                              | live probes            |
| Old spelling `tehranlaser.ir`                         | ❌ foreign host `5.61.28.239` (`nginx/1.18.0 (Ubuntu)`), TLS fails — **not under this account's control, never emitted as canonical** | `curl`/`nslookup`      |
| `https://tehran-laser.opcelon.workers.dev/`           | ✅ same worker, owner account's workers.dev origin                                                                                    | live probes            |
| Legacy `tehran-laser.samerkhaldounmarefi.workers.dev` | old account's deployment; scheduled for decommission after data migration                                                             | live probes            |

## 2. Configuration that makes the domain canonical (all in git)

- `wrangler.jsonc` → `SITE_URL: https://tehranlesar.ir` (wins over the fallback in `resolveCanonicalOrigin`)
- `src/lib/seo/canonical.ts` → `DEFAULT_CANONICAL_ORIGIN = 'https://tehranlesar.ir'`
- Canonical `<link>`, `og:url`, `og:image`, JSON-LD `@id`, sitemap `<loc>` and robots `Sitemap:` all derive from that single resolver.

## 3. Verification after the deploy that bakes `SITE_URL`

```bash
curl -s https://tehranlesar.ir/robots.txt | tail -1   # Sitemap: https://tehranlesar.ir/sitemap.xml
curl -s https://tehranlesar.ir/sitemap.xml | grep -c '<loc>https://tehranlesar.ir'
curl -s https://tehranlesar.ir/ | grep -o '<link rel="canonical" href="[^"]*"'
```

The CD post-deploy smoke suite probes this origin on every deploy (8 routes, health,
SEO endpoints, anonymous auth boundary).

## 4. Remaining items

1. **www redirect**: if `www.tehranlesar.ir` is added as a custom domain later, add a Cloudflare redirect rule `www → apex` so only one canonical host exists.
2. **Search consoles**: submit `https://tehranlesar.ir/sitemap.xml` in Google Search Console / Bing Webmaster.
3. **Decommission the legacy origin** (`tehran-laser.samerkhaldounmarefi.workers.dev`) only after the data migration completes and the owner confirms.
4. `tehranlaser.ir` (old spelling) points at an unrelated server — either reclaim it at the registrar or ignore it; the platform must never emit it as canonical.
