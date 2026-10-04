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
//#region src/pages/admin/settings/index.astro
var settings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let settings = {};
	let dbStats = {
		tables: 14,
		settingsCount: 0,
		customersCount: 0,
		bookingsCount: 0
	};
	try {
		if (env?.DB) {
			const allSets = await getAllSettings(env.DB);
			settings = {
				...allSets.public,
				...allSets.private
			};
			const [setsCount, custCount, bookCount] = await Promise.all([
				env.DB.prepare("SELECT COUNT(*) AS c FROM settings").first(),
				env.DB.prepare("SELECT COUNT(*) AS c FROM customers").first(),
				env.DB.prepare("SELECT COUNT(*) AS c FROM bookings").first()
			]);
			dbStats = {
				tables: 14,
				settingsCount: setsCount?.c ?? Object.keys(settings).length,
				customersCount: custCount?.c ?? 0,
				bookingsCount: bookCount?.c ?? 0
			};
		}
	} catch (e) {
		console.error("Failed to load settings:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "تنظیمات کلینیک",
		"activeNav": "settings",
		"data-astro-cid-agtm42qz": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad settings-container" data-astro-cid-agtm42qz><!-- 3D Header Row --><div class="dashboard-header-row" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 10px;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "settings",
		"size": 26,
		"class": "title-icon",
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>تنظیمات و پیکربندی مرکزی کلینیک</span></h1><p class="section-block-sub" data-astro-cid-agtm42qz>مدیریت یکپارچه مشخصات کلینیک، درگاه پیامک، شیفت‌های کاری، امنیت دسترسی و پشتیبان‌گیری دیتابیس D1</p></div><div class="actions" data-astro-cid-agtm42qz><span class="d1-status-badge" data-astro-cid-agtm42qz><span class="live-dot" data-astro-cid-agtm42qz></span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>پایگاه داده Cloudflare D1 فعال</span></span></div></div><!-- Alert Notices --><div id="settingsAlert" class="alert-3d-danger" style="display: none;" role="alert" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span id="settingsAlertText" data-astro-cid-agtm42qz></span></div><div id="settingsSuccess" class="alert-3d-success" style="display: none;" role="status" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>تنظیمات با موفقیت در پایگاه داده لایو D1 ذخیره و اعمال شد.</span></div><!-- 3D Settings Tab Bar --><nav class="settings-tab-bar" aria-label="دسته‌بندی تنظیمات" data-astro-cid-agtm42qz><button type="button" class="settings-tab-btn active" data-tab="profile" role="tab" aria-selected="true" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>مشخصات کلینیک</span></button><button type="button" class="settings-tab-btn" data-tab="sms" role="tab" aria-selected="false" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>درگاه پیامک</span></button><button type="button" class="settings-tab-btn" data-tab="schedule" role="tab" aria-selected="false" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>زمان‌بندی و شیفت‌ها</span></button><button type="button" class="settings-tab-btn" data-tab="security" role="tab" aria-selected="false" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>امنیت و نشست‌ها</span></button><button type="button" class="settings-tab-btn" data-tab="backup" role="tab" aria-selected="false" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>پشتیبان‌گیری و دیتابیس D1</span></button></nav><!-- Main Settings Form --><form id="settingsForm" data-astro-cid-agtm42qz><!-- 1. CLINIC PROFILE PANEL --><section id="panel-profile" class="settings-panel active" role="tabpanel" data-astro-cid-agtm42qz><div class="admin-section-block" data-astro-cid-agtm42qz><div class="section-block-header" data-astro-cid-agtm42qz><h2 class="section-block-title" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>هویت تجاری و مشخصات رسمی کلینیک</span></h2><p class="section-block-sub" data-astro-cid-agtm42qz>اطلاعات برندینگ که در فاکتورها، سربرگ‌ها، رزرو و پیامک‌های ارسالی درج می‌شود.</p></div><div class="settings-grid" data-astro-cid-agtm42qz><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="business_name" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>نام تجاری رسمی (فارسی):</span></label><input id="business_name" autocomplete="off" type="text" name="business_name" class="form-control-modal"${addAttribute(settings.business_name || "تهران لیزر", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>نام رسمی کلینیک برای سربرگ، پیامک‌ها و فاکتور مشتریان.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="business_name_en" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>نام بین‌المللی (انگلیسی):</span></label><input id="business_name_en" autocomplete="off" type="text" name="business_name_en" dir="ltr" class="form-control-modal"${addAttribute(settings.business_name_en || "Tehran Laser", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>جهت متادیتای وب‌سایت، نقشه گوگل و اسناد لاتین.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="phone" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>شماره تماس و نوبت‌دهی مستقیم:</span></label><input id="phone" autocomplete="off" type="tel" name="phone" dir="ltr" class="form-control-modal"${addAttribute(settings.phone || "+98 903 555 5090", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>شماره تلفن پاسخگویی مستقیم و ثبت نوبت کلینیک.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="support_phone" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mobile",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>شماره پشتیبانی پیام‌رسان‌ها:</span></label><input id="support_phone" autocomplete="off" type="tel" name="support_phone" dir="ltr" class="form-control-modal"${addAttribute(settings.support_phone || "+98 903 555 5090", "value")} data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>شماره خط پشتیبانی واتساپ و تلگرام مراجعین.</span></div><div class="field-group settings-grid-full" data-astro-cid-agtm42qz><label class="field-label" for="address" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>نشانی دقیق کلینیک:</span></label><input id="address" autocomplete="off" type="text" name="address" class="form-control-modal"${addAttribute(settings.address || "تهران، پاسداران، خیابان پایدارفرد، نبش بوستان هفتم", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>آدرس ارسالی در پیامک‌های تایید نوبت و نمایش در فوتر سایت.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="currency" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>واحد پول سیستم:</span></label><input id="currency" autocomplete="off" type="text" name="currency" dir="ltr" class="form-control-modal"${addAttribute(settings.currency || "IRT", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>کد ارزی سامانه (پیش‌فرض: IRT تومان).</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="currency_label" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>برچسب نمایشی واحد قیمت:</span></label><input id="currency_label" autocomplete="off" type="text" name="currency_label" class="form-control-modal"${addAttribute(settings.currency_label || "هزار تومان", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>عنوانی که در کنار ارقام تعرفه‌ها درج می‌شود.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="discount_percent" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>درصد تخفیف پکیج‌های فول‌بادی:</span></label><div style="position: relative;" data-astro-cid-agtm42qz><input id="discount_percent" autocomplete="off" type="number" name="discount_percent" class="form-control-modal"${addAttribute(settings.discount_percent || settings.site_discount_percent || "15", "value")} min="0" max="100" required data-astro-cid-agtm42qz><span style="position: absolute; left: 16px; top: 12px; color: #94a3b8; font-weight: 700;" data-astro-cid-agtm42qz>٪</span></div><span class="field-hint" data-astro-cid-agtm42qz>میزان کسر تخفیف پیش‌فرض برای پکیج‌های کل بدن بانوان.</span></div></div></div></section><!-- 2. SMS INTEGRATION PANEL --><section id="panel-sms" class="settings-panel" role="tabpanel" data-astro-cid-agtm42qz><div class="admin-section-block" data-astro-cid-agtm42qz><div class="section-block-header" data-astro-cid-agtm42qz><h2 class="section-block-title" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>پیکربندی درگاه پیامک و امنیت وب‌سرویس</span></h2><p class="section-block-sub" data-astro-cid-agtm42qz>تنظیم ارائه‌دهنده پیامک خدماتی، سرشماره ارسال و کلیدهای امنیتی احراز هویت.</p></div><div class="settings-grid" style="margin-bottom: 24px;" data-astro-cid-agtm42qz><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="sms_provider" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>انتخاب ارائه‌دهنده پیامک:</span></label><select id="sms_provider" autocomplete="off" name="sms_provider" class="form-control-modal" data-astro-cid-agtm42qz><option value="kavenegar"${addAttribute(settings.sms_provider === "kavenegar" || !settings.sms_provider, "selected")} data-astro-cid-agtm42qz>کاوه نگار (Kavenegar Webhook / Pattern)</option><option value="farazsms"${addAttribute(settings.sms_provider === "farazsms", "selected")} data-astro-cid-agtm42qz>فراز اس‌ام‌اس (FarazSMS / IPPanel)</option><option value="melipayamak"${addAttribute(settings.sms_provider === "melipayamak", "selected")} data-astro-cid-agtm42qz>ملی پیامک (MeliPayamak)</option></select><span class="field-hint" data-astro-cid-agtm42qz>وب‌سرویس مورد استفاده برای ارسال پترن‌های خدماتی بدون بلک‌لیست.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="sms_sender_number" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>خط خدماتی / سرشماره فرستنده:</span></label><input id="sms_sender_number" autocomplete="off" type="text" name="sms_sender_number" dir="ltr" class="form-control-modal"${addAttribute(settings.sms_sender_number || "10008585", "value")} data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>شماره خط خدماتی ثبت‌شده در سامانه پیامکی.</span></div><div class="field-group settings-grid-full" data-astro-cid-agtm42qz><label class="field-label" for="smsApiKeyInput" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>کلید امنیتی وب‌سرویس (API Key):</span></label><div class="credential-field-wrap" data-astro-cid-agtm42qz><input id="smsApiKeyInput" type="password" name="sms_api_key" class="form-control-modal"${addAttribute(settings.sms_api_key || "", "value")} placeholder="••••••••••••••••••••••••••••••••" autocomplete="off" dir="ltr" data-astro-cid-agtm42qz><button type="button" id="toggleApiKeyBtn" class="credential-toggle-btn" title="نمایش / پنهان‌سازی کلید" aria-label="تغییر حالت نمایش کلید امنیتی" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 16,
		"data-astro-cid-agtm42qz": true
	})}</button></div><div class="security-badge-pill" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>رمزنگاری‌شده در لبه کلودفلر — در فرانت‌اند مراجعین هرگز افشا نمی‌شود.</span></div></div></div><div class="section-block-header" style="margin-top: 24px;" data-astro-cid-agtm42qz><h3 class="section-block-title" style="font-size: 1.05rem;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "bell",
		"size": 18,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>ارسال خودکار پیامک‌ها (Automation Triggers)</span></h3><p class="section-block-sub" data-astro-cid-agtm42qz>تنظیم اعلان‌های خودکار برای هر چرخه از تجربه مراجعین کلینیک.</p></div><div style="display: flex; flex-direction: column; gap: 12px;" data-astro-cid-agtm42qz><div class="toggle-row" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.9rem; color: #f8fafc; margin-bottom: 2px;" data-astro-cid-agtm42qz>ارسال پیامک تایید آنی نوبت رزرو</strong><span class="field-hint" data-astro-cid-agtm42qz>ارسال خودکار کد پیگیری، تاریخ، ساعت و نشانی کلینیک بلافاصله پس از ثبت نوبت.</span></div><label class="toggle-switch-3d" aria-label="ارسال تایید نوبت" data-astro-cid-agtm42qz><input type="checkbox" name="sms_booking_confirm_enabled" autocomplete="off"${addAttribute(settings.sms_booking_confirm_enabled !== "false", "checked")} data-astro-cid-agtm42qz><span class="toggle-slider" data-astro-cid-agtm42qz></span></label></div><div class="toggle-row" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.9rem; color: #f8fafc; margin-bottom: 2px;" data-astro-cid-agtm42qz>یادآوری هوشمند نوبت ۲۴ ساعت قبل</strong><span class="field-hint" data-astro-cid-agtm42qz>یادآوری آماده‌سازی قبل لیزر (شیو کردن) و اعلام زمان حضور به مراجع.</span></div><label class="toggle-switch-3d" aria-label="یادآوری ۲۴ ساعته" data-astro-cid-agtm42qz><input type="checkbox" name="sms_reminder_24h_enabled" autocomplete="off"${addAttribute(settings.sms_reminder_24h_enabled !== "false", "checked")} data-astro-cid-agtm42qz><span class="toggle-slider" data-astro-cid-agtm42qz></span></label></div><div class="toggle-row" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.9rem; color: #f8fafc; margin-bottom: 2px;" data-astro-cid-agtm42qz>تبریک سالروز تولد همراه با کوپن تخفیف</strong><span class="field-hint" data-astro-cid-agtm42qz>ارسال پیامک تبریک صمیمانه همراه با هدیه شارژ کیف پول یا ۳۰٪ تخفیف جلسه.</span></div><label class="toggle-switch-3d" aria-label="پیامک تبریک تولد" data-astro-cid-agtm42qz><input type="checkbox" name="sms_birthday_enabled" autocomplete="off"${addAttribute(settings.sms_birthday_enabled !== "false", "checked")} data-astro-cid-agtm42qz><span class="toggle-slider" data-astro-cid-agtm42qz></span></label></div><div class="toggle-row" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.9rem; color: #f8fafc; margin-bottom: 2px;" data-astro-cid-agtm42qz>یادآوری جلسه بعدی دوره درمان</strong><span class="field-hint" data-astro-cid-agtm42qz>ارسال پیامک جهت رزرو جلسه بعد در بازه طلایی ۴ الی ۶ هفته پس از جلسه فعلی.</span></div><label class="toggle-switch-3d" aria-label="یادآوری جلسه بعد" data-astro-cid-agtm42qz><input type="checkbox" name="sms_next_session_enabled" autocomplete="off"${addAttribute(settings.sms_next_session_enabled !== "false", "checked")} data-astro-cid-agtm42qz><span class="toggle-slider" data-astro-cid-agtm42qz></span></label></div></div><!-- Quick Test SMS Box --><div style="margin-top: 24px; padding: 18px; background: rgba(10, 14, 22, 0.6); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 16px;" data-astro-cid-agtm42qz><div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.88rem; color: #f5d77f; margin-bottom: 4px;" data-astro-cid-agtm42qz>تست ارتباط وب‌سرویس پیامکی:</strong><span class="field-hint" data-astro-cid-agtm42qz>یک پیامک تستی به شماره زیر ارسال کنید تا از اتصال درگاه مطمئن شوید.</span></div><div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" data-astro-cid-agtm42qz><input id="testSmsPhone" autocomplete="off" type="tel" dir="ltr" placeholder="۰۹۱۲۳۴۵۶۷۸۹" class="form-control-modal" style="width: 170px; margin-top: 0; padding: 8px 12px; font-size: 0.86rem;" data-astro-cid-agtm42qz><button type="button" id="testSmsBtn" class="btn-3d-secondary" style="padding: 8px 16px; min-height: 38px; font-size: 0.82rem;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 14,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>ارسال پیامک آزمایشی</span></button></div></div><div id="testSmsResult" style="display: none; margin-top: 10px; font-size: 0.82rem;" data-astro-cid-agtm42qz></div></div></div></section><!-- 3. WORKING HOURS & SCHEDULE PANEL --><section id="panel-schedule" class="settings-panel" role="tabpanel" data-astro-cid-agtm42qz><div class="admin-section-block" data-astro-cid-agtm42qz><div class="section-block-header" data-astro-cid-agtm42qz><h2 class="section-block-title" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>موتور نوبت‌دهی و زمان‌بندی هوشمند</span></h2><p class="section-block-sub" data-astro-cid-agtm42qz>تنظیم گام زمانی، بافر بهداشتی دستگاه‌ها و قواعد افق رزرو آنلاین کلینیک.</p></div><div class="settings-grid" style="margin-bottom: 24px;" data-astro-cid-agtm42qz><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="slot_granularity_minutes" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>گام اسلات‌های نوبت‌دهی (دقیقه):</span></label><input id="slot_granularity_minutes" autocomplete="off" type="number" name="slot_granularity_minutes" class="form-control-modal"${addAttribute(settings.slot_granularity_minutes || "15", "value")} min="5" max="120" required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>فاصله‌ی زمانی بین شروع هر نوبت در تقویم (پیش‌فرض: ۱۵ یا ۳۰ دقیقه).</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="booking_buffer_minutes" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>زمان بافر استریل و ضدعفونی (دقیقه):</span></label><input id="booking_buffer_minutes" autocomplete="off" type="number" name="booking_buffer_minutes" class="form-control-modal"${addAttribute(settings.booking_buffer_minutes || "0", "value")} min="0" max="60" required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>فرصت پاکسازی سری دستگاه لیزر و تعویض رول بعد از هر جلسه.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="min_lead_minutes" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>حداقل زمان پیش‌خرید نوبت (دقیقه):</span></label><input id="min_lead_minutes" autocomplete="off" type="number" name="min_lead_minutes" class="form-control-modal"${addAttribute(settings.min_lead_minutes || "0", "value")} min="0" max="1440" required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>حداقل فاصله زمانی بین ثبت آنلاین تا ساعت حضور مراجع.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="max_advance_days" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>حداکثر افق تقویم برای رزرو آینده (روز):</span></label><input id="max_advance_days" autocomplete="off" type="number" name="max_advance_days" class="form-control-modal"${addAttribute(settings.max_advance_days || "90", "value")} min="7" max="365" required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>مراجعین تا چند روز آینده می‌توانند در سایت نوبت ثبت کنند.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="timezone" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>منطقه زمانی سرور رزرواسیون:</span></label><input id="timezone" autocomplete="off" type="text" name="timezone" dir="ltr" class="form-control-modal"${addAttribute(settings.timezone || "Asia/Tehran", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>مبنای محاسبه اوقات شیفت‌ها و تقویم شمسی.</span></div></div><div class="toggle-row" style="margin-bottom: 24px;" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><strong style="display: block; font-size: 0.9rem; color: #f8fafc; margin-bottom: 2px;" data-astro-cid-agtm42qz>سامانه نوبت‌دهی آنلاین سراسری (Online Booking Engine)</strong><span class="field-hint" data-astro-cid-agtm42qz>با غیرفعال‌سازی این گزینه، فرم نوبت‌دهی در وب‌سایت بسته شده و فقط رزرو تلفنی پذیرفته می‌شود.</span></div><label class="toggle-switch-3d" aria-label="فعال بودن نوبت‌دهی آنلاین" data-astro-cid-agtm42qz><input type="checkbox" name="booking_enabled" autocomplete="off"${addAttribute(settings.booking_enabled !== "false", "checked")} data-astro-cid-agtm42qz><span class="toggle-slider" data-astro-cid-agtm42qz></span></label></div><!-- Working Days Summary Card --><div class="shift-card" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><div style="display: flex; align-items: center; gap: 8px; color: #f5d77f; font-weight: 800; font-size: 0.92rem; margin-bottom: 4px;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>شیفت‌های کاری هفتگی و تعطیلات تقویم</span></div><p class="field-hint" style="margin: 0;" data-astro-cid-agtm42qz>شنبه تا پنج‌شنبه (۰۹:۰۰ الی ۱۳:۰۰ و ۱۴:۰۰ الی ۲۰:۰۰) • جمعه‌ها تعطیل رسمی</p></div><a href="/admin/schedule" class="btn-3d-secondary" style="padding: 8px 16px; min-height: 38px; font-size: 0.82rem;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>مدیریت ساعات کاری</span></a></div></div></section><!-- 4. SECURITY & ACCESS PANEL --><section id="panel-security" class="settings-panel" role="tabpanel" data-astro-cid-agtm42qz><div class="admin-section-block" data-astro-cid-agtm42qz><div class="section-block-header" data-astro-cid-agtm42qz><h2 class="section-block-title" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>سیاست‌های امنیتی، کنترل نرخ و نشست‌ها</span></h2><p class="section-block-sub" data-astro-cid-agtm42qz>تنظیم محدودیت‌های امنیتی (Rate Limiting) و عمر نشست ورود مدیران کلینیک.</p></div><div class="settings-grid" style="margin-bottom: 24px;" data-astro-cid-agtm42qz><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="session_ttl_hours" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>عمر نشست ورود مدیران (ساعت):</span></label><input id="session_ttl_hours" autocomplete="off" type="number" name="session_ttl_hours" class="form-control-modal"${addAttribute(settings.session_ttl_hours || "168", "value")} min="1" max="720" required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>مدت زمان اعتبار کوکی ورود امن پس از آخرین استفاده (پیش‌فرض: ۱۶۸ ساعت / ۷ روز).</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="rate_limit_login" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>سقف تلاش‌های ورود مجاز (Rate Limit Login):</span></label><input id="rate_limit_login" autocomplete="off" type="text" name="rate_limit_login" dir="ltr" class="form-control-modal"${addAttribute(settings.rate_limit_login || "10/600", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>۱۰ تلاش در ۱۰ دقیقه به ازای هر آدرس آی‌پی برای جلوگیری از Brute-Force.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="rate_limit_booking" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>سقف درخواست ثبت نوبت (Rate Limit Booking):</span></label><input id="rate_limit_booking" autocomplete="off" type="text" name="rate_limit_booking" dir="ltr" class="form-control-modal"${addAttribute(settings.rate_limit_booking || "20/600", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>حداکثر تعداد ثبت نوبت در بازه زمانی جهت مقابله با اسپم و ربات‌ها.</span></div><div class="field-group" data-astro-cid-agtm42qz><label class="field-label" for="rate_limit_public_form" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mail",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>سقف فرم‌های عمومی و تماس (Public Form):</span></label><input id="rate_limit_public_form" autocomplete="off" type="text" name="rate_limit_public_form" dir="ltr" class="form-control-modal"${addAttribute(settings.rate_limit_public_form || "30/600", "value")} required data-astro-cid-agtm42qz><span class="field-hint" data-astro-cid-agtm42qz>محدودیت نرخ ارسال فرم‌های تماس و دریافت مشاوره.</span></div></div><div class="shift-card" data-astro-cid-agtm42qz><div data-astro-cid-agtm42qz><div style="display: flex; align-items: center; gap: 8px; color: #f5d77f; font-weight: 800; font-size: 0.92rem; margin-bottom: 4px;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "audit",
		"size": 18,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>لاگ‌برداری تفصیلی و رهگیری تغییرات (Audit Trail)</span></div><p class="field-hint" style="margin: 0;" data-astro-cid-agtm42qz>کلیه رویدادهای سیستمی، ورودها و تغییرات تنظیمات در جدول امنیتی audit_logs ثبت می‌شوند.</p></div><a href="/admin/audit" class="btn-3d-secondary" style="padding: 8px 16px; min-height: 38px; font-size: 0.82rem;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "audit",
		"size": 15,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>مشاهده لاگ وقایع</span></a></div></div></section><!-- 5. D1 BACKUP & SYSTEM HEALTH PANEL --><section id="panel-backup" class="settings-panel" role="tabpanel" data-astro-cid-agtm42qz><div class="admin-section-block" data-astro-cid-agtm42qz><div class="section-block-header" data-astro-cid-agtm42qz><h2 class="section-block-title" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>پایگاه داده لبه (Cloudflare D1) و ابزار پشتیبان‌گیری</span></h2><p class="section-block-sub" data-astro-cid-agtm42qz>مانیتورینگ برخط وضعیت دیتابیس، سلامت لبه و دانلود مستقیم بکاپ داده‌ها.</p></div><!-- D1 KPI Grid --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 24px;" data-astro-cid-agtm42qz><div class="kpi-card-3d" data-astro-cid-agtm42qz><div class="kpi-header" data-astro-cid-agtm42qz><span class="kpi-title" data-astro-cid-agtm42qz>موتور دیتابیس</span><span class="kpi-icon" style="color: #f5d77f;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}</span></div><div class="kpi-value" style="font-size: 1.4rem; color: #f5d77f;" data-astro-cid-agtm42qz>Cloudflare D1</div><div class="kpi-footer" style="color: #34d399;" data-astro-cid-agtm42qz>SQLite Serverless on Edge</div></div><div class="kpi-card-3d" data-astro-cid-agtm42qz><div class="kpi-header" data-astro-cid-agtm42qz><span class="kpi-title" data-astro-cid-agtm42qz>تعداد کلیدهای تنظیمات</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "settings",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}</span></div><div class="kpi-value" data-astro-cid-agtm42qz>${dbStats.settingsCount || Object.keys(settings).length || 22}</div><div class="kpi-footer" style="color: #38bdf8;" data-astro-cid-agtm42qz>پیکربندی‌های ثبت‌شده در جدول</div></div><div class="kpi-card-3d" data-astro-cid-agtm42qz><div class="kpi-header" data-astro-cid-agtm42qz><span class="kpi-title" data-astro-cid-agtm42qz>مراجعین ثبت‌شده</span><span class="kpi-icon" style="color: #a78bfa;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}</span></div><div class="kpi-value" data-astro-cid-agtm42qz>${dbStats.customersCount}</div><div class="kpi-footer" style="color: #a78bfa;" data-astro-cid-agtm42qz>پرونده‌های فعال در CRM</div></div><div class="kpi-card-3d" data-astro-cid-agtm42qz><div class="kpi-header" data-astro-cid-agtm42qz><span class="kpi-title" data-astro-cid-agtm42qz>نوبت‌های سیستم</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 20,
		"data-astro-cid-agtm42qz": true
	})}</span></div><div class="kpi-value" data-astro-cid-agtm42qz>${dbStats.bookingsCount}</div><div class="kpi-footer" style="color: #34d399;" data-astro-cid-agtm42qz>کل رزروهای پایگاه داده</div></div></div><!-- D1 Operations Box --><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 18px;" data-astro-cid-agtm42qz><div style="background: rgba(14, 18, 28, 0.7); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 18px; padding: 20px;" data-astro-cid-agtm42qz><h3 style="display: flex; align-items: center; gap: 8px; font-size: 0.96rem; color: #f5d77f; margin: 0 0 8px;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "download",
		"size": 18,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>دریافت نسخه پشتیبان (JSON Export)</span></h3><p class="field-hint" style="margin-bottom: 16px;" data-astro-cid-agtm42qz>دانلود مستقیم تمام متادیتا، پیکربندی‌های کلینیک و اطلاعات عملیاتی با یک کلیک در قالب استاندارد JSON.</p><button type="button" id="exportBackupBtn" class="btn-3d-gold" style="width: 100%;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "download",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>دانلود فایل پشتیبان (Export JSON)</span></button></div><div style="background: rgba(14, 18, 28, 0.7); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 18px; padding: 20px;" data-astro-cid-agtm42qz><h3 style="display: flex; align-items: center; gap: 8px; font-size: 0.96rem; color: #f5d77f; margin: 0 0 8px;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 18,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>بررسی زنده پینگ و اتصال دیتابیس D1</span></h3><p class="field-hint" style="margin-bottom: 16px;" data-astro-cid-agtm42qz>سنجش بلادرنگ زمان تاخیر پاسخ دیتابیس در لبه شبکه و راستی‌آزمایی پایداری سرویس API Health.</p><button type="button" id="pingHealthBtn" class="btn-3d-secondary" style="width: 100%;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 17,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>آزمون پینگ لایو D1</span></button><div id="healthPingResult" style="display: none; margin-top: 12px; font-size: 0.84rem; padding: 10px 14px; border-radius: 10px; background: rgba(9, 12, 18, 0.9); border: 1px solid rgba(212, 175, 55, 0.25);" data-astro-cid-agtm42qz></div></div></div></div></section><!-- Sticky / Bottom Action Bar --><div class="action-bar-bottom" data-astro-cid-agtm42qz><button type="button" id="resetSettingsBtn" class="btn-3d-secondary" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 16,
		"data-astro-cid-agtm42qz": true
	})}<span data-astro-cid-agtm42qz>بازنشانی فرم</span></button><button type="submit" id="saveSettingsBtn" class="btn-3d-gold" style="padding: 12px 28px; font-size: 0.96rem;" data-astro-cid-agtm42qz>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 18,
		"id": "saveBtnIcon",
		"data-astro-cid-agtm42qz": true
	})}<span id="saveBtnText" data-astro-cid-agtm42qz>ذخیره کلیه تنظیمات در دیتابیس D1</span></button></div></form></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/settings/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/settings/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/settings/index.astro";
var $$url = "/admin/settings";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/settings/index@_@astro
var page = () => settings_exports;
//#endregion
export { page };
