# عملیات، استقرار و امنیت — کلینیک تهران لیزر

راهنمای عملیاتی برای تیم فنی/پرسنل: چگونه سایت منتشر می‌شود، پرسنل از کجا وارد می‌شوند، و قواعد امنیتی الزامی.

---

## ۱. استقرار (Deployment)

سایت به‌صورت **Astro SSR** ساخته و روی **Cloudflare Workers** منتشر می‌شود؛ داده‌ها در **Cloudflare D1** هستند.

### مسیر استاندارد
```bash
npm run typecheck        # astro sync + tsc --noEmit + astro check  (باید ۰ خطا)
npm test                 # تست واحد + یکپارچگی D1
npm run build            # astro build  →  خروجی در ./dist
npx wrangler deploy      # انتشار روی Cloudflare Workers
```
یا یک‌مرحله‌ای: `npm run cf:deploy` (معادل `astro build && wrangler deploy`).

### پیکربندی (`wrangler.jsonc`)
| کلید | معنا |
| :--- | :--- |
| `name` | `tehran-laser` |
| `assets.directory` | `./dist` (خروجی Astro) |
| `d1_databases[].binding` | `DB` → دیتابیس `tehran-laser-db` |
| `vars.BUSINESS_TIMEZONE` | `Asia/Tehran` |
| `vars.SITE_URL` | نشانی زندهٔ سایت (برای canonical/OG/sitemap) |

> ⚠️ **`SITE_URL` را روی دامنهٔ زنده بگذارید.** دامنهٔ `tehranlaser.ir` در حال حاضر به‌صورت پارک‌شده پاسخ می‌دهد و **نباید** به‌عنوان origin منتشر شود؛ تا زمانی که واقعاً همین اپ را سرو نکند، نشانی Workers درست است.

### مایگریشن‌های پایگاه‌داده
```bash
npm run db:migrate:local    # اعمال مایگریشن‌ها روی D1 محلی
npm run db:migrate:remote   # اعمال روی D1 لایو
# یا مستقیماً:
npx wrangler d1 migrations apply tehran-laser-db --remote
```
مایگریشن‌ها در `migrations/` **ترتیبی** هستند و باید فقط از طریق ابزار مایگریشن اعمال شوند (نه SQL دستی روی DB زنده).

### بررسی سلامت پس از استقرار
| مسیر | انتظار |
| :--- | :--- |
| `GET /` | صفحهٔ اصلی با تعرفه‌ها و متادیتای سئو |
| `GET /services` | کاتالوگ خدمات و تب بانوان/آقایان |
| `GET /booking` | جادوگر رزرو با اسلات‌های زنده |
| `GET /sitemap.xml` · `GET /robots.txt` | درست و بلاک‌بودن مسیر ادمین |
| `GET /api/health` | `{ status: "ok", database: "ok" }` |

---

## ۲. مسیر ورود پرسنل (Admin login)

- **مسیر ورود:** `/admin/login` (از پیوند «ورود پرسنل» در فوتر عمومی هم قابل دسترسی است).
- فرم ورود به اندپوینت `POST /api/v1/auth/login` با `{ email, password }` درخواست می‌فرستد و در موفقیت کوکی سشن `tl_session` را دریافت می‌کند، سپس به `/admin` هدایت می‌شود.
- **دروازهٔ احراز هویت (`src/middleware.ts`):** هر مسیر زیر `/admin/**` به‌جز `/admin/login`، همهٔ `/api/v1/admin/**` و `/api/v1/me` **الزاماً** به سشن زنده نیاز دارند. کاربر ناشناس در مرورگر به صفحهٔ ورود و در API با پوش پوشش (`AUTH_REQUIRED`) پاسخ داده می‌شود.
- **مجوزدهی (Authorization):** هر روت با `requirePermission(locals, '...')` کنترل می‌شود — پنهان‌کردن دکمه در UI هرگز جای Authorization را نمی‌گیرد.
- **محدودیت نرخ:** ورود با `rate_limit_login` (کلید `login:<ip>`) محافظت می‌شود؛ فراتر از سقف → `429 RATE_LIMITED`.

---

## ۳. 🔐 نکتهٔ امنیتی (Security note)

> **اعتبارنامه‌ها (ایمیل/گذرواژهٔ پرسنل) در پایگاه‌داده نگهداری می‌شوند — در جدول `users` — و هرگز نباید در سورس کد، مستندات، کامیت یا هیچ فایل قابل‌ردیابی نوشته شوند.**

قواعد الزامی:

1. **هرگز گذرواژه، نام کاربری، توکن، API key یا رشتهٔ اتصال را در کد یا مستندات درج یا کامیت نکنید.**
2. رازها فقط از طریق بایندینگ محیطی/سکرت تزریق می‌شوند:
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   ```
   کلیدهای خصوصی (`telegram_bot_token`, `sms_api_key`, `whatsapp_api_key`, …) در `PRIVATE_SETTING_KEYS` (`src/domain/settings/settings.types.ts`) هستند و **هرگز** توسط اندپوینت عمومی برگردانده نمی‌شوند.
3. **جدول‌های `users` و `sessions` هرگز دست‌کاری مستقیم نشوند.** گذرواژه با `PBKDF2-SHA256` (۱۰۰٬۰۰۰ دور + سالت تصادفی ۱۶ بایتی) هش شده و توکن سشن فقط به‌صورت `sha256(rawToken)` ذخیره می‌شود.
4. کوکی سشن `tl_session` با پرچم‌های `HttpOnly; Secure (در prod); SameSite=Lax` صادر می‌شود و از جاوااسکریپت قابل خواندن نیست.
5. **تغییر/ریست خودسرانهٔ گذرواژه ممنوع** — این کار دسترسی مالک به سیستم لایو را می‌بندد.

جزئیات مدل تهدید و هدرهای امنیتی: [`SECURITY.md`](../SECURITY.md).

---

## ۴. هدرهای امنیتی

`src/middleware.ts` روی همهٔ پاسخ‌ها اعمال می‌کند:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none';
  base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## ۵. کش

- صفحات عمومی ناشناس: `Cache-Control: public, max-age=60, stale-while-revalidate=300` (فقط `GET` موفق و بدون سشن).
- API، ادمین و پاسخ‌های شخصی‌سازی‌شده: `no-store` — هرگز روی CDN کش نمی‌شوند.
