globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { u as listAdminCustomers } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/customers/index.astro
var customers_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const url = Astro.url;
	const search = url.searchParams.get("q") || void 0;
	let customers = {
		items: [],
		nextCursor: null
	};
	try {
		customers = await listAdminCustomers(env.DB, 50, void 0, search);
	} catch (e) {
		console.error("Failed to load customers:", e);
	}
	const categoryParam = url.searchParams.get("category") || void 0;
	const displayedItems = categoryParam ? customers.items.filter((c) => c.pricingCategory === categoryParam) : customers.items;
	const totalBookings = displayedItems.reduce((sum, c) => sum + (c.bookingsCount ?? 0), 0);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "بانک مراجعین",
		"activeNav": "customers",
		"data-astro-cid-bwvpu5dv": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad customers-page" data-astro-cid-bwvpu5dv><!-- 3D Obsidian-Gold Header Row --><div class="dashboard-header-row" data-astro-cid-bwvpu5dv><div class="header-main-col" data-astro-cid-bwvpu5dv><h1 class="admin-page-title" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "customers",
		"size": 26,
		"class": "title-gold-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>بانک جامع اطلاعات مراجعین کلینیک</span></h1><p class="section-block-sub" data-astro-cid-bwvpu5dv>مشاهده، مدیریت، جستجو و ویرایش مستقیم مشخصات مراجعین (API First)</p></div><div class="actions customers-header-actions" data-astro-cid-bwvpu5dv><span class="customers-count-pill" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 16,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>${customers.items.length.toLocaleString("fa-IR")} پرونده مراجع</span></span><span class="customers-count-pill customers-count-pill-alt" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>${totalBookings.toLocaleString("fa-IR")} نوبت ثبت‌شده</span></span></div></div><!-- 3D Search & Filter Card --><div class="admin-section-block customers-search-card" data-astro-cid-bwvpu5dv><form method="GET" class="customers-search-form" aria-label="جستجوی مراجعین" data-astro-cid-bwvpu5dv><div class="customers-search-input-wrap" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 18,
		"class": "customers-search-icon",
		"aria-hidden": "true",
		"data-astro-cid-bwvpu5dv": true
	})}<input type="text" name="q" class="form-control-modal customers-search-input" placeholder="جستجوی سریع با نام مراجع یا شماره تلفن (مثال: ۰۹۰۳)..."${addAttribute(search || "", "value")} aria-label="عبارت جستجو" data-astro-cid-bwvpu5dv></div><div class="customers-search-actions" data-astro-cid-bwvpu5dv><button type="submit" class="btn-3d-gold customers-search-btn" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 17,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>جستجوی مراجع</span></button><a href="/admin/customers" class="btn-3d-secondary customers-clear-btn" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>پاک کردن</span></a></div></form></div><!-- 3D Customers Table --><div class="admin-section-block customers-table-card" data-astro-cid-bwvpu5dv>${displayedItems.length === 0 ? renderTemplate`<div class="customers-empty-state" data-astro-cid-bwvpu5dv><span class="empty-icon-3d" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 38,
		"data-astro-cid-bwvpu5dv": true
	})}</span><p class="empty-text" data-astro-cid-bwvpu5dv>مراجع مطابق با جستجوی شما یافت نشد.</p><p class="empty-sub" data-astro-cid-bwvpu5dv>عبارت دیگری را امتحان کنید یا فیلتر را پاک نمایید.</p></div>` : renderTemplate`<div class="today-table-wrapper customers-table-wrap" data-astro-cid-bwvpu5dv><table class="admin-table customers-table" data-astro-cid-bwvpu5dv><thead data-astro-cid-bwvpu5dv><tr data-astro-cid-bwvpu5dv><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>نام و نام خانوادگی</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>شماره همراه</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>بخش پذیرش</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>تعداد نوبت‌ها</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>آخرین نوبت</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>تاریخ ثبت پرونده</span></th><th data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>عملیات ویرایش</span></th></tr></thead><tbody data-astro-cid-bwvpu5dv>${displayedItems.map((c) => renderTemplate`<tr data-astro-cid-bwvpu5dv><td class="cell-name" data-label="نام و نام خانوادگی" data-astro-cid-bwvpu5dv><span class="cust-avatar" aria-hidden="true" data-astro-cid-bwvpu5dv>${c.name?.trim()?.charAt(0) || "؟"}</span><span class="cust-name-text" data-astro-cid-bwvpu5dv>${c.name}</span></td><td dir="ltr" class="cell-phone" data-label="شماره همراه" data-astro-cid-bwvpu5dv><a${addAttribute(`tel:${c.phone}`, "href")} class="cust-phone-link" dir="ltr" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"class": "phone-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>${c.phone}</span></a></td><td data-label="بخش پذیرش" data-astro-cid-bwvpu5dv><span${addAttribute(`badge-status ${c.pricingCategory === "female" ? "badge-status-completed" : "badge-status-pending"}`, "class")} data-astro-cid-bwvpu5dv>${c.pricingCategory === "female" ? "بانوان" : "آقایان"}</span></td><td class="cell-count" data-label="تعداد نوبت‌ها" data-astro-cid-bwvpu5dv><span class="count-pill" data-astro-cid-bwvpu5dv>${(c.bookingsCount ?? 0).toLocaleString("fa-IR")}</span><span class="count-unit" data-astro-cid-bwvpu5dv>نوبت</span></td><td data-label="آخرین نوبت" data-astro-cid-bwvpu5dv>${c.lastBookingAt ? renderTemplate`<span class="date-gold" data-astro-cid-bwvpu5dv>${formatJalaliDate(c.lastBookingAt.slice(0, 10))}</span>` : renderTemplate`<span class="date-dim" data-astro-cid-bwvpu5dv>—</span>`}</td><td class="cell-created" data-label="تاریخ ثبت پرونده" data-astro-cid-bwvpu5dv>${formatJalaliDate(c.createdAt.slice(0, 10))}</td><td class="cell-action" data-label="عملیات ویرایش" data-astro-cid-bwvpu5dv><button type="button" class="btn-table-action edit-customer-btn customers-edit-btn"${addAttribute(c.id, "data-id")}${addAttribute(c.name, "data-name")}${addAttribute(c.phone, "data-phone")}${addAttribute(c.pricingCategory, "data-category")}${addAttribute(c.email || "", "data-email")}${addAttribute(c.note || "", "data-note")} data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 15,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>ویرایش مشخصات</span></button></td></tr>`)}</tbody></table></div>`}</div><!-- 3D Obsidian-Gold Edit Customer Modal --><div id="customerEditModal" class="modal-3d-backdrop customers-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="customerModalTitle" data-astro-cid-bwvpu5dv><div class="modal-3d-card customers-modal-card" data-astro-cid-bwvpu5dv><div class="modal-3d-header" data-astro-cid-bwvpu5dv><h3 class="modal-3d-title" id="customerModalTitle" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 20,
		"class": "title-gold-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>ویرایش پرونده مراجع</span></h3><button type="button" id="closeEditModalBtn" class="modal-close-btn" aria-label="بستن پنجره" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-bwvpu5dv": true
	})}</button></div><p class="modal-intro-note" data-astro-cid-bwvpu5dv>تغییرات مستقیماً در دیتابیس D1 ذخیره و در تمامی بخش‌های پذیرش اعمال خواهد شد.</p><div id="editAlert" class="alert-3d-danger customers-alert" style="display: none;" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 18,
		"class": "alert-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span id="editAlertText" data-astro-cid-bwvpu5dv></span></div><form id="editCustomerForm" class="customers-form-grid" data-astro-cid-bwvpu5dv><input type="hidden" id="editCustomerId" data-astro-cid-bwvpu5dv><div class="customers-field" data-astro-cid-bwvpu5dv><label for="editCustomerName" class="form-label-modal" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>نام و نام خانوادگی مراجع:</span></label><input type="text" id="editCustomerName" class="form-control-modal" required data-astro-cid-bwvpu5dv></div><div class="customers-field" data-astro-cid-bwvpu5dv><label for="editCustomerPhone" class="form-label-modal" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>شماره تلفن همراه (جهت پیامک و تماس):</span></label><input type="tel" id="editCustomerPhone" dir="ltr" class="form-control-modal" required data-astro-cid-bwvpu5dv></div><div class="g-2 customers-form-row" data-astro-cid-bwvpu5dv><div class="customers-field" data-astro-cid-bwvpu5dv><label for="editCustomerCategory" class="form-label-modal" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>بخش پذیرش:</span></label><select id="editCustomerCategory" class="form-control-modal" data-astro-cid-bwvpu5dv><option value="female" data-astro-cid-bwvpu5dv>بانوان</option><option value="male" data-astro-cid-bwvpu5dv>آقایان</option></select></div><div class="customers-field" data-astro-cid-bwvpu5dv><label for="editCustomerEmail" class="form-label-modal" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mail",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>آدرس ایمیل (اختیاری):</span></label><input type="email" id="editCustomerEmail" dir="ltr" class="form-control-modal" placeholder="example@mail.com" data-astro-cid-bwvpu5dv></div></div><div class="customers-field" data-astro-cid-bwvpu5dv><label for="editCustomerNote" class="form-label-modal" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>یادداشت و پرونده بالینی (پوست، حساسیت، توضیحات):</span></label><textarea id="editCustomerNote" class="form-control-modal"${addAttribute(3, "rows")} placeholder="توضیحات نوع پوست، آلرژی یا یادداشت اپراتور..." data-astro-cid-bwvpu5dv></textarea></div><div class="customers-modal-actions" data-astro-cid-bwvpu5dv><button type="button" id="cancelEditBtn" class="btn-3d-secondary" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>انصراف</span></button><button type="submit" id="saveCustomerBtn" class="btn-3d-gold customers-save-btn" data-astro-cid-bwvpu5dv>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 17,
		"data-astro-cid-bwvpu5dv": true
	})}<span data-astro-cid-bwvpu5dv>ذخیره تغییرات مراجع</span></button></div></form></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/customers/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/customers/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/customers/index.astro";
var $$url = "/admin/customers";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/customers/index@_@astro
var page = () => customers_exports;
//#endregion
export { page };
