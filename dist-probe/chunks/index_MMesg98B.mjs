globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, _ as addAttribute, c as Fragment, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { l as listAdminBookings, x as listPublicServices } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/bookings/index.astro
var bookings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const url = Astro.url;
	const statusFilter = url.searchParams.get("status") || void 0;
	const serviceFilter = url.searchParams.get("service") || void 0;
	const searchFilter = url.searchParams.get("q") || void 0;
	let bookings = {
		items: [],
		nextCursor: null
	};
	let services = [];
	try {
		[bookings, services] = await Promise.all([listAdminBookings(env.DB, {
			status: statusFilter,
			serviceSlug: serviceFilter,
			q: searchFilter,
			limit: 50
		}), listPublicServices(env.DB)]);
	} catch (e) {
		console.error("Failed to load admin bookings:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "مدیریت نوبت‌ها",
		"activeNav": "bookings",
		"data-astro-cid-ogblbbbz": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-ogblbbbz><!-- 3D Header Row --><div class="dashboard-header-row" data-astro-cid-ogblbbbz><div data-astro-cid-ogblbbbz><h1 class="admin-page-title page-title-with-icon" data-astro-cid-ogblbbbz><span class="page-title-icon-box" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "bookings",
		"size": 26,
		"data-astro-cid-ogblbbbz": true
	})}</span><span data-astro-cid-ogblbbbz>کنسول مدیریت و ویرایش نوبت‌های کلینیک</span></h1><p class="section-block-sub" data-astro-cid-ogblbbbz>تأیید فوری نوبت‌ها، لغو، تغییر وضعیت، ویرایش مشخصات مراجعین و مبالغ مصوب (API First)</p></div><div class="actions" data-astro-cid-ogblbbbz><span class="bookings-total-pill" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 16,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>تعداد کل نوبت‌ها: <strong data-astro-cid-ogblbbbz>${bookings.items.length.toLocaleString("fa-IR")}</strong> مورد</span></span></div></div><!-- 3D Filter Bar --><div class="admin-section-block filter-section-card" data-astro-cid-ogblbbbz><form method="GET" class="bookings-filter-form" data-astro-cid-ogblbbbz><div class="filter-field-col" data-astro-cid-ogblbbbz><label class="filter-field-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "filter",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>فیلتر وضعیت نوبت:</span></label><select name="status" class="form-control-modal filter-input" data-astro-cid-ogblbbbz><option value="" data-astro-cid-ogblbbbz>همه وضعیت‌ها</option><option value="pending"${addAttribute(statusFilter === "pending", "selected")} data-astro-cid-ogblbbbz>در انتظار تأیید</option><option value="confirmed"${addAttribute(statusFilter === "confirmed", "selected")} data-astro-cid-ogblbbbz>تأییدشده</option><option value="completed"${addAttribute(statusFilter === "completed", "selected")} data-astro-cid-ogblbbbz>انجام‌شده</option><option value="cancelled"${addAttribute(statusFilter === "cancelled", "selected")} data-astro-cid-ogblbbbz>لغوشده</option><option value="no_show"${addAttribute(statusFilter === "no_show", "selected")} data-astro-cid-ogblbbbz>عدم حضور</option><option value="rejected"${addAttribute(statusFilter === "rejected", "selected")} data-astro-cid-ogblbbbz>ردشده</option></select></div><div class="filter-field-col" data-astro-cid-ogblbbbz><label class="filter-field-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>فیلتر خدمت / ناحیه:</span></label><select name="service" class="form-control-modal filter-input" data-astro-cid-ogblbbbz><option value="" data-astro-cid-ogblbbbz>همه خدمات</option>${services.map((s) => renderTemplate`<option${addAttribute(s.slug, "value")}${addAttribute(serviceFilter === s.slug, "selected")} data-astro-cid-ogblbbbz>${s.name}</option>`)}</select></div><div class="filter-field-col filter-field-wide" data-astro-cid-ogblbbbz><label class="filter-field-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>جستجوی مراجع / کد رهگیری / تلفن:</span></label><input type="text" name="q" class="form-control-modal filter-input" placeholder="نام، ۰۹۱۲ یا کد رهگیری..."${addAttribute(searchFilter || "", "value")} data-astro-cid-ogblbbbz></div><div class="filter-btn-group" data-astro-cid-ogblbbbz><button type="submit" class="btn-3d-gold filter-action-btn" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 16,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>اعمال فیلتر</span></button><a href="/admin/bookings" class="btn-3d-secondary filter-action-btn" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 16,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>پاک کردن</span></a></div></form></div><!-- 3D Bookings Table --><div class="admin-section-block table-section-block" data-astro-cid-ogblbbbz>${bookings.items.length === 0 ? renderTemplate`<div class="empty-state-card" style="border: none; margin: 24px;" data-astro-cid-ogblbbbz><span class="empty-icon-wrap" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 40,
		"data-astro-cid-ogblbbbz": true
	})}</span><p class="empty-text" data-astro-cid-ogblbbbz>نوبتی با مشخصات واردشده یافت نشد.</p></div>` : renderTemplate`<div class="table-responsive-container" data-astro-cid-ogblbbbz><table class="admin-table-3d bookings-custom-table" data-astro-cid-ogblbbbz><thead data-astro-cid-ogblbbbz><tr data-astro-cid-ogblbbbz><th data-astro-cid-ogblbbbz>کد رزرو</th><th data-astro-cid-ogblbbbz>نام مراجع</th><th data-astro-cid-ogblbbbz>شماره همراه</th><th data-astro-cid-ogblbbbz>خدمت</th><th data-astro-cid-ogblbbbz>بخش</th><th data-astro-cid-ogblbbbz>تاریخ و ساعت نوبت</th><th data-astro-cid-ogblbbbz>مبلغ مصوب</th><th data-astro-cid-ogblbbbz>وضعیت</th><th data-astro-cid-ogblbbbz>مدیریت و عملیات</th></tr></thead><tbody data-astro-cid-ogblbbbz>${bookings.items.map((b) => {
		const dateStr = b.startsAt.slice(0, 10);
		const timeStr = new Date(b.startsAt).toLocaleTimeString("fa-IR", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tehran"
		});
		return renderTemplate`<tr data-astro-cid-ogblbbbz><td dir="ltr" class="ref-col-cell" data-astro-cid-ogblbbbz><span class="booking-ref-tag" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "document",
			"size": 12,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>${b.reference}</span></span></td><td class="customer-name-cell" data-astro-cid-ogblbbbz><span data-astro-cid-ogblbbbz>${b.customer.name}</span></td><td dir="ltr" class="phone-col-cell" data-astro-cid-ogblbbbz><a${addAttribute(`tel:${b.customer.phone}`, "href")} class="phone-direct-link" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "phone",
			"size": 14,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>${b.customer.phone}</span></a></td><td data-astro-cid-ogblbbbz>${b.service.name}</td><td data-astro-cid-ogblbbbz><span${addAttribute(`badge-status ${b.pricingCategory === "female" ? "badge-status-completed" : "badge-status-pending"}`, "class")} data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "users",
			"size": 12,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>${b.pricingCategory === "female" ? "بانوان" : "آقایان"}</span></span></td><td data-astro-cid-ogblbbbz><div class="date-time-cell-main" data-astro-cid-ogblbbbz>${formatJalaliDate(dateStr)}</div><span class="date-time-cell-sub" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>ساعت ${timeStr}</span></span></td><td data-astro-cid-ogblbbbz><div class="amount-cell-main" data-astro-cid-ogblbbbz>${(b.quotedAmount * 1e3).toLocaleString("fa-IR")} تومان</div>${b.discountAmount > 0 && renderTemplate`<span class="amount-cell-discount" data-astro-cid-ogblbbbz>(تخفیف: ${(b.discountAmount * 1e3).toLocaleString("fa-IR")})</span>`}</td><td data-astro-cid-ogblbbbz><span${addAttribute(`badge-status badge-status-${b.status}`, "class")} data-astro-cid-ogblbbbz>${b.status === "confirmed" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "checkCircle",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>تأییدشده</span>` })}`}${b.status === "pending" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>در انتظار تأیید</span>` })}`}${b.status === "completed" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "check",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>انجام‌شده</span>` })}`}${b.status === "cancelled" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "x",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>لغوشده</span>` })}`}${b.status === "no_show" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "warning",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>عدم حضور</span>` })}`}${b.status === "rejected" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "close",
			"size": 13,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>ردشده</span>` })}`}</span></td><td data-astro-cid-ogblbbbz><div class="row-actions-group" data-astro-cid-ogblbbbz>${b.status === "pending" && renderTemplate`<button type="button" class="btn-3d-accept accept-booking-btn"${addAttribute(b.id, "data-id")} title="تأیید فوری نوبت" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "check",
			"size": 14,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>تأیید</span></button>`}${b.status === "pending" && renderTemplate`<button type="button" class="btn-3d-reject reject-booking-btn"${addAttribute(b.id, "data-id")} title="رد و لغو نوبت" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "close",
			"size": 14,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>رد</span></button>`}${b.status === "confirmed" && renderTemplate`<button type="button" class="btn-3d-complete complete-booking-btn"${addAttribute(b.id, "data-id")} title="ثبت خاتمه و انجام خدمت" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "checkCircle",
			"size": 14,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>انجام شد</span></button>`}<button type="button" class="btn-table-action edit-booking-btn"${addAttribute(b.id, "data-id")}${addAttribute(b.customer.id, "data-customer-id")}${addAttribute(b.customer.name, "data-customer-name")}${addAttribute(b.customer.phone, "data-customer-phone")}${addAttribute(b.customerNote || "", "data-customer-note")}${addAttribute(b.adminNote || "", "data-admin-note")}${addAttribute(b.quotedAmount, "data-amount")} title="ویرایش پرونده و مشخصات" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 14,
			"data-astro-cid-ogblbbbz": true
		})}<span data-astro-cid-ogblbbbz>ویرایش</span></button></div></td></tr>`;
	})}</tbody></table></div>`}</div><!-- 3D Edit Booking & Customer Modal --><div id="bookingEditModal" class="modal-backdrop modal-custom-backdrop" style="display: none;" data-astro-cid-ogblbbbz><div class="modal-dialog modal-custom-dialog" data-astro-cid-ogblbbbz><div class="modal-header-with-icon" data-astro-cid-ogblbbbz><div class="modal-title-row" data-astro-cid-ogblbbbz><span class="modal-icon-badge" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 20,
		"data-astro-cid-ogblbbbz": true
	})}</span><h3 class="modal-title" data-astro-cid-ogblbbbz>ویرایش مشخصات نوبت و مراجع</h3></div><button type="button" class="modal-close-icon-btn" id="closeEditModalBtn" aria-label="بستن" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-ogblbbbz": true
	})}</button></div><p class="modal-sub-desc" data-astro-cid-ogblbbbz>ویرایش نام، شماره تلفن، یادداشت‌های پرونده و مبلغ مصوب (API First)</p><div id="bookingEditAlert" class="alert-3d-danger" style="display: none; margin-bottom: 16px;" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 18,
		"data-astro-cid-ogblbbbz": true
	})}<span id="bookingEditAlertText" data-astro-cid-ogblbbbz></span></div><form id="editBookingForm" data-astro-cid-ogblbbbz><input type="hidden" id="editBookingId" data-astro-cid-ogblbbbz><input type="hidden" id="editBookingCustomerId" data-astro-cid-ogblbbbz><div class="form-grid-pair" data-astro-cid-ogblbbbz><div data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>نام و نام خانوادگی مراجع:</span></label><input type="text" id="editBookingCustName" class="form-control-modal" required data-astro-cid-ogblbbbz></div><div data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>شماره همراه:</span></label><input type="tel" id="editBookingCustPhone" dir="ltr" class="form-control-modal" required data-astro-cid-ogblbbbz></div></div><div class="form-field-wrap" data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "cash",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>مبلغ مصوب فاکتور (هزار تومان):</span></label><input type="number" id="editBookingAmount" class="form-control-modal" required data-astro-cid-ogblbbbz></div><div class="form-field-wrap" data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>یادداشت مراجع (توضیحات رزرو):</span></label><input type="text" id="editBookingCustomerNote" class="form-control-modal" placeholder="توضیحات وارد شده توسط مراجع..." data-astro-cid-ogblbbbz></div><div class="form-field-wrap" data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>یادداشت محرمانه داخلی اپراتور / کلینیک:</span></label><textarea id="editBookingAdminNote" class="form-control-modal"${addAttribute(2, "rows")} placeholder="توضیحات داخلی کلینیک..." data-astro-cid-ogblbbbz></textarea></div><div class="modal-actions-row" data-astro-cid-ogblbbbz><button type="button" id="cancelBookingEditBtn" class="btn-3d-secondary modal-btn" data-astro-cid-ogblbbbz>انصراف</button><button type="submit" id="saveBookingBtn" class="btn-3d-accept modal-btn modal-btn-submit" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>ذخیره تغییرات نوبت</span></button></div></form></div></div><!-- 3D Rejection Modal --><div id="bookingRejectModal" class="modal-backdrop modal-custom-backdrop" style="display: none;" data-astro-cid-ogblbbbz><div class="modal-dialog modal-custom-dialog" data-astro-cid-ogblbbbz><div class="modal-header-with-icon" data-astro-cid-ogblbbbz><div class="modal-title-row" style="color: #f87171;" data-astro-cid-ogblbbbz><span class="modal-icon-badge reject-icon-badge" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 20,
		"data-astro-cid-ogblbbbz": true
	})}</span><h3 class="modal-title" style="color: #f87171;" data-astro-cid-ogblbbbz>ثبت دلیل رد نوبت</h3></div><button type="button" class="modal-close-icon-btn" id="closeRejectModalBtn" aria-label="بستن" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-ogblbbbz": true
	})}</button></div><p class="modal-sub-desc" data-astro-cid-ogblbbbz>دلیل عدم امکان پذیرش جهت اطلاع مراجع و آزادسازی فوری اسلات در سامانه:</p><form id="rejectBookingForm" data-astro-cid-ogblbbbz><input type="hidden" id="rejectBookingId" data-astro-cid-ogblbbbz><div class="form-field-wrap" data-astro-cid-ogblbbbz><label class="modal-input-label" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>علت پیش‌فرض:</span></label><select id="rejectReasonPreset" class="form-control-modal" style="margin-bottom: 10px;" data-astro-cid-ogblbbbz><option value="عدم امکان ارائه خدمت در ساعت درخواستی به دلیل تکمیل ظرفیت" data-astro-cid-ogblbbbz>عدم امکان ارائه خدمت در ساعت درخواستی</option><option value="ضرورت تغییر زمان با هماهنگی تلفنی با مراجع" data-astro-cid-ogblbbbz>ضرورت تغییر زمان با هماهنگی تلفنی</option><option value="محدودیت‌های پزشکی و دارویی مراجع" data-astro-cid-ogblbbbz>محدودیت‌های پزشکی و دارویی مراجع</option><option value="سایر دلایل" data-astro-cid-ogblbbbz>سایر دلایل...</option></select><textarea id="rejectReasonText" class="form-control-modal"${addAttribute(2, "rows")} placeholder="توضیحات تکمیلی یا پیام ارسالی به مراجع..." data-astro-cid-ogblbbbz></textarea></div><div class="modal-actions-row" data-astro-cid-ogblbbbz><button type="button" id="cancelRejectBtn" class="btn-3d-secondary modal-btn" data-astro-cid-ogblbbbz>انصراف</button><button type="submit" id="confirmRejectBtn" class="btn-3d-reject modal-btn modal-btn-submit" data-astro-cid-ogblbbbz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-ogblbbbz": true
	})}<span data-astro-cid-ogblbbbz>ثبت قطعی رد نوبت</span></button></div></form></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/bookings/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/bookings/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/bookings/index.astro";
var $$url = "/admin/bookings";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/bookings/index@_@astro
var page = () => bookings_exports;
//#endregion
export { page };
