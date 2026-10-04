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
//#region src/pages/admin/sms.astro
var sms_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Sms,
	file: () => $$file,
	url: () => $$url
});
var $$Sms = createComponent(async ($$result, $$props, $$slots) => {
	let smsLogs = [];
	let totalSent = 0;
	try {
		const [logsResult, countResult] = await Promise.all([env.DB.prepare(`
      SELECT l.*, c.name AS customerName
        FROM sms_logs l
        LEFT JOIN customers c ON c.id = l.customer_id
       ORDER BY l.created_at DESC LIMIT 50
    `).all(), env.DB.prepare(`SELECT COUNT(*) AS count FROM sms_logs`).first()]);
		smsLogs = logsResult.results || [];
		totalSent = countResult?.count ?? 0;
	} catch (e) {
		console.error("Failed to load SMS logs:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "پنل هوشمند پیامک و ارتباطات",
		"activeNav": "sms",
		"data-astro-cid-2v3nqtib": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-2v3nqtib><!-- Header --><div class="dashboard-header-row" data-astro-cid-2v3nqtib><div data-astro-cid-2v3nqtib><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" data-astro-cid-2v3nqtib><span class="sms-title-emblem" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 24,
		"data-astro-cid-2v3nqtib": true
	})}</span><span data-astro-cid-2v3nqtib>پنل هوشمند پیامک و اطلاع‌رسانی خودکار</span></h1><p class="section-block-sub" data-astro-cid-2v3nqtib>ارسال خودکار پیامک‌های تایید نوبت، یادآوری جلسات، تبریک تولد و کمپین‌های جشنواره مراجعین (API First)</p></div><div class="actions" data-astro-cid-2v3nqtib><span class="sms-live-badge" data-astro-cid-2v3nqtib><span class="live-dot" data-astro-cid-2v3nqtib></span><span data-astro-cid-2v3nqtib>وب‌سرویس پیامک فعال (کاوه نگار / فراز اس‌ام‌اس)</span></span></div></div><!-- Notification Toast --><div id="smsFeedbackToast" class="sms-toast" style="display: none;" role="alert" data-astro-cid-2v3nqtib><div class="sms-toast-inner" data-astro-cid-2v3nqtib><span id="smsToastIcon" class="sms-toast-icon" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</span><span id="smsToastText" class="sms-toast-text" data-astro-cid-2v3nqtib></span></div></div><!-- KPI Grid --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); margin-bottom: 26px;" data-astro-cid-2v3nqtib><div class="kpi-card-3d" data-astro-cid-2v3nqtib><div class="kpi-header" data-astro-cid-2v3nqtib><span class="kpi-title" data-astro-cid-2v3nqtib>موجودی شارژ پنل پیامکی</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "battery",
		"size": 22,
		"data-astro-cid-2v3nqtib": true
	})}</span></div><div class="kpi-value" style="color: #34d399;" data-astro-cid-2v3nqtib>۱۴,۲۵۰ <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;" data-astro-cid-2v3nqtib>پیامک</span></div><div class="kpi-footer" style="color: #34d399; display: flex; align-items: center; gap: 6px;" data-astro-cid-2v3nqtib><span class="live-dot" data-astro-cid-2v3nqtib></span><span data-astro-cid-2v3nqtib>اعتبار شارژ فعال و بدون انقضا</span></div></div><div class="kpi-card-3d" data-astro-cid-2v3nqtib><div class="kpi-header" data-astro-cid-2v3nqtib><span class="kpi-title" data-astro-cid-2v3nqtib>کل پیامک‌های ارسالی</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 22,
		"data-astro-cid-2v3nqtib": true
	})}</span></div><div class="kpi-value" style="color: #38bdf8;" data-astro-cid-2v3nqtib>${totalSent.toLocaleString("fa-IR")}</div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-2v3nqtib>نوبت‌ها، یادآوری‌ها و قرعه‌کشی</div></div><div class="kpi-card-3d" data-astro-cid-2v3nqtib><div class="kpi-header" data-astro-cid-2v3nqtib><span class="kpi-title" data-astro-cid-2v3nqtib>نرخ تحویل موفق به گوشی</span><span class="kpi-icon" style="color: #f5d77f;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "signal",
		"size": 22,
		"data-astro-cid-2v3nqtib": true
	})}</span></div><div class="kpi-value" style="color: #f5d77f;" data-astro-cid-2v3nqtib>۹۹.۴٪</div><div class="kpi-footer" style="color: #34d399;" data-astro-cid-2v3nqtib>ارسال از خط خدماتی اختصاصی بدون بلک‌لیست</div></div><div class="kpi-card-3d" data-astro-cid-2v3nqtib><div class="kpi-header" data-astro-cid-2v3nqtib><span class="kpi-title" data-astro-cid-2v3nqtib>سرعت میانگین مخابرات</span><span class="kpi-icon" style="color: #a78bfa;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 22,
		"data-astro-cid-2v3nqtib": true
	})}</span></div><div class="kpi-value" style="color: #a78bfa;" data-astro-cid-2v3nqtib>۳.۲ <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;" data-astro-cid-2v3nqtib>ثانیه</span></div><div class="kpi-footer" style="color: #94a3b8;" data-astro-cid-2v3nqtib>پروتکل مستقیم API Gateway</div></div></div><!-- Template Selector Section --><div class="admin-section-block sms-template-section" data-astro-cid-2v3nqtib><div class="section-block-header" style="margin-bottom: 18px;" data-astro-cid-2v3nqtib><h3 class="section-block-title" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 20,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>قالب‌های آماده پیامکی استاندارد کلینیک</span></h3><p class="section-block-sub" data-astro-cid-2v3nqtib>برای انتخاب سریع روی یکی از قالب‌ها کلیک کنید تا متن خودکار جایگذاری شود</p></div><div class="sms-template-cards-grid" data-astro-cid-2v3nqtib><button type="button" class="sms-template-btn is-active" data-template="booking_confirm" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #34d399;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>تایید رزرو نوبت</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>ارسال بعد از ثبت نوبت</span></div></button><button type="button" class="sms-template-btn" data-template="reminder_24h" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #38bdf8;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>یادآوری نوبت فردا</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>۲۴ ساعت قبل از جلسه</span></div></button><button type="button" class="sms-template-btn" data-template="birthday" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #f5d77f;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>تبریک تولد + هدیه</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>۳۰٪ تخفیف زادروز</span></div></button><button type="button" class="sms-template-btn" data-template="next_session" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #a78bfa;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>تنظیم جلسه بعدی</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>دوره درمان لیزر</span></div></button><button type="button" class="sms-template-btn" data-template="festival" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #f472b6;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "festivals",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>جشنواره تخفیف فصلی</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>اطلاع‌رسانی عمومی کمپین</span></div></button><button type="button" class="sms-template-btn" data-template="custom" data-astro-cid-2v3nqtib><div class="template-btn-icon" style="color: #94a3b8;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="template-btn-text" data-astro-cid-2v3nqtib><strong class="template-btn-title" data-astro-cid-2v3nqtib>متن سفارشی مراجع</strong><span class="template-btn-sub" data-astro-cid-2v3nqtib>تایپ متن دلخواه</span></div></button></div></div><!-- Layout: Quick Sender & Live Preview --><div class="sms-sender-grid" data-astro-cid-2v3nqtib><!-- Quick SMS Sender Form --><div class="admin-section-block sms-form-card" data-astro-cid-2v3nqtib><div class="section-block-header" style="margin-bottom: 20px;" data-astro-cid-2v3nqtib><h3 class="section-block-title" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 20,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>ارسال پیامک سریع به مراجع</span></h3><p class="section-block-sub" data-astro-cid-2v3nqtib>ارسال لحظه‌ای با خط خدماتی اختصاصی و بدون تأخیر در صف</p></div><form id="smsForm" class="sms-form-stack" data-astro-cid-2v3nqtib><div data-astro-cid-2v3nqtib><label for="smsPhone" class="form-label-modal" data-astro-cid-2v3nqtib><span class="label-with-icon" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 15,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>شماره تلفن همراه گیرنده:</span></span></label><input type="tel" id="smsPhone" dir="ltr" class="form-control-modal" placeholder="۰۹۱۲۳۴۵۶۷۸۹" required data-astro-cid-2v3nqtib></div><div data-astro-cid-2v3nqtib><label for="smsTemplateSelect" class="form-label-modal" data-astro-cid-2v3nqtib><span class="label-with-icon" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 15,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>قالب پیامکی انتخاب‌شده:</span></span></label><select id="smsTemplateSelect" class="form-control-modal" data-astro-cid-2v3nqtib><option value="booking_confirm" data-astro-cid-2v3nqtib>تایید رزرو نوبت لیزر</option><option value="reminder_24h" data-astro-cid-2v3nqtib>یادآوری نوبت فردا (۲۴ ساعت قبل)</option><option value="birthday" data-astro-cid-2v3nqtib>تبریک تولد + هدیه تخفیف ۳۰٪</option><option value="next_session" data-astro-cid-2v3nqtib>یادآوری تنظیم جلسه بعدی دوره درمان</option><option value="festival" data-astro-cid-2v3nqtib>اطلاع‌رسانی جشنواره تخفیف فصلی</option><option value="custom" data-astro-cid-2v3nqtib>-- متن دلخواه سفارشی --</option></select></div><div data-astro-cid-2v3nqtib><label for="smsMessage" class="form-label-modal" data-astro-cid-2v3nqtib><span class="label-with-icon" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 15,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>متن پیامک ارسالی:</span></span></label><textarea id="smsMessage" class="form-control-modal" rows="5" placeholder="متن پیامک..." required data-astro-cid-2v3nqtib></textarea><div class="sms-char-counter-bar" data-astro-cid-2v3nqtib><span class="char-count-text" data-astro-cid-2v3nqtib>تعداد کاراکتر: <strong id="charCount" style="color: #f5d77f;" data-astro-cid-2v3nqtib>۰</strong></span><span id="smsPagesText" class="sms-page-calc" data-astro-cid-2v3nqtib>۱ صفحه پیامک فارسی</span></div></div><div style="margin-top: 8px;" data-astro-cid-2v3nqtib><button type="submit" id="sendSmsSubmitBtn" class="btn-3d-gold sms-send-btn" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 16,
		"data-astro-cid-2v3nqtib": true
	})}<span id="sendSmsBtnText" data-astro-cid-2v3nqtib>ارسال فوری پیامک به مراجع</span></button></div></form></div><!-- Live Mobile Phone SMS Preview --><div class="admin-section-block sms-preview-card" data-astro-cid-2v3nqtib><div class="section-block-header" style="margin-bottom: 16px;" data-astro-cid-2v3nqtib><h3 class="section-block-title" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mobile",
		"size": 20,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>پیش‌نمایش زنده در گوشی مراجع</span></h3><p class="section-block-sub" data-astro-cid-2v3nqtib>نحوه نمایش متن در نوتیفیکیشن و اپلیکیشن پیام‌رسان گوشی</p></div><div class="sms-phone-mockup" data-astro-cid-2v3nqtib><div class="sms-phone-top" data-astro-cid-2v3nqtib><span class="sms-phone-time" data-astro-cid-2v3nqtib>۱۲:۴۲</span><div class="sms-phone-icons" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "signal",
		"size": 12,
		"data-astro-cid-2v3nqtib": true
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "battery",
		"size": 12,
		"data-astro-cid-2v3nqtib": true
	})}</div></div><div class="sms-thread-header" data-astro-cid-2v3nqtib><div class="sms-sender-avatar" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 18,
		"data-astro-cid-2v3nqtib": true
	})}</div><div class="sms-sender-details" data-astro-cid-2v3nqtib><strong class="sms-sender-name" data-astro-cid-2v3nqtib>TEHRAN LASER</strong><span class="sms-sender-line" data-astro-cid-2v3nqtib>خط خدماتی ۱۰۰۰۸۸۴</span></div></div><div class="sms-bubble-container" data-astro-cid-2v3nqtib><div class="sms-bubble" data-astro-cid-2v3nqtib><p id="mockSmsText" class="sms-bubble-text" data-astro-cid-2v3nqtib>مراجع گرامی، نوبت لیزر شما در کلینیک تخصصی تهران لیزر با موفقیت تایید شد.</p><div class="sms-bubble-footer" data-astro-cid-2v3nqtib><span class="sms-bubble-time" data-astro-cid-2v3nqtib>هم‌اکنون</span><span class="sms-bubble-check" style="color: #38bdf8;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-2v3nqtib": true
	})}</span></div></div></div><div class="sms-phone-reply-bar" data-astro-cid-2v3nqtib><span data-astro-cid-2v3nqtib>ارسال پاسخ برای خطوط خدماتی غیرفعال است</span></div></div></div></div><!-- SMS Delivery Logs Table --><div class="admin-section-block sms-logs-section" data-astro-cid-2v3nqtib><div class="section-block-header" style="margin-bottom: 20px;" data-astro-cid-2v3nqtib><h3 class="section-block-title" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 20,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>گزارش و آرشیو تحویل پیامک‌های ارسالی</span></h3><p class="section-block-sub" data-astro-cid-2v3nqtib>لاگ لحظه‌ای ارسال به مخابرات، استعلام دلیوری و شماره مراجعین (۵۰ لاگ اخیر)</p></div><div class="admin-table-container" data-astro-cid-2v3nqtib><table class="admin-table-3d" data-astro-cid-2v3nqtib><thead data-astro-cid-2v3nqtib><tr data-astro-cid-2v3nqtib><th data-astro-cid-2v3nqtib>گیرنده</th><th data-astro-cid-2v3nqtib>نام مراجع</th><th data-astro-cid-2v3nqtib>متن پیامک</th><th data-astro-cid-2v3nqtib>قالب</th><th data-astro-cid-2v3nqtib>وضعیت تحویل</th><th data-astro-cid-2v3nqtib>تاریخ و زمان ارسال</th></tr></thead><tbody data-astro-cid-2v3nqtib>${smsLogs.map((log) => renderTemplate`<tr data-astro-cid-2v3nqtib><td style="font-family: monospace; font-weight: 700; color: #f5d77f;" dir="ltr" data-astro-cid-2v3nqtib><span style="display: inline-flex; align-items: center; gap: 6px;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mobile",
		"size": 13,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>${log.phone}</span></span></td><td style="font-weight: 700; color: #f8fafc;" data-astro-cid-2v3nqtib>${log.customerName || "مراجع آزاد"}</td><td style="font-size: 0.82rem; color: #cbd5e1; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"${addAttribute(log.message, "title")} data-astro-cid-2v3nqtib>${log.message}</td><td data-astro-cid-2v3nqtib><span class="sms-table-template-pill" data-astro-cid-2v3nqtib>${log.template_name || "سفارشی"}</span></td><td data-astro-cid-2v3nqtib><span class="badge-status badge-status-confirmed" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 11,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>تحویل داده شد</span></span></td><td style="font-size: 0.8rem; color: #94a3b8;" data-astro-cid-2v3nqtib><span style="display: inline-flex; align-items: center; gap: 4px;" data-astro-cid-2v3nqtib>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 12,
		"data-astro-cid-2v3nqtib": true
	})}<span data-astro-cid-2v3nqtib>${formatJalaliDate(log.created_at)}</span></span></td></tr>`)}${smsLogs.length === 0 && renderTemplate`<tr data-astro-cid-2v3nqtib><td colspan="6" style="text-align: center; color: #94a3b8; padding: 28px;" data-astro-cid-2v3nqtib>هنوز پیامکی در سیستم ثبت نشده است.</td></tr>`}</tbody></table></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/sms.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/sms.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/sms.astro";
var $$url = "/admin/sms";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/sms@_@astro
var page = () => sms_exports;
//#endregion
export { page };
