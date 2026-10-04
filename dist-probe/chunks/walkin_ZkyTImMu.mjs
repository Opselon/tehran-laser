globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { u as listAdminCustomers, x as listPublicServices } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/walkin.astro
var walkin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Walkin,
	file: () => $$file,
	url: () => $$url
});
var $$Walkin = createComponent(async ($$result, $$props, $$slots) => {
	let services = [];
	let customers = {
		items: [],
		nextCursor: null
	};
	try {
		[services, customers] = await Promise.all([listPublicServices(env.DB), listAdminCustomers(env.DB, 100)]);
	} catch (e) {
		console.error("Failed to load walkin prerequisites:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "پذیرش حضوری و جلسه بعد",
		"activeNav": "walkin"
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad"><div class="dashboard-header-row"><div><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "instant",
		"size": 26,
		"class": "title-icon"
	})}<span>پذیرش حضوری و تنظیم نوبت جلسه آینده</span></h1><p class="section-block-sub">ثبت نوبت درجا برای مراجع حاضر در کلینیک، صدور خودکار تراکنش مالی و رزرو هوشمند جلسه بعد (API First)</p></div><div class="actions"><span style="font-size: 0.88rem; color: #34d399; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); padding: 8px 16px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;"><span class="live-dot"></span>سامانه پذیرش مستقیم فعال</span></div></div><div id="walkinAlert" class="alert-3d-danger" style="display: none; margin-bottom: 20px;"><span id="walkinAlertText"></span></div><div id="walkinSuccess" style="display: none; margin-bottom: 20px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 18px 24px; border-radius: 14px; font-weight: 700;"><span id="walkinSuccessText">✓ نوبت مراجع و تراکنش مالی با موفقیت ثبت شد.</span></div><form id="walkinForm"><!-- 1. Customer Selection / Quick New --><div class="admin-section-block" style="padding: 26px; margin-bottom: 24px;"><h3 class="section-block-title" style="margin-bottom: 18px; display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 20
	})}<span>مشخصات مراجع حاضر در کلینیک</span></h3><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;"><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">انتخاب مراجع سابق (پرونده‌دار):</label><select id="custSelect" class="form-control-modal"><option value="">-- ثبت مراجع جدید (ورود دستی) --</option>${customers.items.map((c) => renderTemplate`<option${addAttribute(c.id, "value")}${addAttribute(c.name, "data-name")}${addAttribute(c.phone, "data-phone")}${addAttribute(c.pricingCategory, "data-category")}>${c.name} — ${c.phone} (${c.pricingCategory === "female" ? "بانوان" : "آقایان"})</option>`)}</select></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">نام و نام خانوادگی مراجع:</label><input type="text" id="custName" class="form-control-modal" placeholder="نام مراجع..." required></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">شماره تلفن همراه (پیامک تایید):</label><input type="tel" id="custPhone" dir="ltr" class="form-control-modal" placeholder="۰۹۱۲..." required></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">بخش پذیرش:</label><select id="custCategory" class="form-control-modal"><option value="female">بانوان</option><option value="male">آقایان</option></select></div></div></div><!-- 2. Treatment & Laser Service --><div class="admin-section-block" style="padding: 26px; margin-bottom: 24px;"><h3 class="section-block-title" style="margin-bottom: 18px; display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 20
	})}<span>ناحیه تحت درمان و پارامترهای لیزر کندلا</span></h3><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;"><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">ناحیه / خدمت لیزر:</label><select id="serviceSelect" class="form-control-modal" required>${services.map((s) => renderTemplate`<option${addAttribute(s.slug, "value")}${addAttribute(s.prices.find((p) => p.pricingCategory === "female")?.amount || 320, "data-price")}>${s.name} (${s.durationMinutes} دقیقه)</option>`)}</select></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">شماره جلسه درمانی:</label><div style="display: flex; gap: 8px; align-items: center;"><input type="number" id="sessionNumber" class="form-control-modal" value="1" min="1" max="15" required><span style="color: #94a3b8; font-size: 0.85rem;">از</span><input type="number" id="totalSessions" class="form-control-modal" value="8" min="1" max="15" required></div></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">انرژی شات (J/cm²) و عرض پالس:</label><div class="g-2" style="display: grid; gap: 8px"><input type="number" id="joulesEnergy" step="0.5" class="form-control-modal" value="14.0" title="ژول بر سانتی‌متر مربع"><input type="number" id="pulseWidth" step="0.5" class="form-control-modal" value="3.0" title="عرض پالس میلی‌ثانیه"></div></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">تعداد شات دستگاه:</label><input type="number" id="shotCount" class="form-control-modal" value="520"></div></div></div><!-- 3. Financial & POS Payment --><div class="admin-section-block" style="padding: 26px; margin-bottom: 24px;"><h3 class="section-block-title" style="margin-bottom: 18px; display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 20
	})}<span>تسویه مالی و دریافت وجه (ثبت خودکار در حسابداری)</span></h3><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;"><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">مبلغ دریافتی (هزار تومان):</label><input type="number" id="paymentAmount" class="form-control-modal" value="1940" required><span style="font-size: 0.76rem; color: #34d399; margin-top: 4px; display: block;">معادل ۱٬۹۴۰٬۰۰۰ تومان (پکیج فول بادی بانوان)</span></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">روش پرداخت:</label><select id="paymentMethod" class="form-control-modal"><option value="pos">💳 کارت‌خوان کلینیک (POS)</option><option value="card_to_card">📱 کارت‌به‌کارت / شبا</option><option value="cash">💵 پرداخت نقدی</option></select></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;">شماره پیگیری / ارجاع پوز:</label><input type="text" id="trackingNumber" dir="ltr" class="form-control-modal" placeholder="POS-89312"></div></div></div><!-- 4. Next Session Scheduler (Auto) --><div class="admin-section-block" style="padding: 26px; margin-bottom: 24px; border-color: rgba(56, 189, 248, 0.4); background: rgba(14, 165, 233, 0.04);"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;"><h3 class="section-block-title" style="margin: 0; color: #38bdf8; display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 20
	})}<span>تنظیم هوشمند نوبت جلسه بعدی (Next Session Scheduler)</span></h3><label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: #38bdf8; font-weight: 700;"><input type="checkbox" id="scheduleNextCheckbox" checked style="width: 18px; height: 18px; accent-color: #38bdf8;"><span>رزرو نوبت جلسه بعدی مراجع</span></label></div><div id="nextSessionFields" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;"><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">فاصله استاندارد چرخه رشد مو:</label><select id="intervalWeeks" class="form-control-modal"><option value="4">۴ هفته بعد (مناسب صورت و جلسات آغازین)</option><option value="6" selected>۶ هفته بعد (استاندارد نواحی بدن و کندلا)</option><option value="8">۸ هفته بعد (جلسات پایانی و شارژ)</option></select></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">تاریخ پیشنهادی جلسه بعدی:</label><input type="datetime-local" id="nextSessionDateTime" class="form-control-modal" dir="ltr"></div><div><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">یادداشت برای جلسه بعدی:</label><input type="text" id="nextSessionNote" class="form-control-modal" placeholder="بررسی واکنش پوست در جلسه دوم..."></div></div></div><div style="display: flex; justify-content: flex-end; gap: 14px;"><button type="submit" id="submitWalkinBtn" class="btn-3d-accept" style="padding: 16px 36px; font-size: 1.05rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "instant",
		"size": 18
	})}<span>ثبت قطعی پذیرش، تراکنش مالی و نوبت جلسه بعد</span></button></div></form></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/walkin.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/walkin.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/walkin.astro";
var $$url = "/admin/walkin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/walkin@_@astro
var page = () => walkin_exports;
//#endregion
export { page };
