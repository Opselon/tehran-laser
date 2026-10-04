# قرارداد تاریخ و زمان — تقویم جلالی (شمسی)

> **قانون:** همهٔ تاریخ‌هایی که **کاربر یا پرسنل** می‌بینند **جلالی/شمسی** هستند. همهٔ تاریخ‌هایی که **ذخیره یا منتقل** می‌شوند **میلادی استاندارد ISO** (`YYYY-MM-DD` برای تاریخ محلی، ISO-8601 UTC برای لحظه) هستند. تبدیل فقط در **مرز نمایش** رخ می‌دهد.

منبع یگانه: **`src/lib/datetime/jalali.ts`** (بر پایهٔ `jalaali-js`).

---

## ۱. دو محور زمانی

| محور | نوع | مثال | محل استفاده |
| :--- | :--- | :--- | :--- |
| **لحظه (Instant)** | ISO-8601 UTC | `2026-10-04T12:30:00.000Z` | `bookings.starts_at/ends_at`، سشن‌ها، لاگ‌ها |
| **تاریخ محلی (Local date)** | `YYYY-MM-DD` به وقت کلینیک | `2026-10-04` | پارامتر `date` در availability، اسلات‌ها |
| **ساعت دیواری (Wall time)** | `HH:MM` | `09:30` | ساعات کاری، شروع اسلات |

منطقهٔ زمانی کلینیک: **`Asia/Tehran`** (متغیر `BUSINESS_TIMEZONE` و تنظیم `timezone`). محاسبات wall-clock در `src/lib/datetime/timezone.ts` انجام می‌شود (بدون وابستگی به APIهای Node؛ سازگار با `workerd`).

---

## ۲. توابع `jalali.ts` (مرجع)

| تابع | ورودی | خروجی | کاربرد |
| :--- | :--- | :--- | :--- |
| `toJalali(localDate)` | `'YYYY-MM-DD'` یا ISO | `{ jy, jm, jd }` | تبدیل پایه به اجزای جلالی |
| `jalaliOfInstant(instantIso, tz)` | ISO + منطقه | `{ jy, jm, jd }` | جلالی از لحظه، به وقت کلینیک |
| **`formatJalaliDate(localDate)`** | `'YYYY-MM-DD'` یا ISO | `'۱۴۰۵/۰۷/۱۲'` | **نمایش استاندارد تاریخ** |
| **`formatJalaliOfInstant(instantIso, tz)`** | ISO + منطقه | `'۱۴۰۵/۰۷/۱۲'` | نمایش تاریخ یک لحظه |
| `formatJalaliDateLong(localDate)` | `'YYYY-MM-DD'` | `'۱۲ مهر ۱۴۰۵'` | نمایش طولانی با نام ماه |
| `persianWeekday(localDate)` | `'YYYY-MM-DD'` | `'شنبه' … 'جمعه'` | نام روز هفته (0=شنبه) |
| `formatTimeFa(timeOfDay)` | `'HH:MM'` | `'۰۹:۳۰'` | ساعت با ارقام فارسی |
| `formatInstantTimeFa(instantIso, tz)` | ISO + منطقه | `'۰۹:۳۰'` | ساعت یک لحظه |
| `formatMoney(amount, label)` | عدد + واحد | `'۲٬۲۹۰ تومان'` | مبلغ (ارقام فارسی، جداکننده «٬») |
| `toPersianDigits(v)` / `toEnglishDigits(v)` | رشته/عدد | رشته | تبدیل ارقام |

**ماه‌ها:** `PERSIAN_MONTHS = فروردین … اسفند` — **روزهای هفته:** `PERSIAN_WEEKDAYS = شنبه … جمعه`.

نکته: `toJalali` برای ورودی خالی مقدار پیش‌فرض `{ jy: 1405, jm: 1, jd: 1 }` و `formatJalaliDate` برای ورودی خالی `'-'` برمی‌گرداند.

---

## ۳. قواعد استفاده

1. **هرگز ISO خام را به کاربر نشان ندهید.** برای هر تاریخ کاربری از `formatJalaliDate` یا `formatJalaliOfInstant` استفاده کنید.
2. **هرگز تاریخ جلالی را ذخیره یا به API نفرستید.** پارامترها و بدنه‌های API همیشه ISO `YYYY-MM-DD` (یا ISO UTC برای لحظه) هستند.
3. **برای لحظه‌ها همیشه منطقهٔ کلینیک را پاس دهید** (`BUSINESS_TIMEZONE`) — نه منطقهٔ مرورگر.
4. **ورودی تاریخ در فرم‌ها باید جلالی باشد.** یک انتخابگر جلالی (`src/components/booking/JalaliCalendar.tsx`) موجود است و باید زیر آن ISO بخواند/بنویسد؛ هیچ تغییر API یا DB لازم نیست.

### نمونهٔ درست
```ts
import { formatJalaliDate, formatJalaliOfInstant } from '@/lib/datetime/jalali';

formatJalaliDate('2026-10-04');                          // '۱۴۰۵/۰۷/۱۲'
formatJalaliOfInstant(booking.startsAt, 'Asia/Tehran');  // '۱۴۰۵/۰۷/۱۲'
```

---

## ۴. وضعیت نواحی ادمین (Pre-wave)

در نقطهٔ پایهٔ این مستندسازی، سه صفحهٔ ادمین هنوز از ورودی میلادی بومی مرورگر استفاده می‌کردند:

| فایل | خط | وضعیت |
| :--- | --: | :--- |
| `src/pages/admin/calendar.astro` | ۹۰ | `type="date"` میلادی |
| `src/pages/admin/festivals.astro` | ۳۹۹ و ۴۰۳ | `type="date"` میلادی |
| `src/pages/admin/schedule/index.astro` | ۳۶۲ | `type="date"` میلادی |

**هدف (طبق CONTRACT):** صفر ورودی `type="date"` بومی در ادمین؛ همهٔ تاریخ‌های ادمین جلالی و قابل انتخاب؛ زیرساخت داده همچنان ISO `YYYY-MM-DD`. (این اصلاح در حیطهٔ Lane C این موج است.)

---

## ۵. تست

منطق جلالی تست واحد دارد (`tests/unit`). هنگام تغییر `jalali.ts`، تست‌های جلالی را اجرا کنید:
```bash
npm run test:unit
```
