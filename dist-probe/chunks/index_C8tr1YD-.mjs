globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { f as listAdminServices } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/services/index.astro
var services_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let services = [];
	try {
		services = await listAdminServices(env.DB);
	} catch (e) {
		console.error("Failed to load admin services:", e);
	}
	function getServiceCategory(slug, name) {
		const s = slug.toLowerCase();
		const n = name.toLowerCase();
		if (s.includes("body") || n.includes("بدن") || s.includes("package") || n.includes("پکیج")) return {
			key: "package",
			label: "پکیج طلایی",
			icon: "gem",
			color: "#f5d77f",
			bg: "rgba(212, 175, 55, 0.15)",
			border: "rgba(212, 175, 55, 0.4)"
		};
		if (s.includes("face") || s.includes("lip") || s.includes("chin") || s.includes("neck") || n.includes("صورت") || n.includes("لب") || n.includes("چانه") || n.includes("گردن")) return {
			key: "face",
			label: "صورت و گردن",
			icon: "sparkles",
			color: "#f472b6",
			bg: "rgba(244, 114, 182, 0.12)",
			border: "rgba(244, 114, 182, 0.35)"
		};
		if (s.includes("arm") || s.includes("forearm") || s.includes("underarm") || n.includes("دست") || n.includes("بازو") || n.includes("ساعد") || n.includes("زیر بغل") || n.includes("زیربغل")) return {
			key: "arms",
			label: "دست و بازو",
			icon: "services",
			color: "#38bdf8",
			bg: "rgba(56, 189, 248, 0.12)",
			border: "rgba(56, 189, 248, 0.35)"
		};
		if (s.includes("chest") || s.includes("abdomen") || s.includes("navel") || s.includes("back") || n.includes("سینه") || n.includes("شکم") || n.includes("ناف") || n.includes("کمر") || n.includes("پشت")) return {
			key: "torso",
			label: "تنه و بالاتنه",
			icon: "shield",
			color: "#c084fc",
			bg: "rgba(192, 132, 252, 0.12)",
			border: "rgba(192, 132, 252, 0.35)"
		};
		if (s.includes("leg") || s.includes("thigh") || s.includes("bikini") || s.includes("buttock") || s.includes("gluteal") || n.includes("پا") || n.includes("ران") || n.includes("ساق") || n.includes("بیکینی") || n.includes("باسن")) return {
			key: "legs",
			label: "پا و نواحی خاص",
			icon: "tag",
			color: "#34d399",
			bg: "rgba(52, 211, 153, 0.12)",
			border: "rgba(52, 211, 153, 0.35)"
		};
		return {
			key: "other",
			label: "سایر خدمات",
			icon: "gem",
			color: "#94a3b8",
			bg: "rgba(148, 163, 184, 0.12)",
			border: "rgba(148, 163, 184, 0.35)"
		};
	}
	const activeCount = services.filter((s) => s.active).length;
	const inactiveCount = services.length - activeCount;
	const nextDisplayOrder = services.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0) + 1;
	const categoryCounts = {
		all: services.length,
		face: 0,
		arms: 0,
		torso: 0,
		legs: 0,
		package: 0,
		other: 0
	};
	for (const s of services) {
		const key = getServiceCategory(s.slug, s.name).key;
		categoryCounts[key] = (categoryCounts[key] || 0) + 1;
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "خدمات و تعرفه‌ها",
		"activeNav": "services",
		"data-astro-cid-irsidq5c": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad services-page-container" data-astro-cid-irsidq5c><!-- 3D Header Row --><div class="dashboard-header-row services-header-3d" data-astro-cid-irsidq5c><div class="services-header-info" data-astro-cid-irsidq5c><div class="services-title-wrapper" data-astro-cid-irsidq5c><span class="services-icon-box" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "services",
		"size": 24,
		"data-astro-cid-irsidq5c": true
	})}</span><h1 class="admin-page-title" data-astro-cid-irsidq5c>کاتالوگ خدمات و تعرفه‌های مصوب کلینیک</h1></div><p class="section-block-sub" data-astro-cid-irsidq5c>مدیریت نواحی تحت پوشش لیزر، ویرایش زمان جلسات و به‌روزرسانی تعرفه مصوب بانوان و آقایان (کاملاً API First)</p></div><div class="services-header-actions" data-astro-cid-irsidq5c><div class="stats-pills-row" data-astro-cid-irsidq5c><span class="stat-pill stat-pill--active" title="تعداد خدمات فعال در وب‌سایت" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>فعال: ${activeCount.toLocaleString("fa-IR")}</span></span><span class="stat-pill stat-pill--inactive" title="تعداد خدمات غیرفعال" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>غیرفعال: ${inactiveCount.toLocaleString("fa-IR")}</span></span><span class="stat-pill stat-pill--total" title="کل خدمات ثبت شده در سامانه" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>مجموع: ${services.length.toLocaleString("fa-IR")}</span></span></div><button type="button" id="openNewServiceBtn" class="btn-3d-gold add-service-btn" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>افزودن خدمت جدید</span></button></div></div><!-- 3D Filter & Search Toolbar --><div class="admin-section-block services-toolbar-block" data-astro-cid-irsidq5c><div class="services-toolbar-top" data-astro-cid-irsidq5c><div class="services-search-col" data-astro-cid-irsidq5c><div class="search-input-wrap" data-astro-cid-irsidq5c><span class="search-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}</span><input type="text" id="serviceSearchInput" class="form-control-modal search-input-field" placeholder="جستجوی سریع با نام خدمت یا شناسه (مثال: صورت، arms، زیر بغل)..." data-astro-cid-irsidq5c><button type="button" id="clearSearchBtn" class="clear-search-btn" style="display: none;" title="پاک کردن جستجو" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}</button></div></div><div class="services-status-filter-col" data-astro-cid-irsidq5c><select id="statusFilterSelect" class="form-control-modal status-filter-select" data-astro-cid-irsidq5c><option value="all" data-astro-cid-irsidq5c>همه وضعیت‌ها (فعال و غیرفعال)</option><option value="active" data-astro-cid-irsidq5c>فقط خدمات فعال (منتشر شده)</option><option value="inactive" data-astro-cid-irsidq5c>فقط خدمات غیرفعال (مخفی)</option></select></div></div><!-- Category Filter Pills --><div class="services-categories-bar" data-astro-cid-irsidq5c><div class="category-tabs-scroll" data-astro-cid-irsidq5c><button type="button" class="category-tab-btn active" data-category="all" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>همه (${categoryCounts.all.toLocaleString("fa-IR")})</span></button><button type="button" class="category-tab-btn" data-category="face" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>صورت و گردن (${categoryCounts.face.toLocaleString("fa-IR")})</span></button><button type="button" class="category-tab-btn" data-category="arms" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "services",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>دست و بازو (${categoryCounts.arms.toLocaleString("fa-IR")})</span></button><button type="button" class="category-tab-btn" data-category="torso" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>تنه و بالاتنه (${categoryCounts.torso.toLocaleString("fa-IR")})</span></button><button type="button" class="category-tab-btn" data-category="legs" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>پا و نواحی خاص (${categoryCounts.legs.toLocaleString("fa-IR")})</span></button><button type="button" class="category-tab-btn" data-category="package" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>پکیج طلایی (${categoryCounts.package.toLocaleString("fa-IR")})</span></button></div><div class="services-counter-indicator" id="servicesCounterIndicator" data-astro-cid-irsidq5c>نمایش ${services.length.toLocaleString("fa-IR")} خدمت</div></div></div><!-- 3D Services Management Table (Desktop View) --><div class="admin-section-block services-table-section desktop-only-table" style="padding: 0; overflow: hidden;" data-astro-cid-irsidq5c><div class="today-table-wrapper services-table-wrapper" style="border: none; border-radius: 0;" data-astro-cid-irsidq5c><table class="admin-table services-3d-table" id="servicesTable" data-astro-cid-irsidq5c><thead data-astro-cid-irsidq5c><tr data-astro-cid-irsidq5c><th style="width: 50px; text-align: center;" data-astro-cid-irsidq5c>ترتیب</th><th data-astro-cid-irsidq5c>نام خدمت و دسته‌بندی</th><th data-astro-cid-irsidq5c>شناسه یکتا (Slug)</th><th data-astro-cid-irsidq5c>مدت جلسه</th><th data-astro-cid-irsidq5c>تعرفه مصوب بانوان</th><th data-astro-cid-irsidq5c>تعرفه مصوب آقایان</th><th style="text-align: center;" data-astro-cid-irsidq5c>وضعیت سایت</th><th style="text-align: center;" data-astro-cid-irsidq5c>عملیات</th></tr></thead><tbody id="servicesTableBody" data-astro-cid-irsidq5c>${services.map((s) => {
		const femalePrice = s.prices.find((p) => p.pricingCategory === "female");
		const malePrice = s.prices.find((p) => p.pricingCategory === "male");
		const femalePriceAmount = femalePrice ? femalePrice.amount : 0;
		const malePriceAmount = malePrice ? malePrice.amount : 0;
		const isPromo = s.slug === "full-body";
		const cat = getServiceCategory(s.slug, s.name);
		return renderTemplate`<tr class="service-row"${addAttribute(s.id, "data-id")}${addAttribute(s.name.toLowerCase(), "data-name")}${addAttribute(s.slug.toLowerCase(), "data-slug")}${addAttribute(cat.key, "data-category")}${addAttribute(s.active ? "true" : "false", "data-active")} data-astro-cid-irsidq5c><td${addAttribute({ textAlign: "center" }, "style")} data-astro-cid-irsidq5c><span class="order-pill-badge" data-astro-cid-irsidq5c>${s.displayOrder}</span></td><td data-astro-cid-irsidq5c><div class="service-name-cell" data-astro-cid-irsidq5c><div class="service-title-text" data-astro-cid-irsidq5c>${s.name}</div><div class="service-category-badge"${addAttribute(`color: ${cat.color}; background: ${cat.bg}; border: 1px solid ${cat.border};`, "style")} data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": cat.icon,
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>${cat.label}</span></div>${s.shortDescription && renderTemplate`<div class="service-short-desc" data-astro-cid-irsidq5c>${s.shortDescription}</div>`}</div></td><td dir="ltr"${addAttribute({
			fontFamily: "monospace",
			color: "#f5d77f",
			fontSize: "0.85rem"
		}, "style")} data-astro-cid-irsidq5c><span class="slug-tag" data-astro-cid-irsidq5c>${s.slug}</span></td><td data-astro-cid-irsidq5c><span class="duration-badge" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>${s.durationMinutes} دقیقه</span></span></td><td data-astro-cid-irsidq5c><div class="tariff-cell-wrap" data-astro-cid-irsidq5c>${femalePrice ? isPromo ? renderTemplate`<div class="promo-price-block" data-astro-cid-irsidq5c><span class="promo-old-price" data-astro-cid-irsidq5c>۲٬۲۹۰٬۰۰۰</span><span class="promo-new-price" data-astro-cid-irsidq5c>۱٬۹۴۰٬۰۰۰ تومان</span><span class="promo-tag" data-astro-cid-irsidq5c>ویژه سایت</span></div>` : renderTemplate`<span class="price-badge-female" data-astro-cid-irsidq5c>${(femalePrice.amount * 1e3).toLocaleString("fa-IR")} تومان</span>` : renderTemplate`<span class="price-badge-unset" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "info",
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>استعلام تلفنی</span></span>`}<button type="button" class="btn-quick-edit js-quick-edit-price" title="ویرایش سریع تعرفه بانوان"${addAttribute(s.id, "data-id")} data-target="female" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}</button></div></td><td data-astro-cid-irsidq5c><div class="tariff-cell-wrap" data-astro-cid-irsidq5c>${malePrice && malePrice.amount > 0 ? renderTemplate`<span class="price-badge-male" data-astro-cid-irsidq5c>${(malePrice.amount * 1e3).toLocaleString("fa-IR")} تومان</span>` : renderTemplate`<span class="price-badge-unset" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "info",
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>استعلام تلفنی</span></span>`}<button type="button" class="btn-quick-edit js-quick-edit-price" title="ویرایش سریع تعرفه آقایان"${addAttribute(s.id, "data-id")} data-target="male" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}</button></div></td><td${addAttribute({ textAlign: "center" }, "style")} data-astro-cid-irsidq5c><button type="button" class="switch-3d js-toggle-active"${addAttribute(s.id, "data-id")}${addAttribute(s.active ? "true" : "false", "data-active")}${addAttribute(s.name, "data-name")}${addAttribute(s.active ? "کلیک جهت غیرفعال کردن خدمت" : "کلیک جهت فعال کردن خدمت", "title")} data-astro-cid-irsidq5c><span${addAttribute(`switch-3d-track ${s.active ? "active" : ""}`, "class")} data-astro-cid-irsidq5c><span class="switch-3d-thumb" data-astro-cid-irsidq5c></span></span><span class="switch-3d-label" data-astro-cid-irsidq5c>${s.active ? "فعال" : "غیرفعال"}</span></button></td><td${addAttribute({ textAlign: "center" }, "style")} data-astro-cid-irsidq5c><button type="button" class="btn-table-action edit-service-btn"${addAttribute(s.id, "data-id")}${addAttribute(s.name, "data-name")}${addAttribute(s.slug, "data-slug")}${addAttribute(s.durationMinutes, "data-duration")}${addAttribute(s.active ? "true" : "false", "data-active")}${addAttribute(s.displayOrder, "data-order")}${addAttribute(s.shortDescription || "", "data-shortdesc")}${addAttribute(femalePriceAmount, "data-price-female")}${addAttribute(malePriceAmount, "data-price-male")} data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 13,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>ویرایش خدمت</span></button></td></tr>`;
	})}</tbody></table><!-- Empty state row --><div id="noResultsDesktop" class="empty-results-box" style="display: none;" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 28,
		"data-astro-cid-irsidq5c": true
	})}<p data-astro-cid-irsidq5c>هیچ خدمتی مطابق با جستجو یا فیلتر دسته‌بندی انتخاب‌شده یافت نشد.</p></div></div></div><!-- 3D Mobile Cards View (< 768px, specifically 320px & 390px) --><div class="services-cards-mobile" id="servicesMobileList" data-astro-cid-irsidq5c>${services.map((s) => {
		const femalePrice = s.prices.find((p) => p.pricingCategory === "female");
		const malePrice = s.prices.find((p) => p.pricingCategory === "male");
		const femalePriceAmount = femalePrice ? femalePrice.amount : 0;
		const malePriceAmount = malePrice ? malePrice.amount : 0;
		const isPromo = s.slug === "full-body";
		const cat = getServiceCategory(s.slug, s.name);
		return renderTemplate`<div class="service-card-mobile service-row"${addAttribute(s.id, "data-id")}${addAttribute(s.name.toLowerCase(), "data-name")}${addAttribute(s.slug.toLowerCase(), "data-slug")}${addAttribute(cat.key, "data-category")}${addAttribute(s.active ? "true" : "false", "data-active")} data-astro-cid-irsidq5c><div class="card-mobile-top" data-astro-cid-irsidq5c><div class="card-mobile-title-col" data-astro-cid-irsidq5c><span class="order-pill-badge" data-astro-cid-irsidq5c>${s.displayOrder}</span><span class="card-service-title" data-astro-cid-irsidq5c>${s.name}</span><span class="service-category-badge"${addAttribute(`color: ${cat.color}; background: ${cat.bg}; border: 1px solid ${cat.border};`, "style")} data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": cat.icon,
			"size": 11,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>${cat.label}</span></span></div><div class="card-mobile-switch-col" data-astro-cid-irsidq5c><button type="button" class="switch-3d js-toggle-active"${addAttribute(s.id, "data-id")}${addAttribute(s.active ? "true" : "false", "data-active")}${addAttribute(s.name, "data-name")}${addAttribute(s.active ? "کلیک جهت غیرفعال کردن" : "کلیک جهت فعال کردن", "title")} data-astro-cid-irsidq5c><span${addAttribute(`switch-3d-track ${s.active ? "active" : ""}`, "class")} data-astro-cid-irsidq5c><span class="switch-3d-thumb" data-astro-cid-irsidq5c></span></span><span class="switch-3d-label" data-astro-cid-irsidq5c>${s.active ? "فعال" : "غیرفعال"}</span></button></div></div><div class="card-mobile-meta" data-astro-cid-irsidq5c><span class="slug-tag" dir="ltr" data-astro-cid-irsidq5c>${s.slug}</span><span class="duration-badge" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 12,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>${s.durationMinutes} دقیقه</span></span></div>${s.shortDescription && renderTemplate`<div class="card-mobile-desc" data-astro-cid-irsidq5c>${s.shortDescription}</div>`}<div class="card-mobile-tariffs" data-astro-cid-irsidq5c><div class="tariff-box-mobile" data-astro-cid-irsidq5c><span class="tariff-box-label" data-astro-cid-irsidq5c>تعرفه مصوب بانوان:</span><div class="tariff-box-val" data-astro-cid-irsidq5c>${femalePrice ? isPromo ? renderTemplate`<span class="promo-new-price" style="font-size: 0.86rem;" data-astro-cid-irsidq5c>۱٬۹۴۰٬۰۰۰ تومان (تخفیف سایت)</span>` : renderTemplate`<span class="price-badge-female" data-astro-cid-irsidq5c>${(femalePrice.amount * 1e3).toLocaleString("fa-IR")} تومان</span>` : renderTemplate`<span class="price-badge-unset" data-astro-cid-irsidq5c>استعلام تلفنی</span>`}</div></div><div class="tariff-box-mobile" data-astro-cid-irsidq5c><span class="tariff-box-label" data-astro-cid-irsidq5c>تعرفه مصوب آقایان:</span><div class="tariff-box-val" data-astro-cid-irsidq5c>${malePrice && malePrice.amount > 0 ? renderTemplate`<span class="price-badge-male" data-astro-cid-irsidq5c>${(malePrice.amount * 1e3).toLocaleString("fa-IR")} تومان</span>` : renderTemplate`<span class="price-badge-unset" data-astro-cid-irsidq5c>استعلام تلفنی</span>`}</div></div></div><div class="card-mobile-actions" data-astro-cid-irsidq5c><button type="button" class="btn-table-action edit-service-btn btn-mobile-edit"${addAttribute(s.id, "data-id")}${addAttribute(s.name, "data-name")}${addAttribute(s.slug, "data-slug")}${addAttribute(s.durationMinutes, "data-duration")}${addAttribute(s.active ? "true" : "false", "data-active")}${addAttribute(s.displayOrder, "data-order")}${addAttribute(s.shortDescription || "", "data-shortdesc")}${addAttribute(femalePriceAmount, "data-price-female")}${addAttribute(malePriceAmount, "data-price-male")} data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
			"name": "edit",
			"size": 14,
			"data-astro-cid-irsidq5c": true
		})}<span data-astro-cid-irsidq5c>ویرایش مشخصات و تعرفه خدمت</span></button></div></div>`;
	})}<div id="noResultsMobile" class="empty-results-box" style="display: none;" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 28,
		"data-astro-cid-irsidq5c": true
	})}<p data-astro-cid-irsidq5c>هیچ خدمتی مطابق با جستجو یا فیلتر دسته‌بندی انتخاب‌شده یافت نشد.</p></div></div><!-- 3D Edit Service Modal --><div id="serviceEditModal" class="modal-backdrop services-modal-backdrop" style="display: none;" data-astro-cid-irsidq5c><div class="modal-dialog services-modal-dialog" data-astro-cid-irsidq5c><div class="modal-header-row" data-astro-cid-irsidq5c><div class="modal-title-wrap" data-astro-cid-irsidq5c><span class="modal-title-icon-gold" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 20,
		"data-astro-cid-irsidq5c": true
	})}</span><h3 class="modal-title" data-astro-cid-irsidq5c>ویرایش خدمت و تعرفه مصوب</h3></div><button type="button" id="closeEditModalX" class="modal-close-icon-btn" title="بستن" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}</button></div><p class="modal-subtitle-text" data-astro-cid-irsidq5c>تغییر نام ناحیه، زمان تخصیصی جلسه و قیمت مصوب بانوان و آقایان مستقیماً در دیتابیس D1 ذخیره می‌شود.</p><div id="serviceAlert" class="alert-3d-danger" style="display: none;" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}<span id="serviceAlertText" data-astro-cid-irsidq5c></span></div><form id="editServiceForm" class="services-modal-form" data-astro-cid-irsidq5c><input type="hidden" id="editServiceId" data-astro-cid-irsidq5c><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceName" class="form-label-gold" data-astro-cid-irsidq5c>نام ناحیه / خدمت (فارسی):</label><input type="text" id="editServiceName" class="form-control-modal" required minlength="2" maxlength="80" data-astro-cid-irsidq5c></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceSlug" class="form-label-gold" data-astro-cid-irsidq5c>شناسه یکتا (Slug):</label><input type="text" id="editServiceSlug" class="form-control-modal slug-input" dir="ltr" required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="حروف کوچک انگلیسی و خط تیره (-) بدون فاصله" data-astro-cid-irsidq5c></div></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceDuration" class="form-label-gold" data-astro-cid-irsidq5c><span class="label-with-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>مدت زمان جلسه (دقیقه):</span></span></label><input type="number" id="editServiceDuration" class="form-control-modal" min="5" max="600" required data-astro-cid-irsidq5c></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceOrder" class="form-label-gold" data-astro-cid-irsidq5c>ترتیب نمایش در کاتالوگ:</label><input type="number" id="editServiceOrder" class="form-control-modal" min="0" max="9999" required data-astro-cid-irsidq5c></div></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceActive" class="form-label-gold" data-astro-cid-irsidq5c>وضعیت انتشار در وب‌سایت:</label><select id="editServiceActive" class="form-control-modal" data-astro-cid-irsidq5c><option value="true" data-astro-cid-irsidq5c>فعال (قابل مشاهده و رزرو در سایت)</option><option value="false" data-astro-cid-irsidq5c>غیرفعال (مخفی از فرم رزرو و تعرفه‌ها)</option></select></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServiceShortDesc" class="form-label-gold" data-astro-cid-irsidq5c>توضیح مختصر خدمت (اختیاری):</label><input type="text" id="editServiceShortDesc" class="form-control-modal" placeholder="مثال: شامل مچ تا شانه با شات نامحدود" maxlength="200" data-astro-cid-irsidq5c></div></div><!-- Dual Tariffs 3D Card --><div class="modal-tariffs-panel" data-astro-cid-irsidq5c><div class="tariffs-panel-header" data-astro-cid-irsidq5c><span class="tariffs-header-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}</span><span class="tariffs-header-title" data-astro-cid-irsidq5c>نرخ‌گذاری تعرفه‌های مصوب (واحد: هزار تومان)</span></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServicePriceFemale" class="form-label-gold" data-astro-cid-irsidq5c>تعرفه مصوب بانوان:</label><div class="input-with-hint" data-astro-cid-irsidq5c><input type="number" id="editServicePriceFemale" class="form-control-modal price-input" placeholder="مثال: ۳۲۰" min="0" step="5" data-astro-cid-irsidq5c><div class="toman-live-preview" id="editFemaleTomanPreview" data-astro-cid-irsidq5c>معادل: استعلام تلفنی</div></div></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="editServicePriceMale" class="form-label-gold" data-astro-cid-irsidq5c>تعرفه مصوب آقایان:</label><div class="input-with-hint" data-astro-cid-irsidq5c><input type="number" id="editServicePriceMale" class="form-control-modal price-input" placeholder="مثال: ۴۰۰" min="0" step="5" data-astro-cid-irsidq5c><div class="toman-live-preview" id="editMaleTomanPreview" data-astro-cid-irsidq5c>معادل: استعلام تلفنی</div></div></div></div></div><div class="modal-actions-row services-modal-actions" data-astro-cid-irsidq5c><button type="button" id="cancelServiceBtn" class="btn-table-action btn-modal-cancel" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>انصراف</span></button><button type="submit" id="saveServiceBtn" class="btn-3d-accept btn-modal-save" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>ذخیره تغییرات خدمت و تعرفه</span></button></div></form></div></div><!-- 3D New Service Modal --><div id="newServiceModal" class="modal-backdrop services-modal-backdrop" style="display: none;" data-astro-cid-irsidq5c><div class="modal-dialog services-modal-dialog" data-astro-cid-irsidq5c><div class="modal-header-row" data-astro-cid-irsidq5c><div class="modal-title-wrap" data-astro-cid-irsidq5c><span class="modal-title-icon-gold" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 20,
		"data-astro-cid-irsidq5c": true
	})}</span><h3 class="modal-title" data-astro-cid-irsidq5c>افزودن خدمت جدید به کاتالوگ</h3></div><button type="button" id="closeNewModalX" class="modal-close-icon-btn" title="بستن" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}</button></div><p class="modal-subtitle-text" data-astro-cid-irsidq5c>تعریف ناحیه جدید لیزر، تنظیم مدت جلسه و نرخ‌گذاری همزمان تعرفه مصوب بانوان و آقایان.</p><div id="newServiceAlert" class="alert-3d-danger" style="display: none;" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}<span id="newServiceAlertText" data-astro-cid-irsidq5c></span></div><form id="newServiceForm" class="services-modal-form" data-astro-cid-irsidq5c><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceName" class="form-label-gold" data-astro-cid-irsidq5c>نام ناحیه / خدمت (فارسی):</label><input type="text" id="newServiceName" class="form-control-modal" placeholder="مثال: خط ریش و گردن آقایان" required minlength="2" maxlength="80" data-astro-cid-irsidq5c></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceSlug" class="form-label-gold" data-astro-cid-irsidq5c>شناسه یکتا (Slug انگلیسی):</label><input type="text" id="newServiceSlug" class="form-control-modal slug-input" dir="ltr" placeholder="مثال: beard-neck" required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="حروف کوچک انگلیسی و خط تیره (-) بدون فاصله" data-astro-cid-irsidq5c></div></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceDuration" class="form-label-gold" data-astro-cid-irsidq5c><span class="label-with-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>مدت زمان جلسه (دقیقه):</span></span></label><input type="number" id="newServiceDuration" class="form-control-modal" min="5" max="600" value="15" required data-astro-cid-irsidq5c></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceOrder" class="form-label-gold" data-astro-cid-irsidq5c>ترتیب نمایش در کاتالوگ:</label><input type="number" id="newServiceOrder" class="form-control-modal" min="0" max="9999"${addAttribute(nextDisplayOrder, "value")} required data-astro-cid-irsidq5c></div></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceActive" class="form-label-gold" data-astro-cid-irsidq5c>وضعیت انتشار اولیه:</label><select id="newServiceActive" class="form-control-modal" data-astro-cid-irsidq5c><option value="true" selected data-astro-cid-irsidq5c>فعال (بلافاصله منتشر شود)</option><option value="false" data-astro-cid-irsidq5c>غیرفعال (پیش‌نویس / مخفی)</option></select></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServiceShortDesc" class="form-label-gold" data-astro-cid-irsidq5c>توضیح کوتاه خدمت (اختیاری):</label><input type="text" id="newServiceShortDesc" class="form-control-modal" placeholder="مثال: خط بالا و پایین گردن با خنک‌کننده اختصاصی" maxlength="200" data-astro-cid-irsidq5c></div></div><!-- Dual Tariffs 3D Card --><div class="modal-tariffs-panel" data-astro-cid-irsidq5c><div class="tariffs-panel-header" data-astro-cid-irsidq5c><span class="tariffs-header-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}</span><span class="tariffs-header-title" data-astro-cid-irsidq5c>نرخ‌گذاری اولیه تعرفه (واحد: هزار تومان)</span></div><div class="form-grid-2col" data-astro-cid-irsidq5c><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServicePriceFemale" class="form-label-gold" data-astro-cid-irsidq5c>تعرفه مصوب بانوان:</label><div class="input-with-hint" data-astro-cid-irsidq5c><input type="number" id="newServicePriceFemale" class="form-control-modal price-input" placeholder="مثال: ۳۲۰ برای ۳۲۰٬۰۰۰ تومان" min="0" step="5" data-astro-cid-irsidq5c><div class="toman-live-preview" id="newFemaleTomanPreview" data-astro-cid-irsidq5c>معادل: استعلام تلفنی</div></div></div><div class="form-group-item" data-astro-cid-irsidq5c><label for="newServicePriceMale" class="form-label-gold" data-astro-cid-irsidq5c>تعرفه مصوب آقایان:</label><div class="input-with-hint" data-astro-cid-irsidq5c><input type="number" id="newServicePriceMale" class="form-control-modal price-input" placeholder="مثال: ۳۸۰ برای ۳۸۰٬۰۰۰ تومان" min="0" step="5" data-astro-cid-irsidq5c><div class="toman-live-preview" id="newMaleTomanPreview" data-astro-cid-irsidq5c>معادل: استعلام تلفنی</div></div></div></div></div><div class="modal-actions-row services-modal-actions" data-astro-cid-irsidq5c><button type="button" id="cancelNewServiceBtn" class="btn-table-action btn-modal-cancel" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 14,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>انصراف</span></button><button type="submit" id="saveNewServiceBtn" class="btn-3d-gold btn-modal-save" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-irsidq5c": true
	})}<span data-astro-cid-irsidq5c>ایجاد خدمت و ثبت تعرفه</span></button></div></form></div></div><!-- Toast Notification --><div id="servicesToast" class="services-toast" style="display: none;" data-astro-cid-irsidq5c><span id="toastIcon" class="toast-icon" data-astro-cid-irsidq5c>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-irsidq5c": true
	})}</span><span id="toastMessage" class="toast-message" data-astro-cid-irsidq5c></span></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/services/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/services/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/services/index.astro";
var $$url = "/admin/services";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/services/index@_@astro
var page = () => services_exports;
//#endregion
export { page };
