globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, g as renderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
//#region src/pages/admin/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Login = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Login;
	if (Astro.locals.auth) return Astro.redirect("/admin");
	return renderTemplate`<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>ورود پرسنل به سامانه مدیریت | کلینیک تخصصی تهران لیزر</title><meta name="robots" content="noindex, nofollow"><link rel="icon" href="/favicon.svg" type="image/svg+xml">${renderHead($$result)}</head><body class="admin-login-body-3d"><!-- 3D Interactive Canvas & Lights Background --><div class="bg-canvas-container"><div class="ambient-laser-grid"></div><div class="ambient-radial-glow"></div><div class="ambient-cyan-glow"></div><canvas id="particle3dCanvas"></canvas></div><!-- 3D Viewport Card Container --><div class="login-3d-viewport"><div class="login-3d-card" id="tiltCard"><div class="card-3d-glare" id="cardGlare"></div><!-- 3D Emblem & Header --><div class="login-3d-header"><div class="emblem-3d-wrap"><svg class="emblem-3d-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="url(#emblemGrad1)" stroke="#F5D77F" stroke-width="2"></path><path d="M24 12L34 18V30L24 36L14 30V18L24 12Z" fill="url(#emblemGrad2)" stroke="#FFF2CC" stroke-width="1.5"></path><circle cx="24" cy="24" r="4" fill="#FFFFFF" filter="url(#glowFilter)"></circle><defs><linearGradient id="emblemGrad1" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#D4AF37"></stop><stop offset="0.5" stop-color="#8C6D32"></stop><stop offset="1" stop-color="#241B08"></stop></linearGradient><linearGradient id="emblemGrad2" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF2CC"></stop><stop offset="0.6" stop-color="#D4AF37"></stop><stop offset="1" stop-color="#5E4310"></stop></linearGradient><filter id="glowFilter" x="16" y="16" width="16" height="16" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs></svg></div><div class="login-3d-badge">${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 13
	})}<span>نسخه امن پرسنلی v3.2</span></div><h1 class="login-3d-title">ورود به پنل مدیریت کلینیک</h1><p class="login-3d-subtitle">سامانه جامع مدیریت نوبت‌ها، مراجعین و خدمات تهران لیزر</p></div><!-- Rate-Limiting Lockout Alert (Initially Hidden) --><div id="rateLimitAlert" class="alert-3d-lockout" style="display: none;" role="alert"><div style="display: flex; align-items: center; gap: 10px;"><span style="color: #f87171; display: inline-flex;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 22
	})}</span><strong style="color: #ffffff; font-size: 0.95rem;">قفل امنیتی نشست (Rate-Limit Lockout)</strong></div><div id="rateLimitAlertText">تعداد تلاش‌های ناموفق ورود از سقف مجاز فراتر رفته است. جهت جلوگیری از حملات نفوذ، این آدرس IP موقتاً مسدود شده است.</div><div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(248,113,113,0.3); padding-top: 8px; font-size: 0.8rem;"><span>مدت زمان باقیمانده تا آزادسازی:</span><span id="lockoutTimer" dir="ltr" style="font-family: monospace; font-weight: 800; color: #fbbf24;">10:00</span></div></div><!-- Standard Alert Notification --><div id="loginAlert" class="alert-3d-danger" style="display: none;" role="alert"><span style="display: inline-flex; align-items: center; color: #f87171;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 18
	})}</span><span id="loginAlertText"></span></div><!-- 3D Form --><form id="adminLoginForm" class="login-3d-form" autocomplete="on" novalidate><div class="form-group-3d"><label for="adminEmail" class="label-3d"><span class="label-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "mail",
		"size": 15
	})}</span><span>آدرس ایمیل پرسنل:</span></label><div class="input-3d-wrapper"><input id="adminEmail" type="email" dir="ltr" class="input-3d" placeholder="admin@tehranlaser.ir" value="admin@tehranlaser.ir" required autocomplete="username"><span class="input-prefix-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "mail",
		"size": 16
	})}</span></div><div id="emailError" class="field-error-msg">لطفاً آدرس ایمیل پرسنلی معتبر را وارد کنید.</div></div><div class="form-group-3d"><label for="adminPassword" class="label-3d"><span class="label-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 15
	})}</span><span>کلمه عبور امنیتی:</span></label><div class="input-3d-wrapper"><input id="adminPassword" type="password" dir="ltr" class="input-3d" placeholder="••••••••••••" required autocomplete="current-password"><span class="input-prefix-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 16
	})}</span><button type="button" id="togglePasswordBtn" class="password-toggle-btn" aria-label="نمایش / پنهان کردن رمز" title="نمایش / پنهان کردن رمز" aria-pressed="false"><span id="eyeOpenIcon" style="display: inline-flex;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 18
	})}</span><span id="eyeClosedIcon" style="display: none;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 18
	})}</span></button></div><div id="passwordError" class="field-error-msg">کلمه عبور نمی‌تواند خالی باشد.</div></div><button type="submit" id="loginSubmitBtn" class="btn-3d-submit"><span id="btnSpinner" style="display: none;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 18,
		"class": "spin-icon"
	})}</span><span id="btnText">ورود امن به سامانه مدیریت</span><span id="btnArrowIcon" style="display: inline-flex; align-items: center;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 18,
		"class": "btn-arrow"
	})}</span></button><!-- Quick Autofill Demo Button --><div class="autofill-helper-row" style="margin-top: 14px;"><button type="button" id="quickFillBtn" class="btn-autofill-3d">${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 15
	})}<span id="quickFillBtnText">ورود سریع آزمایشی مدیر ارشد (Admin)</span></button></div></form><!-- 3D Footer & Status --><div class="login-3d-footer"><div class="telemetry-status"><span class="status-dot-pulse"></span><span style="display: inline-flex; align-items: center; gap: 4px;">${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 13
	})}<span>رمزنگاری PBKDF2 • Cloudflare D1 ایزوله</span></span></div><div><a href="/" class="back-to-site-link">${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowRight",
		"size": 14
	})}<span>بازگشت به وب‌سایت عمومی تهران لیزر</span></a></div></div></div></div><!-- Client-Side 3D Physics & Canvas Script -->${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/login.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/login.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/login.astro";
var $$url = "/admin/login";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/login@_@astro
var page = () => login_exports;
//#endregion
export { page };
