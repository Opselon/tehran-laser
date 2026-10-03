# سند امنیت و مدل تهدیدات کلینیک تهران لیزر (SECURITY.md)

این سند تشریح‌کننده تدابیر امنیتی، سیاست‌های حفاظت از داده‌ها و مدل مهار تهدیدات در سامانه تهران لیزر است (Contract §292, §339).

---

## ۱. مدل تهدیدات و تدابیر متقابل (Threat Modeling & Mitigations)

| تهدید امنیتی | سناریوی حمله | راهکار حفاظتی پیاده‌سازی‌شده |
| :--- | :--- | :--- |
| **سرقت کلمات عبور** | افشای بانک اطلاعاتی یا حملات Brute Force | رمزنگاری با `PBKDF2-SHA256` با ۱۰۰٬۰۰۰ دور تکرار و سالت تصادفی ۱۶ بایتی. |
| **سرقت نشست (Session Hijacking)** | خواندن کوکی توسط اسکریپت‌های مخرب (XSS) | کوکی‌های سشن با پرچم‌های `HttpOnly; Secure; SameSite=Lax` صادر شده و در جاوااسکریپت غیرقابل دسترسی هستند. |
| **افشای توکن از دیتابیس** | نفوذ به دیتابیس و خواندن رکوردهای جدول سشن | توکن خام سشن هرگز در دیتابیس ذخیره نمی‌شود؛ تنها هش `SHA-256(rawToken)` ذخیره می‌گردد. |
| **تداخل و رزرو همزمان** | دو مراجع یک اسلات خالی را در یک صدم ثانیه رزرو کنند | درج در جدول `booking_slots` با کلید یکتای `PRIMARY KEY (slot_key, slot_start)` مانع از درج همزمان شده و یکی را با خطای 409 بازمی‌گرداند. |
| **اسپم و حملات DoS در فرم‌ها** | ارسال ربات‌وار هزاران درخواست رزرو یا ورود | اعمال `rate_limit` مبتنی بر IP کلاینت در پنجره‌های ۱۰ دقیقه‌ای با پاسخ خطای `429 (RATE_LIMITED)`. |
| **تزریق اسکریپت (XSS)** | درج اسکریپت در یادداشت‌ها یا نام مراجعین | فیلتر ورودی‌ها با Zod، رندرینگ امن در ری‌اکت و اعمال سخت‌گیرانه هدر `Content-Security-Policy`. |
| **افزایش سطح دسترسی (Privilege Escalation)** | فراخوانی مستقیم متدهای ادمین با توکن پرسنل عادی | اعتبارسنجی سروری دسترسی‌ها از طریق `requirePermission` در روت‌های API (نه صرفاً مخفی‌سازی دکمه‌ها در UI). |

---

## ۲. هدرهای امنیتی HTTP (Security Headers)

میدلور سرور (`src/middleware.ts`) به صورت خودکار هدرهای امنیتی زیر را بر روی تمامی پاسخ‌ها اعمال می‌نماید (Contract §85):

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## ۳. سیاست نگهداری و انقضای نشست‌ها (Session Lifecycle)

- طول عمر پیش‌فرض هر نشست ادمین: **۷ روز (۱۶۸ ساعت)**.
- هنگام خروج از سامانه (`POST /api/v1/auth/logout`)، رکورد سشن بلافاصله از جدول `sessions` حذف شده و کوکی مرورگر با زمان منقضی (`Max-Age=0`) پاک می‌گردد.
