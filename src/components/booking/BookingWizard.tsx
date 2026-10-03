import { useState, useEffect } from 'react';
import type { PublicServiceDto, AvailabilitySlotDto } from '../../domain/api/dto.types';
import type { PricingCategory } from '../../domain/booking/booking.types';
import { formatJalaliDate } from '../../lib/datetime/jalali';

interface BookingWizardProps {
  initialServices?: PublicServiceDto[] | undefined;
  preselectedSlug?: string | undefined;
}

interface BookingSuccessResult {
  bookingId: string;
  reference: string;
  status: string;
  startsAt: string;
  serviceName: string;
  pricingCategory: PricingCategory;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
}

export function BookingWizard({ initialServices = [], preselectedSlug }: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<PublicServiceDto[]>(initialServices);
  const [loadingServices, setLoadingServices] = useState<boolean>(initialServices.length === 0);

  // Form selections
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(preselectedSlug ?? '');
  const [pricingCategory, setPricingCategory] = useState<PricingCategory>('female');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Customer info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BookingSuccessResult | null>(null);

  // Load services if not passed
  useEffect(() => {
    if (initialServices.length > 0) return;
    fetch('/api/v1/services')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.data) {
          setServices(data.data);
          if (preselectedSlug) setSelectedServiceSlug(preselectedSlug);
        }
      })
      .catch(() => setErrorMessage('خطا در دریافت لیست خدمات. لطفاً صفحه را تازه‌سازی کنید.'))
      .finally(() => setLoadingServices(false));
  }, [initialServices, preselectedSlug]);

  // Generate the next 14 available days (skipping Fridays where closed)
  const availableDates: Array<{ isoDate: string; jalaliLabel: string; weekdayName: string }> = [];
  const today = new Date();
  for (let i = 1; i <= 21 && availableDates.length < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Friday is day 5 in js Date (0 is Sunday, 5 is Friday in UTC/local)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = d.getDay();
    // 5 = Friday in standard JS getDay
    if (dayOfWeek === 5) continue;

    const weekdayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    availableDates.push({
      isoDate,
      jalaliLabel: formatJalaliDate(isoDate),
      weekdayName: weekdayNames[dayOfWeek] || '',
    });
  }

  // Load slots when service + category + date change
  useEffect(() => {
    if (!selectedServiceSlug || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    setErrorMessage(null);
    setSelectedSlot('');

    fetch(`/api/v1/availability?service=${encodeURIComponent(selectedServiceSlug)}&category=${pricingCategory}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.data && data.data.slots) {
          setAvailableSlots(data.data.slots);
        } else if (data.error) {
          setErrorMessage(data.error.message || 'زمان‌های این روز در دسترس نیست.');
        }
      })
      .catch(() => setErrorMessage('خطا در دریافت زمان‌های خالی.'))
      .finally(() => setLoadingSlots(false));
  }, [selectedServiceSlug, pricingCategory, selectedDate]);

  const selectedService = services.find((s) => s.slug === selectedServiceSlug);
  const currentPrice = selectedService?.prices.find((p) => p.pricingCategory === pricingCategory);

  // Quote calculation for display
  const basePrice = currentPrice?.amount ?? 0;
  // 15% discount for full-body on site
  const discountAmount = selectedService?.slug === 'full-body' ? Math.round(basePrice * 0.15) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Handlers
  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && !selectedServiceSlug) {
      setErrorMessage('لطفاً یک خدمت را انتخاب فرمایید.');
      return;
    }
    if (step === 2 && pricingCategory === 'male' && !currentPrice) {
      setErrorMessage('تعرفه خدمات آقایان نیازمند مشاوره تلفنی است. لطفاً با کلینیک تماس حاصل فرمایید.');
      return;
    }
    if (step === 3 && !selectedDate) {
      setErrorMessage('لطفاً تاریخ مد نظر خود را انتخاب کنید.');
      return;
    }
    if (step === 4 && !selectedSlot) {
      setErrorMessage('لطفاً ساعت نوبت را انتخاب فرمایید.');
      return;
    }
    if (step === 5) {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setErrorMessage('لطفاً نام و نام خانوادگی خود را به درستی وارد فرمایید.');
        return;
      }
      const cleanPhone = customerPhone.replace(/[\s-]/g, '');
      if (!/^(09|\+989)\d{9}$/.test(cleanPhone)) {
        setErrorMessage('لطفاً شماره تلفن همراه ۱۱ رقمی معتبر وارد فرمایید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
        return;
      }
    }
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: selectedServiceSlug,
          pricingCategory,
          startsAt: selectedSlot,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          note: customerNote.trim() || undefined,
        }),
      });

      const body = (await res.json()) as any;
      if (res.status === 201 && body.data) {
        setSuccessResult(body.data);
      } else if (res.status === 409) {
        setErrorMessage('متأسفانه این زمان توسط مراجعه‌کننده دیگری رزرو شد. لطفاً ساعت دیگری را انتخاب فرمایید.');
        setStep(4); // Go back to slot selection
      } else {
        setErrorMessage(body.error?.message || 'خطا در ثبت نوبت. لطفاً دوباره تلاش فرمایید.');
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور. اتصال اینترنت خود را بررسی فرمایید.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 6 / Confirmation View
  if (successResult) {
    const slotDate = successResult.startsAt.slice(0, 10);
    const slotTimeUtc = new Date(successResult.startsAt);
    const timeFormatted = slotTimeUtc.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    });

    return (
      <div className="booking-success-card animate-scale-in">
        <div className="success-icon-wrap">
          <span className="success-check">✓</span>
        </div>
        <h2 className="success-title">رزرو شما با موفقیت ثبت شد</h2>
        <p className="success-subtitle">
          اطلاعات نوبت شما در سامانه ثبت گردید و جهت تأیید نهایی برای پذیرش ارسال شد.
        </p>

        <div className="success-details-box">
          <div className="detail-row">
            <span className="detail-label">کد رهگیری رزرو:</span>
            <span className="detail-value highlight-ref" dir="ltr">{successResult.reference}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">خدمت:</span>
            <span className="detail-value">{successResult.serviceName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">بخش:</span>
            <span className="detail-value">{successResult.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">تاریخ و زمان:</span>
            <span className="detail-value">{formatJalaliDate(slotDate)} — ساعت {timeFormatted}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">مبلغ مصوب:</span>
            <span className="detail-value">{successResult.quotedAmount.toLocaleString('fa-IR')} هزار تومان</span>
          </div>
          {successResult.discountAmount > 0 && (
            <div className="detail-row text-success">
              <span className="detail-label">تخفیف آنلاین (۱۵٪):</span>
              <span className="detail-value">{successResult.discountAmount.toLocaleString('fa-IR')} هزار تومان</span>
            </div>
          )}
          <div className="detail-row total-row">
            <span className="detail-label">مبلغ نهایی قابل پرداخت در کلینیک:</span>
            <span className="detail-value bold">
              {(successResult.quotedAmount - successResult.discountAmount).toLocaleString('fa-IR')} هزار تومان
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">وضعیت:</span>
            <span className="badge badge-warning">در انتظار تأیید منشی</span>
          </div>
        </div>

        <div className="clinic-location-reminder">
          <h4>اطلاعات کلینیک تهران لیزر:</h4>
          <p><strong>آدرس:</strong> پاسداران، خیابان پایدارفرد، نبش بوستان هفتم</p>
          <p><strong>شماره پشتیبانی:</strong> <a href="tel:+989035555090" dir="ltr">۰۹۰۳ ۵۵۵ ۵۰۹۰</a></p>
          <p className="small text-muted mt-1">همکاران ما پیش از موعد نوبت جهت هماهنگی نهایی با شما تماس خواهند گرفت.</p>
        </div>

        <div className="success-actions mt-4">
          <a href="/" className="btn btn-outline">بازگشت به صفحه اصلی</a>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSuccessResult(null);
              setStep(1);
              setSelectedSlot('');
            }}
          >
            ثبت رزرو جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-wizard-container">
      {/* Progress Bar */}
      <div className="wizard-stepper">
        <div className="stepper-track">
          <div className="stepper-fill" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
        </div>
        <div className="stepper-steps">
          {['خدمت', 'تعرفه', 'تاریخ', 'ساعت', 'اطلاعات', 'تأیید'].map((title, idx) => (
            <div
              key={idx}
              className={`step-item ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'completed' : ''}`}
            >
              <div className="step-circle">{step > idx + 1 ? '✓' : idx + 1}</div>
              <span className="step-title">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="alert alert-danger animate-fade-in mb-4" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Wizard Steps */}
      <div className="wizard-body">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله اول: انتخاب خدمت لیزر</h3>
            <p className="step-desc">ناحیه مورد نظر خود را جهت انجام لیزر انتخاب فرمایید:</p>

            {loadingServices ? (
              <div className="loading-state py-5 text-center">
                <div className="spinner"></div>
                <p className="mt-3">در حال بارگذاری لیست خدمات کلینیک...</p>
              </div>
            ) : (
              <div className="services-selection-grid">
                {services.map((s) => {
                  const fPrice = s.prices.find((p) => p.pricingCategory === 'female');
                  const isPromo = s.slug === 'full-body';
                  const isSelected = selectedServiceSlug === s.slug;

                  return (
                    <div
                      key={s.slug}
                      className={`service-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedServiceSlug(s.slug)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedServiceSlug(s.slug);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      <div className="card-radio">
                        <span className={`radio-indicator ${isSelected ? 'checked' : ''}`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                      <div className="card-details">
                        <div className="card-title-row">
                          <span className="service-name">{s.name}</span>
                          {isPromo && <span className="badge badge-promo">تخفیف ویژه ۱۵٪</span>}
                          {isSelected && <span className="badge badge-selected">انتخاب شده ✓</span>}
                        </div>
                        <p className="service-short-desc">{s.shortDescription || s.description}</p>
                        <div className="card-price-row">
                          <span className="price-val">
                            {fPrice ? `${fPrice.amount.toLocaleString('fa-IR')} هزار تومان` : 'استعلام قیمت'}
                          </span>
                          <span className="duration-tag">⏱ {s.durationMinutes} دقیقه</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedService && (
              <div className="selection-confirmation-banner animate-fade-in mt-4">
                <div className="banner-text">
                  <span className="banner-icon">✓</span>
                  <span>
                    خدمت انتخابی: <strong>{selectedService.name}</strong>
                  </span>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
                  تأیید و انتخاب بخش (بانوان / آقایان) ←
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Gender Category */}
        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله دوم: تعیین بخش مراجعین</h3>
            <p className="step-desc">بخش مورد نظر جهت ارائه خدمات را انتخاب فرمایید:</p>

            <div className="gender-selection-cards">
              <div
                className={`gender-card ${pricingCategory === 'female' ? 'selected' : ''}`}
                onClick={() => setPricingCategory('female')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPricingCategory('female');
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={pricingCategory === 'female'}
              >
                <div className="gender-icon">👩</div>
                <div className="gender-title">
                  بخش بانوان {pricingCategory === 'female' && <span className="badge badge-selected">✓</span>}
                </div>
                <p className="gender-desc">دستگاه اختصاصی، اپراتور مجرب خانم، تعرفه مصوب</p>
                <div className="gender-price-preview">
                  {currentPrice ? (
                    <span className="price-highlight">
                      {basePrice.toLocaleString('fa-IR')} هزار تومان
                      {discountAmount > 0 && (
                        <span className="discount-badge">
                          با تخفیف سایت: {finalPrice.toLocaleString('fa-IR')}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>تعرفه استاندارد کلینیک</span>
                  )}
                </div>
              </div>

              <div
                className={`gender-card ${pricingCategory === 'male' ? 'selected' : ''}`}
                onClick={() => setPricingCategory('male')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPricingCategory('male');
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={pricingCategory === 'male'}
              >
                <div className="gender-icon">👨</div>
                <div className="gender-title">
                  بخش آقایان {pricingCategory === 'male' && <span className="badge badge-selected">✓</span>}
                </div>
                <p className="gender-desc">اپراتور آقا، متناسب با تراکم و ضخامت موهای آقایان</p>
                <div className="gender-price-preview">
                  <span className="text-muted">استعلام تلفنی تعرفه</span>
                </div>
              </div>
            </div>

            {pricingCategory === 'male' && (
              <div className="alert alert-info mt-4">
                <span>
                  نکته: تعرفه خدمات آقایان به دلیل تفاوت در تعداد شات و دستگاه، در هنگام مراجعه یا با تماس تلفنی (۰۹۰۳ ۵۵۵ ۵۰۹۰) اعلام می‌گردد. ثبت نوبت به صورت اولیه و رایگان انجام می‌شود.
                </span>
              </div>
            )}

            <div className="selection-confirmation-banner animate-fade-in mt-4">
              <div className="banner-text">
                <span className="banner-icon">✓</span>
                <span>
                  بخش انتخابی: <strong>{pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</strong>
                </span>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
                تأیید و انتخاب تاریخ مراجعه ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Date */}
        {step === 3 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله سوم: انتخاب روز مراجعه</h3>
            <p className="step-desc">تاریخ مد نظر خود را برای حضور در کلینیک پاسداران مشخص فرمایید:</p>

            <div className="dates-grid">
              {availableDates.map((d) => {
                const isSelected = selectedDate === d.isoDate;
                return (
                  <div
                    key={d.isoDate}
                    className={`date-slot-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(d.isoDate)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(d.isoDate);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    <span className="date-weekday">{d.weekdayName}</span>
                    <span className="date-jalali">{d.jalaliLabel}</span>
                    {isSelected && <span className="date-selected-check">✓</span>}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="selection-confirmation-banner animate-fade-in mt-4">
                <div className="banner-text">
                  <span className="banner-icon">✓</span>
                  <span>
                    روز انتخابی: <strong>{formatJalaliDate(selectedDate)}</strong>
                  </span>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
                  تأیید و مشاهده ساعت‌های آزاد ←
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Select Time Slot */}
        {step === 4 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله چهارم: انتخاب ساعت نوبت</h3>
            <p className="step-desc">
              ساعت‌های آزاد کلینیک در تاریخ {formatJalaliDate(selectedDate)}:
            </p>

            {loadingSlots ? (
              <div className="loading-state py-5 text-center">
                <div className="spinner"></div>
                <p className="mt-3">در حال استعلام زمان‌های در دسترس...</p>
              </div>
            ) : availableSlots.filter((s) => s.available).length === 0 ? (
              <div className="empty-slots-box">
                <p>متأسفانه در این تاریخ تمامی نوبت‌ها تکمیل شده است.</p>
                <button type="button" className="btn btn-outline btn-sm mt-2" onClick={() => setStep(3)}>
                  انتخاب تاریخ دیگر
                </button>
              </div>
            ) : (
              <div className="slots-selection-grid">
                {availableSlots
                  .filter((s) => s.available)
                  .map((slot) => {
                    const isSelected = selectedSlot === slot.startsAt;
                    const slotUtc = new Date(slot.startsAt);
                    const timeStr = slotUtc.toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Tehran',
                    });

                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        className={`time-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot.startsAt)}
                        aria-pressed={isSelected}
                      >
                        ⏱ ساعت {timeStr} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
              </div>
            )}

            {selectedSlot && (
              <div className="selection-confirmation-banner animate-fade-in mt-4">
                <div className="banner-text">
                  <span className="banner-icon">✓</span>
                  <span>
                    ساعت انتخابی: <strong>{new Date(selectedSlot).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}</strong>
                  </span>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
                  تأیید و تکمیل مشخصات مراجع ←
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Customer Information */}
        {step === 5 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله پنجم: مشخصات مراجع</h3>
            <p className="step-desc">جهت ثبت نوبت و ارسال پیامک هماهنگی، اطلاعات زیر را وارد نمایید:</p>

            <div className="booking-form-fields">
              <div className="form-group mb-3">
                <label htmlFor="custName" className="form-label required">نام و نام خانوادگی:</label>
                <input
                  id="custName"
                  type="text"
                  className="form-control"
                  placeholder="مثال: سارا محمدی"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custPhone" className="form-label required">شماره تلفن همراه:</label>
                <input
                  id="custPhone"
                  type="tel"
                  dir="ltr"
                  className="form-control text-left"
                  placeholder="09123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
                <span className="form-hint">شماره همراه جهت هماهنگی و ارسال تأییدیه</span>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custEmail" className="form-label">آدرس ایمیل (اختیاری):</label>
                <input
                  id="custEmail"
                  type="email"
                  dir="ltr"
                  className="form-control text-left"
                  placeholder="sara@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custNote" className="form-label">توضیحات یا یادداشت (اختیاری):</label>
                <textarea
                  id="custNote"
                  className="form-control"
                  rows={3}
                  placeholder="مثال: جلسه اول / پوست حساس..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Summary & Confirmation */}
        {step === 6 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله نهایی: بازبینی و تأیید پیش‌فاکتور</h3>
            <p className="step-desc">اطلاعات نوبت خود را بررسی و با فشردن دکمه زیر نهایی فرمایید:</p>

            <div className="summary-invoice-card">
              <div className="summary-row">
                <span className="label">خدمت انتخابی:</span>
                <span className="value font-semibold">{selectedService?.name}</span>
              </div>
              <div className="summary-row">
                <span className="label">بخش:</span>
                <span className="value">{pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</span>
              </div>
              <div className="summary-row">
                <span className="label">مدت زمان تقریبی:</span>
                <span className="value">⏱ {selectedService?.durationMinutes} دقیقه</span>
              </div>
              <div className="summary-row">
                <span className="label">تاریخ نوبت:</span>
                <span className="value">{formatJalaliDate(selectedDate)}</span>
              </div>
              <div className="summary-row">
                <span className="label">ساعت حضور:</span>
                <span className="value font-semibold">
                  {selectedSlot &&
                    new Date(selectedSlot).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Tehran',
                    })}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">نام مراجع:</span>
                <span className="value">{customerName}</span>
              </div>
              <div className="summary-row">
                <span className="label">شماره همراه:</span>
                <span className="value" dir="ltr">{customerPhone}</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row">
                <span className="label">تعرفه مصوب:</span>
                <span className="value">
                  {pricingCategory === 'female'
                    ? `${basePrice.toLocaleString('fa-IR')} هزار تومان`
                    : 'استعلام حضوری / تلفنی'}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row text-success">
                  <span className="label">تخفیف ویژه سایت (۱۵٪):</span>
                  <span className="value">-{discountAmount.toLocaleString('fa-IR')} هزار تومان</span>
                </div>
              )}
              <div className="summary-row total-amount-row">
                <span className="label">مبلغ نهایی قابل پرداخت:</span>
                <span className="value total-price">
                  {pricingCategory === 'female'
                    ? `${finalPrice.toLocaleString('fa-IR')} هزار تومان`
                    : 'مشاوره رایگان'}
                </span>
              </div>
              <p className="payment-notice">
                💳 پرداخت مبلغ در کلینیک و پس از انجام خدمت صورت می‌پذیرد.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      <div className="wizard-footer">
        {step > 1 && (
          <button type="button" className="btn btn-outline" onClick={handleBack} disabled={submitting}>
            بازگشت به مرحله قبل
          </button>
        )}

        {step < 6 ? (
          <button type="button" className="btn btn-primary mr-auto" onClick={handleNext}>
            {step === 1 && 'مرحله بعد (تعیین بخش بانوان / آقایان) →'}
            {step === 2 && 'مرحله بعد (انتخاب تاریخ) →'}
            {step === 3 && 'مرحله بعد (انتخاب ساعت) →'}
            {step === 4 && 'مرحله بعد (اطلاعات مراجع) →'}
            {step === 5 && 'مرحله بعد (پیش‌فاکتور و تأیید) →'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg mr-auto submit-booking-btn"
            onClick={handleSubmitBooking}
            disabled={submitting}
          >
            {submitting ? 'در حال ثبت نوبت...' : 'تأیید نهایی و ثبت رزرو'}
          </button>
        )}
      </div>
    </div>
  );
}
