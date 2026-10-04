# کلینیک تخصصی تهران لیزر (Tehran Laser)

> وب‌سایت رسمی + پنل مدیریت «کلینیک تخصصی تهران لیزر» — کلینیک لیزر موهای زائد در پاسداران، تهران.
> سایت عمومی **فارسی و راست‌به‌چپ (`lang="fa-IR"`, `dir="rtl"`)**، ساخته‌شده با **Astro SSR روی Cloudflare Workers** و پایگاه‌داده **Cloudflare D1 (SQLite)**.

نشانی زنده: `https://tehran-laser.samerkhaldounmarefi.workers.dev/`

---

## ۱. این پروژه چیست؟

یک سامانه دو بخشی:

| بخش | مسیر | توضیح |
| :--- | :--- | :--- |
| **وب‌سایت عمومی** | `/`, `/services`, `/booking`, `/clinic`, `/faq`, `/blog`, `/contact`, `/privacy`, `/terms` | کاتالوگ خدمات و تعرفه‌ها، جادوگر رزرو آنلاین، مجله، صفحات حقوقی. رندر کامل سمت سرور (HTML خالص برای سئو). |
| **پنل مدیریت** | `/admin/**` (ورود از `/admin/login`) | نوبت‌ها، خدمات و تعرفه‌ها، تقویم، شیفت‌ها، مراجعین (CRM)، محتوا، تنظیمات. فقط پرسنل احراز هویت‌شده. |
| **API** | `/api/v1/**` | قرارداد کامل: [`docs/API.md`](docs/API.md) |
| **سلامت** | `/api/health` | پاسخ سبک بدون دیاگنوستیک سنگین |

- **برند:** «کلینیک تهران لیزر» — پاسداران، خیابان پایدارفرد، نبش بوستان هفتم — دستگاه **Candela GentleMax Pro 2024** (الکساندرایت ۷۵۵nm / Nd:YAG 1064nm).
- **منطقه زمانی عملیاتی:** `Asia/Tehran` (`BUSINESS_TIMEZONE` در `wrangler.jsonc`).

> ⚠️ این مخزن صرفاً متعلق به کسب‌وکار «کلینیک تهران لیزر» (پاسداران) است. محتوای، متن، قیمت یا برندِ کلینیک‌های دیگر هرگز نباید وارد این پروژه شود — فقط فهرست نواحی و اعداد تعرفهٔ اختصاصی خودِ این کلینیک معتبر است.

---

## ۲. پشته فناوری

| لایه | فناوری |
| :--- | :--- |
| Runtime | Cloudflare Workers (`workerd`) — بدون سرور دائمی |
| Database | Cloudflare D1 (SQLite) — پرسمان‌های آماده، بدون `SELECT *` |
| Framework | Astro 7 SSR (`output: 'server'`) |
| Islands | React 19 (جادوگر رزرو، داشبورد) |
| Validation | Zod v4 در مرزهای ورودی |
| امنیت | WebCrypto PBKDF2-SHA256، سشن‌های D1 با هش SHA-256 |
| تقویم | `jalaali-js` (نمایش جلالی، ذخیره‌سازی ISO) |
| تست | Vitest + `@cloudflare/vitest-pool-workers` |

---

## ۳. راهنمای مستندات (Docs)

| سند | موضوع |
| :--- | :--- |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | سیستم طراحی، توکن‌ها و **قانون رنگ** (کنتراست AA) |
| [`docs/PRICING.md`](docs/PRICING.md) | **مدل قیمت‌گذاری دو جنسیتی** (بانوان/آقایان) و ویرایش از داشبورد |
| [`docs/DATETIME-JALALI.md`](docs/DATETIME-JALALI.md) | **قرارداد تاریخ جلالی (شمسی)** |
| [`docs/PWA-MOBILE.md`](docs/PWA-MOBILE.md) | **PWA، نصب اپلیکیشن و تجربه موبایل** |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | **استقرار، مسیر ورود ادمین و نکات امنیتی** |
| [`docs/API.md`](docs/API.md) | قرارداد کامل `/api/v1` |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DATABASE.md`](DATABASE.md) · [`SECURITY.md`](SECURITY.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md) | معماری، پایگاه‌داده، امنیت، استقرار |

---

## ۴. دستورات توسعه

```bash
npm install            # نصب وابستگی‌ها
npm run dev            # سرور توسعه محلی
npm run typecheck      # astro sync + tsc --noEmit + astro check (باید ۰ خطا باشد)
npm test               # تست‌های واحد + یکپارچگی D1
npm run build          # بیلد نهایی برای Cloudflare Workers
npm run cf:deploy      # astro build && wrangler deploy  (فقط توسط مالک استقرار)
```

---

## ۵. ساختار مخزن

```text
TehranLasser/
├── migrations/          # مایگریشن‌های ترتیبی D1 (0001 …)
├── public/              # favicon، آیکون‌های PWA، manifest.webmanifest، sw.js
├── src/
│   ├── components/      # جزایر React و اجزای Astro (public, booking, admin, ui)
│   ├── data/            # داده‌های ثابت (مثلاً FAQ)
│   ├── db/              # هلپرهای کوئری D1
│   ├── domain/          # مدل‌ها، قیمت‌گذاری، زمان‌بندی، اعتبارسنجی Zod، RBAC
│   ├── layouts/         # PublicLayout (عمومی) و AdminLayout
│   ├── lib/             # تقویم جلالی، امنیت، API client، SEO
│   ├── pages/           # صفحات عمومی SSR، پنل /admin و روتر /api/v1
│   ├── server/          # ریپازیتوری، رزرو اتمیک، احراز هویت
│   ├── styles/          # tokens.css (منبع یگانه) + base/components/public/admin
│   └── middleware.ts    # هدرهای امنیتی + دروازه احراز هویت
├── docs/                # مستندات (این پوشه)
└── wrangler.jsonc       # پیکربندی Workers + بایندینگ D1
```

---

## ۶. هشدار امنیتی

ورود ادمین از مسیر `/admin/login` انجام می‌شود و **اعتبارنامه‌ها در پایگاه‌داده (جدول `users`) نگهداری می‌شوند** — نه در سورس کد.

- ✅ هرگز نام کاربری، گذرواژه، توکن یا رشته اتصال را در کد، مستندات یا گیت کامیت نکنید.
- ✅ رازها فقط از طریق `wrangler secret put` و بایندینگ محیطی تزریق می‌شوند.
- ❌ جداول `users` و `sessions` هرگز دست‌کاری مستقیم نشوند.
- جزئیات: [`docs/OPERATIONS.md`](docs/OPERATIONS.md) و [`SECURITY.md`](SECURITY.md).

---

<p align="right">© کلینیک تخصصی تهران لیزر — تمامی حقوق محفوظ است.</p>
