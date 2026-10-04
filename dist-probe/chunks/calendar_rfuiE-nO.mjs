globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, _ as addAttribute, c as Fragment, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { l as listAdminBookings } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/calendar.astro
var calendar_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Calendar,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Calendar = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Calendar;
	const targetDate = Astro.url.searchParams.get("date") || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const fromIso = `${targetDate}T00:00:00.000Z`;
	const toIso = `${targetDate}T23:59:59.999Z`;
	const currDateObj = /* @__PURE__ */ new Date(targetDate + "T12:00:00Z");
	const prevDateObj = /* @__PURE__ */ new Date(currDateObj.getTime() - 864e5);
	const nextDateObj = new Date(currDateObj.getTime() + 864e5);
	const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const prevDateStr = prevDateObj.toISOString().slice(0, 10);
	const nextDateStr = nextDateObj.toISOString().slice(0, 10);
	const isToday = targetDate === todayIso;
	let bookings = {
		items: [],
		nextCursor: null
	};
	try {
		bookings = await listAdminBookings(env.DB, {
			fromStartsAt: fromIso,
			toStartsAt: toIso,
			limit: 100
		});
	} catch (e) {
		console.error("Failed to load calendar bookings:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "تقویم روزانه کلینیک",
		"activeNav": "calendar",
		"data-astro-cid-napi2nkf": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-napi2nkf><!-- 3D Header Row --><div class="dashboard-header-row" data-astro-cid-napi2nkf><div data-astro-cid-napi2nkf><h1 class="admin-page-title page-title-with-icon" data-astro-cid-napi2nkf><span class="page-title-icon-box" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 26,
		"data-astro-cid-napi2nkf": true
	})}</span><span data-astro-cid-napi2nkf>تقویم زمان‌بندی روزانه کلینیک</span></h1><p class="section-block-sub" data-astro-cid-napi2nkf>نمایش نوبت‌ها به تفکیک روز انتخابی — <strong style="color: #f5d77f;" data-astro-cid-napi2nkf>${formatJalaliDate(targetDate)}</strong></p></div><!-- Calendar Grid Navigation Toolbar --><div class="calendar-nav-toolbar" data-astro-cid-napi2nkf><div class="calendar-step-controls" data-astro-cid-napi2nkf><a${addAttribute(`/admin/calendar?date=${prevDateStr}`, "href")} class="btn-cal-step"${addAttribute(`روز قبل (${prevDateStr})`, "title")} aria-label="روز قبل" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronRight",
		"size": 18,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>روز قبل</span></a><a${addAttribute(`/admin/calendar?date=${todayIso}`, "href")}${addAttribute(`btn-cal-today ${isToday ? "btn-cal-today-active" : ""}`, "class")} title="رفتن به نوبت‌های امروز" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 15,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>امروز</span></a><a${addAttribute(`/admin/calendar?date=${nextDateStr}`, "href")} class="btn-cal-step"${addAttribute(`روز بعد (${nextDateStr})`, "title")} aria-label="روز بعد" data-astro-cid-napi2nkf><span data-astro-cid-napi2nkf>روز بعد</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronLeft",
		"size": 18,
		"data-astro-cid-napi2nkf": true
	})}</a></div><form method="GET" class="cal-date-picker-form" data-astro-cid-napi2nkf><label class="cal-date-label" for="calDateInput" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>انتخاب تاریخ:</span></label><input id="calDateInput" type="date" name="date" class="cal-date-input"${addAttribute(targetDate, "value")} onchange="this.form.submit()" data-astro-cid-napi2nkf></form></div></div><!-- Day Schedule Visual Timeline --><div class="admin-section-block calendar-section-block" data-astro-cid-napi2nkf><div class="section-block-header cal-section-header" data-astro-cid-napi2nkf><h2 class="section-block-title cal-section-title" data-astro-cid-napi2nkf><span class="cal-title-text" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 22,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>جدول زمان‌بندی نوبت‌های ${formatJalaliDate(targetDate)}</span></span><span class="cal-count-badge" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>${bookings.items.length.toLocaleString("fa-IR")} نوبت ثبت‌شده</span></span></h2></div>${bookings.items.length === 0 ? renderTemplate`<div class="empty-state-card cal-empty-state" data-astro-cid-napi2nkf><div class="empty-icon-wrap" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 42,
		"data-astro-cid-napi2nkf": true
	})}</div><p class="empty-text" data-astro-cid-napi2nkf>هیچ نوبتی برای این روز ثبت نشده است.</p><div class="cal-empty-actions" data-astro-cid-napi2nkf><a${addAttribute(`/admin/calendar?date=${todayIso}`, "href")} class="btn-3d-gold" style="font-size: 0.85rem; padding: 8px 16px;" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 15,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>مشاهده نوبت‌های امروز</span></a><a href="/admin/bookings" class="btn-3d-secondary" style="font-size: 0.85rem; padding: 8px 16px;" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "bookings",
		"size": 15,
		"data-astro-cid-napi2nkf": true
	})}<span data-astro-cid-napi2nkf>کنسول مدیریت تمام نوبت‌ها</span></a></div></div>` : renderTemplate`<div class="pending-bookings-list cal-bookings-grid" data-astro-cid-napi2nkf>${bookings.items.map((b) => {
		const timeStr = new Date(b.startsAt).toLocaleTimeString("fa-IR", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tehran"
		});
		return renderTemplate`<div class="pending-booking-card cal-booking-card" data-astro-cid-napi2nkf><div data-astro-cid-napi2nkf><div class="card-top-row" data-astro-cid-napi2nkf><div class="customer-info" data-astro-cid-napi2nkf><span class="customer-name" data-astro-cid-napi2nkf>${b.customer.name}</span><a${addAttribute(`tel:${b.customer.phone}`, "href")} class="customer-phone" dir="ltr" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "phone",
			"size": 13,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>${b.customer.phone}</span></a></div><div class="booking-ref-badge" dir="ltr" title="کد پیگیری" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "document",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>${b.reference}</span></div></div><div class="card-meta-grid cal-card-meta" data-astro-cid-napi2nkf><div class="meta-item cal-meta-item" data-astro-cid-napi2nkf><span class="meta-item-label" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 14,
			"data-astro-cid-napi2nkf": true
		})}<strong data-astro-cid-napi2nkf>زمان:</strong></span><span class="meta-item-value" data-astro-cid-napi2nkf>ساعت ${timeStr}</span></div><div class="meta-item cal-meta-item" data-astro-cid-napi2nkf><span class="meta-item-label" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "sparkles",
			"size": 14,
			"data-astro-cid-napi2nkf": true
		})}<strong data-astro-cid-napi2nkf>خدمت:</strong></span><span class="meta-item-value" data-astro-cid-napi2nkf>${b.service.name}</span></div><div class="meta-item cal-meta-item" data-astro-cid-napi2nkf><span class="meta-item-label" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "users",
			"size": 14,
			"data-astro-cid-napi2nkf": true
		})}<strong data-astro-cid-napi2nkf>بخش:</strong></span><span class="meta-item-value" data-astro-cid-napi2nkf>${b.pricingCategory === "female" ? "بانوان" : "آقایان"}</span></div><div class="meta-item cal-meta-item" data-astro-cid-napi2nkf><span class="meta-item-label" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "cash",
			"size": 14,
			"data-astro-cid-napi2nkf": true
		})}<strong data-astro-cid-napi2nkf>مبلغ:</strong></span><span class="meta-item-value font-tabular" data-astro-cid-napi2nkf>${(b.quotedAmount * 1e3).toLocaleString("fa-IR")} ت</span></div></div></div><div class="cal-card-footer" data-astro-cid-napi2nkf><span${addAttribute(`badge-status badge-status-${b.status}`, "class")} data-astro-cid-napi2nkf>${b.status === "confirmed" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "checkCircle",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>تأییدشده</span>` })}`}${b.status === "pending" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>در انتظار تأیید</span>` })}`}${b.status === "completed" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "check",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>انجام‌شده</span>` })}`}${b.status === "cancelled" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "x",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>لغوشده</span>` })}`}${b.status === "rejected" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "close",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>ردشده</span>` })}`}${b.status === "no_show" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "warning",
			"size": 12,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>عدم حضور</span>` })}`}</span><a${addAttribute(`/admin/bookings?q=${encodeURIComponent(b.reference)}`, "href")} class="btn-card-manage" title="مدیریت و ویرایش این نوبت" data-astro-cid-napi2nkf>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 13,
			"data-astro-cid-napi2nkf": true
		})}<span data-astro-cid-napi2nkf>مدیریت نوبت</span></a></div></div>`;
	})}</div>`}</div></div>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/calendar.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/calendar.astro";
var $$url = "/admin/calendar";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/calendar@_@astro
var page = () => calendar_exports;
//#endregion
export { page };
