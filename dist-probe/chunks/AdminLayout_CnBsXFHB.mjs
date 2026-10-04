globalThis.process ??= {};
globalThis.process.env ??= {};
import { D as createAstro, _ as addAttribute, d as renderSlot, g as renderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
/* empty css                    */
//#region src/layouts/AdminLayout.astro
createAstro("https://astro.build");
var $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminLayout;
	const { title = "سامانه مدیریت تهران لیزر", activeNav = "dashboard" } = Astro.props;
	const auth = Astro.locals.auth || {
		id: "usr_admin_live",
		email: "admin@tehranlaser.ir",
		displayName: "مدیر ارشد کلینیک",
		role: "SUPER_ADMIN",
		permissions: [
			"booking.read",
			"settings.read",
			"customer.read",
			"audit.read"
		]
	};
	return renderTemplate`<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | پنل مدیریت تهران لیزر</title><meta name="robots" content="noindex, nofollow"><link rel="icon" href="/favicon.svg" type="image/svg+xml">${renderHead($$result)}</head><body class="admin-body"><div class="admin-shell"><!-- 3D High-Tech Topbar --><header class="admin-topbar"><div class="admin-topbar__brand"><button type="button" class="admin-menu-btn" id="adminMenuBtn" aria-label="باز کردن منو" aria-expanded="false" aria-controls="adminSidebar"><span class="bar"></span><span class="bar"></span><span class="bar"></span></button><a href="/admin" class="brand-link"><div class="brand-emblem-mini">${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 20,
		"aria-hidden": true
	})}</div><div class="brand-text-col"><strong class="brand-name">تهران لیزر</strong><span class="brand-sub">سامانه فرماندهی عملیات</span></div></a></div><div class="admin-topbar__center"><div class="hud-telemetry-badge"><span class="hud-pulse-dot"></span><span>سرور لایو • اتصال D1 پایدار</span></div><div class="hud-clock-widget" id="liveClockWidget"><span id="liveClockTime">⏱ --:--:--</span></div></div><div class="admin-topbar__actions"><div class="user-profile-badge"><div class="user-avatar-circle">${(auth.displayName || "ادمین").slice(0, 1)}</div><div style="display: flex; flex-direction: column; gap: 2px;"><span class="user-name">${auth.displayName || auth.email}</span><span class="badge-role-gold">SUPER ADMIN</span></div></div><button type="button" class="btn-3d-logout" id="adminLogoutBtn" title="خروج از سامانه"><span>خروج</span><span>⎋</span></button></div></header><!-- 3D Obsidian Sidebar --><aside class="admin-sidebar" id="adminSidebar"><nav class="admin-sidebar__nav"><ul class="admin-nav-list">${[
		{
			id: "dashboard",
			label: "داشبورد و امروز",
			href: "/admin",
			icon: "dashboard"
		},
		{
			id: "walkin",
			label: "پذیرش فوری و جلسه بعد",
			href: "/admin/walkin",
			icon: "walkin"
		},
		{
			id: "bookings",
			label: "مدیریت نوبت‌ها",
			href: "/admin/bookings",
			icon: "bookings"
		},
		{
			id: "calendar",
			label: "تقویم نوبت‌ها",
			href: "/admin/calendar",
			icon: "calendar"
		},
		{
			id: "crm",
			label: "پرونده بالینی و CRM",
			href: "/admin/crm",
			icon: "crm"
		},
		{
			id: "customers",
			label: "بانک مراجعین",
			href: "/admin/customers",
			icon: "customers"
		},
		{
			id: "accounting",
			label: "حسابداری و نمودارها",
			href: "/admin/accounting",
			icon: "accounting"
		},
		{
			id: "sms",
			label: "پنل پیامک و اطلاع‌رسانی",
			href: "/admin/sms",
			icon: "sms"
		},
		{
			id: "lottery",
			label: "قرعه‌کشی و گردونه شانس",
			href: "/admin/lottery",
			icon: "lottery"
		},
		{
			id: "festivals",
			label: "جشنواره‌ها و تایم‌لاین",
			href: "/admin/festivals",
			icon: "festivals"
		},
		{
			id: "instagram",
			label: "تنظیمات اینستاگرام",
			href: "/admin/instagram",
			icon: "instagram"
		},
		{
			id: "services",
			label: "خدمات و تعرفه‌ها",
			href: "/admin/services",
			icon: "services"
		},
		{
			id: "schedule",
			label: "ساعات کاری و زمان‌بندی",
			href: "/admin/schedule",
			icon: "schedule"
		},
		{
			id: "blog",
			label: "مقالات و محتوا",
			href: "/admin/blog",
			icon: "blog"
		},
		{
			id: "settings",
			label: "تنظیمات کلینیک",
			href: "/admin/settings",
			icon: "settings"
		},
		{
			id: "audit",
			label: "گزارش وقایع و لاگ",
			href: "/admin/audit",
			icon: "audit"
		}
	].map((item) => renderTemplate`<li class="admin-nav-item"><a${addAttribute(item.href, "href")}${addAttribute(`admin-nav-link ${activeNav === item.id ? "active" : ""}`, "class")}><span class="nav-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": item.icon,
		"size": 18
	})}</span><span class="nav-label">${item.label}</span></a></li>`)}</ul></nav><div class="admin-sidebar__footer"><a href="/" target="_blank" class="view-website-link"><span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 15,
		"aria-hidden": true
	})} مشاهده وب‌سایت اصلی ${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowUpRight",
		"size": 13,
		"aria-hidden": true
	})}</span></a><div class="version-tag">نسخه ۳.۲.۰ — Cloudflare Edge Native</div></div></aside><!-- Mobile sidebar backdrop --><div class="admin-sidebar-overlay" id="adminSidebarOverlay" hidden></div><!-- Main Content Area --><main class="admin-main">${renderSlot($$result, $$slots["default"])}</main></div><!-- Script for Clock & Logout -->${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/layouts/AdminLayout.astro", void 0);
//#endregion
export { $$AdminLayout as t };
