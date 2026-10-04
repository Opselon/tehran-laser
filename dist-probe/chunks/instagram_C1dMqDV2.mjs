globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { a as getAllSettings } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/instagram.astro
var instagram_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Instagram,
	file: () => $$file,
	url: () => $$url
});
var $$Instagram = createComponent(async ($$result, $$props, $$slots) => {
	let settings = {
		public: {},
		private: {}
	};
	try {
		settings = await getAllSettings(env.DB);
	} catch (e) {
		console.error("Failed to load Instagram settings:", e);
	}
	const igUser = settings.public.instagram_username || "tehranlaser_clinic";
	const igBio = settings.public.instagram_bio_link || "https://tehranlaser.ir";
	const igPromo = settings.public.instagram_promo_code || "INSTA20";
	const igReel = settings.public.instagram_latest_reel_url || "https://instagram.com/reel/C7-placeholder";
	const igDisc = settings.public.instagram_follower_discount_percent || "15";
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "تنظیمات اینستاگرام و سوشال هاب",
		"activeNav": "instagram",
		"data-astro-cid-2epwnxuf": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-2epwnxuf><!-- Header --><div class="dashboard-header-row" data-astro-cid-2epwnxuf><div data-astro-cid-2epwnxuf><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" data-astro-cid-2epwnxuf><span class="ig-title-emblem" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "instagram",
		"size": 24,
		"data-astro-cid-2epwnxuf": true
	})}</span><span data-astro-cid-2epwnxuf>سوشال هاب و تنظیمات یکپارچه‌سازی اینستاگرام</span></h1><p class="section-block-sub" data-astro-cid-2epwnxuf>اتصال پیج رسمی، کدهای تخفیف فالوورها، ریلزهای آموزشی کندلا و تبدیل بازدیدکنندگان به مراجعین وفادار (API First)</p></div><div class="actions" data-astro-cid-2epwnxuf><a${addAttribute(`https://instagram.com/${igUser}`, "href")} target="_blank" rel="noopener" class="btn-3d-secondary" style="display: inline-flex; align-items: center; gap: 8px;" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 16,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>مشاهده پیج لایو اینستاگرام</span></a></div></div><!-- Notification Toast --><div id="igFeedbackToast" class="ig-toast" style="display: none;" role="alert" data-astro-cid-2epwnxuf><div class="ig-toast-inner" data-astro-cid-2epwnxuf><span id="igToastIcon" class="ig-toast-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-2epwnxuf": true
	})}</span><span id="igToastText" class="ig-toast-text" data-astro-cid-2epwnxuf></span></div></div><!-- KPI Grid --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); margin-bottom: 26px;" data-astro-cid-2epwnxuf><div class="kpi-card-3d" data-astro-cid-2epwnxuf><div class="kpi-header" data-astro-cid-2epwnxuf><span class="kpi-title" data-astro-cid-2epwnxuf>دنبال‌کنندگان (فالوورها)</span><span class="kpi-icon" style="color: #f5d77f;" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 22,
		"data-astro-cid-2epwnxuf": true
	})}</span></div><div class="kpi-value" style="color: #f5d77f;" data-astro-cid-2epwnxuf>۴۸.۵K</div><div class="kpi-footer" style="color: #34d399; display: flex; align-items: center; gap: 6px;" data-astro-cid-2epwnxuf><span class="live-dot" data-astro-cid-2epwnxuf></span><span data-astro-cid-2epwnxuf>جامعه فعال مراجعین کلینیک</span></div></div><div class="kpi-card-3d" data-astro-cid-2epwnxuf><div class="kpi-header" data-astro-cid-2epwnxuf><span class="kpi-title" data-astro-cid-2epwnxuf>پست‌ها و محتوای آموزشی</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "camera",
		"size": 22,
		"data-astro-cid-2epwnxuf": true
	})}</span></div><div class="kpi-value" style="color: #38bdf8;" data-astro-cid-2epwnxuf>۱۲۴ <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;" data-astro-cid-2epwnxuf>پست و ریلز</span></div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-2epwnxuf>معرفی تکنولوژی الکس کندلا</div></div><div class="kpi-card-3d" data-astro-cid-2epwnxuf><div class="kpi-header" data-astro-cid-2epwnxuf><span class="kpi-title" data-astro-cid-2epwnxuf>تخفیف اختصاصی فالوورها</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 22,
		"data-astro-cid-2epwnxuf": true
	})}</span></div><div class="kpi-value" style="color: #34d399;" id="kpiDiscVal" data-astro-cid-2epwnxuf>${igDisc}٪</div><div class="kpi-footer" style="color: #cbd5e1;" data-astro-cid-2epwnxuf>کد فعال: <code style="color: #f5d77f;" id="kpiPromoCode" data-astro-cid-2epwnxuf>${igPromo}</code></div></div><div class="kpi-card-3d" data-astro-cid-2epwnxuf><div class="kpi-header" data-astro-cid-2epwnxuf><span class="kpi-title" data-astro-cid-2epwnxuf>وضعیت اتصال پایگاه داده</span><span class="kpi-icon" style="color: #a78bfa;" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 22,
		"data-astro-cid-2epwnxuf": true
	})}</span></div><div class="kpi-value" style="color: #34d399; font-size: 1.45rem;" data-astro-cid-2epwnxuf>همگام D1</div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-2epwnxuf>تنظیمات سراسری Cloudflare</div></div></div><!-- Layout: Settings Form & Instagram Live Mockup --><div class="ig-layout-grid" data-astro-cid-2epwnxuf><!-- Form Section --><div class="admin-section-block ig-form-card" data-astro-cid-2epwnxuf><div class="section-block-header" style="margin-bottom: 22px;" data-astro-cid-2epwnxuf><h3 class="section-block-title" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "settings",
		"size": 20,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>مشخصات و پارامترهای پیج کلینیک</span></h3><p class="section-block-sub" data-astro-cid-2epwnxuf>اطلاعات ثبت‌شده مستقیماً در نوار هدر و فوتر وب‌سایت اصلی نمایش داده می‌شوند</p></div><form id="igForm" class="ig-form-stack" data-astro-cid-2epwnxuf><div data-astro-cid-2epwnxuf><label for="igUsernameInput" class="form-label-modal" data-astro-cid-2epwnxuf><span class="label-with-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "instagram",
		"size": 15,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>نام کاربری اینستاگرام (Username بدون @):</span></span></label><div class="input-icon-wrapper" data-astro-cid-2epwnxuf><span class="input-prefix-tag" data-astro-cid-2epwnxuf>@</span><input type="text" id="igUsernameInput" dir="ltr" class="form-control-modal input-has-prefix"${addAttribute(igUser, "value")} placeholder="tehranlaser_clinic" required data-astro-cid-2epwnxuf></div></div><div data-astro-cid-2epwnxuf><label for="igBioInput" class="form-label-modal" data-astro-cid-2epwnxuf><span class="label-with-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 15,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>لینک بایو اینستاگرام (Bio Link):</span></span></label><input type="url" id="igBioInput" dir="ltr" class="form-control-modal"${addAttribute(igBio, "value")} placeholder="https://tehranlaser.ir" required data-astro-cid-2epwnxuf></div><div class="ig-form-row" data-astro-cid-2epwnxuf><div style="flex: 1 1 200px;" data-astro-cid-2epwnxuf><label for="igPromoInput" class="form-label-modal" data-astro-cid-2epwnxuf><span class="label-with-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 15,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>کد تخفیف اختصاصی فالوورها:</span></span></label><input type="text" id="igPromoInput" dir="ltr" class="form-control-modal"${addAttribute(igPromo, "value")} placeholder="INSTA20" required data-astro-cid-2epwnxuf></div><div style="flex: 1 1 140px;" data-astro-cid-2epwnxuf><label for="igDiscInput" class="form-label-modal" data-astro-cid-2epwnxuf><span class="label-with-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 15,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>درصد تخفیف (%):</span></span></label><input type="number" id="igDiscInput" class="form-control-modal"${addAttribute(igDisc, "value")} min="1" max="50" required data-astro-cid-2epwnxuf></div></div><div data-astro-cid-2epwnxuf><label for="igReelInput" class="form-label-modal" data-astro-cid-2epwnxuf><span class="label-with-icon" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "play",
		"size": 15,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>لینک آخرین ریلز معرفی کلینیک یا آموزش کندلا:</span></span></label><input type="url" id="igReelInput" dir="ltr" class="form-control-modal"${addAttribute(igReel, "value")} placeholder="https://instagram.com/reel/..." data-astro-cid-2epwnxuf></div><div class="ig-form-actions" data-astro-cid-2epwnxuf><button type="submit" id="saveIgBtn" class="btn-3d-gold ig-save-btn" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 16,
		"data-astro-cid-2epwnxuf": true
	})}<span id="saveIgBtnText" data-astro-cid-2epwnxuf>ذخیره تنظیمات در دیتابیس D1</span></button></div></form></div><!-- Instagram Mockup Card --><div class="ig-mockup-wrapper" data-astro-cid-2epwnxuf><div class="ig-mockup-device" data-astro-cid-2epwnxuf><!-- Device Top Bar --><div class="ig-device-bar" data-astro-cid-2epwnxuf><span class="ig-device-time" data-astro-cid-2epwnxuf>20:26</span><div class="ig-device-icons" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "signal",
		"size": 12,
		"data-astro-cid-2epwnxuf": true
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "wifi",
		"size": 12,
		"data-astro-cid-2epwnxuf": true
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "battery",
		"size": 12,
		"data-astro-cid-2epwnxuf": true
	})}</div></div><!-- Mockup Header --><div class="ig-profile-header" data-astro-cid-2epwnxuf><div class="ig-avatar-halo" data-astro-cid-2epwnxuf><div class="ig-avatar-inner" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 28,
		"data-astro-cid-2epwnxuf": true
	})}</div></div><h4 id="mockUsername" class="ig-profile-username" data-astro-cid-2epwnxuf>@${igUser}</h4><span class="ig-profile-badge" data-astro-cid-2epwnxuf>کلینیک تخصصی تهران لیزر | پاسداران</span><p class="ig-profile-bio" data-astro-cid-2epwnxuf>مرکز تخصصی لیزر موهای زائد با دستگاه اورجینال کندلا الکساندرایت ۲۰۲۶ • تحت نظر پزشک متخصص</p></div><!-- Stats Strip --><div class="ig-stats-strip" data-astro-cid-2epwnxuf><div class="ig-stat-col" data-astro-cid-2epwnxuf><div class="ig-stat-num" data-astro-cid-2epwnxuf>۱۲۴</div><div class="ig-stat-lbl" data-astro-cid-2epwnxuf>پست</div></div><div class="ig-stat-col" data-astro-cid-2epwnxuf><div class="ig-stat-num" data-astro-cid-2epwnxuf>۴۸.۵K</div><div class="ig-stat-lbl" data-astro-cid-2epwnxuf>فالوور</div></div><div class="ig-stat-col" data-astro-cid-2epwnxuf><div class="ig-stat-num" data-astro-cid-2epwnxuf>۱۵</div><div class="ig-stat-lbl" data-astro-cid-2epwnxuf>دنبال‌شونده</div></div></div><!-- Follower Promo Coupon Box --><div class="ig-coupon-card" data-astro-cid-2epwnxuf><div class="ig-coupon-top" data-astro-cid-2epwnxuf><span class="ig-coupon-title" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-2epwnxuf": true
	})}<span data-astro-cid-2epwnxuf>کد تخفیف اختصاصی فالوورها:</span></span><button id="copyPromoBtn" class="ig-coupon-copy" type="button" title="کپی کد تخفیف" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 13,
		"data-astro-cid-2epwnxuf": true
	})}<span id="copyPromoLabel" data-astro-cid-2epwnxuf>کپی</span></button></div><div class="ig-coupon-bottom" data-astro-cid-2epwnxuf><code id="mockPromo" class="ig-coupon-code" data-astro-cid-2epwnxuf>${igPromo}</code><span id="mockDisc" class="ig-coupon-rate" data-astro-cid-2epwnxuf>(${igDisc}٪ تخفیف)</span></div></div><!-- Bio Link Preview --><div class="ig-bio-link-box" data-astro-cid-2epwnxuf><a id="mockLink"${addAttribute(igBio, "href")} target="_blank" rel="noopener" class="ig-bio-anchor" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 14,
		"data-astro-cid-2epwnxuf": true
	})}<span id="mockLinkText" class="ig-bio-text" data-astro-cid-2epwnxuf>${igBio}</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 12,
		"data-astro-cid-2epwnxuf": true
	})}</a></div><!-- Reel Preview Card --><div class="ig-reel-preview-card" data-astro-cid-2epwnxuf><div class="ig-reel-banner" data-astro-cid-2epwnxuf><div class="ig-reel-play-circle" data-astro-cid-2epwnxuf>${renderComponent($$result, "Icon", $$Icon, {
		"name": "play",
		"size": 20,
		"data-astro-cid-2epwnxuf": true
	})}</div><span class="ig-reel-pill" data-astro-cid-2epwnxuf>ریلز آموزشی لایو</span></div><div class="ig-reel-caption" data-astro-cid-2epwnxuf>معرفی سری‌های شخصی و تکنولوژی ایرکولینگ زیمر کلینیک تهران لیزر</div></div></div></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/instagram.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/instagram.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/instagram.astro";
var $$url = "/admin/instagram";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/instagram@_@astro
var page = () => instagram_exports;
//#endregion
export { page };
