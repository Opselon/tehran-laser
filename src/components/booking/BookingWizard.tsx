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

  // Form selections: multiple services supported!
  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<string[]>(
    preselectedSlug ? [preselectedSlug] : [],
  );
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
          if (preselectedSlug) setSelectedServiceSlugs([preselectedSlug]);
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
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 5) continue; // Friday

    const weekdayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    availableDates.push({
      isoDate,
      jalaliLabel: formatJalaliDate(isoDate),
      weekdayName: weekdayNames[dayOfWeek] || '',
    });
  }

  // Load slots when selected services + category + date change
  useEffect(() => {
    if (selectedServiceSlugs.length === 0 || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    setErrorMessage(null);
    setSelectedSlot('');

    const slugsParam = encodeURIComponent(selectedServiceSlugs.join(','));
    fetch(
      `/api/v1/availability?services=${slugsParam}&category=${pricingCategory}&date=${selectedDate}`,
    )
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
  }, [selectedServiceSlugs, pricingCategory, selectedDate]);

  // Multi-service toggle logic
  const toggleServiceSlug = (slug: string) => {
    setSelectedServiceSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  const selectPopularFemale = () => {
    setSelectedServiceSlugs(['underarm', 'bikini', 'full-legs']);
  };

  const clearAllServices = () => {
    setSelectedServiceSlugs([]);
  };

  const selectedServices = services.filter((s) => selectedServiceSlugs.includes(s.slug));
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Quote calculation for all selected services
  const selectedPrices = selectedServices.map((s) => {
    const p = s.prices.find((pr) => pr.pricingCategory === pricingCategory);
    return {
      service: s,
      amount: p?.amount ?? 0,
      hasPrice: Boolean(p),
    };
  });

  const totalBasePrice = selectedPrices.reduce((sum, item) => sum + item.amount, 0);
  const fullBodyPriceItem = selectedPrices.find((pr) => pr.service.slug === 'full-body');
  const discountAmount = fullBodyPriceItem ? Math.round(fullBodyPriceItem.amount * 0.15) : 0;
  const finalPrice = Math.max(0, totalBasePrice - discountAmount);

  // Handlers
  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && selectedServiceSlugs.length === 0) {
      setErrorMessage('لطفاً حداقل یک ناحیه یا خدمت را انتخاب فرمایید.');
      return;
    }
    if (step === 2 && pricingCategory === 'male' && selectedPrices.some((p) => !p.hasPrice)) {
      setErrorMessage(
        'تعرفه خدمات آقایان نیازمند مشاوره تلفنی است. لطفاً با کلینیک تماس حاصل فرمایید.',
      );
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
          serviceSlugs: selectedServiceSlugs,
          serviceSlug: selectedServiceSlugs[0],
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
        setErrorMessage(
          'متأسفانه این زمان توسط مراجعه‌کننده دیگری رزرو شد. لطفاً ساعت دیگری را انتخاب فرمایید.',
        );
        setStep(4);
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
          اطلاعات نوبت شما در سامانه ثبت گردید و جهت هماهنگی و پذیرش آماده است.
        </p>

        <div className="success-details-box">
          <div className="detail-row">
            <span className="detail-label">کد رهگیری رزرو:</span>
            <span className="detail-value highlight-ref" dir="ltr">
              {successResult.reference}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">نواحی و خدمات:</span>
            <span className="detail-value font-semibold">{successResult.serviceName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">بخش پذیرش:</span>
            <span className="detail-value">
              {successResult.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">تاریخ مراجعه:</span>
            <span className="detail-value">{formatJalaliDate(slotDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ساعت حضور:</span>
            <span className="detail-value">{timeFormatted}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">نام مراجع:</span>
            <span className="detail-value">{successResult.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">شماره همراه:</span>
            <span className="detail-value" dir="ltr">
              {successResult.customerPhone}
            </span>
          </div>
          <div className="detail-row highlight-amount-row">
            <span className="detail-label">مبلغ قابل پرداخت در کلینیک:</span>
            <span className="detail-value text-gold">
              {successResult.quotedAmount > 0
                ? `${successResult.quotedAmount.toLocaleString('fa-IR')} هزار تومان`
                : 'استعلام تلفنی'}
            </span>
          </div>
        </div>

        <div className="success-guidelines">
          <h4 className="guidelines-title">نکات مهم قبل از مراجعه:</h4>
          <ul>
            <li>۲۴ ساعت قبل از نوبت، موهای نواحی انتخابی را با تیغ یا ژیلت شیو بفرمایید.</li>
            <li>از مصرف کرم، لوسیون یا بادی اسپلش در روز مراجعه بر روی پوست خودداری کنید.</li>
            <li>حداقل ۱۰ دقیقه قبل از ساعت مقرر در محل کلینیک حضور به هم رسانید.</li>
          </ul>
        </div>

        <div className="success-actions mt-4 text-center">
          <a href="/" className="btn btn-outline">
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-wizard-container">
      {/* Step Indicator */}
      <div className="wizard-stepper">
        <div className="stepper-track">
          <div className="stepper-fill" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
        </div>
        <div className="stepper-steps">
          {[
            { num: 1, title: 'خدمات' },
            { num: 2, title: 'تعرفه' },
            { num: 3, title: 'تاریخ' },
            { num: 4, title: 'ساعت' },
            { num: 5, title: 'اطلاعات' },
            { num: 6, title: 'تأیید' },
          ].map((s) => (
            <div
              key={s.num}
              className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
            >
              <div className="step-circle">{step > s.num ? '✓' : s.num}</div>
              <span className="step-title">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-danger animate-shake mb-4" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Steps Content */}
      <div className="wizard-body">
        {/* Step 1: Select Service(s) */}
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <div className="step-header-with-actions">
              <div>
                <h3 className="step-heading">مرحله اول: انتخاب نواحی لیزر</h3>
                <p className="step-desc">
                  می‌توانید <strong>یک یا چند ناحیه</strong> را جهت انجام در یک جلسه انتخاب فرمایید:
                </p>
              </div>
              <div className="quick-action-pills">
                <button
                  type="button"
                  className="pill-quick-btn"
                  onClick={selectPopularFemale}
                >
                  ✨ پکیج محبوب (زیر بغل + بیکینی + پا)
                </button>
                {selectedServiceSlugs.length > 0 && (
                  <button
                    type="button"
                    className="pill-quick-btn text-muted"
                    onClick={clearAllServices}
                  >
                    ✕ پاک کردن ({selectedServiceSlugs.length})
                  </button>
                )}
              </div>
            </div>

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
                  const isSelected = selectedServiceSlugs.includes(s.slug);

                  return (
                    <div
                      key={s.slug}
                      className={`service-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleServiceSlug(s.slug)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleServiceSlug(s.slug);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      <div className="card-checkbox">
                        <span className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                      <div className="card-details">
                        <div className="card-title-row">
                          <span className="service-name">{s.name}</span>
                          {isPromo && <span className="badge badge-promo">تخفیف ویژه ۱۵٪</span>}
                          {isSelected && <span className="badge badge-selected">انتخاب شد ✓</span>}
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

            {/* Multi-service summary drawer */}
            {selectedServices.length > 0 && (
              <div className="multi-service-summary-bar animate-fade-in mt-4">
                <div className="summary-bar-header">
                  <div className="summary-bar-count">
                    <span className="badge-count">{selectedServices.length}</span>
                    <strong>نواحی انتخاب‌شده برای این جلسه:</strong>
                  </div>
                  <div className="selected-chips-list">
                    {selectedServices.map((s) => (
                      <span key={s.slug} className="service-chip">
                        {s.name}
                        <button
                          type="button"
                          className="chip-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleServiceSlug(s.slug);
                          }}
                          aria-label={`حذف ${s.name}`}
                          title={`حذف ${s.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="summary-bar-footer">
                  <div className="summary-stats">
                    <span className="stat-pill">
                      ⏱ مدت زمان کل: <strong>{totalDurationMinutes} دقیقه</strong>
                    </span>
                    <span className="stat-pill">
                      💳 برآورد تعرفه بانوان:{' '}
                      <strong className="highlight-gold">
                        {finalPrice > 0 ? `${finalPrice.toLocaleString('fa-IR')} هزار تومان` : 'استعلام'}
                      </strong>
                    </span>
                  </div>
                  <button type="button" className="btn btn-primary btn-advance" onClick={handleNext}>
                    تأیید نواحی ({selectedServices.length} مورد) و ادامه ←
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Gender Category */}
        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading">مرحله دوم: تعیین بخش مراجعین</h3>
            <p className="step-desc">بخش مورد نظر جهت ارائه خدمات را انتخاب فرمایید:</p>

            {/* Recap of selected services */}
            <div className="selected-areas-recap mb-4">
              <h4 className="recap-title">
                نواحی انتخاب‌شده شما ({selectedServices.length} ناحیه — ⏱ مجموع {totalDurationMinutes} دقیقه):
              </h4>
              <div className="recap-chips">
                {selectedServices.map((s) => {
                  const p = s.prices.find((pr) => pr.pricingCategory === 'female');
                  return (
                    <div key={s.slug} className="recap-item">
                      <span className="recap-name">{s.name}</span>
                      <span className="recap-price">
                        {p ? `${p.amount.toLocaleString('fa-IR')} هزار تومان` : 'استعلام'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

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
                  <span className="price-highlight">
                    مجموع: {totalBasePrice.toLocaleString('fa-IR')} هزار تومان
                    {discountAmount > 0 && (
                      <span className="discount-badge">
                        با تخفیف ویژه: {finalPrice.toLocaleString('fa-IR')} هزار تومان
                      </span>
                    )}
                  </span>
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
            <p className="step-desc">روز مورد نظر خود را جهت حضور در کلینیک مشخص فرمایید:</p>

            <div className="duration-info-notice mb-3">
              ℹ️ جهت انجام <strong>{selectedServices.length} ناحیه انتخابی</strong> ({selectedServices.map((s) => s.name).join('، ')})، نوبت متوالی به مدت <strong>{totalDurationMinutes} دقیقه</strong> تنظیم می‌شود.
            </div>

            <div className="dates-grid">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.isoDate;
                return (
                  <div
                    key={item.isoDate}
                    className={`date-slot-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(item.isoDate)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(item.isoDate);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    <span className="date-weekday">{item.weekdayName}</span>
                    <span className="date-jalali">{item.jalaliLabel}</span>
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
                    تاریخ انتخابی: <strong>{formatJalaliDate(selectedDate)}</strong>
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
              ساعت‌های آزاد برای نوبت {totalDurationMinutes} دقیقه‌ای در تاریخ {formatJalaliDate(selectedDate)}:
            </p>

            {loadingSlots ? (
              <div className="loading-state py-5 text-center">
                <div className="spinner"></div>
                <p className="mt-3">در حال جستجوی ساعت‌های خالی کلینیک...</p>
              </div>
            ) : availableSlots.filter((s) => s.available).length === 0 ? (
              <div className="empty-state py-4 text-center">
                <p>متأسفانه در این تاریخ ظرفیت خالی پیوسته برای {totalDurationMinutes} دقیقه وجود ندارد.</p>
                <button type="button" className="btn btn-outline mt-2" onClick={() => setStep(3)}>
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
                    ساعت انتخابی:{' '}
                    <strong>
                      {new Date(selectedSlot).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Tehran',
                      })}
                    </strong>
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
                <label htmlFor="custName" className="form-label required">
                  نام و نام خانوادگی:
                </label>
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
                <label htmlFor="custPhone" className="form-label required">
                  شماره تلفن همراه:
                </label>
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
                <label htmlFor="custEmail" className="form-label">
                  آدرس ایمیل (اختیاری):
                </label>
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
                <label htmlFor="custNote" className="form-label">
                  توضیحات یا یادداشت (اختیاری):
                </label>
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
              <div className="summary-row-header mb-3">
                <span className="font-bold">نواحی و خدمات انتخابی ({selectedServices.length} مورد):</span>
              </div>
              <div className="itemized-services-list mb-3">
                {selectedServices.map((s) => {
                  const p = s.prices.find((pr) => pr.pricingCategory === pricingCategory);
                  return (
                    <div key={s.slug} className="itemized-row">
                      <span className="item-name">
                        • {s.name} <span className="item-duration text-muted">({s.durationMinutes} دقیقه)</span>
                      </span>
                      <span className="item-price">
                        {p ? `${p.amount.toLocaleString('fa-IR')} هزار تومان` : 'استعلام'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-row">
                <span className="label">بخش پذیرش:</span>
                <span className="value">{pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</span>
              </div>
              <div className="summary-row">
                <span className="label">مدت زمان کل:</span>
                <span className="value">⏱ {totalDurationMinutes} دقیقه</span>
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
                <span className="value" dir="ltr">
                  {customerPhone}
                </span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row">
                <span className="label">مجموع تعرفه مصوب:</span>
                <span className="value">
                  {pricingCategory === 'female'
                    ? `${totalBasePrice.toLocaleString('fa-IR')} هزار تومان`
                    : 'استعلام حضوری / تلفنی'}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row text-success">
                  <span className="label">تخفیف پکیج کل بدن (۱۵٪):</span>
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
            {step === 1 && `مرحله بعد: تعیین بخش (${selectedServices.length} ناحیه) →`}
            {step === 2 && 'مرحله بعد: انتخاب تاریخ →'}
            {step === 3 && 'مرحله بعد: انتخاب ساعت →'}
            {step === 4 && 'مرحله بعد: اطلاعات مراجع →'}
            {step === 5 && 'مرحله بعد: پیش‌فاکتور و تأیید →'}
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
