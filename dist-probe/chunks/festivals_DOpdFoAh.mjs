globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/festivals.astro
var festivals_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Festivals,
	file: () => $$file,
	url: () => $$url
});
var $$Festivals = createComponent(async ($$result, $$props, $$slots) => {
	let festivals = [];
	try {
		festivals = (await env.DB.prepare(`SELECT * FROM discount_festivals ORDER BY starts_at DESC`).all()).results || [];
	} catch (e) {
		console.error("Failed to load festivals:", e);
	}
	const activeFestivals = festivals.filter((f) => Boolean(f.active));
	const activeCount = activeFestivals.length;
	const maxDiscount = activeFestivals.reduce((max, f) => f.discount_percent > max ? f.discount_percent : max, 0);
	const totalCampaigns = festivals.length;
	const seasonalTimeline = [
		{
			id: "spring",
			season: "بهار (نوروزی)",
			date: "۱ تا ۲۰ فروردین",
			disc: "۲۵٪",
			iconName: "sparkles",
			status: "گذشته",
			statusClass: "badge-status-completed"
		},
		{
			id: "summer",
			season: "تابستانه (آفتاب)",
			date: "۱ تا ۱۵ تیر",
			disc: "۱۵٪",
			iconName: "lightning",
			status: "گذشته",
			statusClass: "badge-status-completed"
		},
		{
			id: "autumn",
			season: "پاییزه طلایی",
			date: "مهر تا آبان",
			disc: "۲۰٪",
			iconName: "gem",
			status: "در حال اجرا",
			statusClass: "badge-status-confirmed"
		},
		{
			id: "yalda",
			season: "جشنواره شب یلدا",
			date: "۲۵ تا ۳۰ آذر",
			disc: "۳۰٪",
			iconName: "star",
			status: "به‌زودی",
			statusClass: "badge-status-pending"
		}
	];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "جشنواره‌ها و تخفیف‌ها",
		"activeNav": "festivals",
		"data-astro-cid-hzp2ai53": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-hzp2ai53><!-- Header --><div class="dashboard-header-row" data-astro-cid-hzp2ai53><div data-astro-cid-hzp2ai53><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" data-astro-cid-hzp2ai53><span class="fest-title-emblem" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "festivals",
		"size": 24,
		"data-astro-cid-hzp2ai53": true
	})}</span><span data-astro-cid-hzp2ai53>جشنواره‌های تخفیف و تایم‌لاین کمپین‌های فروش</span></h1><p class="section-block-sub" data-astro-cid-hzp2ai53>مدیریت تخفیف‌های مناسبتی، کمپین‌های تبلیغاتی و تایم‌لاین فصلی کلینیک تهران لیزر (API First)</p></div><div class="actions" data-astro-cid-hzp2ai53><button id="openNewFestModalBtn" class="btn-3d-gold" type="button" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>ایجاد جشنواره تخفیف جدید</span></button></div></div><!-- Feedback Notification Banner --><div id="festFeedbackToast" class="fest-toast" style="display: none;" role="alert" data-astro-cid-hzp2ai53><div class="fest-toast-inner" data-astro-cid-hzp2ai53><span id="festToastIcon" class="fest-toast-icon" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-hzp2ai53": true
	})}</span><span id="festToastText" class="fest-toast-text" data-astro-cid-hzp2ai53></span></div></div><!-- 3D KPI Metrics Cards --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); margin-bottom: 28px;" data-astro-cid-hzp2ai53><div class="kpi-card-3d" data-astro-cid-hzp2ai53><div class="kpi-header" data-astro-cid-hzp2ai53><span class="kpi-title" data-astro-cid-hzp2ai53>کمپین‌های فعال روی سایت</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "festivals",
		"size": 22,
		"data-astro-cid-hzp2ai53": true
	})}</span></div><div class="kpi-value" style="color: #34d399;" data-astro-cid-hzp2ai53>${activeCount} <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;" data-astro-cid-hzp2ai53>کمپین لایو</span></div><div class="kpi-footer" style="color: #34d399; display: flex; align-items: center; gap: 6px;" data-astro-cid-hzp2ai53><span class="live-dot" data-astro-cid-hzp2ai53></span><span data-astro-cid-hzp2ai53>اعمال خودکار روی نوبت‌های آنلاین</span></div></div><div class="kpi-card-3d" data-astro-cid-hzp2ai53><div class="kpi-header" data-astro-cid-hzp2ai53><span class="kpi-title" data-astro-cid-hzp2ai53>بیشترین درصد تخفیف فعال</span><span class="kpi-icon" style="color: #f5d77f;" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 22,
		"data-astro-cid-hzp2ai53": true
	})}</span></div><div class="kpi-value" style="color: #f5d77f;" data-astro-cid-hzp2ai53>${maxDiscount}٪</div><div class="kpi-footer" style="color: #cbd5e1;" data-astro-cid-hzp2ai53>روی پکیج‌های برگزیده کندلا پرومکس</div></div><div class="kpi-card-3d" data-astro-cid-hzp2ai53><div class="kpi-header" data-astro-cid-hzp2ai53><span class="kpi-title" data-astro-cid-hzp2ai53>کل کمپین‌های تعریف‌شده</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 22,
		"data-astro-cid-hzp2ai53": true
	})}</span></div><div class="kpi-value" style="color: #38bdf8;" data-astro-cid-hzp2ai53>${totalCampaigns}</div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-hzp2ai53>آرشیو فصلی و دوره‌ای کلینیک</div></div><div class="kpi-card-3d" data-astro-cid-hzp2ai53><div class="kpi-header" data-astro-cid-hzp2ai53><span class="kpi-title" data-astro-cid-hzp2ai53>یکپارچه‌سازی با پایگاه D1</span><span class="kpi-icon" style="color: #a78bfa;" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 22,
		"data-astro-cid-hzp2ai53": true
	})}</span></div><div class="kpi-value" style="color: #a78bfa; font-size: 1.5rem;" data-astro-cid-hzp2ai53>همگام لایو</div><div class="kpi-footer" style="color: #34d399;" data-astro-cid-hzp2ai53>اتصال Cloudflare Workers پایدار</div></div></div><!-- Active Festivals Grid & Countdown --><div class="admin-section-block" style="padding: 24px; margin-bottom: 32px;" data-astro-cid-hzp2ai53><div class="section-block-header" style="margin-bottom: 20px;" data-astro-cid-hzp2ai53><h3 class="section-block-title" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 20,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>فهرست جشنواره‌های جاری و برنامه‌ریزی‌شده</span></h3><p class="section-block-sub" data-astro-cid-hzp2ai53>لیست تخفیف‌های ویژه، کدهای سیستمی، میزان درصد کسر بها و روزشمار پایان مهلت</p></div><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 20px;" data-astro-cid-hzp2ai53>${festivals.map((f) => {
		const isActive = Boolean(f.active);
		return renderTemplate`<div${addAttribute(`fest-card-3d ${isActive ? "is-active" : "is-inactive"}`, "class")} data-astro-cid-hzp2ai53><div class="fest-card-top-bar" data-astro-cid-hzp2ai53><div class="fest-badge-slot" data-astro-cid-hzp2ai53>${isActive ? renderTemplate`<span class="badge-status badge-status-confirmed" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "checkCircle",
			"size": 12,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>فعال روی سایت</span></span>` : renderTemplate`<span class="badge-status badge-status-no_show" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 12,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>غیرفعال</span></span>`}</div><span class="fest-slug-code" dir="ltr" data-astro-cid-hzp2ai53>#${f.slug}</span></div><div class="fest-card-header" data-astro-cid-hzp2ai53><div class="fest-icon-emblem" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "festivals",
			"size": 24,
			"data-astro-cid-hzp2ai53": true
		})}</div><div class="fest-title-wrap" data-astro-cid-hzp2ai53><h3 class="fest-card-title" data-astro-cid-hzp2ai53>${f.title}</h3><span class="fest-card-sub" data-astro-cid-hzp2ai53>تخفیف ویژه مراجعین کلینیک</span></div></div><div class="fest-discount-strip" data-astro-cid-hzp2ai53><span class="fest-discount-label" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "percent",
			"size": 15,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>میزان تخفیف اعمالی:</span></span><span class="fest-discount-val" data-astro-cid-hzp2ai53>${f.discount_percent}٪ تخفیف</span></div><p class="fest-card-desc" data-astro-cid-hzp2ai53>${f.description || "تخفیف ویژه تمامی خدمات لیزر کندلا به مدت محدود روی وب‌سایت تهران لیزر."}</p><!-- Dynamic 3D Countdown Box --><div class="fest-countdown-container"${addAttribute(f.ends_at, "data-ends-at")}${addAttribute(isActive ? "1" : "0", "data-active")} data-astro-cid-hzp2ai53><div class="fest-countdown-header" data-astro-cid-hzp2ai53><span class="fest-countdown-title" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>مهلت باقی‌مانده کمپین:</span></span><span class="fest-countdown-status" data-astro-cid-hzp2ai53>در حال محاسبه...</span></div><div class="fest-countdown-grid" data-astro-cid-hzp2ai53><div class="fest-countdown-unit" data-astro-cid-hzp2ai53><span class="fest-unit-num fest-days" data-astro-cid-hzp2ai53>--</span><span class="fest-unit-label" data-astro-cid-hzp2ai53>روز</span></div><div class="fest-countdown-sep" data-astro-cid-hzp2ai53>:</div><div class="fest-countdown-unit" data-astro-cid-hzp2ai53><span class="fest-unit-num fest-hours" data-astro-cid-hzp2ai53>--</span><span class="fest-unit-label" data-astro-cid-hzp2ai53>ساعت</span></div><div class="fest-countdown-sep" data-astro-cid-hzp2ai53>:</div><div class="fest-countdown-unit" data-astro-cid-hzp2ai53><span class="fest-unit-num fest-minutes" data-astro-cid-hzp2ai53>--</span><span class="fest-unit-label" data-astro-cid-hzp2ai53>دقیقه</span></div><div class="fest-countdown-sep" data-astro-cid-hzp2ai53>:</div><div class="fest-countdown-unit" data-astro-cid-hzp2ai53><span class="fest-unit-num fest-seconds" data-astro-cid-hzp2ai53>--</span><span class="fest-unit-label" data-astro-cid-hzp2ai53>ثانیه</span></div></div></div><div class="fest-card-footer" data-astro-cid-hzp2ai53><span class="fest-date-col" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 13,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>شروع: ${formatJalaliDate(f.starts_at)}</span></span><span class="fest-date-col" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-hzp2ai53": true
		})}<span data-astro-cid-hzp2ai53>پایان: ${formatJalaliDate(f.ends_at)}</span></span></div></div>`;
	})}${festivals.length === 0 && renderTemplate`<div class="fest-empty-box" style="grid-column: 1 / -1;" data-astro-cid-hzp2ai53><div class="fest-empty-icon" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "festivals",
		"size": 40,
		"data-astro-cid-hzp2ai53": true
	})}</div><h4 style="font-size: 1.1rem; color: #f8fafc; margin-bottom: 6px;" data-astro-cid-hzp2ai53>هنوز هیچ جشنواره‌ای تعریف نشده است</h4><p style="font-size: 0.85rem; color: #94a3b8; margin: 0 0 16px;" data-astro-cid-hzp2ai53>برای شروع کمپین‌های تبلیغاتی و ارائه تخفیف‌های فصلی، از دکمه زیر استفاده نمایید.</p><button class="btn-3d-gold open-modal-trigger-btn" type="button" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 15,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>ایجاد اولین جشنواره</span></button></div>`}</div></div><!-- Visual Yearly Timeline --><div class="admin-section-block" style="padding: 28px;" data-astro-cid-hzp2ai53><div class="section-block-header" data-astro-cid-hzp2ai53><h3 class="section-block-title" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 20,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>تایم‌لاین کمپین‌های سالانه کلینیک تهران لیزر</span></h3><p class="section-block-sub" data-astro-cid-hzp2ai53>تقویم راهبردی کمپین‌های فصلی و تخفیف‌های مناسبتی در طول سال کاری کلینیک</p></div><div class="timeline-wrapper" data-astro-cid-hzp2ai53><div class="timeline-track-line" aria-hidden="true" data-astro-cid-hzp2ai53></div><div class="timeline-grid" data-astro-cid-hzp2ai53>${seasonalTimeline.map((item) => renderTemplate`<div class="timeline-season-card" data-astro-cid-hzp2ai53><div class="timeline-season-emblem" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": item.iconName,
		"size": 24,
		"data-astro-cid-hzp2ai53": true
	})}</div><h4 class="timeline-season-title" data-astro-cid-hzp2ai53>${item.season}</h4><div class="timeline-season-date" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 12,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>${item.date}</span></div><div class="timeline-season-disc" data-astro-cid-hzp2ai53><span data-astro-cid-hzp2ai53>${item.disc} تخفیف</span></div><span${addAttribute(`badge-status ${item.statusClass}`, "class")} style="font-size: 0.72rem;" data-astro-cid-hzp2ai53>${item.status}</span></div>`)}</div></div></div></div><div id="newFestModal" class="modal-3d-backdrop" style="display: none;" data-astro-cid-hzp2ai53><div class="modal-3d-card" style="max-width: 540px;" data-astro-cid-hzp2ai53><div class="modal-3d-header" data-astro-cid-hzp2ai53><h3 class="modal-3d-title" style="display: flex; align-items: center; gap: 10px;" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "festivals",
		"size": 22,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>تعریف جشنواره تخفیف جدید</span></h3><button id="closeFestModalBtn" class="modal-close-btn" type="button" aria-label="بستن پنجره" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-hzp2ai53": true
	})}</button></div><form id="festForm" style="display: flex; flex-direction: column; gap: 16px;" data-astro-cid-hzp2ai53><div data-astro-cid-hzp2ai53><label for="festTitle" class="form-label-modal" data-astro-cid-hzp2ai53>عنوان جشنواره:</label><input type="text" id="festTitle" class="form-control-modal" placeholder="مثال: جشنواره پاییزه طلایی تهران لیزر" required data-astro-cid-hzp2ai53></div><div class="g-2" style="display: grid; gap: 14px;" data-astro-cid-hzp2ai53><div data-astro-cid-hzp2ai53><label for="festPercent" class="form-label-modal" data-astro-cid-hzp2ai53>درصد تخفیف (%):</label><input type="number" id="festPercent" class="form-control-modal" value="20" min="1" max="100" required data-astro-cid-hzp2ai53></div><div data-astro-cid-hzp2ai53><label for="festSlug" class="form-label-modal" data-astro-cid-hzp2ai53>نامک انگلیسی (Slug):</label><input type="text" id="festSlug" dir="ltr" class="form-control-modal" placeholder="golden-autumn" required data-astro-cid-hzp2ai53></div></div><div data-astro-cid-hzp2ai53><label for="festDesc" class="form-label-modal" data-astro-cid-hzp2ai53>توضیحات و متن کمپین:</label><textarea id="festDesc" class="form-control-modal" rows="3" placeholder="توضیحات و شرایط تخفیف برای نمایش به مراجعین..." data-astro-cid-hzp2ai53></textarea></div><div class="g-2" style="display: grid; gap: 14px;" data-astro-cid-hzp2ai53><div data-astro-cid-hzp2ai53><label for="festStarts" class="form-label-modal" data-astro-cid-hzp2ai53>تاریخ شروع:</label><input type="date" id="festStarts" class="form-control-modal" required data-astro-cid-hzp2ai53></div><div data-astro-cid-hzp2ai53><label for="festEnds" class="form-label-modal" data-astro-cid-hzp2ai53>تاریخ پایان:</label><input type="date" id="festEnds" class="form-control-modal" required data-astro-cid-hzp2ai53></div></div><div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; flex-wrap: wrap;" data-astro-cid-hzp2ai53><button type="button" id="cancelFestBtn" class="btn-3d-secondary" data-astro-cid-hzp2ai53>انصراف</button><button type="submit" id="saveFestSubmitBtn" class="btn-3d-accept" data-astro-cid-hzp2ai53>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-hzp2ai53": true
	})}<span data-astro-cid-hzp2ai53>ثبت و انتشار جشنواره</span></button></div></form></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/festivals.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/festivals.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/festivals.astro";
var $$url = "/admin/festivals";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/festivals@_@astro
var page = () => festivals_exports;
//#endregion
export { page };
