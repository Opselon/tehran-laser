import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PublicServiceDto, AvailabilitySlotDto } from '../../domain/api/dto.types';
import type { PricingCategory } from '../../domain/booking/booking.types';
import { IconReact } from '../ui/IconReact';
import { JalaliCalendar } from './JalaliCalendar';
import {
  addDays,
  isoDayOf,
  isValidEmail,
  isValidName,
  isValidPhone,
  moneyFa,
  persianWeekIndex,
  timeFa,
  toLocalPhone,
  TOTAL_STEPS,
  STEP_META,
  type BookingSuccessResult,
  type CustomerDraft,
  type CustomerErrors,
  type QuoteTotals,
} from './booking-shared';
import './booking-wizard.css';

interface BookingWizardProps {
  initialServices?: PublicServiceDto[] | undefined;
  preselectedSlug?: string | undefined;
}

const EMPTY_CUSTOMER: CustomerDraft = { name: '', phone: '', email: '', note: '' };

const NEXT_LABEL: Record<number, string> = {
  1: 'ادامه: تاریخ و ساعت',
  2: 'ادامه: مشخصات مراجع',
  3: 'ادامه: بررسی و تأیید',
};

export function BookingWizard({ initialServices = [], preselectedSlug }: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<PublicServiceDto[]>(initialServices);
  const [loadingServices, setLoadingServices] = useState<boolean>(initialServices.length === 0);
  const [servicesFailed, setServicesFailed] = useState<boolean>(false);

  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<string[]>(() =>
    preselectedSlug ? [preselectedSlug] : [],
  );
  const [pricingCategory, setPricingCategory] = useState<PricingCategory>('female');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [customer, setCustomer] = useState<CustomerDraft>(EMPTY_CUSTOMER);
  const [fieldErrors, setFieldErrors] = useState<CustomerErrors>({});

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BookingSuccessResult | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const idempotencyKey = useRef<string>(makeIdempotencyKey());

  /* ── Services ─────────────────────────────────────────────── */

  const loadServices = useCallback(() => {
    setLoadingServices(true);
    setServicesFailed(false);
    fetch('/api/v1/services')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('services'))))
      .then((raw: unknown) => {
        const data = raw as { data?: PublicServiceDto[] };
        const list = Array.isArray(data.data) ? data.data : [];
        setServices(list);
        if (preselectedSlug && !list.some((s) => s.slug === preselectedSlug)) {
          setSelectedServiceSlugs((prev) => prev.filter((slug) => slug !== preselectedSlug));
        }
      })
      .catch(() => {
        setServicesFailed(true);
        setErrorMessage('خطا در دریافت لیست خدمات. لطفاً دوباره تلاش کنید.');
      })
      .finally(() => setLoadingServices(false));
  }, [preselectedSlug]);

  useEffect(() => {
    if (initialServices.length > 0) return;
    loadServices();
  }, [initialServices.length, loadServices]);

  /* ── Availability ─────────────────────────────────────────── */

  useEffect(() => {
    if (selectedServiceSlugs.length === 0 || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setErrorMessage(null);
    setSelectedSlot('');

    const slugsParam = encodeURIComponent(selectedServiceSlugs.join(','));
    fetch(`/api/v1/availability?services=${slugsParam}&category=${pricingCategory}&date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('availability'))))
      .then((raw: unknown) => {
        if (cancelled) return;
        const data = raw as { data?: { slots?: AvailabilitySlotDto[] } };
        setAvailableSlots(Array.isArray(data.data?.slots) ? (data.data?.slots ?? []) : []);
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('خطا در دریافت زمان‌های خالی. لطفاً دوباره تلاش کنید.');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedServiceSlugs, pricingCategory, selectedDate]);

  /* ── Selection helpers ────────────────────────────────────── */

  const toggleServiceSlug = (slug: string) => {
    setSelectedServiceSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setErrorMessage(null);
  };

  const selectedServices = services.filter((s) => selectedServiceSlugs.includes(s.slug));
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const quote: QuoteTotals = useMemo(() => {
    let base = 0;
    let discount = 0;
    let missingPrice = false;
    for (const s of selectedServices) {
      const price = s.prices.find((p) => p.pricingCategory === pricingCategory);
      if (!price) {
        missingPrice = true;
        continue;
      }
      base += price.amount;
      if (s.slug === 'full-body') discount = Math.round(price.amount * 0.15);
    }
    return { base, discount, final: Math.max(0, base - discount), missingPrice };
  }, [selectedServices, pricingCategory]);

  /* ── Selectable days (clinic is closed on Fridays) ────────── */

  const selectableDates = useMemo<string[]>(() => {
    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 90; i++) {
      const d = addDays(today, i);
      if (persianWeekIndex(isoDayOf(d)) === 6) continue; // جمعه
      days.push(isoDayOf(d));
    }
    return days;
  }, []);

  /* ── Navigation & validation ──────────────────────────────── */

  const focusStep = () => {
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    });
  };

  const goTo = (next: number) => {
    setErrorMessage(null);
    setStep(next);
    focusStep();
  };

  const validateStep = (current: number): string | null => {
    if (current === 1) {
      if (selectedServiceSlugs.length === 0) return 'لطفاً حداقل یک ناحیه یا خدمت را انتخاب فرمایید.';
      if (pricingCategory === 'male' && quote.missingPrice) {
        return 'تعرفه خدمات آقایان نیازمند مشاوره تلفنی است. لطفاً با کلینیک تماس حاصل فرمایید.';
      }
      return null;
    }
    if (current === 2) {
      if (!selectedDate) return 'لطفاً تاریخ مراجعه را از تقویم انتخاب کنید.';
      if (!selectedSlot) return 'لطفاً یکی از ساعت‌های آزاد را انتخاب فرمایید.';
      return null;
    }
    if (current === 3) {
      const errors: CustomerErrors = {};
      if (!isValidName(customer.name)) {
        errors.name = 'نام و نام خانوادگی را به درستی وارد فرمایید.';
      }
      if (!isValidPhone(customer.phone)) {
        errors.phone = 'شماره همراه معتبر وارد فرمایید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).';
      }
      if (!isValidEmail(customer.email)) {
        errors.email = 'آدرس ایمیل معتبر نیست.';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return 'برخی از اطلاعات واردشده معتبر نیستند؛ فیلدهای مشخص‌شده را اصلاح کنید.';
      }
      setFieldErrors({});
      return null;
    }
    return null;
  };

  const handleNext = () => {
    const problem = validateStep(step);
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    if (step === 1) {
      setErrorMessage(null);
      if (selectedDate && !selectableDates.includes(selectedDate)) setSelectedDate('');
      goTo(Math.min(TOTAL_STEPS - 1, step + 1));
      return;
    }
    goTo(Math.min(TOTAL_STEPS, step + 1));
  };

  const handleBack = () => goTo(Math.max(1, step - 1));

  const setCustomerField = (key: keyof CustomerDraft, value: string) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next: CustomerErrors = { ...prev };
      delete next[key];
      return next;
    });
  };

  /* ── Submit ───────────────────────────────────────────────── */

  const handleSubmitBooking = async () => {
    const problem = validateStep(3);
    if (problem) {
      setErrorMessage(problem);
      return;
    }
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
          customerName: customer.name.trim(),
          customerPhone: customer.phone.trim(),
          customerEmail: customer.email.trim() || undefined,
          note: customer.note.trim() || undefined,
          idempotencyKey: idempotencyKey.current,
        }),
      });

      const body = (await res.json()) as { data?: BookingSuccessResult; error?: { message?: string } };
      if (res.status === 201 && body.data) {
        setSuccessResult(body.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (res.status === 409) {
        setErrorMessage(
          'متأسفانه این زمان توسط مراجعه‌کننده دیگری رزرو شد. لطفاً ساعت دیگری را انتخاب فرمایید.',
        );
        setSelectedSlot('');
        setStep(2);
        focusStep();
      } else if (res.status === 429) {
        setErrorMessage('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه بعد دوباره تلاش فرمایید.');
      } else {
        setErrorMessage(body.error?.message || 'خطا در ثبت نوبت. لطفاً دوباره تلاش فرمایید.');
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور. اتصال اینترنت خود را بررسی فرمایید.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Receipt ──────────────────────────────────────────────── */

  if (successResult) {
    return (
      <BookingReceiptInline
        result={successResult}
        onReset={() => {
          setSuccessResult(null);
          setCustomer(EMPTY_CUSTOMER);
          setSelectedSlot('');
          setSelectedDate('');
          setSelectedServiceSlugs([]);
          setStep(1);
        }}
      />
    );
  }

  const categoryLabel = pricingCategory === 'female' ? 'بانوان' : 'آقایان';

  return (
    <div className="booking-wizard-container" ref={containerRef}>
      <div className="wizard-stepper">
        <div className="stepper-track">
          <div
            className="stepper-fill"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
        <ol className="stepper-steps">
          {STEP_META.map((s) => (
            <li
              key={s.num}
              className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
              aria-current={step === s.num ? 'step' : undefined}
            >
              <div className="step-circle">
                {step > s.num ? <IconReact name="check" size={16} strokeWidth={2.6} /> : s.num}
              </div>
              <span className="step-title">{s.title}</span>
            </li>
          ))}
        </ol>
        <p className="stepper-counter">
          مرحله {step.toLocaleString('fa-IR')} از {TOTAL_STEPS.toLocaleString('fa-IR')}
        </p>
      </div>

      <div className="sr-only" aria-live="assertive">
        {errorMessage ?? ''}
      </div>

      {errorMessage && (
        <div className="alert alert-danger animate-shake mb-4" role="alert">
          <span className="alert-icon">
            <IconReact name="warning" size={18} />
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="wizard-body">
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <div className="step-header-with-actions">
              <div>
                <h3 className="step-heading" ref={headingRef} tabIndex={-1}>
                  مرحله اول: انتخاب نواحی و بخش مراجعین
                </h3>
                <p className="step-desc">
                  <strong>یک یا چند ناحیه</strong> را برای انجام در یک جلسه انتخاب و بخش مراجعه را
                  مشخص فرمایید:
                </p>
              </div>
              <div className="quick-action-pills">
                <button type="button" className="pill-quick-btn" onClick={() => setSelectedServiceSlugs(['underarm', 'bikini', 'full-legs'])}>
                  <IconReact name="sparkles" size={14} />
                  پکیج محبوب (زیر بغل + بیکینی + پا)
                </button>
                {selectedServiceSlugs.length > 0 && (
                  <button
                    type="button"
                    className="pill-quick-btn text-muted"
                    onClick={() => setSelectedServiceSlugs([])}
                  >
                    <IconReact name="close" size={14} />
                    پاک کردن ({selectedServiceSlugs.length.toLocaleString('fa-IR')})
                  </button>
                )}
              </div>
            </div>

            {loadingServices ? (
              <div className="service-skeleton-grid" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div className="skeleton service-skeleton" key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="empty-state">
                <IconReact name="services" size={30} />
                <p>{servicesFailed ? 'لیست خدمات در دسترس نیست.' : 'خدمتی ثبت نشده است.'}</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={loadServices}>
                  <IconReact name="refresh" size={16} />
                  تلاش دوباره
                </button>
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
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                    >
                      <div className="card-checkbox">
                        <span className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <IconReact name="check" size={14} strokeWidth={3} />}
                        </span>
                      </div>
                      <div className="card-details">
                        <div className="card-title-row">
                          <span className="service-name">{s.name}</span>
                          {isPromo && (
                            <span className="badge badge-promo">
                              <IconReact name="percent" size={12} />
                              تخفیف ویژه ۱۵٪
                            </span>
                          )}
                          {isSelected && (
                            <span className="badge badge-selected">
                              <IconReact name="check" size={12} strokeWidth={3} />
                              انتخاب شد
                            </span>
                          )}
                        </div>
                        <p className="service-short-desc">{s.shortDescription || s.description}</p>
                        <div className="card-price-row">
                          <span className="price-val">
                            {fPrice ? moneyFa(fPrice.amount) : 'استعلام قیمت'}
                          </span>
                          <span className="duration-tag">
                            <IconReact name="clock" size={13} />
                            {s.durationMinutes.toLocaleString('fa-IR')} دقیقه
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="gender-selection-cards">
              {([
                { key: 'female', icon: 'users', title: 'بخش بانوان', desc: 'دستگاه اختصاصی، اپراتور مجرب خانم، تعرفه مصوب' },
                { key: 'male', icon: 'customers', title: 'بخش آقایان', desc: 'اپراتور آقا، متناسب با تراکم و ضخامت موهای آقایان' },
              ] as const).map((g) => {
                const isSel = pricingCategory === g.key;
                return (
                  <div
                    key={g.key}
                    className={`gender-card ${isSel ? 'selected' : ''}`}
                    onClick={() => setPricingCategory(g.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPricingCategory(g.key);
                      }
                    }}
                    role="radio"
                    aria-checked={isSel}
                    tabIndex={0}
                  >
                    <div className="gender-icon">
                      <IconReact name={g.icon} size={30} />
                    </div>
                    <div className="gender-title">
                      {g.title}
                      {isSel && (
                        <span className="badge badge-selected">
                          <IconReact name="check" size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="gender-desc">{g.desc}</p>
                    <div className="gender-price-preview">
                      {g.key === 'female' ? (
                        quote.base > 0 ? (
                          <span className="price-highlight">
                            مجموع: {moneyFa(quote.base)}
                            {quote.discount > 0 && (
                              <span className="discount-badge">
                                <IconReact name="tag" size={12} />
                                با تخفیف: {moneyFa(quote.final)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">پس از انتخاب نواحی</span>
                        )
                      ) : (
                        <span className="text-muted">استعلام تلفنی تعرفه</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedServices.length > 0 && (
              <div className="multi-service-summary-bar animate-fade-in mt-4">
                <div className="summary-bar-header">
                  <div className="summary-bar-count">
                    <span className="badge-count">{selectedServices.length.toLocaleString('fa-IR')}</span>
                    <strong>نواحی انتخاب‌شده برای این جلسه ({categoryLabel}):</strong>
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
                          <IconReact name="x" size={11} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="summary-bar-footer">
                  <div className="summary-stats">
                    <span className="stat-pill">
                      <IconReact name="clock" size={15} />
                      مدت زمان کل: <strong>{totalDurationMinutes.toLocaleString('fa-IR')} دقیقه</strong>
                    </span>
                    <span className="stat-pill">
                      <IconReact name="wallet" size={15} />
                      برآورد تعرفه: <strong className="highlight-gold">{moneyFa(quote.final)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading" ref={step === 2 ? headingRef : undefined} tabIndex={-1}>
              مرحله دوم: انتخاب تاریخ و ساعت
            </h3>
            <p className="step-desc">
              روز و ساعت مراجعه را از تقویم و ساعت‌های آزاد زیر انتخاب فرمایید:
            </p>

            <div className="duration-info-notice mb-3">
              <IconReact name="info" size={16} />
              جهت انجام <strong>{selectedServices.length.toLocaleString('fa-IR')} ناحیه انتخابی</strong>{' '}
              ({selectedServices.map((s) => s.name).join('، ')})، نوبت متوالی به مدت{' '}
              <strong>{totalDurationMinutes.toLocaleString('fa-IR')} دقیقه</strong> تنظیم می‌شود.
            </div>

            <div className="date-time-layout">
              <JalaliCalendar
                selectableDates={selectableDates}
                selectedDate={selectedDate}
                onSelect={(iso) => {
                  setSelectedDate(iso);
                  setErrorMessage(null);
                }}
                closedNote="در بازه زمانی فعلی روز قابل رزروی وجود ندارد. لطفاً با کلینیک تماس بگیرید."
              />

              <div className="slots-panel">
                <h4 className="slots-title">
                  <IconReact name="clock" size={16} />
                  ساعت‌های آزاد
                </h4>

                {!selectedDate ? (
                  <p className="slots-hint">برای دیدن ساعت‌های خالی، ابتدا یک روز را از تقویم انتخاب کنید.</p>
                ) : loadingSlots ? (
                  <div className="loading-state">
                    <div className="spinner" />
                    <p>در حال جستجوی ساعت‌های خالی کلینیک…</p>
                  </div>
                ) : availableSlots.filter((s) => s.available).length === 0 ? (
                  <div className="empty-state">
                    <IconReact name="calendar" size={28} />
                    <p>برای {totalDurationMinutes.toLocaleString('fa-IR')} دقیقه در این روز ظرفیت پیوسته وجود ندارد. روز دیگری را امتحان کنید.</p>
                  </div>
                ) : (
                  <div className="slots-selection-grid">
                    {availableSlots
                      .filter((s) => s.available)
                      .map((slot) => {
                        const isSelected = selectedSlot === slot.startsAt;
                        return (
                          <button
                            key={slot.startsAt}
                            type="button"
                            className={`time-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedSlot(slot.startsAt);
                              setErrorMessage(null);
                            }}
                            aria-pressed={isSelected}
                          >
                            <IconReact name="clock" size={15} />
                            <span className="time-pill-label">ساعت {timeFa(slot.startsAt)}</span>
                            {isSelected && <IconReact name="check" size={15} strokeWidth={3} />}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {selectedDate && selectedSlot && (
              <div className="selection-confirmation-banner animate-fade-in mt-4">
                <div className="banner-text">
                  <span className="banner-icon">
                    <IconReact name="check" size={13} strokeWidth={3} />
                  </span>
                  <span>
                    نوبت انتخابی: <strong>{timeFa(selectedSlot)}</strong> — روز{' '}
                    <strong>{selectedDateLabel(selectedDate)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading" ref={step === 3 ? headingRef : undefined} tabIndex={-1}>
              مرحله سوم: مشخصات مراجع
            </h3>
            <p className="step-desc">
              جهت ثبت نوبت و ارسال پیامک هماهنگی، اطلاعات زیر را وارد نمایید:
            </p>

            <div className="booking-form-fields">
              <div className="form-group mb-3">
                <label htmlFor="custName" className="form-label required">
                  نام و نام خانوادگی
                </label>
                <div className="input-with-icon">
                  <IconReact name="users" size={17} />
                  <input
                    id="custName"
                    type="text"
                    autoComplete="name"
                    className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                    placeholder="مثال: سارا محمدی"
                    value={customer.name}
                    onChange={(e) => setCustomerField('name', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'custName-err' : undefined}
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <span className="field-error" id="custName-err" role="alert">
                    <IconReact name="warning" size={13} />
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custPhone" className="form-label required">
                  شماره تلفن همراه
                </label>
                <div className="input-with-icon">
                  <IconReact name="phone" size={17} />
                  <input
                    id="custPhone"
                    type="tel"
                    dir="ltr"
                    autoComplete="tel"
                    inputMode="tel"
                    className={`form-control text-left ${fieldErrors.phone ? 'is-invalid' : ''}`}
                    placeholder="09123456789"
                    value={customer.phone}
                    onChange={(e) => setCustomerField('phone', e.target.value)}
                    onBlur={(e) => {
                      const normalized = toLocalPhone(e.target.value);
                      if (normalized !== e.target.value) setCustomerField('phone', normalized);
                    }}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'custPhone-err' : 'custPhone-hint'}
                    required
                  />
                </div>
                {fieldErrors.phone ? (
                  <span className="field-error" id="custPhone-err" role="alert">
                    <IconReact name="warning" size={13} />
                    {fieldErrors.phone}
                  </span>
                ) : (
                  <span className="form-hint" id="custPhone-hint">
                    شماره همراه جهت هماهنگی و ارسال تأییدیه نوبت
                  </span>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custEmail" className="form-label">
                  آدرس ایمیل (اختیاری)
                </label>
                <div className="input-with-icon">
                  <IconReact name="mail" size={17} />
                  <input
                    id="custEmail"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    className={`form-control text-left ${fieldErrors.email ? 'is-invalid' : ''}`}
                    placeholder="sara@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomerField('email', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'custEmail-err' : undefined}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="field-error" id="custEmail-err" role="alert">
                    <IconReact name="warning" size={13} />
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="custNote" className="form-label">
                  توضیحات یا یادداشت (اختیاری)
                </label>
                <textarea
                  id="custNote"
                  className="form-control"
                  rows={3}
                  maxLength={500}
                  placeholder="مثال: جلسه اول / پوست حساس…"
                  value={customer.note}
                  onChange={(e) => setCustomerField('note', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content animate-fade-in">
            <h3 className="step-heading" ref={step === 4 ? headingRef : undefined} tabIndex={-1}>
              مرحله چهارم: پیش‌فاکتور و تأیید نهایی
            </h3>
            <p className="step-desc">اطلاعات نوبت را بازبینی و با فشردن دکمه زیر نهایی فرمایید:</p>

            <div className="summary-invoice-card">
              <div className="summary-row-header mb-3">
                <span className="font-bold">
                  <IconReact name="services" size={16} />
                  نواحی و خدمات انتخابی ({selectedServices.length.toLocaleString('fa-IR')} مورد)
                </span>
              </div>

              <div className="itemized-services-list mb-3">
                {selectedServices.map((s) => {
                  const p = s.prices.find((pr) => pr.pricingCategory === pricingCategory);
                  return (
                    <div key={s.slug} className="itemized-row">
                      <span className="item-name">
                        {s.name}{' '}
                        <span className="item-duration text-muted">
                          ({s.durationMinutes.toLocaleString('fa-IR')} دقیقه)
                        </span>
                      </span>
                      <span className="item-price">{p ? moneyFa(p.amount) : 'استعلام'}</span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-row">
                <span className="label">بخش پذیرش</span>
                <span className="value">{categoryLabel}</span>
              </div>
              <div className="summary-row">
                <span className="label">مدت زمان کل</span>
                <span className="value">
                  <IconReact name="clock" size={15} />
                  {totalDurationMinutes.toLocaleString('fa-IR')} دقیقه
                </span>
              </div>
              <div className="summary-row">
                <span className="label">تاریخ نوبت</span>
                <span className="value">{selectedDateLabel(selectedDate)}</span>
              </div>
              <div className="summary-row">
                <span className="label">ساعت حضور</span>
                <span className="value font-semibold">{selectedSlot ? timeFa(selectedSlot) : '-'}</span>
              </div>
              <div className="summary-row">
                <span className="label">نام مراجع</span>
                <span className="value">{customer.name.trim()}</span>
              </div>
              <div className="summary-row">
                <span className="label">شماره همراه</span>
                <span className="value" dir="ltr">
                  {toLocalPhone(customer.phone) || '-'}
                </span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row">
                <span className="label">مجموع تعرفه مصوب</span>
                <span className="value">
                  {pricingCategory === 'female' ? moneyFa(quote.base) : 'استعلام حضوری / تلفنی'}
                </span>
              </div>
              {quote.discount > 0 && (
                <div className="summary-row text-success">
                  <span className="label">تخفیف پکیج کل بدن (۱۵٪)</span>
                  <span className="value">−{moneyFa(quote.discount)}</span>
                </div>
              )}
              <div className="summary-row total-amount-row">
                <span className="label">مبلغ نهایی قابل پرداخت</span>
                <span className="value total-price">
                  {pricingCategory === 'female' ? moneyFa(quote.final) : 'مشاوره رایگان'}
                </span>
              </div>

              <p className="payment-notice">
                <IconReact name="wallet" size={15} />
                پرداخت مبلغ در کلینیک و پس از انجام خدمت صورت می‌پذیرد.
              </p>
            </div>

            <div className="sms-notice">
              <IconReact name="sms" size={20} />
              <div>
                <strong>اطلاع‌رسانی پیامکی</strong>
                <p>
                  پس از ثبت نوبت، پیامک تأیید حاوی کد رهگیری به شماره{' '}
                  <span dir="ltr">{toLocalPhone(customer.phone) || customer.phone}</span> ارسال می‌شود.
                  لطفاً آن را نزد خود نگه دارید.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-footer">
        {step > 1 ? (
          <button type="button" className="btn btn-outline" onClick={handleBack} disabled={submitting}>
            <IconReact name="arrowRight" size={16} />
            بازگشت
          </button>
        ) : (
          <span className="wizard-footer-spacer" />
        )}

        {step < TOTAL_STEPS ? (
          <button type="button" className="btn btn-primary btn-advance" onClick={handleNext}>
            {NEXT_LABEL[step] ?? 'ادامه'}
            <IconReact name="arrowLeft" size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg submit-booking-btn"
            onClick={handleSubmitBooking}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner spinner-sm" />
                در حال ثبت نوبت…
              </>
            ) : (
              <>
                <IconReact name="send" size={17} />
                تأیید نهایی و ثبت رزرو
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Receipt (step 5 view) ────────────────────────────────────── */

function BookingReceiptInline({
  result,
  onReset,
}: {
  result: BookingSuccessResult;
  onReset: () => void;
}) {
  return (
    <div className="booking-success-card animate-scale-in">
      <div className="success-icon-wrap">
        <IconReact name="checkCircle" size={34} strokeWidth={2.2} />
      </div>
      <h2 className="success-title">رزرو شما با موفقیت ثبت شد</h2>
      <p className="success-subtitle">اطلاعات نوبت شما در سامانه ثبت گردید و آماده پذیرش است.</p>

      <div className="success-details-box">
        <div className="detail-row">
          <span className="detail-label">کد رهگیری رزرو</span>
          <span className="detail-value highlight-ref" dir="ltr">
            {result.reference}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">نواحی و خدمات</span>
          <span className="detail-value font-semibold">{result.serviceName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">بخش پذیرش</span>
          <span className="detail-value">{result.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">تاریخ مراجعه</span>
          <span className="detail-value">{selectedDateLabel(result.startsAt.slice(0, 10))}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ساعت حضور</span>
          <span className="detail-value">{timeFa(result.startsAt)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">نام مراجع</span>
          <span className="detail-value">{result.customerName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">شماره همراه</span>
          <span className="detail-value" dir="ltr">
            {result.customerPhone}
          </span>
        </div>
        <div className="detail-row highlight-amount-row">
          <span className="detail-label">مبلغ قابل پرداخت در کلینیک</span>
          <span className="detail-value text-gold">
            {result.quotedAmount > 0 ? moneyFa(result.quotedAmount) : 'استعلام تلفنی'}
          </span>
        </div>
      </div>

      <div className="sms-notice sms-notice-success">
        <IconReact name="sms" size={20} />
        <div>
          <strong>پیامک تأیید در راه است</strong>
          <p>جزئیات این نوبت به شماره {result.customerPhone} پیامک می‌شود. در صورت نیاز با کلینیک تماس بگیرید.</p>
        </div>
      </div>

      <div className="success-guidelines">
        <h4 className="guidelines-title">
          <IconReact name="info" size={16} />
          نکات مهم قبل از مراجعه
        </h4>
        <ul>
          <li>۲۴ ساعت قبل از نوبت، موهای نواحی انتخابی را با تیغ یا ژیلت شیو بفرمایید.</li>
          <li>از مصرف کرم، لوسیون یا بادی اسپلش در روز مراجعه بر روی پوست خودداری کنید.</li>
          <li>حداقل ۱۰ دقیقه قبل از ساعت مقرر در محل کلینیک حضور به هم رسانید.</li>
        </ul>
      </div>

      <div className="success-actions mt-4">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <IconReact name="plus" size={16} />
          ثبت نوبت جدید
        </button>
        <a href="/" className="btn btn-outline">
          بازگشت به صفحه اصلی
        </a>
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */

function selectedDateLabel(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00Z`));
  } catch {
    return isoDate;
  }
}

function makeIdempotencyKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
