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
//#region src/pages/admin/lottery.astro
var lottery_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Lottery,
	file: () => $$file,
	url: () => $$url
});
var $$Lottery = createComponent(async ($$result, $$props, $$slots) => {
	let campaigns = [];
	let activeCampaign = null;
	try {
		campaigns = (await env.DB.prepare(`SELECT * FROM lottery_campaigns ORDER BY created_at DESC`).all()).results || [];
		activeCampaign = campaigns.find((c) => c.status === "active") || campaigns[0] || null;
	} catch (e) {
		console.error("Failed to load lottery data:", e);
	}
	const totalWinners = campaigns.filter((c) => Boolean(c.winner_name)).length;
	const totalCampaigns = campaigns.length;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "قرعه‌کشی و گردونه شانس",
		"activeNav": "lottery",
		"data-astro-cid-7kpp7sel": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-7kpp7sel><!-- Header --><div class="dashboard-header-row" data-astro-cid-7kpp7sel><div data-astro-cid-7kpp7sel><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" data-astro-cid-7kpp7sel><span class="lottery-title-emblem" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lottery",
		"size": 24,
		"data-astro-cid-7kpp7sel": true
	})}</span><span data-astro-cid-7kpp7sel>قرعه‌کشی هوشمند و گردونه شانس مراجعین</span></h1><p class="section-block-sub" data-astro-cid-7kpp7sel>سیستم باشگاه وفاداری، قرعه‌کشی‌های ماهانه بین مراجعین، اهدای جوایز جلسات رایگان و اطلاع‌رسانی پیامکی (API First)</p></div><div class="actions" data-astro-cid-7kpp7sel><button id="openNewLotteryModalBtn" class="btn-3d-gold" type="button" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>تعریف کمپین قرعه‌کشی جدید</span></button></div></div><!-- Notification Toast --><div id="lotteryFeedbackToast" class="lottery-toast" style="display: none;" role="alert" data-astro-cid-7kpp7sel><div class="lottery-toast-inner" data-astro-cid-7kpp7sel><span id="lotteryToastIcon" class="lottery-toast-icon" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-7kpp7sel": true
	})}</span><span id="lotteryToastText" class="lottery-toast-text" data-astro-cid-7kpp7sel></span></div></div><!-- KPI Grid --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); margin-bottom: 26px;" data-astro-cid-7kpp7sel><div class="kpi-card-3d" data-astro-cid-7kpp7sel><div class="kpi-header" data-astro-cid-7kpp7sel><span class="kpi-title" data-astro-cid-7kpp7sel>وضعیت دوره جاری</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lottery",
		"size": 22,
		"data-astro-cid-7kpp7sel": true
	})}</span></div><div class="kpi-value" style="color: #34d399; font-size: 1.55rem;" data-astro-cid-7kpp7sel>${activeCampaign && activeCampaign.status === "active" ? "در حال ثبت‌نام" : "آماده تعریف"}</div><div class="kpi-footer" style="color: #34d399; display: flex; align-items: center; gap: 6px;" data-astro-cid-7kpp7sel><span class="live-dot" data-astro-cid-7kpp7sel></span><span data-astro-cid-7kpp7sel>انتخاب رمزنگاری‌شده D1</span></div></div><div class="kpi-card-3d" data-astro-cid-7kpp7sel><div class="kpi-header" data-astro-cid-7kpp7sel><span class="kpi-title" data-astro-cid-7kpp7sel>جایزه ویژه دوره جاری</span><span class="kpi-icon" style="color: #f5d77f;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 22,
		"data-astro-cid-7kpp7sel": true
	})}</span></div><div class="kpi-value" style="color: #f5d77f; font-size: 1.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"${addAttribute(activeCampaign?.prize || "تعریف نشده", "title")} data-astro-cid-7kpp7sel>${activeCampaign?.prize || "تعریف نشده"}</div><div class="kpi-footer" style="color: #cbd5e1;" data-astro-cid-7kpp7sel>جلسات رایگان لیزر کندلا</div></div><div class="kpi-card-3d" data-astro-cid-7kpp7sel><div class="kpi-header" data-astro-cid-7kpp7sel><span class="kpi-title" data-astro-cid-7kpp7sel>حداقل فاکتور واجد شرایط</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "cash",
		"size": 22,
		"data-astro-cid-7kpp7sel": true
	})}</span></div><div class="kpi-value" style="color: #38bdf8;" data-astro-cid-7kpp7sel>${activeCampaign && activeCampaign.min_spending > 0 ? `${(activeCampaign.min_spending * 1e3).toLocaleString("fa-IR")} ت` : "بدون شرط"}</div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-7kpp7sel>محاسبه خودکار از ماژول حسابداری</div></div><div class="kpi-card-3d" data-astro-cid-7kpp7sel><div class="kpi-header" data-astro-cid-7kpp7sel><span class="kpi-title" data-astro-cid-7kpp7sel>کل برندگان ثبت‌شده</span><span class="kpi-icon" style="color: #a78bfa;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 22,
		"data-astro-cid-7kpp7sel": true
	})}</span></div><div class="kpi-value" style="color: #a78bfa;" data-astro-cid-7kpp7sel>${totalWinners} <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;" data-astro-cid-7kpp7sel>نفر</span></div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-7kpp7sel>از مجموع ${totalCampaigns} دوره برگزار شده</div></div></div><!-- Active Campaign Highlight Box -->${activeCampaign ? renderTemplate`<div class="lottery-active-hero admin-section-block" data-astro-cid-7kpp7sel><div class="lottery-hero-top" data-astro-cid-7kpp7sel><div class="lottery-hero-info" data-astro-cid-7kpp7sel><div style="margin-bottom: 8px;" data-astro-cid-7kpp7sel>${activeCampaign.status === "active" ? renderTemplate`<span class="badge-status badge-status-confirmed" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 12,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>دوره فعال در حال ثبت نام و واجدین شرایط</span></span>` : renderTemplate`<span class="badge-status badge-status-completed" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>قرعه‌کشی با موفقیت انجام شده</span></span>`}</div><h2 class="lottery-hero-title" data-astro-cid-7kpp7sel>${activeCampaign.title}</h2><div class="lottery-prize-strip" data-astro-cid-7kpp7sel><span class="lottery-prize-icon" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 18,
		"data-astro-cid-7kpp7sel": true
	})}</span><span class="lottery-prize-label" data-astro-cid-7kpp7sel>جایزه ویژه برنده:</span><strong class="lottery-prize-name" data-astro-cid-7kpp7sel>${activeCampaign.prize}</strong></div></div><div class="lottery-hero-spend" data-astro-cid-7kpp7sel><span class="lottery-spend-label" data-astro-cid-7kpp7sel>حداقل خرید جهت شرکت:</span><div class="lottery-spend-val" data-astro-cid-7kpp7sel>${activeCampaign.min_spending > 0 ? `${(activeCampaign.min_spending * 1e3).toLocaleString("fa-IR")} تومان` : "بدون محدودیت خرید"}</div><span class="lottery-spend-sub" data-astro-cid-7kpp7sel>ورود خودکار فاکتورهای واجد شرایط</span></div></div><!-- Draw Stage / Wheel Interaction --><div class="lottery-stage-card" data-astro-cid-7kpp7sel><div id="drawVisualContainer" data-astro-cid-7kpp7sel><!-- Winner Celebration Display --><div id="winnerDisplayBox" class="winner-reveal-box" style="display: none;" data-astro-cid-7kpp7sel><div class="winner-sparkle-emblem" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 36,
		"data-astro-cid-7kpp7sel": true
	})}</div><h3 class="winner-reveal-heading" data-astro-cid-7kpp7sel>برنده خوش‌شانس این دوره تهران لیزر</h3><div id="winnerNameText" class="winner-name-display" data-astro-cid-7kpp7sel>--</div><div id="winnerPhoneText" dir="ltr" class="winner-phone-display" data-astro-cid-7kpp7sel>--</div><div class="winner-sms-badge" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 15,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>پیامک تبریک رسمی و کد جایزه به شماره برنده ارسال گردید.</span></div></div><!-- 3D Interactive Obsidian-Gold Wheel Stage --><div id="wheelIdleBox" class="wheel-stage-idle" data-astro-cid-7kpp7sel><div class="lottery-wheel-wrapper" data-astro-cid-7kpp7sel><div class="lottery-wheel-pointer" data-astro-cid-7kpp7sel><span class="pointer-arrow" data-astro-cid-7kpp7sel></span></div><div id="goldenWheelCanvas" class="lottery-wheel-disc" data-astro-cid-7kpp7sel><svg viewBox="0 0 200 200" class="wheel-svg" aria-hidden="true" data-astro-cid-7kpp7sel><circle cx="100" cy="100" r="96" fill="#0f172a" stroke="rgba(212, 175, 55, 0.6)" stroke-width="4" data-astro-cid-7kpp7sel></circle><!-- Wheel Sectors --><g opacity="0.85" data-astro-cid-7kpp7sel><path d="M100 100 L100 4 A96 96 0 0 1 168 32 Z" fill="#d4af37" opacity="0.25" data-astro-cid-7kpp7sel></path><path d="M100 100 L168 32 A96 96 0 0 1 196 100 Z" fill="#1e293b" data-astro-cid-7kpp7sel></path><path d="M100 100 L196 100 A96 96 0 0 1 168 168 Z" fill="#d4af37" opacity="0.4" data-astro-cid-7kpp7sel></path><path d="M100 100 L168 168 A96 96 0 0 1 100 196 Z" fill="#0f172a" data-astro-cid-7kpp7sel></path><path d="M100 100 L100 196 A96 96 0 0 1 32 168 Z" fill="#d4af37" opacity="0.25" data-astro-cid-7kpp7sel></path><path d="M100 100 L32 168 A96 96 0 0 1 4 100 Z" fill="#1e293b" data-astro-cid-7kpp7sel></path><path d="M100 100 L4 100 A96 96 0 0 1 32 32 Z" fill="#d4af37" opacity="0.4" data-astro-cid-7kpp7sel></path><path d="M100 100 L32 32 A96 96 0 0 1 100 4 Z" fill="#0f172a" data-astro-cid-7kpp7sel></path></g><!-- Gold studs --><circle cx="100" cy="10" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="164" cy="36" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="190" cy="100" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="164" cy="164" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="100" cy="190" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="36" cy="164" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="10" cy="100" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><circle cx="36" cy="36" r="3" fill="#f5d77f" data-astro-cid-7kpp7sel></circle><!-- Inner Hub --><circle cx="100" cy="100" r="36" fill="#0b0e16" stroke="#d4af37" stroke-width="2.5" data-astro-cid-7kpp7sel></circle></svg><div class="wheel-center-emblem" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lottery",
		"size": 26,
		"data-astro-cid-7kpp7sel": true
	})}</div></div></div><h3 class="wheel-stage-title" data-astro-cid-7kpp7sel>${activeCampaign.status === "active" ? "آماده اجرای قرعه‌کشی زنده بین مراجعین واجد شرایط" : `برنده دوره: ${activeCampaign.winner_name || "ثبت شده در سامانه"}`}</h3><p class="wheel-stage-sub" data-astro-cid-7kpp7sel>انتخاب کاملاً تصادفی و رمزنگاری‌شده از بین کل مراجعین واجد شرایط که در بازه کمپین فاکتور ثبت‌شده داشته‌اند.</p></div></div>${activeCampaign.status === "active" && renderTemplate`<div class="wheel-action-wrap" data-astro-cid-7kpp7sel><button id="triggerDrawBtn"${addAttribute(activeCampaign.id, "data-id")} class="btn-3d-gold lottery-draw-btn" type="button" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "play",
		"size": 18,
		"data-astro-cid-7kpp7sel": true
	})}<span id="triggerDrawBtnText" data-astro-cid-7kpp7sel>شروع گردونه و انتخاب برنده تصادفی</span></button></div>`}</div></div>` : renderTemplate`<div class="admin-section-block" style="padding: 40px 24px; text-align: center; color: #94a3b8;" data-astro-cid-7kpp7sel><div class="lottery-empty-emblem" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lottery",
		"size": 40,
		"data-astro-cid-7kpp7sel": true
	})}</div><h4 style="font-size: 1.15rem; color: #f8fafc; margin-bottom: 6px;" data-astro-cid-7kpp7sel>هنوز هیچ دوره قرعه‌کشی تعریف نشده است</h4><p style="font-size: 0.88rem; max-width: 440px; margin: 0 auto 18px;" data-astro-cid-7kpp7sel>از دکمه بالا برای ساخت اولین کمپین قرعه‌کشی و اعطای جوایز ویژه به مراجعین وفادار استفاده کنید.</p><button class="btn-3d-gold open-lottery-modal-trigger" type="button" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>تعریف اولین دوره</span></button></div>`}<!-- Past Campaigns Table --><div class="admin-section-block" style="padding: 24px;" data-astro-cid-7kpp7sel><div class="section-block-header" style="margin-bottom: 20px;" data-astro-cid-7kpp7sel><h3 class="section-block-title" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 20,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>تاریخچه دوره‌ها و برندگان قرعه‌کشی</span></h3><p class="section-block-sub" data-astro-cid-7kpp7sel>آرشیو کمپین‌های اتمام‌یافته، مشخصات برندگان خوش‌شانس و زمان برگزاری</p></div><div class="admin-table-container" data-astro-cid-7kpp7sel><table class="admin-table-3d" data-astro-cid-7kpp7sel><thead data-astro-cid-7kpp7sel><tr data-astro-cid-7kpp7sel><th data-astro-cid-7kpp7sel>عنوان دوره</th><th data-astro-cid-7kpp7sel>جایزه ویژه</th><th data-astro-cid-7kpp7sel>وضعیت</th><th data-astro-cid-7kpp7sel>نام برنده</th><th data-astro-cid-7kpp7sel>شماره تماس برنده</th><th data-astro-cid-7kpp7sel>تاریخ برگزاری</th></tr></thead><tbody data-astro-cid-7kpp7sel>${campaigns.map((c) => renderTemplate`<tr data-astro-cid-7kpp7sel><td style="font-weight: 800; color: #f8fafc;" data-astro-cid-7kpp7sel>${c.title}</td><td style="color: #f5d77f; font-weight: 700;" data-astro-cid-7kpp7sel><span style="display: inline-flex; align-items: center; gap: 6px;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 14,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>${c.prize}</span></span></td><td data-astro-cid-7kpp7sel><span${addAttribute(`badge-status ${c.status === "active" ? "badge-status-confirmed" : "badge-status-completed"}`, "class")} data-astro-cid-7kpp7sel>${c.status === "active" ? "دوره جاری" : "پایان یافته"}</span></td><td style="font-weight: 700; color: #34d399;" data-astro-cid-7kpp7sel>${c.winner_name || "-"}</td><td dir="ltr" style="font-family: monospace; font-size: 0.85rem; color: #cbd5e1;" data-astro-cid-7kpp7sel>${c.winner_phone || "-"}</td><td style="font-size: 0.85rem; color: #94a3b8;" data-astro-cid-7kpp7sel>${c.draw_date ? formatJalaliDate(c.draw_date) : "هنوز اجرا نشده"}</td></tr>`)}${campaigns.length === 0 && renderTemplate`<tr data-astro-cid-7kpp7sel><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;" data-astro-cid-7kpp7sel>هیچ دوره‌ای در آرشیو ثبت نشده است.</td></tr>`}</tbody></table></div></div></div><div id="newLotteryModal" class="modal-3d-backdrop" style="display: none;" data-astro-cid-7kpp7sel><div class="modal-3d-card" style="max-width: 520px;" data-astro-cid-7kpp7sel><div class="modal-3d-header" data-astro-cid-7kpp7sel><h3 class="modal-3d-title" style="display: flex; align-items: center; gap: 10px;" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lottery",
		"size": 22,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>تعریف دوره قرعه‌کشی جدید</span></h3><button id="closeLotteryModalBtn" class="modal-close-btn" type="button" aria-label="بستن پنجره" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 18,
		"data-astro-cid-7kpp7sel": true
	})}</button></div><form id="lotteryForm" style="display: flex; flex-direction: column; gap: 16px;" data-astro-cid-7kpp7sel><div data-astro-cid-7kpp7sel><label for="lotteryTitle" class="form-label-modal" data-astro-cid-7kpp7sel>عنوان کمپین قرعه‌کشی:</label><input type="text" id="lotteryTitle" class="form-control-modal" placeholder="مثال: قرعه‌کشی بزرگ یلدا و زمستان طلایی تهران لیزر" required data-astro-cid-7kpp7sel></div><div data-astro-cid-7kpp7sel><label for="lotteryPrize" class="form-label-modal" data-astro-cid-7kpp7sel>جایزه ویژه برنده:</label><input type="text" id="lotteryPrize" class="form-control-modal" placeholder="مثال: یک دوره ۸ جلسه‌ای فول بادی رایگان الکس کندلا" required data-astro-cid-7kpp7sel></div><div data-astro-cid-7kpp7sel><label for="lotteryMinSpend" class="form-label-modal" data-astro-cid-7kpp7sel>حداقل مبلغ خرید جهت شرکت (هزار تومان):</label><input type="number" id="lotteryMinSpend" class="form-control-modal" value="500" placeholder="۰ برای تمام مراجعین بدون حداقل خرید" data-astro-cid-7kpp7sel></div><div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; flex-wrap: wrap;" data-astro-cid-7kpp7sel><button type="button" id="cancelLotteryBtn" class="btn-3d-secondary" data-astro-cid-7kpp7sel>انصراف</button><button type="submit" id="saveLotterySubmitBtn" class="btn-3d-accept" data-astro-cid-7kpp7sel>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-7kpp7sel": true
	})}<span data-astro-cid-7kpp7sel>ثبت و آغاز دوره</span></button></div></form></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/lottery.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/lottery.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/lottery.astro";
var $$url = "/admin/lottery";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/lottery@_@astro
var page = () => lottery_exports;
//#endregion
export { page };
