globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { u as listAdminCustomers } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/crm.astro
var crm_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Crm,
	file: () => $$file,
	url: () => $$url
});
var $$Crm = createComponent(async ($$result, $$props, $$slots) => {
	let customersList = [];
	let clinicalRecords = [];
	try {
		customersList = (await listAdminCustomers(env.DB, 100)).items;
		clinicalRecords = (await env.DB.prepare(`
    SELECT r.*, c.name AS customerName, c.phone AS customerPhone
      FROM customer_clinical_records r
      JOIN customers c ON c.id = r.customer_id
     ORDER BY r.created_at DESC LIMIT 50
  `).all()).results || [];
	} catch (e) {
		console.error("Failed to load CRM data:", e);
	}
	const totalSessionsBooked = clinicalRecords.reduce((s, r) => s + (Number(r.total_sessions) || 0), 0);
	const completedSessions = clinicalRecords.length;
	const avgProgress = totalSessionsBooked > 0 ? Math.min(100, Math.round(completedSessions / totalSessionsBooked * 100)) : 0;
	const totalShots = clinicalRecords.reduce((s, r) => s + (Number(r.shot_count) || 0), 0);
	const avgJoules = clinicalRecords.length > 0 ? clinicalRecords.reduce((s, r) => s + (Number(r.joules_energy) || 0), 0) / clinicalRecords.length : 0;
	const DEVICE_LABEL = "الکساندرایت کندلا جنتل پرومکس ۲۰۲۶";
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "پرونده بالینی و CRM",
		"activeNav": "crm",
		"data-astro-cid-rrz7xids": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad crm-page" data-astro-cid-rrz7xids><div class="dashboard-header-row" data-astro-cid-rrz7xids><div class="header-main-col" data-astro-cid-rrz7xids><h1 class="admin-page-title" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 26,
		"class": "title-gold-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>پرونده بالینی و ارتباط با مراجعین (Clinical CRM)</span></h1><p class="section-block-sub" data-astro-cid-rrz7xids>مدیریت پرونده‌های درمانی، رصد دوره‌های لیزر کندلا، شات‌ها، انرژی ژول و حافظه مراجعین (API First)</p></div><div class="actions" data-astro-cid-rrz7xids><button id="openNewRecordModalBtn" class="btn-3d-gold" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 17,
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>ثبت جلسه بالینی جدید</span></button></div></div><!-- Stats summary row --><div class="kpi-grid-3d crm-kpi-grid" data-astro-cid-rrz7xids><div class="kpi-card-3d" data-astro-cid-rrz7xids><div class="kpi-header" data-astro-cid-rrz7xids><span class="kpi-title" data-astro-cid-rrz7xids>کل مراجعین ثبت‌شده</span><span class="kpi-icon crm-kpi-icon-gold" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 20,
		"data-astro-cid-rrz7xids": true
	})}</span></div><div class="kpi-value" data-astro-cid-rrz7xids>${customersList.length.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-rrz7xids>بانک فعال مراجعین کلینیک</div></div><div class="kpi-card-3d" data-astro-cid-rrz7xids><div class="kpi-header" data-astro-cid-rrz7xids><span class="kpi-title" data-astro-cid-rrz7xids>جلسات ثبت‌شده در پرونده</span><span class="kpi-icon crm-kpi-icon-blue" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 20,
		"data-astro-cid-rrz7xids": true
	})}</span></div><div class="kpi-value" data-astro-cid-rrz7xids>${completedSessions.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-rrz7xids>سوابق دوز و انرژی دستگاه</div></div><div class="kpi-card-3d" data-astro-cid-rrz7xids><div class="kpi-header" data-astro-cid-rrz7xids><span class="kpi-title" data-astro-cid-rrz7xids>میانگین پیشرفت جلسات</span><span class="kpi-icon crm-kpi-icon-green" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chart",
		"size": 20,
		"data-astro-cid-rrz7xids": true
	})}</span></div><div class="kpi-value crm-kpi-progress-value" data-astro-cid-rrz7xids>${avgProgress.toLocaleString("fa-IR")}<span class="crm-kpi-unit" data-astro-cid-rrz7xids>٪</span></div><div class="kpi-footer" data-astro-cid-rrz7xids>${totalSessionsBooked.toLocaleString("fa-IR")} جلسه برنامه‌ریزی‌شده کل</div></div><div class="kpi-card-3d" data-astro-cid-rrz7xids><div class="kpi-header" data-astro-cid-rrz7xids><span class="kpi-title" data-astro-cid-rrz7xids>مجموع شات‌های لیزر</span><span class="kpi-icon crm-kpi-icon-gold" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 20,
		"data-astro-cid-rrz7xids": true
	})}</span></div><div class="kpi-value" data-astro-cid-rrz7xids>${totalShots.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-rrz7xids>میانگین انرژی: ${avgJoules.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} J/cm²</div></div></div><!-- Layout: Customer dossiers and recent clinical records --><div class="g-side crm-layout" data-astro-cid-rrz7xids><!-- Right: Customer list sidebar --><div class="admin-section-block crm-side-card" data-astro-cid-rrz7xids><h3 class="crm-side-title" data-astro-cid-rrz7xids><span class="crm-side-title-text" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 16,
		"class": "title-gold-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>مراجعین اخیر</span></span><span class="crm-side-count" data-astro-cid-rrz7xids>${customersList.length.toLocaleString("fa-IR")} پرونده</span></h3><div class="crm-search-wrap" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 16,
		"class": "crm-search-icon",
		"aria-hidden": "true",
		"data-astro-cid-rrz7xids": true
	})}<input type="text" id="custSearchInput" class="form-control-modal crm-search-input" placeholder="جستجوی نام یا تلفن..." aria-label="جستجوی مراجع" data-astro-cid-rrz7xids></div><div id="customerListContainer" class="crm-cust-list" data-astro-cid-rrz7xids>${customersList.map((c, idx) => renderTemplate`<div${addAttribute(`crm-cust-item ${idx === 0 ? "active" : ""}`, "class")}${addAttribute(c.id, "data-id")}${addAttribute(c.name, "data-name")}${addAttribute(c.phone, "data-phone")}${addAttribute(c.pricingCategory, "data-category")}${addAttribute(c.bookingsCount || 1, "data-count")} role="button"${addAttribute(0, "tabindex")} data-astro-cid-rrz7xids><span class="crm-cust-avatar" aria-hidden="true" data-astro-cid-rrz7xids>${c.name?.trim()?.charAt(0) || "؟"}</span><span class="crm-cust-body" data-astro-cid-rrz7xids><span class="crm-cust-top" data-astro-cid-rrz7xids><span class="crm-cust-name" data-astro-cid-rrz7xids>${c.name}</span><span class="crm-cust-cat" data-astro-cid-rrz7xids>${c.pricingCategory === "female" ? "بانوان" : "آقایان"}</span></span><span class="crm-cust-meta" data-astro-cid-rrz7xids><span dir="ltr" class="crm-cust-phone" data-astro-cid-rrz7xids>${c.phone}</span><span class="crm-cust-count" data-astro-cid-rrz7xids>${(c.bookingsCount || 1).toLocaleString("fa-IR")} نوبت</span></span></span></div>`)}${customersList.length === 0 && renderTemplate`<p class="crm-side-empty" data-astro-cid-rrz7xids>هنوز مراجعی ثبت نشده است.</p>`}</div></div><!-- Left: Active Customer Clinical Dossier --><div class="admin-section-block crm-dossier-card" data-astro-cid-rrz7xids><div class="crm-dossier-head" data-astro-cid-rrz7xids><div class="crm-dossier-id" data-astro-cid-rrz7xids><h2 id="dossierName" class="crm-dossier-name" data-astro-cid-rrz7xids>${customersList[0]?.name || "انتخاب مراجع"}</h2><div class="crm-dossier-meta" data-astro-cid-rrz7xids><span class="crm-dossier-phone" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"class": "meta-icon",
		"data-astro-cid-rrz7xids": true
	})}<span id="dossierPhone" dir="ltr" data-astro-cid-rrz7xids>${customersList[0]?.phone || ""}</span></span><span class="crm-dossier-cat" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"class": "meta-icon",
		"data-astro-cid-rrz7xids": true
	})}<span id="dossierCategory" data-astro-cid-rrz7xids>دسته: ${customersList[0]?.pricingCategory === "female" ? "بانوان" : "آقایان"}</span></span></div></div><div class="crm-dossier-actions" data-astro-cid-rrz7xids><button id="sendDirectSmsBtn" class="btn-3d-complete crm-dossier-btn" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 15,
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>ارسال پیامک مستقیم</span></button><button id="addSessionForCustBtn" class="btn-3d-gold crm-dossier-btn" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 15,
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>جلسه جدید کندلا</span></button></div></div><!-- Device + Course Progress --><div class="crm-course-panel" data-astro-cid-rrz7xids><div class="crm-device-line" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 17,
		"class": "title-gold-icon",
		"data-astro-cid-rrz7xids": true
	})}<span class="crm-device-name" data-astro-cid-rrz7xids>دستگاه فعال:</span><span class="crm-device-value" data-astro-cid-rrz7xids>${DEVICE_LABEL}</span></div><div class="crm-progress-head" data-astro-cid-rrz7xids><span class="crm-progress-label" data-astro-cid-rrz7xids>وضعیت پیشرفت پکیج لیزر (تعداد جلسات سپری شده):</span><span id="dossierProgressText" class="crm-progress-value" data-astro-cid-rrz7xids>جلسه ۲ از ۸ (۲۵٪)</span></div><div class="crm-progress-track" data-astro-cid-rrz7xids><div id="dossierProgressBar" class="crm-progress-fill" data-astro-cid-rrz7xids></div></div></div><!-- Clinical records table --><h4 class="crm-records-title" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 16,
		"class": "title-gold-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>تاریخچه جلسات، شات‌ها و دوز انرژی کندلا</span></h4><div class="admin-table-container crm-table-wrap" data-astro-cid-rrz7xids><table class="admin-table-3d crm-table" data-astro-cid-rrz7xids><thead data-astro-cid-rrz7xids><tr data-astro-cid-rrz7xids><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}جلسه</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}تاریخ جلسه</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}ناحیه تحت درمان</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}انرژی (J/cm²)</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}عرض پالس</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}شات‌ها</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}واکنش پوست</th><th data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"class": "th-icon",
		"data-astro-cid-rrz7xids": true
	})}اپراتور</th></tr></thead><tbody id="clinicalRecordsTbody" data-astro-cid-rrz7xids>${clinicalRecords.map((r) => renderTemplate`<tr${addAttribute(r.customer_id, "data-custid")} data-astro-cid-rrz7xids><td data-astro-cid-rrz7xids><span class="crm-session-badge" data-astro-cid-rrz7xids>جلسه ${r.session_number} از ${r.total_sessions}</span></td><td class="crm-date-cell" data-astro-cid-rrz7xids>${formatJalaliDate(r.created_at)}</td><td class="crm-area-cell" data-astro-cid-rrz7xids>${r.treated_areas}</td><td data-astro-cid-rrz7xids><span class="crm-joule-chip" data-astro-cid-rrz7xids>${r.joules_energy} J</span></td><td data-astro-cid-rrz7xids><span class="crm-pulse-chip" data-astro-cid-rrz7xids>${r.pulse_width_ms} ms</span></td><td data-astro-cid-rrz7xids><span class="crm-shot-chip" data-astro-cid-rrz7xids>${(Number(r.shot_count) || 0).toLocaleString("fa-IR")}</span></td><td class="crm-reaction-cell" data-astro-cid-rrz7xids>${r.skin_reaction}</td><td class="crm-operator-cell" data-astro-cid-rrz7xids>${r.operator_name || "اپراتور"}</td></tr>`)}${clinicalRecords.length === 0 && renderTemplate`<tr data-astro-cid-rrz7xids><td colspan="8" class="crm-empty-row" data-astro-cid-rrz7xids><span class="empty-icon-3d" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 34,
		"data-astro-cid-rrz7xids": true
	})}</span><span data-astro-cid-rrz7xids>هنوز جلسه بالینی ثبت نشده است. از دکمه بالا برای ثبت اولین جلسه استفاده کنید.</span></td></tr>`}</tbody></table></div></div></div></div><div id="newRecordModal" class="modal-3d-backdrop" style="display: none;" data-astro-cid-rrz7xids><div class="modal-3d-card" style="max-width: 620px;" data-astro-cid-rrz7xids><div class="modal-3d-header" data-astro-cid-rrz7xids><h3 class="modal-3d-title" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 20,
		"class": "title-gold-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>ثبت جلسه درمانی و پارامترهای لیزر</span></h3><button id="closeRecordModalBtn" class="modal-close-btn" aria-label="بستن" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-rrz7xids": true
	})}</button></div><form id="recordForm" class="crm-form" data-astro-cid-rrz7xids><input type="hidden" id="recordCustId"${addAttribute(customersList[0]?.id || "", "value")} data-astro-cid-rrz7xids><div class="g-2 crm-form-row" data-astro-cid-rrz7xids><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recSessionNum" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>شماره جلسه:</span></label><input type="number" id="recSessionNum" class="form-control-modal" value="1" min="1" max="15" required data-astro-cid-rrz7xids></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recTotalSessions" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>کل جلسات پکیج:</span></label><input type="number" id="recTotalSessions" class="form-control-modal" value="8" min="1" max="15" required data-astro-cid-rrz7xids></div></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recAreas" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>نواحی تحت درمان:</span></label><input type="text" id="recAreas" class="form-control-modal" value="فول بادی کاربردی (ساق، ساعد، زیربغل، بیکینی)" required data-astro-cid-rrz7xids></div><div class="crm-dose-grid" data-astro-cid-rrz7xids><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recJoules" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>انرژی (J/cm²):</span></label><input type="number" id="recJoules" step="0.5" class="form-control-modal crm-dose-input" value="14.0" required data-astro-cid-rrz7xids></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recPulse" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>عرض پالس (ms):</span></label><input type="number" id="recPulse" step="0.5" class="form-control-modal crm-dose-input" value="3.0" required data-astro-cid-rrz7xids></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recShots" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>تعداد شات:</span></label><input type="number" id="recShots" class="form-control-modal crm-dose-input" value="550" required data-astro-cid-rrz7xids></div></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recReaction" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>واکنش پوست مراجع:</span></label><input type="text" id="recReaction" class="form-control-modal" value="اریتم خفیف طبیعی، بدون سوختگی، کمپرس سرد اعمال شد" data-astro-cid-rrz7xids></div><div class="customers-field" data-astro-cid-rrz7xids><label class="form-label-modal" for="recOperator" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"class": "field-icon",
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>اپراتور / پزشک ناظر:</span></label><input type="text" id="recOperator" class="form-control-modal" value="خانم دکتر افشار / اپراتور ارشد" data-astro-cid-rrz7xids></div><div class="crm-form-actions" data-astro-cid-rrz7xids><button type="button" id="cancelRecordBtn" class="btn-3d-secondary" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>انصراف</span></button><button type="submit" id="saveRecordSubmitBtn" class="btn-3d-gold" data-astro-cid-rrz7xids>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 17,
		"data-astro-cid-rrz7xids": true
	})}<span data-astro-cid-rrz7xids>ثبت دائم در پرونده بالینی</span></button></div></form></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/crm.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/crm.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/crm.astro";
var $$url = "/admin/crm";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/crm@_@astro
var page = () => crm_exports;
//#endregion
export { page };
