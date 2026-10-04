globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll, r as __toESM } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as require_react } from "./react_BpCRmogb.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { n as toGregorian, r as toJalaali, t as jalaaliMonthLength } from "./dist_DQmtns5G.mjs";
import { x as listPublicServices } from "./repositories_B3hzhjEm.mjs";
import { n as require_jsx_runtime, t as IconReact } from "./IconReact_dVhAhHG5.mjs";
import { env } from "cloudflare:workers";
//#region src/components/booking/booking-shared.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var STEP_META = [
	{
		num: 1,
		title: "خدمات"
	},
	{
		num: 2,
		title: "زمان"
	},
	{
		num: 3,
		title: "مشخصات"
	},
	{
		num: 4,
		title: "تأیید"
	}
];
/** Local 'YYYY-MM-DD' (no UTC shifting — matches what the API expects). */
function isoDayOf(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** Weekday index for an ISO day, Persian week order: 0 = شنبه … 6 = جمعه. */
function persianWeekIndex(isoDate) {
	const [y, m, d] = isoDate.split("-").map(Number);
	if (y === void 0 || m === void 0 || d === void 0) return 0;
	return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 1) % 7;
}
function addDays(base, days) {
	const copy = new Date(base);
	copy.setDate(copy.getDate() + days);
	return copy;
}
/** Persian / Arabic-Indic digits → ASCII so users can type either. */
function toEnglishDigits(value) {
	return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
/** Loose client-side check mirroring the server's phoneSchema. */
function isValidPhone(value) {
	const clean = toEnglishDigits(value).replace(/[\s\-().]/g, "");
	return /^(\+98|0098)?0?9\d{9}$/.test(clean);
}
/** Rewrite a valid number to the familiar 0912… form for display. */
function toLocalPhone(value) {
	const clean = toEnglishDigits(value).replace(/[\s\-().]/g, "");
	if (!isValidPhone(clean)) return clean;
	if (clean.startsWith("+98")) return `0${clean.slice(3)}`;
	if (clean.startsWith("0098")) return `0${clean.slice(4)}`;
	if (/^9\d{9}$/.test(clean)) return `0${clean}`;
	return clean;
}
/** Client-side name check matching the server nameSchema intent. */
function isValidName(value) {
	const trimmed = value.trim();
	if (trimmed.length < 2 || trimmed.length > 80) return false;
	return /^[\p{L}\p{M}\s'‌-]+$/u.test(trimmed);
}
function isValidEmail(value) {
	const trimmed = value.trim();
	if (!trimmed) return true;
	return trimmed.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}
/** '۲٬۲۹۰ هزار تومان' — same wording the rest of the public site uses. */
function moneyFa(amount) {
	return `${amount.toLocaleString("fa-IR")} هزار تومان`;
}
/** '۰۹:۳۰' — clinic timezone wall clock. */
function timeFa(isoInstant) {
	return new Date(isoInstant).toLocaleTimeString("fa-IR", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tehran"
	});
}
//#endregion
//#region src/components/booking/JalaliCalendar.tsx
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAY_HEADS = [
	"ش",
	"ی",
	"د",
	"س",
	"چ",
	"پ",
	"ج"
];
var MONTH_NAMES = [
	"فروردین",
	"اردیبهشت",
	"خرداد",
	"تیر",
	"مرداد",
	"شهریور",
	"مهر",
	"آبان",
	"آذر",
	"دی",
	"بهمن",
	"اسفند"
];
var PERSIAN_DIGITS = [
	"۰",
	"۱",
	"۲",
	"۳",
	"۴",
	"۵",
	"۶",
	"۷",
	"۸",
	"۹"
];
function fa(n) {
	return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}
/**
* Jalali month pager restricted to days the clinic can actually book.
* Only months containing a selectable day are reachable, so a visitor can
* never page into a dead month.
*/
function JalaliCalendar({ selectableDates, selectedDate, onSelect, closedNote }) {
	const months = (0, import_react.useMemo)(() => {
		const byKey = /* @__PURE__ */ new Map();
		const selectable = new Set(selectableDates);
		for (const iso of selectableDates) {
			const d = /* @__PURE__ */ new Date(`${iso}T00:00:00Z`);
			const j = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
			const key = `${j.jy}-${j.jm}`;
			if (!byKey.has(key)) byKey.set(key, {
				key,
				label: `${MONTH_NAMES[j.jm - 1] ?? ""} ${fa(j.jy)}`,
				weeks: []
			});
		}
		for (const month of byKey.values()) {
			const [jyRaw, jmRaw] = month.key.split("-");
			const jy = Number(jyRaw);
			const jm = Number(jmRaw);
			const first = toGregorian(jy, jm, 1);
			const firstIso = `${first.gy}-${String(first.gm).padStart(2, "0")}-${String(first.gd).padStart(2, "0")}`;
			const offset = persianWeekIndex(firstIso);
			const grid = new Array(offset).fill(null);
			const length = jalaaliMonthLength(jy, jm);
			for (let i = 0; i < length; i++) {
				const dayIso = isoDayOf(addDays(/* @__PURE__ */ new Date(`${firstIso}T00:00:00Z`), i));
				grid.push(selectable.has(dayIso) ? dayIso : null);
			}
			while (grid.length % 7 !== 0) grid.push(null);
			const weeks = [];
			for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
			month.weeks = weeks;
		}
		return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
	}, [selectableDates]);
	const monthKeys = months.map((m) => m.key);
	const firstKey = monthKeys[0] ?? "";
	const selectedKey = (() => {
		if (!selectedDate) return firstKey;
		const d = /* @__PURE__ */ new Date(`${selectedDate}T00:00:00Z`);
		const j = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
		return `${j.jy}-${j.jm}`;
	})();
	const visibleKey = monthKeys.includes(selectedKey) ? selectedKey : firstKey;
	const month = months.find((m) => m.key === visibleKey);
	const index = monthKeys.indexOf(visibleKey);
	if (!month) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "calendar-empty",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
			name: "calendar",
			size: 30,
			label: "تقویم"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: closedNote })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "jalali-calendar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "calendar-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "calendar-nav-btn",
						onClick: () => {
							const prev = monthKeys[index - 1];
							if (prev) onSelect(prev);
						},
						"aria-label": "ماه قبل",
						disabled: index <= 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "chevronRight",
							size: 18
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "calendar-month-label",
						"aria-live": "polite",
						children: month.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "calendar-nav-btn",
						onClick: () => {
							const next = monthKeys[index + 1];
							if (next) onSelect(next);
						},
						"aria-label": "ماه بعد",
						disabled: index >= monthKeys.length - 1,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "chevronLeft",
							size: 18
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "calendar-weekdays",
				children: WEEKDAY_HEADS.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `calendar-wd ${i === 6 ? "is-friday-head" : ""}`,
					children: w
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "calendar-body",
				children: month.weeks.map((week, wi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "calendar-week",
					children: week.map((iso, di) => {
						if (!iso) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "calendar-cell is-empty",
							"aria-hidden": "true"
						}, di);
						const dayNum = Number(iso.slice(-2));
						const isFriday = persianWeekIndex(iso) === 6;
						const selected = selectedDate === iso;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `calendar-day ${isFriday ? "is-friday" : ""} ${selected ? "selected" : ""}`,
							onClick: () => onSelect(iso),
							"aria-pressed": selected,
							"aria-label": iso,
							dir: "ltr",
							children: fa(dayNum)
						}, iso);
					})
				}, wi))
			})
		]
	});
}
//#endregion
//#region src/components/booking/BookingWizard.tsx
var EMPTY_CUSTOMER = {
	name: "",
	phone: "",
	email: "",
	note: ""
};
var NEXT_LABEL = {
	1: "ادامه: تاریخ و ساعت",
	2: "ادامه: مشخصات مراجع",
	3: "ادامه: بررسی و تأیید"
};
function BookingWizard({ initialServices = [], preselectedSlug }) {
	const [step, setStep] = (0, import_react.useState)(1);
	const [services, setServices] = (0, import_react.useState)(initialServices);
	const [loadingServices, setLoadingServices] = (0, import_react.useState)(initialServices.length === 0);
	const [servicesFailed, setServicesFailed] = (0, import_react.useState)(false);
	const [selectedServiceSlugs, setSelectedServiceSlugs] = (0, import_react.useState)(() => preselectedSlug ? [preselectedSlug] : []);
	const [pricingCategory, setPricingCategory] = (0, import_react.useState)("female");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)("");
	const [availableSlots, setAvailableSlots] = (0, import_react.useState)([]);
	const [loadingSlots, setLoadingSlots] = (0, import_react.useState)(false);
	const [selectedSlot, setSelectedSlot] = (0, import_react.useState)("");
	const [customer, setCustomer] = (0, import_react.useState)(EMPTY_CUSTOMER);
	const [fieldErrors, setFieldErrors] = (0, import_react.useState)({});
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const [successResult, setSuccessResult] = (0, import_react.useState)(null);
	const containerRef = (0, import_react.useRef)(null);
	const headingRef = (0, import_react.useRef)(null);
	const idempotencyKey = (0, import_react.useRef)(makeIdempotencyKey());
	const loadServices = (0, import_react.useCallback)(() => {
		setLoadingServices(true);
		setServicesFailed(false);
		fetch("/api/v1/services").then((res) => res.ok ? res.json() : Promise.reject(/* @__PURE__ */ new Error("services"))).then((raw) => {
			const data = raw;
			const list = Array.isArray(data.data) ? data.data : [];
			setServices(list);
			if (preselectedSlug && !list.some((s) => s.slug === preselectedSlug)) setSelectedServiceSlugs((prev) => prev.filter((slug) => slug !== preselectedSlug));
		}).catch(() => {
			setServicesFailed(true);
			setErrorMessage("خطا در دریافت لیست خدمات. لطفاً دوباره تلاش کنید.");
		}).finally(() => setLoadingServices(false));
	}, [preselectedSlug]);
	(0, import_react.useEffect)(() => {
		if (initialServices.length > 0) return;
		loadServices();
	}, [initialServices.length, loadServices]);
	(0, import_react.useEffect)(() => {
		if (selectedServiceSlugs.length === 0 || !selectedDate) {
			setAvailableSlots([]);
			return;
		}
		let cancelled = false;
		setLoadingSlots(true);
		setErrorMessage(null);
		setSelectedSlot("");
		const slugsParam = encodeURIComponent(selectedServiceSlugs.join(","));
		fetch(`/api/v1/availability?services=${slugsParam}&category=${pricingCategory}&date=${selectedDate}`).then((res) => res.ok ? res.json() : Promise.reject(/* @__PURE__ */ new Error("availability"))).then((raw) => {
			if (cancelled) return;
			const data = raw;
			setAvailableSlots(Array.isArray(data.data?.slots) ? data.data?.slots ?? [] : []);
		}).catch(() => {
			if (!cancelled) setErrorMessage("خطا در دریافت زمان‌های خالی. لطفاً دوباره تلاش کنید.");
		}).finally(() => {
			if (!cancelled) setLoadingSlots(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		selectedServiceSlugs,
		pricingCategory,
		selectedDate
	]);
	const toggleServiceSlug = (slug) => {
		setSelectedServiceSlugs((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
		setErrorMessage(null);
	};
	const selectedServices = services.filter((s) => selectedServiceSlugs.includes(s.slug));
	const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
	const quote = (0, import_react.useMemo)(() => {
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
			if (s.slug === "full-body") discount = Math.round(price.amount * .15);
		}
		return {
			base,
			discount,
			final: Math.max(0, base - discount),
			missingPrice
		};
	}, [selectedServices, pricingCategory]);
	const selectableDates = (0, import_react.useMemo)(() => {
		const today = /* @__PURE__ */ new Date();
		const days = [];
		for (let i = 0; i < 90; i++) {
			const d = addDays(today, i);
			if (persianWeekIndex(isoDayOf(d)) === 6) continue;
			days.push(isoDayOf(d));
		}
		return days;
	}, []);
	const focusStep = () => {
		requestAnimationFrame(() => {
			containerRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
			headingRef.current?.focus({ preventScroll: true });
		});
	};
	const goTo = (next) => {
		setErrorMessage(null);
		setStep(next);
		focusStep();
	};
	const validateStep = (current) => {
		if (current === 1) {
			if (selectedServiceSlugs.length === 0) return "لطفاً حداقل یک ناحیه یا خدمت را انتخاب فرمایید.";
			if (pricingCategory === "male" && quote.missingPrice) return "تعرفه خدمات آقایان نیازمند مشاوره تلفنی است. لطفاً با کلینیک تماس حاصل فرمایید.";
			return null;
		}
		if (current === 2) {
			if (!selectedDate) return "لطفاً تاریخ مراجعه را از تقویم انتخاب کنید.";
			if (!selectedSlot) return "لطفاً یکی از ساعت‌های آزاد را انتخاب فرمایید.";
			return null;
		}
		if (current === 3) {
			const errors = {};
			if (!isValidName(customer.name)) errors.name = "نام و نام خانوادگی را به درستی وارد فرمایید.";
			if (!isValidPhone(customer.phone)) errors.phone = "شماره همراه معتبر وارد فرمایید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";
			if (!isValidEmail(customer.email)) errors.email = "آدرس ایمیل معتبر نیست.";
			if (Object.keys(errors).length > 0) {
				setFieldErrors(errors);
				return "برخی از اطلاعات واردشده معتبر نیستند؛ فیلدهای مشخص‌شده را اصلاح کنید.";
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
			if (selectedDate && !selectableDates.includes(selectedDate)) setSelectedDate("");
			goTo(Math.min(3, step + 1));
			return;
		}
		goTo(Math.min(4, step + 1));
	};
	const handleBack = () => goTo(Math.max(1, step - 1));
	const setCustomerField = (key, value) => {
		setCustomer((prev) => ({
			...prev,
			[key]: value
		}));
		setFieldErrors((prev) => {
			if (!prev[key]) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});
	};
	const handleSubmitBooking = async () => {
		const problem = validateStep(3);
		if (problem) {
			setErrorMessage(problem);
			return;
		}
		setSubmitting(true);
		setErrorMessage(null);
		try {
			const res = await fetch("/api/v1/bookings", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					serviceSlugs: selectedServiceSlugs,
					serviceSlug: selectedServiceSlugs[0],
					pricingCategory,
					startsAt: selectedSlot,
					customerName: customer.name.trim(),
					customerPhone: customer.phone.trim(),
					customerEmail: customer.email.trim() || void 0,
					note: customer.note.trim() || void 0,
					idempotencyKey: idempotencyKey.current
				})
			});
			const body = await res.json();
			if (res.status === 201 && body.data) {
				setSuccessResult(body.data);
				window.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			} else if (res.status === 409) {
				setErrorMessage("متأسفانه این زمان توسط مراجعه‌کننده دیگری رزرو شد. لطفاً ساعت دیگری را انتخاب فرمایید.");
				setSelectedSlot("");
				setStep(2);
				focusStep();
			} else if (res.status === 429) setErrorMessage("تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه بعد دوباره تلاش فرمایید.");
			else setErrorMessage(body.error?.message || "خطا در ثبت نوبت. لطفاً دوباره تلاش فرمایید.");
		} catch {
			setErrorMessage("خطای ارتباط با سرور. اتصال اینترنت خود را بررسی فرمایید.");
		} finally {
			setSubmitting(false);
		}
	};
	if (successResult) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingReceiptInline, {
		result: successResult,
		onReset: () => {
			setSuccessResult(null);
			setCustomer(EMPTY_CUSTOMER);
			setSelectedSlot("");
			setSelectedDate("");
			setSelectedServiceSlugs([]);
			setStep(1);
		}
	});
	const categoryLabel = pricingCategory === "female" ? "بانوان" : "آقایان";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "booking-wizard-container",
		ref: containerRef,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wizard-stepper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "stepper-track",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "stepper-fill",
							style: { width: `${(step - 1) / 3 * 100}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "stepper-steps",
						children: STEP_META.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `step-item ${step === s.num ? "active" : ""} ${step > s.num ? "completed" : ""}`,
							"aria-current": step === s.num ? "step" : void 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "step-circle",
								children: step > s.num ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "check",
									size: 16,
									strokeWidth: 2.6
								}) : s.num
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-title",
								children: s.title
							})]
						}, s.num))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "stepper-counter",
						children: [
							"مرحله ",
							step.toLocaleString("fa-IR"),
							" از ",
							4 .toLocaleString("fa-IR")
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sr-only",
				"aria-live": "assertive",
				children: errorMessage ?? ""
			}),
			errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "alert alert-danger animate-shake mb-4",
				role: "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "alert-icon",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "warning",
						size: 18
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMessage })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wizard-body",
				children: [
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "step-content animate-fade-in",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "step-header-with-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "step-heading",
									ref: headingRef,
									tabIndex: -1,
									children: "مرحله اول: انتخاب نواحی و بخش مراجعین"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "step-desc",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "یک یا چند ناحیه" }), " را برای انجام در یک جلسه انتخاب و بخش مراجعه را مشخص فرمایید:"]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "quick-action-pills",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "pill-quick-btn",
										onClick: () => setSelectedServiceSlugs([
											"underarm",
											"bikini",
											"full-legs"
										]),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "sparkles",
											size: 14
										}), "پکیج محبوب (زیر بغل + بیکینی + پا)"]
									}), selectedServiceSlugs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "pill-quick-btn text-muted",
										onClick: () => setSelectedServiceSlugs([]),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
												name: "close",
												size: 14
											}),
											"پاک کردن (",
											selectedServiceSlugs.length.toLocaleString("fa-IR"),
											")"
										]
									})]
								})]
							}),
							loadingServices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "service-skeleton-grid",
								"aria-hidden": "true",
								children: [
									0,
									1,
									2
								].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton service-skeleton" }, i))
							}) : services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
										name: "services",
										size: 30
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: servicesFailed ? "لیست خدمات در دسترس نیست." : "خدمتی ثبت نشده است." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "btn btn-outline btn-sm",
										onClick: loadServices,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "refresh",
											size: 16
										}), "تلاش دوباره"]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "services-selection-grid",
								children: services.map((s) => {
									const fPrice = s.prices.find((p) => p.pricingCategory === "female");
									const isPromo = s.slug === "full-body";
									const isSelected = selectedServiceSlugs.includes(s.slug);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `service-select-card ${isSelected ? "selected" : ""}`,
										onClick: () => toggleServiceSlug(s.slug),
										onKeyDown: (e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												toggleServiceSlug(s.slug);
											}
										},
										role: "checkbox",
										"aria-checked": isSelected,
										tabIndex: 0,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "card-checkbox",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `checkbox-indicator ${isSelected ? "checked" : ""}`,
												children: isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "check",
													size: 14,
													strokeWidth: 3
												})
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "card-details",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "card-title-row",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "service-name",
															children: s.name
														}),
														isPromo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "badge badge-promo",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
																name: "percent",
																size: 12
															}), "تخفیف ویژه ۱۵٪"]
														}),
														isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "badge badge-selected",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
																name: "check",
																size: 12,
																strokeWidth: 3
															}), "انتخاب شد"]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "service-short-desc",
													children: s.shortDescription || s.description
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "card-price-row",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "price-val",
														children: fPrice ? moneyFa(fPrice.amount) : "استعلام قیمت"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "duration-tag",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
																name: "clock",
																size: 13
															}),
															s.durationMinutes.toLocaleString("fa-IR"),
															" دقیقه"
														]
													})]
												})
											]
										})]
									}, s.slug);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gender-selection-cards",
								children: [{
									key: "female",
									icon: "users",
									title: "بخش بانوان",
									desc: "دستگاه اختصاصی، اپراتور مجرب خانم، تعرفه مصوب"
								}, {
									key: "male",
									icon: "customers",
									title: "بخش آقایان",
									desc: "اپراتور آقا، متناسب با تراکم و ضخامت موهای آقایان"
								}].map((g) => {
									const isSel = pricingCategory === g.key;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `gender-card ${isSel ? "selected" : ""}`,
										onClick: () => setPricingCategory(g.key),
										onKeyDown: (e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setPricingCategory(g.key);
											}
										},
										role: "radio",
										"aria-checked": isSel,
										tabIndex: 0,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "gender-icon",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: g.icon,
													size: 30
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "gender-title",
												children: [g.title, isSel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "badge badge-selected",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
														name: "check",
														size: 12,
														strokeWidth: 3
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "gender-desc",
												children: g.desc
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "gender-price-preview",
												children: g.key === "female" ? quote.base > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "price-highlight",
													children: [
														"مجموع: ",
														moneyFa(quote.base),
														quote.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "discount-badge",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
																	name: "tag",
																	size: 12
																}),
																"با تخفیف: ",
																moneyFa(quote.final)
															]
														})
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted",
													children: "پس از انتخاب نواحی"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted",
													children: "استعلام تلفنی تعرفه"
												})
											})
										]
									}, g.key);
								})
							}),
							selectedServices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "multi-service-summary-bar animate-fade-in mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "summary-bar-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-bar-count",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "badge-count",
											children: selectedServices.length.toLocaleString("fa-IR")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
											"نواحی انتخاب‌شده برای این جلسه (",
											categoryLabel,
											"):"
										] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "selected-chips-list",
										children: selectedServices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "service-chip",
											children: [s.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "chip-remove-btn",
												onClick: (e) => {
													e.stopPropagation();
													toggleServiceSlug(s.slug);
												},
												"aria-label": `حذف ${s.name}`,
												title: `حذف ${s.name}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "x",
													size: 11,
													strokeWidth: 3
												})
											})]
										}, s.slug))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "summary-bar-footer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-stats",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "stat-pill",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "clock",
													size: 15
												}),
												"مدت زمان کل: ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalDurationMinutes.toLocaleString("fa-IR"), " دقیقه"] })
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "stat-pill",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "wallet",
													size: 15
												}),
												"برآورد تعرفه: ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "highlight-gold",
													children: moneyFa(quote.final)
												})
											]
										})]
									})
								})]
							})
						]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "step-content animate-fade-in",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "step-heading",
								ref: step === 2 ? headingRef : void 0,
								tabIndex: -1,
								children: "مرحله دوم: انتخاب تاریخ و ساعت"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "step-desc",
								children: "روز و ساعت مراجعه را از تقویم و ساعت‌های آزاد زیر انتخاب فرمایید:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "duration-info-notice mb-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
										name: "info",
										size: 16
									}),
									"جهت انجام ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selectedServices.length.toLocaleString("fa-IR"), " ناحیه انتخابی"] }),
									" ",
									"(",
									selectedServices.map((s) => s.name).join("، "),
									")، نوبت متوالی به مدت",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalDurationMinutes.toLocaleString("fa-IR"), " دقیقه"] }),
									" تنظیم می‌شود."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "date-time-layout",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliCalendar, {
									selectableDates,
									selectedDate,
									onSelect: (iso) => {
										setSelectedDate(iso);
										setErrorMessage(null);
									},
									closedNote: "در بازه زمانی فعلی روز قابل رزروی وجود ندارد. لطفاً با کلینیک تماس بگیرید."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "slots-panel",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "slots-title",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "clock",
											size: 16
										}), "ساعت‌های آزاد"]
									}), !selectedDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "slots-hint",
										children: "برای دیدن ساعت‌های خالی، ابتدا یک روز را از تقویم انتخاب کنید."
									}) : loadingSlots ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "loading-state",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "spinner" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "در حال جستجوی ساعت‌های خالی کلینیک…" })]
									}) : availableSlots.filter((s) => s.available).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "empty-state",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "calendar",
											size: 28
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											"برای ",
											totalDurationMinutes.toLocaleString("fa-IR"),
											" دقیقه در این روز ظرفیت پیوسته وجود ندارد. روز دیگری را امتحان کنید."
										] })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "slots-selection-grid",
										children: availableSlots.filter((s) => s.available).map((slot) => {
											const isSelected = selectedSlot === slot.startsAt;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: `time-pill ${isSelected ? "selected" : ""}`,
												onClick: () => {
													setSelectedSlot(slot.startsAt);
													setErrorMessage(null);
												},
												"aria-pressed": isSelected,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
														name: "clock",
														size: 15
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "time-pill-label",
														children: ["ساعت ", timeFa(slot.startsAt)]
													}),
													isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
														name: "check",
														size: 15,
														strokeWidth: 3
													})
												]
											}, slot.startsAt);
										})
									})]
								})]
							}),
							selectedDate && selectedSlot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "selection-confirmation-banner animate-fade-in mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "banner-text",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "banner-icon",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "check",
											size: 13,
											strokeWidth: 3
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"نوبت انتخابی: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: timeFa(selectedSlot) }),
										" — روز",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedDateLabel(selectedDate) })
									] })]
								})
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "step-content animate-fade-in",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "step-heading",
								ref: step === 3 ? headingRef : void 0,
								tabIndex: -1,
								children: "مرحله سوم: مشخصات مراجع"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "step-desc",
								children: "جهت ثبت نوبت و ارسال پیامک هماهنگی، اطلاعات زیر را وارد نمایید:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "booking-form-fields",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "form-group mb-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "custName",
												className: "form-label required",
												children: "نام و نام خانوادگی"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "input-with-icon",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "users",
													size: 17
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "custName",
													type: "text",
													autoComplete: "name",
													className: `form-control ${fieldErrors.name ? "is-invalid" : ""}`,
													placeholder: "مثال: سارا محمدی",
													value: customer.name,
													onChange: (e) => setCustomerField("name", e.target.value),
													"aria-invalid": Boolean(fieldErrors.name),
													"aria-describedby": fieldErrors.name ? "custName-err" : void 0,
													required: true
												})]
											}),
											fieldErrors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "field-error",
												id: "custName-err",
												role: "alert",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "warning",
													size: 13
												}), fieldErrors.name]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "form-group mb-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "custPhone",
												className: "form-label required",
												children: "شماره تلفن همراه"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "input-with-icon",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "phone",
													size: 17
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "custPhone",
													type: "tel",
													dir: "ltr",
													autoComplete: "tel",
													inputMode: "tel",
													className: `form-control text-left ${fieldErrors.phone ? "is-invalid" : ""}`,
													placeholder: "09123456789",
													value: customer.phone,
													onChange: (e) => setCustomerField("phone", e.target.value),
													onBlur: (e) => {
														const normalized = toLocalPhone(e.target.value);
														if (normalized !== e.target.value) setCustomerField("phone", normalized);
													},
													"aria-invalid": Boolean(fieldErrors.phone),
													"aria-describedby": fieldErrors.phone ? "custPhone-err" : "custPhone-hint",
													required: true
												})]
											}),
											fieldErrors.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "field-error",
												id: "custPhone-err",
												role: "alert",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "warning",
													size: 13
												}), fieldErrors.phone]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "form-hint",
												id: "custPhone-hint",
												children: "شماره همراه جهت هماهنگی و ارسال تأییدیه نوبت"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "form-group mb-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "custEmail",
												className: "form-label",
												children: "آدرس ایمیل (اختیاری)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "input-with-icon",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "mail",
													size: 17
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "custEmail",
													type: "email",
													dir: "ltr",
													autoComplete: "email",
													className: `form-control text-left ${fieldErrors.email ? "is-invalid" : ""}`,
													placeholder: "sara@example.com",
													value: customer.email,
													onChange: (e) => setCustomerField("email", e.target.value),
													"aria-invalid": Boolean(fieldErrors.email),
													"aria-describedby": fieldErrors.email ? "custEmail-err" : void 0
												})]
											}),
											fieldErrors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "field-error",
												id: "custEmail-err",
												role: "alert",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "warning",
													size: 13
												}), fieldErrors.email]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "form-group mb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "custNote",
											className: "form-label",
											children: "توضیحات یا یادداشت (اختیاری)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: "custNote",
											className: "form-control",
											rows: 3,
											maxLength: 500,
											placeholder: "مثال: جلسه اول / پوست حساس…",
											value: customer.note,
											onChange: (e) => setCustomerField("note", e.target.value)
										})]
									})
								]
							})
						]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "step-content animate-fade-in",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "step-heading",
								ref: step === 4 ? headingRef : void 0,
								tabIndex: -1,
								children: "مرحله چهارم: پیش‌فاکتور و تأیید نهایی"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "step-desc",
								children: "اطلاعات نوبت را بازبینی و با فشردن دکمه زیر نهایی فرمایید:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "summary-invoice-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "summary-row-header mb-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "services",
													size: 16
												}),
												"نواحی و خدمات انتخابی (",
												selectedServices.length.toLocaleString("fa-IR"),
												" مورد)"
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "itemized-services-list mb-3",
										children: selectedServices.map((s) => {
											const p = s.prices.find((pr) => pr.pricingCategory === pricingCategory);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "itemized-row",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "item-name",
													children: [
														s.name,
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "item-duration text-muted",
															children: [
																"(",
																s.durationMinutes.toLocaleString("fa-IR"),
																" دقیقه)"
															]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "item-price",
													children: p ? moneyFa(p.amount) : "استعلام"
												})]
											}, s.slug);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "بخش پذیرش"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value",
											children: categoryLabel
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "مدت زمان کل"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "value",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "clock",
													size: 15
												}),
												totalDurationMinutes.toLocaleString("fa-IR"),
												" دقیقه"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "تاریخ نوبت"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value",
											children: selectedDateLabel(selectedDate)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "ساعت حضور"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value font-semibold",
											children: selectedSlot ? timeFa(selectedSlot) : "-"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "نام مراجع"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value",
											children: customer.name.trim()
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "شماره همراه"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value",
											dir: "ltr",
											children: toLocalPhone(customer.phone) || "-"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "summary-divider" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "مجموع تعرفه مصوب"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value",
											children: pricingCategory === "female" ? moneyFa(quote.base) : "استعلام حضوری / تلفنی"
										})]
									}),
									quote.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row text-success",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "تخفیف پکیج کل بدن (۱۵٪)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "value",
											children: ["−", moneyFa(quote.discount)]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "summary-row total-amount-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "label",
											children: "مبلغ نهایی قابل پرداخت"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "value total-price",
											children: pricingCategory === "female" ? moneyFa(quote.final) : "مشاوره رایگان"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "payment-notice",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: "wallet",
											size: 15
										}), "پرداخت مبلغ در کلینیک و پس از انجام خدمت صورت می‌پذیرد."]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sms-notice",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "sms",
									size: 20
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "اطلاع‌رسانی پیامکی" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"پس از ثبت نوبت، پیامک تأیید حاوی کد رهگیری به شماره",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										dir: "ltr",
										children: toLocalPhone(customer.phone) || customer.phone
									}),
									" ارسال می‌شود. لطفاً آن را نزد خود نگه دارید."
								] })] })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wizard-footer",
				children: [step > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-outline",
					onClick: handleBack,
					disabled: submitting,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "arrowRight",
						size: 16
					}), "بازگشت"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wizard-footer-spacer" }), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-primary btn-advance",
					onClick: handleNext,
					children: [NEXT_LABEL[step] ?? "ادامه", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "arrowLeft",
						size: 16
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-primary btn-lg submit-booking-btn",
					onClick: handleSubmitBooking,
					disabled: submitting,
					children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spinner spinner-sm" }), "در حال ثبت نوبت…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "send",
						size: 17
					}), "تأیید نهایی و ثبت رزرو"] })
				})]
			})
		]
	});
}
function BookingReceiptInline({ result, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "booking-success-card animate-scale-in",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "success-icon-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
					name: "checkCircle",
					size: 34,
					strokeWidth: 2.2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "success-title",
				children: "رزرو شما با موفقیت ثبت شد"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "success-subtitle",
				children: "اطلاعات نوبت شما در سامانه ثبت گردید و آماده پذیرش است."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "success-details-box",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "کد رهگیری رزرو"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value highlight-ref",
							dir: "ltr",
							children: result.reference
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "نواحی و خدمات"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value font-semibold",
							children: result.serviceName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "بخش پذیرش"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value",
							children: result.pricingCategory === "female" ? "بانوان" : "آقایان"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "تاریخ مراجعه"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value",
							children: selectedDateLabel(result.startsAt.slice(0, 10))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "ساعت حضور"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value",
							children: timeFa(result.startsAt)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "نام مراجع"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value",
							children: result.customerName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "شماره همراه"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value",
							dir: "ltr",
							children: result.customerPhone
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row highlight-amount-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-label",
							children: "مبلغ قابل پرداخت در کلینیک"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "detail-value text-gold",
							children: result.quotedAmount > 0 ? moneyFa(result.quotedAmount) : "استعلام تلفنی"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sms-notice sms-notice-success",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
					name: "sms",
					size: 20
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "پیامک تأیید در راه است" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"جزئیات این نوبت به شماره ",
					result.customerPhone,
					" پیامک می‌شود. در صورت نیاز با کلینیک تماس بگیرید."
				] })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "success-guidelines",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
					className: "guidelines-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "info",
						size: 16
					}), "نکات مهم قبل از مراجعه"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "۲۴ ساعت قبل از نوبت، موهای نواحی انتخابی را با تیغ یا ژیلت شیو بفرمایید." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "از مصرف کرم، لوسیون یا بادی اسپلش در روز مراجعه بر روی پوست خودداری کنید." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "حداقل ۱۰ دقیقه قبل از ساعت مقرر در محل کلینیک حضور به هم رسانید." })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "success-actions mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-primary",
					onClick: onReset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "plus",
						size: 16
					}), "ثبت نوبت جدید"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					className: "btn btn-outline",
					children: "بازگشت به صفحه اصلی"
				})]
			})
		]
	});
}
function selectedDateLabel(isoDate) {
	if (!isoDate) return "-";
	try {
		return new Intl.DateTimeFormat("fa-IR", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC"
		}).format(/* @__PURE__ */ new Date(`${isoDate}T00:00:00Z`));
	} catch {
		return isoDate;
	}
}
function makeIdempotencyKey() {
	try {
		return crypto.randomUUID();
	} catch {
		return `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
	}
}
//#endregion
//#region src/pages/booking.astro
var booking_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Booking,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Booking = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Booking;
	let services = [];
	try {
		services = await listPublicServices(env.DB);
	} catch (e) {
		console.error("Failed to load services for booking page:", e);
	}
	const serviceParam = Astro.url.searchParams.get("service") ?? void 0;
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "رزرو آنلاین نوبت",
		url: "/booking"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "رزرو آنلاین نوبت — کلینیک تخصصی تهران لیزر",
		"description": "سامانه هوشمند و شبانه‌روزی رزرو آنلاین نوبت کلینیک تهران لیزر پاسداران. انتخاب خدمت، ساعت و تاریخ بدون معطلی با ۱۵٪ تخفیف ویژه سایت.",
		"canonicalUrl": "/booking",
		"theme": "dark",
		"keywords": [
			"رزرو آنلاین نوبت لیزر تهران",
			"رزرو وقت لیزر پاسداران",
			"نوبت دهی لیزر تهران لیزر",
			"تخفیف رزرو آنلاین لیزر"
		],
		"jsonLd": breadcrumbJsonLd,
		"data-astro-cid-b75koquv": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="booking-page-header" data-astro-cid-b75koquv><div class="container text-center" data-astro-cid-b75koquv><span class="section-subtitle" data-astro-cid-b75koquv>پذیرش هوشمند و بدون معطلی</span><h1 class="page-title" data-astro-cid-b75koquv>رزرو آنلاین نوبت کلینیک تهران لیزر</h1><p class="page-subtitle" data-astro-cid-b75koquv>مراحل زیر را جهت ثبت نوبت خود تکمیل نمایید. تأییدیه و جزئیات نوبت بلافاصله ثبت خواهد شد.</p><ul class="booking-trust-row" data-astro-cid-b75koquv><li data-astro-cid-b75koquv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"stroke": 2.6,
		"class": "trust-ico",
		"data-astro-cid-b75koquv": true
	})}ثبت آنی نوبت در سامانه</li><li data-astro-cid-b75koquv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 16,
		"stroke": 2.4,
		"class": "trust-ico",
		"data-astro-cid-b75koquv": true
	})}۱۵٪ تخفیف ویژه رزرو آنلاین</li><li data-astro-cid-b75koquv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 16,
		"stroke": 2.1,
		"class": "trust-ico",
		"data-astro-cid-b75koquv": true
	})}پشتیبانی پیامکی پس از ثبت</li></ul></div></div><section class="section booking-page-section" data-astro-cid-b75koquv><div class="container container-sm" data-astro-cid-b75koquv>${renderComponent($$result, "BookingWizard", BookingWizard, {
		"client:load": true,
		"initialServices": services,
		"preselectedSlug": serviceParam,
		"data-astro-cid-b75koquv": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Capsizer/Desktop/TehranLasser/src/components/booking/BookingWizard.tsx",
		"client:component-export": "BookingWizard"
	})}</div></section>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/booking.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/booking.astro";
var $$url = "/booking";
//#endregion
//#region \0virtual:astro:page:src/pages/booking@_@astro
var page = () => booking_exports;
//#endregion
export { page };
