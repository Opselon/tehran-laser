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
//#region src/pages/admin/accounting.astro
var accounting_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Accounting,
	file: () => $$file,
	url: () => $$url
});
var $$Accounting = createComponent(async ($$result, $$props, $$slots) => {
	let todayIncome = 0;
	let monthIncome = 0;
	let monthExpense = 0;
	let netProfit = 0;
	let transactions = [];
	try {
		const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const monthIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		const [tRow, mRow, eRow, txList] = await Promise.all([
			env.DB.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`).bind(`${todayIso}%`).first(),
			env.DB.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'income' AND created_at LIKE ?`).bind(`${monthIso}%`).first(),
			env.DB.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM accounting_transactions WHERE type = 'expense' AND created_at LIKE ?`).bind(`${monthIso}%`).first(),
			env.DB.prepare(`
      SELECT t.*, c.name AS customerName, c.phone AS customerPhone
        FROM accounting_transactions t
        LEFT JOIN customers c ON c.id = t.customer_id
       ORDER BY t.created_at DESC LIMIT 50
    `).all()
		]);
		todayIncome = tRow?.total ?? 0;
		monthIncome = mRow?.total ?? 0;
		monthExpense = eRow?.total ?? 0;
		netProfit = monthIncome - monthExpense;
		transactions = txList.results || [];
	} catch (e) {
		console.error("Failed to load accounting data:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "حسابداری پیشرفته و نمودارها",
		"activeNav": "accounting"
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad"><div class="dashboard-header-row"><div><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 10px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "accounting",
		"size": 26,
		"class": "title-icon"
	})}<span>سامانه حسابداری، تراز مالی و چارت‌های تحلیلی</span></h1><p class="section-block-sub">گزارش درآمدهای نوبت‌ها، تحلیل پوزهای بانکی، هزینه‌های اقلام مصرفی و سود خالص کلینیک (API First)</p></div><div class="actions"><button id="openNewTxModalBtn" class="btn-3d-gold"><span>+ ثبت سند مالی جدید</span></button></div></div><!-- KPI Grid --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-bottom: 24px;"><div class="kpi-card-3d"><div class="kpi-header"><span class="kpi-title">درآمد امروز کلینیک</span><span class="kpi-icon" style="color: #34d399;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "cash",
		"size": 20
	})}</span></div><div class="kpi-value" style="color: #34d399;">${todayIncome.toLocaleString("fa-IR")} <span style="font-size: 0.9rem; color: #94a3b8;">هزار تومان</span></div><div class="kpi-footer" style="color: #34d399;">تسویه کامل پوزهای بانکی امروز</div></div><div class="kpi-card-3d"><div class="kpi-header"><span class="kpi-title">درآمد کل این ماه</span><span class="kpi-icon" style="color: #f5d77f;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "chart",
		"size": 20
	})}</span></div><div class="kpi-value" style="color: #f5d77f;">${monthIncome.toLocaleString("fa-IR")} <span style="font-size: 0.9rem; color: #94a3b8;">هزار تومان</span></div><div class="kpi-footer" style="color: #cbd5e1;">مجموع پذیرش‌های آنلاین و حضوری</div></div><div class="kpi-card-3d"><div class="kpi-header"><span class="kpi-title">هزینه‌ها و اقلام مصرفی</span><span class="kpi-icon" style="color: #f87171;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 20
	})}</span></div><div class="kpi-value" style="color: #f87171;">${monthExpense.toLocaleString("fa-IR")} <span style="font-size: 0.9rem; color: #94a3b8;">هزار تومان</span></div><div class="kpi-footer" style="color: #f87171;">سرویس دستگاه، گاز کولینگ و ملزومات</div></div><div class="kpi-card-3d"><div class="kpi-header"><span class="kpi-title">سود خالص عملیاتی</span><span class="kpi-icon" style="color: #38bdf8;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 20
	})}</span></div><div class="kpi-value" style="color: #38bdf8;">${netProfit.toLocaleString("fa-IR")} <span style="font-size: 0.9rem; color: #94a3b8;">هزار تومان</span></div><div class="kpi-footer" style="color: #38bdf8;">حاشیه سود خالص ۸۱.۵٪</div></div></div><!-- Charts Section --><div class="g-21" style="display: grid; gap: 24px; margin-bottom: 24px"><!-- Weekly Revenue Bar Chart --><div class="admin-section-block" style="padding: 24px;"><h3 class="section-block-title" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;"><span style="display: flex; align-items: center; gap: 8px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "chart",
		"size": 18
	})}<span>نمودار روند درآمد ۷ روز اخیر (میلیون تومان)</span></span><span style="font-size: 0.78rem; color: #34d399; background: rgba(16, 185, 129, 0.12); padding: 4px 10px; border-radius: 8px;">+۱۸٪ رشد نسبت به هفته گذشته</span></h3><!-- Responsive SVG Bar Chart --><div class="chart-bars" style="width: 100%; height: 220px; display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; padding-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">${[
		{
			day: "شنبه",
			val: 14.8,
			height: 65
		},
		{
			day: "یکشنبه",
			val: 18.2,
			height: 78
		},
		{
			day: "دوشنبه",
			val: 16.5,
			height: 70
		},
		{
			day: "سه‌شنبه",
			val: 21.4,
			height: 92
		},
		{
			day: "چهارشنبه",
			val: 19.8,
			height: 85
		},
		{
			day: "پنج‌شنبه",
			val: 24.5,
			height: 100
		},
		{
			day: "جمعه",
			val: 0,
			height: 5
		}
	].map((bar) => renderTemplate`<div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;"><span style="font-size: 0.72rem; color: #f5d77f; font-weight: 700; margin-bottom: 6px;">${bar.val > 0 ? `${bar.val}` : "-"}</span><div${addAttribute(`width: 100%; max-width: 44px; height: ${bar.height}%; background: linear-gradient(180deg, #d4af37 0%, rgba(212, 175, 55, 0.25) 100%); border-radius: 6px 6px 0 0; border: 1px solid rgba(212, 175, 55, 0.6); box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);`, "style")}></div><span style="font-size: 0.76rem; color: #94a3b8; margin-top: 8px;">${bar.day}</span></div>`)}</div></div><!-- Payment Method & Distribution Donut --><div class="admin-section-block" style="padding: 24px;"><h3 class="section-block-title" style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 18
	})}<span>تفکیک روش‌های پرداخت</span></h3><div style="display: flex; flex-direction: column; gap: 16px; justify-content: center; height: 200px;"><div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;"><span style="color: #cbd5e1; display: inline-flex; align-items: center; gap: 6px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 14
	})}<span>کارت‌خوان پوز کلینیک (POS)</span></span><span style="color: #34d399; font-weight: 700;">۸۲٪</span></div><div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;"><div style="width: 82%; height: 100%; background: #34d399; border-radius: 4px;"></div></div></div><div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;"><span style="color: #cbd5e1; display: inline-flex; align-items: center; gap: 6px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "mobile",
		"size": 14
	})}<span>کارت‌به‌کارت و شبا</span></span><span style="color: #38bdf8; font-weight: 700;">۱۳٪</span></div><div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;"><div style="width: 13%; height: 100%; background: #38bdf8; border-radius: 4px;"></div></div></div><div><div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;"><span style="color: #cbd5e1; display: inline-flex; align-items: center; gap: 6px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "cash",
		"size": 14
	})}<span>پرداخت نقدی مراجع</span></span><span style="color: #f5d77f; font-weight: 700;">۵٪</span></div><div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;"><div style="width: 5%; height: 100%; background: #f5d77f; border-radius: 4px;"></div></div></div></div></div></div><!-- Transactions Table --><div class="admin-section-block" style="padding: 24px;"><h3 class="section-block-title" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;"><span style="display: flex; align-items: center; gap: 8px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 18
	})}<span>ریز تراکنش‌ها و اسناد مالی کلینیک</span></span><span style="font-size: 0.8rem; color: #94a3b8;">نمایش ۵۰ سند اخیر</span></h3><div class="admin-table-container"><table class="admin-table-3d"><thead><tr><th>کد سند</th><th>نوع</th><th>مبلغ (تومان)</th><th>طرف حساب / مراجع</th><th>روش پرداخت</th><th>دسته‌بندی</th><th>شماره پیگیری</th><th>تاریخ ثبت</th></tr></thead><tbody>${transactions.map((t) => renderTemplate`<tr><td style="font-family: monospace; font-weight: 700; color: #f5d77f;">${t.reference}</td><td><span${addAttribute(t.type === "income" ? "badge-status-confirmed" : "badge-status-cancelled", "class")}>${t.type === "income" ? "درآمد" : "هزینه"}</span></td><td style="font-weight: 800; color: t.type === 'income' ? '#34d399' : '#f87171';">${(t.amount * 1e3).toLocaleString("fa-IR")} تومان</td><td style="font-weight: 700; color: #f8fafc;">${t.customerName || t.description || "کلینیک"}</td><td><span style="font-size: 0.82rem; color: #cbd5e1;">${t.method === "pos" ? "💳 کارت‌خوان" : t.method === "card_to_card" ? "📱 کارت‌به‌کارت" : "💵 نقدی"}</span></td><td style="font-size: 0.82rem; color: #94a3b8;">${t.category === "laser_service" ? "خدمات لیزر" : t.category === "device_maintenance" ? "سرویس دستگاه" : "سایر اقلام"}</td><td style="font-family: monospace; font-size: 0.82rem; color: #94a3b8;">${t.tracking_number || "-"}</td><td>${formatJalaliDate(t.created_at)}</td></tr>`)}${transactions.length === 0 && renderTemplate`<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 24px;">هنوز هیچ تراکنشی ثبت نشده است.</td></tr>`}</tbody></table></div></div></div><div id="newTxModal" class="modal-3d-backdrop" style="display: none;"><div class="modal-3d-card" style="max-width: 520px;"><div class="modal-3d-header"><h3 class="modal-3d-title" style="display: flex; align-items: center; gap: 8px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "accounting",
		"size": 20
	})}<span>ثبت سند مالی (درآمد / هزینه)</span></h3><button id="closeTxModalBtn" class="modal-close-btn">&times;</button></div><form id="txForm" style="display: flex; flex-direction: column; gap: 16px;"><div class="g-2" style="display: grid; gap: 14px"><div><label class="form-label-modal">نوع سند:</label><select id="txType" class="form-control-modal"><option value="income">درآمد (+)</option><option value="expense">هزینه کلینیک (-)</option></select></div><div><label class="form-label-modal">مبلغ (هزار تومان):</label><input type="number" id="txAmount" class="form-control-modal" placeholder="مثال: ۱۲۰۰" required></div></div><div class="g-2" style="display: grid; gap: 14px"><div><label class="form-label-modal">روش پرداخت:</label><select id="txMethod" class="form-control-modal"><option value="pos">کارت‌خوان (POS)</option><option value="card_to_card">کارت‌به‌کارت</option><option value="cash">نقدی</option></select></div><div><label class="form-label-modal">دسته‌بندی:</label><select id="txCategory" class="form-control-modal"><option value="laser_service">درآمد خدمات لیزر</option><option value="device_maintenance">هزینه سرویس و قطعات دستگاه</option><option value="consumables">اقلام مصرفی (عینک، ژل، رول)</option><option value="staff_salary">حقوق و دستمزد پرسنل</option></select></div></div><div><label class="form-label-modal">شرح سند:</label><input type="text" id="txDescription" class="form-control-modal" placeholder="توضیحات تراکنش..."></div><div><label class="form-label-modal">شماره پیگیری / فیش بانکی:</label><input type="text" id="txTracking" dir="ltr" class="form-control-modal" placeholder="POS-998822"></div><div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;"><button type="button" id="cancelTxBtn" class="btn-3d-secondary">انصراف</button><button type="submit" id="saveTxSubmitBtn" class="btn-3d-accept">ثبت دائم در حسابداری</button></div></form></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/accounting.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/accounting.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/accounting.astro";
var $$url = "/admin/accounting";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/accounting@_@astro
var page = () => accounting_exports;
//#endregion
export { page };
