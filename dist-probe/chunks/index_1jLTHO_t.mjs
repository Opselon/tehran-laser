globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, c as Fragment, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { g as listBusinessHours, m as listAllScheduleExceptions } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/schedule/index.astro
var schedule_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let hours = [];
	let exceptions = [];
	try {
		[hours, exceptions] = await Promise.all([listBusinessHours(env.DB), listAllScheduleExceptions(env.DB)]);
	} catch (e) {
		console.error("Failed to load business hours or exceptions:", e);
	}
	const weekdayNames = [
		{
			index: 0,
			name: "شنبه"
		},
		{
			index: 1,
			name: "یکشنبه"
		},
		{
			index: 2,
			name: "دوشنبه"
		},
		{
			index: 3,
			name: "سه‌شنبه"
		},
		{
			index: 4,
			name: "چهارشنبه"
		},
		{
			index: 5,
			name: "پنجشنبه"
		},
		{
			index: 6,
			name: "جمعه"
		}
	];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "ساعات کاری و زمان‌بندی",
		"activeNav": "schedule",
		"data-astro-cid-i2von44b": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-i2von44b><!-- 3D Header Row --><div class="dashboard-header-row" data-astro-cid-i2von44b><div data-astro-cid-i2von44b><h1 class="admin-page-title page-title-with-icon" data-astro-cid-i2von44b><span class="page-title-icon-box" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "schedule",
		"size": 26,
		"data-astro-cid-i2von44b": true
	})}</span><span data-astro-cid-i2von44b>تنظیمات ساعات کاری و زمان‌بندی کلینیک</span></h1><p class="section-block-sub" data-astro-cid-i2von44b>مدیریت بازه‌های نوبت‌دهی هفتگی، تغییر ساعات کاری و تقویم تعطیلات رسمی (کاملاً API First و بلادرنگ)</p></div><div class="actions" data-astro-cid-i2von44b><button type="button" id="openExceptionModalBtn" class="btn-3d-gold" style="display: inline-flex; align-items: center; gap: 8px;" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ثبت روز تعطیل یا استثنا</span></button></div></div><!-- Alert / Status --><div id="scheduleAlert" class="alert-3d-danger" style="display: none; margin-bottom: 20px;" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 18,
		"data-astro-cid-i2von44b": true
	})}<span id="scheduleAlertText" data-astro-cid-i2von44b></span></div><!-- 1. Weekly Business Hours Table --><div class="admin-section-block schedule-section-card" style="margin-bottom: 30px;" data-astro-cid-i2von44b><h3 class="section-block-title schedule-section-title" data-astro-cid-i2von44b><span class="title-with-icon" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 22,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>برنامه کاری هفتگی کلینیک تهران لیزر</span></span><span class="schedule-pill-note" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>مبنای زمان‌بندی هوشمند اسلات‌ها</span></span></h3><div class="table-responsive-container" data-astro-cid-i2von44b><table class="schedule-custom-table" data-astro-cid-i2von44b><thead data-astro-cid-i2von44b><tr data-astro-cid-i2von44b><th data-astro-cid-i2von44b>روز هفته</th><th data-astro-cid-i2von44b>ساعت شروع فعالیت</th><th data-astro-cid-i2von44b>ساعت پایان فعالیت</th><th data-astro-cid-i2von44b>وضعیت پذیرش</th><th data-astro-cid-i2von44b>عملیات ویرایش</th></tr></thead><tbody data-astro-cid-i2von44b>${weekdayNames.map((w) => {
		const day = hours.find((h) => h.weekday === w.index);
		const isOpen = !!day && day.segments.length > 0;
		const opensAt = isOpen ? day.segments[0]?.opensAt : "09:00";
		const closesAt = isOpen ? day.segments[day.segments.length - 1]?.closesAt : "21:00";
		return renderTemplate`<tr data-astro-cid-i2von44b><td class="weekday-name-cell" data-astro-cid-i2von44b>${w.name}</td><td dir="ltr" class="time-col-cell" data-astro-cid-i2von44b>${isOpen ? renderTemplate`<span class="time-slot-badge" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-i2von44b": true
		})}<span data-astro-cid-i2von44b>${opensAt}</span></span>` : renderTemplate`<span class="time-slot-inactive" data-astro-cid-i2von44b>—</span>`}</td><td dir="ltr" class="time-col-cell" data-astro-cid-i2von44b>${isOpen ? renderTemplate`<span class="time-slot-badge" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-i2von44b": true
		})}<span data-astro-cid-i2von44b>${closesAt}</span></span>` : renderTemplate`<span class="time-slot-inactive" data-astro-cid-i2von44b>—</span>`}</td><td data-astro-cid-i2von44b><span${addAttribute(`badge-status ${isOpen ? "badge-status-completed" : "badge-status-rejected"}`, "class")} data-astro-cid-i2von44b>${isOpen ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "checkCircle",
			"size": 12,
			"data-astro-cid-i2von44b": true
		})}<span data-astro-cid-i2von44b>فعال و باز</span>` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
			"name": "close",
			"size": 12,
			"data-astro-cid-i2von44b": true
		})}<span data-astro-cid-i2von44b>تعطیل هفتگی</span>` })}`}</span></td><td data-astro-cid-i2von44b><button type="button" class="btn-table-action edit-hour-btn"${addAttribute(w.index, "data-weekday")}${addAttribute(w.name, "data-name")}${addAttribute(isOpen ? "true" : "false", "data-is-open")}${addAttribute(opensAt, "data-opens-at")}${addAttribute(closesAt, "data-closes-at")} data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 14,
			"data-astro-cid-i2von44b": true
		})}<span data-astro-cid-i2von44b>ویرایش ساعت کاری</span></button></td></tr>`;
	})}</tbody></table></div></div><!-- 2. Exceptions and Holidays Table --><div class="admin-section-block schedule-section-card" data-astro-cid-i2von44b><h3 class="section-block-title schedule-section-title" data-astro-cid-i2von44b><span class="title-with-icon" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 22,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تعطیلات رسمی، تغییرات مقطعی و مسدودی‌های تقویم</span></span><span class="schedule-pill-note" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>${exceptions.length.toLocaleString("fa-IR")} مورد ثبت‌شده</span></span></h3>${exceptions.length === 0 ? renderTemplate`<div class="empty-state-card" style="border: none; margin: 10px;" data-astro-cid-i2von44b><div class="empty-icon-wrap" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 40,
		"data-astro-cid-i2von44b": true
	})}</div><p class="empty-text" data-astro-cid-i2von44b>هیچ روز تعطیل یا استثنای فعالی ثبت نشده است.</p></div>` : renderTemplate`<div class="table-responsive-container" data-astro-cid-i2von44b><table class="schedule-custom-table" data-astro-cid-i2von44b><thead data-astro-cid-i2von44b><tr data-astro-cid-i2von44b><th data-astro-cid-i2von44b>تاریخ (شمسی و میلادی)</th><th data-astro-cid-i2von44b>نوع استثنا</th><th data-astro-cid-i2von44b>ساعت اختصاصی</th><th data-astro-cid-i2von44b>علت / یادداشت</th><th data-astro-cid-i2von44b>عملیات</th></tr></thead><tbody data-astro-cid-i2von44b>${exceptions.map((ex) => renderTemplate`<tr data-astro-cid-i2von44b><td data-astro-cid-i2von44b><div class="date-cell-jalali" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 13,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>${formatJalaliDate(ex.exceptionDate)}</span></div><span dir="ltr" class="date-cell-gregorian" data-astro-cid-i2von44b>${ex.exceptionDate}</span></td><td data-astro-cid-i2von44b><span${addAttribute(`badge-status ${ex.kind === "holiday" ? "badge-status-rejected" : "badge-status-pending"}`, "class")} data-astro-cid-i2von44b>${ex.kind === "holiday" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تعطیل رسمی</span>` })}`}${ex.kind === "closed" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تعطیل کلینیک</span>` })}`}${ex.kind === "special_hours" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ساعات کاری ویژه</span>` })}`}${ex.kind === "blocked_time" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>مسدودی موقت</span>` })}`}${ex.kind === "temporary_change" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تغییر موقت</span>` })}`}</span></td><td dir="ltr" class="time-col-cell" data-astro-cid-i2von44b>${ex.opensAt && ex.closesAt ? renderTemplate`<span class="time-slot-badge" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>${ex.opensAt} تا ${ex.closesAt}</span></span>` : renderTemplate`<span class="badge-all-day-closed" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 12,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تمام روز تعطیل</span></span>`}</td><td${addAttribute({ color: "#cbd5e1" }, "style")} data-astro-cid-i2von44b>${ex.note || "—"}</td><td data-astro-cid-i2von44b><button type="button" class="btn-3d-reject delete-exception-btn" style="padding: 6px 14px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"${addAttribute(ex.id, "data-id")} data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "trash",
		"size": 13,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>حذف</span></button></td></tr>`)}</tbody></table></div>`}</div><!-- 3D Edit Hours Modal --><div id="hourEditModal" class="modal-backdrop modal-custom-backdrop" style="display: none;" data-astro-cid-i2von44b><div class="modal-dialog modal-custom-dialog" data-astro-cid-i2von44b><div class="modal-header-with-icon" data-astro-cid-i2von44b><div class="modal-title-row" data-astro-cid-i2von44b><span class="modal-icon-badge" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 20,
		"data-astro-cid-i2von44b": true
	})}</span><h3 class="modal-title" data-astro-cid-i2von44b>تنظیم ساعت کاری <span id="modalDayName" data-astro-cid-i2von44b></span></h3></div><button type="button" class="modal-close-icon-btn" id="closeHourModalBtn" aria-label="بستن" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-i2von44b": true
	})}</button></div><p class="modal-sub-desc" data-astro-cid-i2von44b>تغییرات مستقیماً در دیتابیس D1 اعمال شده و موتور نوبت‌دهی بلافاصله بر این اساس اسلات‌های آزاد را محاسبه می‌کند.</p><form id="editHourForm" data-astro-cid-i2von44b><input type="hidden" id="editWeekday" data-astro-cid-i2von44b><div class="form-field-wrap" data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>وضعیت فعالیت در این روز:</span></label><select id="editDayIsOpen" class="form-control-modal" data-astro-cid-i2von44b><option value="true" data-astro-cid-i2von44b>فعال و باز (نوبت‌دهی فعال)</option><option value="false" data-astro-cid-i2von44b>تعطیل (عدم امکان رزرو)</option></select></div><div class="form-grid-pair" id="hoursInputGroup" style="display: grid; gap: 14px; margin-bottom: 18px" data-astro-cid-i2von44b><div data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ساعت شروع فعالیت:</span></label><input type="time" id="editOpensAt" class="form-control-modal" dir="ltr" data-astro-cid-i2von44b></div><div data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ساعت پایان فعالیت:</span></label><input type="time" id="editClosesAt" class="form-control-modal" dir="ltr" data-astro-cid-i2von44b></div></div><div class="modal-actions-row" data-astro-cid-i2von44b><button type="button" id="cancelHourBtn" class="btn-3d-secondary modal-btn" data-astro-cid-i2von44b>انصراف</button><button type="submit" id="saveHourBtn" class="btn-3d-accept modal-btn modal-btn-submit" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ذخیره تغییرات ساعت</span></button></div></form></div></div><!-- 3D New Exception / Holiday Modal --><div id="newExceptionModal" class="modal-backdrop modal-custom-backdrop" style="display: none;" data-astro-cid-i2von44b><div class="modal-dialog modal-custom-dialog" data-astro-cid-i2von44b><div class="modal-header-with-icon" data-astro-cid-i2von44b><div class="modal-title-row" data-astro-cid-i2von44b><span class="modal-icon-badge" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 20,
		"data-astro-cid-i2von44b": true
	})}</span><h3 class="modal-title" data-astro-cid-i2von44b>ثبت روز تعطیل یا بازه استثنا</h3></div><button type="button" class="modal-close-icon-btn" id="closeExModalBtn" aria-label="بستن" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-i2von44b": true
	})}</button></div><p class="modal-sub-desc" data-astro-cid-i2von44b>بستن نوبت‌دهی برای یک تاریخ مشخص یا تنظیم ساعات کاری ویژه در روزهای خاص.</p><form id="newExceptionForm" data-astro-cid-i2von44b><div class="form-field-wrap" data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>تاریخ مورد نظر (YYYY-MM-DD):</span></label><input type="date" id="exDate" class="form-control-modal" dir="ltr" required data-astro-cid-i2von44b></div><div class="form-field-wrap" data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>نوع رویداد:</span></label><select id="exKind" class="form-control-modal" data-astro-cid-i2von44b><option value="holiday" data-astro-cid-i2von44b>تعطیل رسمی / مناسبتی</option><option value="closed" data-astro-cid-i2von44b>تعطیلی داخلی کلینیک / استراحت</option><option value="special_hours" data-astro-cid-i2von44b>ساعات کاری ویژه (نیمه‌وقت)</option><option value="blocked_time" data-astro-cid-i2von44b>تعمیرات دستگاه یا مسدودی نوبت</option></select></div><div class="form-grid-pair" id="exHoursGroup" style="display: none; gap: 14px; margin-bottom: 14px" data-astro-cid-i2von44b><div data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ساعت شروع:</span></label><input type="time" id="exOpensAt" class="form-control-modal" dir="ltr" data-astro-cid-i2von44b></div><div data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ساعت پایان:</span></label><input type="time" id="exClosesAt" class="form-control-modal" dir="ltr" data-astro-cid-i2von44b></div></div><div class="form-field-wrap" data-astro-cid-i2von44b><label class="modal-input-label" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>توضیحات و علت (مثال: عید نوروز):</span></label><input type="text" id="exNote" class="form-control-modal" placeholder="توضیح جهت نمایش به پرسنل و مراجعین..." data-astro-cid-i2von44b></div><div class="modal-actions-row" data-astro-cid-i2von44b><button type="button" id="cancelExBtn" class="btn-3d-secondary modal-btn" data-astro-cid-i2von44b>انصراف</button><button type="submit" id="saveExBtn" class="btn-3d-accept modal-btn modal-btn-submit" data-astro-cid-i2von44b>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-i2von44b": true
	})}<span data-astro-cid-i2von44b>ثبت رویداد در تقویم</span></button></div></form></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/schedule/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/schedule/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/schedule/index.astro";
var $$url = "/admin/schedule";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/schedule/index@_@astro
var page = () => schedule_exports;
//#endregion
export { page };
