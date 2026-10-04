# PWA، نصب اپلیکیشن و تجربهٔ موبایل

سایت عمومی «تهران لیزر» **mobile-first** طراحی شده است و به‌عنوان یک **Progressive Web App (PWA)** قابل نصب روی موبایل است.

---

## ۱. فایل مانیفست — `public/manifest.webmanifest`

```json
{
  "name": "کلینیک تهران لیزر",
  "short_name": "تهران لیزر",
  "description": "پلتفرم تخصصی لیزر موهای زائد و زیبایی تهران لیزر",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0f12",
  "theme_color": "#d4af37",
  "dir": "rtl",
  "lang": "fa-IR",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- **آیکون‌ها:** `public/icons/icon-192.png` و `public/icons/icon-512.png` (هر دو معتبر، `purpose: any maskable`).
- **وضعیت نمایش:** `standalone` (شبیه اپ نیتیو، بدون نوار مرورگر).
- **زبان/جهت:** `fa-IR` و `rtl`.
- **رهنمود:** طبق قرارداد این موج، افزودن فیلد `"id": "/"` به مانیفست لازم است تا شرایط نصب‌پذیری کامل شود.

### ارجاع‌های PWA در `src/layouts/PublicLayout.astro`
```html
<meta name="theme-color" content="#d4af37" />
<meta name="application-name" content="کلینیک تهران لیزر" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="تهران لیزر" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

---

## ۲. Service Worker — `public/sw.js`

- نام کش: `tehran-laser-v1`.
- **پیش‌کش (precache):** `/`, `/services`, `/clinic`, `/contact`, `/faq`, `/manifest.webmanifest`.
- **راهبرد:** Network-first برای محتوای عمومی با fallback به کش؛ در ناوبری، در صورت offline به `/` کش‌شده برمی‌گردد و در غیر آن پاسخ `503 Offline`.
- **ممنوعیت مطلق کش درخواست‌های امنیتی:** `POST`/غیر-GET، `/api/**` و `/admin**` هرگز کش نمی‌شوند. (اصل قرارداد §48: ارسال آفلاینِ رزرو نباید هرگز موفقیت جعلی نشان دهد.)
- `install` و `activate` نسخه‌های کش قدیمی را پاک می‌کنند و `clients.claim()` انجام می‌دهند.

### ثبت Service Worker
در `PublicLayout.astro` فقط روی HTTPS و پس از `load`:
```html
<script is:inline>
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
</script>
```

---

## ۳. فرایند نصب (Install flow)

- مرورگر اندروید/دسکتاپ وقتی معیارها برآورده شود رویداد `beforeinstallprompt` را شلیک می‌کند.
- **نکته مهم:** در بررسی سایت زنده، مانیفست و Service Worker **وصل بودند** (۱ ثبت SW، آیکون‌های معتبر ۱۹۲/۵۱۲، `display: standalone`) اما **هیچ رابط نصب (install UI) وجود نداشت** و رویداد `beforeinstallprompt` در هیچ‌جا گرفته نمی‌شد؛ همچنین مانیفست فیلد `id` نداشت.
- **هدف این موج:** نگه‌داشتن `beforeinstallprompt` و نمایش یک کنترل واقعی **«نصب اپلیکیشن»**، افزودن `"id": "/"` به مانیفست و افزودن `apple-touch-icon` سایز ۱۸۰. تأیید نصب‌پذیری از طریق Chrome.
- نصب در iOS از مسیر «Add to Home Screen» مرورگر Safari انجام می‌شود (وب‌اپ استاندارد؛ کنترل نصب خودکار iOS فقط در Safari 16.4+ موجود است).

---

## ۴. تجربهٔ موبایل (Mobile-first)

- **ویوپورت:** `width=device-width, initial-scale=1, viewport-fit=cover` (پشتیبانی از safe-area).
- **نوار پایین (Bottom UI):**
  - در `public.css` در `@media (max-width: 768px)` نوار **`.mobile-sticky-bar`** نمایش داده می‌شود: دو دکمهٔ «تماس تلفنی» و «رزرو آنلاین نوبت» با `position: fixed; bottom: 0` و `padding-bottom: calc(10px + env(safe-area-inset-bottom))`.
  - بدنه در موبایل `padding-bottom: 74px` می‌گیرد تا محتوا زیر نوار پنهان نشود.
  - **وضعیت:** در نقطهٔ پایهٔ این مستند، یک **نوار ناوبری پایین با چهار زبانه (خانه / خدمات / رزرو / تماس)** وجود ندارد؛ فقط نوار CTA چسبان بالا موجود است. طبق CONTRACT هدف، افزودن نوار ناوبری پایین (≤۷۶۸px، اهداف لمسی ≥۴۴px، در صفحات عمومی نه ادمین) جزو دستاوردهای این موج است.
- **دسترس‌پذیری لمسی:** `@media (pointer: coarse)` و اندازه‌های هدف لمسی در `public.css` تعریف شده‌اند.
- **شکست‌های ریسپانسیو:** breakpointهای اصلی `992px / 768px / 576px / 390px / 340px`.
- **نوار موبایل بالا:** دکمهٔ منوی همبرگری (`#mobileMenuBtn`) + کشوی موبایل (`#mobileDrawer`) در `PublicLayout.astro`.
- **آنکت‌های شبکه:** `preconnect`/`dns-prefetch` به `images.unsplash.com` برای Core Web Vitals.

> ⚠️ نوار پایین پرسنلی روی **صفحات عمومی** است و شامل پنل ادمین نمی‌شود. `PublicLayout.astro` (نه `AdminLayout`).
