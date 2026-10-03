# معماری پلتفرم دیجیتال کلینیک تهران لیزر (Tehran Laser Architecture)

این سند تشریح‌کننده تصمیمات معماری، ساختار لایه‌ها، مدل همزمانی، امنیت و جریان داده در پلتفرم تهران لیزر است.

---

## ۱. اصول بنیادین طراحی (Architectural North Stars)

1. **Cloudflare-First و Serverless Native:**
   تمامی محاسبات در محیط اجرایی ایزوله `workerd` (Cloudflare Workers) انجام می‌پذیرد. هیچ فرآیند پس‌زمینه دائمی (No long-running Node daemon) یا فایل‌سیستم وابسته به سیستم‌عامل محلی وجود ندارد.
2. **رندرینگ سمت سرور (Astro SSR):**
   صفحات عمومی وب‌سایت به صورت کامل سمت سرور پردازش شده و کدهای HTML بدون نیاز به جاوااسکریپت به کاربر و خزنده‌های موتورهای جستجو تحویل داده می‌شوند.
3. **سرور مقتدر در قیمت‌گذاری و زمان‌بندی (Server-Authoritative):**
   قیمت نهایی، مدت زمان، تخفیف و اسلات‌های خالی منحصراً توسط سرور و موتور دامنه محاسبه می‌شوند. هیچ قیمت یا اسلات ارسالی از سمت کلاینت مورد اعتماد قرار نمی‌گیرد.
4. **حفاظت قطعی در برابر رزرو همزمان (Double-Booking Proof):**
   با بهره‌گیری از جدول اختصاصی اسلات‌ها و کلیدهای اصلی یکتا (`PRIMARY KEY (slot_key, slot_start)`), همزمانی رزرو در لایه پایگاه داده مدیریت شده و بروز تداخل غیرممکن است.

---

## ۲. دیاگرام لایه‌های سامانه (System Layers)

```text
┌─────────────────────────────────────────────────────────────┐
│                 Browser Client (PWA / Mobile)               │
│   - Astro SSR Pages (Pure HTML/CSS)                         │
│   - Selective React Islands (BookingWizard, AdminDashboard) │
│   - Typed API Client (src/lib/api/client.ts)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / Fetch (/api/v1/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloudflare Workers Runtime (workerd)          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Middleware (src/middleware.ts)                      │   │
│   │  - Security Headers (CSP, HSTS, X-Content-Type)     │   │
│   │  - Session Cookie Validation (tl_session)           │   │
│   │  - Astro.locals.auth Population                     │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ HTTP Router (src/server/http/router.ts)             │   │
│   │  - Rate Limiting (Fixed Window per IP)              │   │
│   │  - Zod Request Schema Validation                    │   │
│   │  - RBAC Permission Enforcement (requirePermission)  │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Domain & Business Core (src/domain/*)               │   │
│   │  - Pricing Engine (calculateQuote)                  │   │
│   │  - Availability Engine (calculateAvailability)      │   │
│   │  - Booking State Machine (canTransitionBookingState)│   │
│   │  - Jalali Date Helpers (src/lib/datetime/*)         │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Repositories & Transaction Layer                    │   │
│   │  - Booking Writer (src/server/booking.ts)           │   │
│   │  - Data Repositories (src/server/repositories.ts)   │   │
│   │  - Session Manager (src/server/auth/session.ts)     │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ Prepared Statements / SQL    │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Cloudflare D1 Database (tehran-laser-db)            │   │
│   │  - Tables, Unique Constraints, Foreign Keys         │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## ۳. موتور دسترسی‌پذیری و کوانتیزاسیون زمان (Availability Engine)

- **منطقه زمانی استاندارد کلینیک:** تمامی ساعت‌های کاری و محاسبات اسلات در منطقه زمانی `Asia/Tehran` انجام می‌پذیرد.
- **تفکیک بازه‌های کاری:** هر روز می‌تواند شامل چندین بازه کاری باز باشد (مانند شنبه تا چهارشنبه ۹ الی ۱۳ و ۱۴ الی ۲۰).
- **روزهای تعطیل و استثنائات:** جدول `schedule_exceptions` روزهای تعطیل رسمی، ساعات خاص یا زمان‌های بلاک‌شده توسط مدیریت را اعمال می‌کند.
- **محاسبه گام‌های زمانی:** اسلات‌ها بر اساس گام زمانی ۳۰ دقیقه‌ای (`slot_granularity_minutes`) همراه با مدت زمان خدمت و بافر تمیزکاری محاسبه می‌شوند.

---

## ۴. استراتژی ایمنی همزمانی (Double-Booking Protection)

جهت جلوگیری از بروز شرایط مسابقه (Race Condition) هنگام ارسال همزمان درخواست رزرو توسط دو مراجعه‌کننده برای یک زمان:
1. جدول `booking_slots` در پایگاه داده ایجاد شده است:
   ```sql
   CREATE TABLE booking_slots (
     slot_key TEXT NOT NULL,
     slot_start TEXT NOT NULL,
     booking_id TEXT NOT NULL,
     PRIMARY KEY (slot_key, slot_start)
   );
   ```
2. هنگام ثبت نوبت، تمام اسلات‌های تحت پوشش خدمت به صورت یکجا در این جدول درج می‌گردند.
3. در صورت تلاش دو مراجع برای یک زمان، دقیقاً یک درخواست موفق به درج شده و دیگری بلافاصله با خطای `409 Conflict (BOOKING_CONFLICT)` مواجه می‌شود.

---

## ۵. امنیت و احراز هویت (Security & RBAC)

- **رمزنگاری کلمات عبور:** الگوریتم استاندارد `PBKDF2-SHA256` با ۱۰۰٬۰۰۰ دور تکرار و سالت ۱۶ بایتی تصادفی. فرمت ذخیره‌سازی: `pbkdf2-sha256$100000$<saltB64>$<hashB64>`.
- **نشست‌های سروری ایمن:** کوکی سشن با پرچم‌های `HttpOnly; Secure; SameSite=Lax` صادر می‌شود. توکن خام سشن هرگز در دیتابیس ذخیره نشده و تنها هش `SHA-256(rawToken)` نگهداری می‌شود.
- **کنترل دسترسی نقش‌محور (RBAC):** نقش‌های `SUPER_ADMIN`، `ADMIN`، `MANAGER`، `STAFF` و `EDITOR` تعریف شده و مجوزهای دقیق روی هر اندپوینت اعمال می‌گردد.
