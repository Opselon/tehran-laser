globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, _ as addAttribute, c as Fragment, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { a as createMedicalProcedureSchema, r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { r as findPublicServiceBySlug } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/services/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug } = Astro.params;
	if (!slug) return Astro.redirect("/services");
	const service = await findPublicServiceBySlug(env.DB, slug);
	if (!service) return Astro.redirect("/404");
	const femalePrice = service.prices.find((p) => p.pricingCategory === "female");
	const malePrice = service.prices.find((p) => p.pricingCategory === "male");
	const isPromo = service.slug === "full-body";
	const basePrice = femalePrice?.amount ?? 0;
	function formatToman(amountInThousands) {
		return (amountInThousands * 1e3).toLocaleString("fa-IR");
	}
	const meta = {
		"full-body": {
			wavelength: "الکساندرایت ۷۵۵nm + ان‌دی‌یاگ ۱۰۶۴nm",
			wavelengthShort: "دو طول موج (Dual)",
			sessions: "۶ الی ۸ جلسه",
			interval: "۶ الی ۸ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
		},
		face: {
			wavelength: "الکساندرایت ۷۵۵nm",
			wavelengthShort: "۷۵۵nm",
			sessions: "۶ الی ۸ جلسه",
			interval: "۴ الی ۵ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
		},
		underarm: {
			wavelength: "الکساندرایت ۷۵۵nm",
			wavelengthShort: "۷۵۵nm",
			sessions: "۶ الی ۸ جلسه",
			interval: "۵ الی ۶ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "رفع تیرگی ناشی از شیو"
		},
		bikini: {
			wavelength: "الکساندرایت ۷۵۵nm",
			wavelengthShort: "۷۵۵nm",
			sessions: "۶ الی ۸ جلسه",
			interval: "۶ الی ۸ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
		},
		"full-legs": {
			wavelength: "الکساندرایت ۷۵۵nm",
			wavelengthShort: "۷۵۵nm",
			sessions: "۶ الی ۸ جلسه",
			interval: "۶ الی ۸ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
		},
		"full-arms": {
			wavelength: "الکساندرایت ۷۵۵nm",
			wavelengthShort: "۷۵۵nm",
			sessions: "۶ الی ۸ جلسه",
			interval: "۵ الی ۷ هفته",
			painLevel: "بدون درد (کرایو DCD)",
			results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
		}
	}[service.slug] ?? {
		wavelength: "الکساندرایت ۷۵۵nm",
		wavelengthShort: "۷۵۵nm",
		sessions: "۶ الی ۸ جلسه",
		interval: "۵ الی ۸ هفته",
		painLevel: "بدون درد (کرایو DCD)",
		results: "کاهش دائمی ۸۵٪ الی ۹۵٪"
	};
	const promoFinalPrice = 1940;
	const promoOriginalPrice = 2290;
	const isDualWavelength = meta.wavelengthShort.includes("دو طول موج") || meta.wavelengthShort.includes("Dual");
	const serviceJsonLdArray = [createMedicalProcedureSchema({
		name: service.name,
		slug: service.slug,
		description: service.description,
		durationMinutes: service.durationMinutes,
		price: (isPromo ? promoFinalPrice : basePrice) * 1e3 || void 0
	}), createBreadcrumbSchema([
		{
			name: "صفحه اصلی",
			url: "/"
		},
		{
			name: "خدمات و تعرفه‌ها",
			url: "/services"
		},
		{
			name: service.name,
			url: `/services/${service.slug}`
		}
	])];
	const careSteps = [
		"ناحیه مورد نظر را ۲۴ ساعت قبل از مراجعه صرفاً با ژیلت شیو فرمایید.",
		"از حداقل ۲ الی ۴ هفته پیش از جلسه از وکس، اپیلاسیون یا بندانداختن خودداری فرمایید.",
		"پوست ناحیه لیزر باید عاری از هرگونه کرم، لوسیون، مام یا ضدآفتاب باشد.",
		"در صورت مصرف داروهای خاص (مانند راکوتان)، لطفاً به اپراتور کلینیک اطلاع دهید."
	];
	const afterCareSteps = [
		"تا ۲۴ ساعت پس از جلسه از دوش آب داغ، سونا و استخر خودداری فرمایید.",
		"از کرم آلوئه‌ورا و زینک اکساید برای تسکین و آبرسانی پوست استفاده کنید.",
		"فعالیت ورزشی سنگین را تا ۲۴ ساعت به تعویق بیندازید.",
		"در معرض تابش مستقیم آفتاب قرار نگیرید و از ضدآفتاب استفاده کنید."
	];
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": `لیزر ${service.name} در پاسداران — تعرفه و رزرو | کلینیک تهران لیزر`,
		"description": `خدمات تخصصی لیزر ${service.name} در کلینیک تهران لیزر پاسداران. مدت زمان ${service.durationMinutes} دقیقه، اپراتور مجرب، دستگاه خنک‌کننده بدون درد و تعرفه مصوب.`,
		"canonicalUrl": `/services/${service.slug}`,
		"jsonLd": serviceJsonLdArray,
		"data-astro-cid-njl2q4gy": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="detail-hero" data-astro-cid-njl2q4gy><div class="container hero-container" data-astro-cid-njl2q4gy><nav class="detail-breadcrumbs" aria-label="مسیر صفحه" data-astro-cid-njl2q4gy><a href="/" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronLeft",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>صفحه اصلی</span></a><span class="bc-sep" data-astro-cid-njl2q4gy>/</span><a href="/services" data-astro-cid-njl2q4gy>خدمات و تعرفه‌ها</a><span class="bc-sep" data-astro-cid-njl2q4gy>/</span><span class="bc-current" data-astro-cid-njl2q4gy>${service.name}</span></nav><div class="hero-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>تعرفه مصوب و شفاف — کلینیک تهران لیزر پاسداران</span></div><h1 class="hero-title" data-astro-cid-njl2q4gy>لیزر تخصصی <span class="gold-gradient" data-astro-cid-njl2q4gy>${service.name}</span></h1><p class="hero-subtitle" data-astro-cid-njl2q4gy>ارائه خدمات با مدرن‌ترین تجهیزات خنک‌کننده و بالاترین استاندارد بهداشتی در منطقه پاسداران</p><!-- Candela GentleMax Pro Technology Badges --><div class="tech-badges-strip" data-astro-cid-njl2q4gy><div class="tech-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>کندلا جنتل‌مکس پرو ۲۰۲۴ (Candela USA)</span></div><div class="tech-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>طول موج ${meta.wavelengthShort} — دستگاه اصل آمریکا</span></div><div class="tech-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>کولینگ کرایو DCD منهای ۳۰ درجه بدون درد</span></div></div></div></section><section class="section detail-section" data-astro-cid-njl2q4gy><div class="container detail-grid" data-astro-cid-njl2q4gy><!-- ════════════ MAIN: 3D Service Detail Card ════════════ --><div class="service-detail-card" data-astro-cid-njl2q4gy><div class="detail-header-row" data-astro-cid-njl2q4gy><div class="detail-header-text" data-astro-cid-njl2q4gy><span class="badge-gold" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "services",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>خدمات پوست و لیزر</span></span><h2 class="service-full-name" data-astro-cid-njl2q4gy>${service.name}</h2></div><div class="duration-pill" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>مدت جلسه:</span><strong data-astro-cid-njl2q4gy>${service.durationMinutes} دقیقه</strong></div></div><p class="service-long-description" data-astro-cid-njl2q4gy>${service.description}</p><!-- ════ Obsidian Pricing Tiers (Female / Male) ════ --><div class="pricing-tier-card" data-astro-cid-njl2q4gy><div class="tier-card-title" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "wallet",
		"size": 17,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>تعرفه‌های مصوب رزرو آنلاین</span></div><!-- Women's tier --><div${addAttribute(`tier-row ${isPromo ? "tier-row-promo" : ""}`, "class:list")} data-astro-cid-njl2q4gy><div class="tier-row-head" data-astro-cid-njl2q4gy><span class="tier-icon" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}</span><span class="tier-label" data-astro-cid-njl2q4gy>تعرفه بخش بانوان</span>${isPromo && renderTemplate`<span class="tier-promo-chip" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 11,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>۱۵٪ تخفیف سایت</span></span>`}</div><div class="tier-value" data-astro-cid-njl2q4gy>${femalePrice ? isPromo ? renderTemplate`<div class="promo-price-block" data-astro-cid-njl2q4gy><span class="strikethrough-price" data-astro-cid-njl2q4gy>${formatToman(promoOriginalPrice)}</span><span class="promo-final-price" data-astro-cid-njl2q4gy>${formatToman(promoFinalPrice)}</span><span class="price-currency" data-astro-cid-njl2q4gy>تومان / هر جلسه</span></div>` : renderTemplate`<div class="price-block" data-astro-cid-njl2q4gy><span class="final-price" data-astro-cid-njl2q4gy>${formatToman(basePrice)}</span><span class="price-currency" data-astro-cid-njl2q4gy>تومان / هر جلسه</span></div>` : renderTemplate`<span class="tier-note" data-astro-cid-njl2q4gy>استعلام تلفنی</span>`}</div></div>${femalePrice && renderTemplate`<div class="session-cost-note" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>هزینه تقریبی دوره کامل (۶ تا ۸ جلسه):${" "}<strong data-astro-cid-njl2q4gy>${formatToman((isPromo ? promoFinalPrice : basePrice) * 6)} تا${" "}${formatToman((isPromo ? promoFinalPrice : basePrice) * 8)} تومان</strong></span></div>`}<!-- Men's tier --><div class="tier-row" data-astro-cid-njl2q4gy><div class="tier-row-head" data-astro-cid-njl2q4gy><span class="tier-icon" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 15,
		"data-astro-cid-njl2q4gy": true
	})}</span><span class="tier-label" data-astro-cid-njl2q4gy>تعرفه بخش آقایان</span></div><div class="tier-value" data-astro-cid-njl2q4gy>${malePrice ? renderTemplate`<div class="price-block" data-astro-cid-njl2q4gy><span class="final-price" data-astro-cid-njl2q4gy>${formatToman(malePrice.amount)}</span><span class="price-currency" data-astro-cid-njl2q4gy>تومان / هر جلسه</span></div>` : renderTemplate`<span class="tier-note" data-astro-cid-njl2q4gy>استعلام قیمت بر اساس تراکم و وسعت در کلینیک یا تماس تلفنی</span>`}</div></div><div class="tier-foot-note" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>تمامی تعرفه‌ها شامل سری شخصی یکبار مصرف، کولینگ کرایو و نظارت پزشک می‌باشد.</span></div></div><!-- ════ Candela Wavelength Badge ════ --><div class="wavelength-card" data-astro-cid-njl2q4gy><div class="wavelength-card-head" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 18,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>طول موج دستگاه کندلا جنتل‌مکس پرو</span></div><div class="wavelength-badges" data-astro-cid-njl2q4gy>${isDualWavelength ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<span class="wave-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>الکساندرایت ۷۵۵nm</span></span><span class="wave-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>ان‌دی‌یاگ Nd:YAG ۱۰۶۴nm</span></span>` })}` : renderTemplate`<span class="wave-badge" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 13,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>${meta.wavelength}</span></span>`}</div><p class="wavelength-desc" data-astro-cid-njl2q4gy>طول موج الکساندرایت ۷۵۵ نانومتر با بیشترین میزان جذب ملانین، ریشه‌های موی ضخیم و سیاه را هدف قرار می‌دهد؛ همزمان سیستم کولینگ داینامیک (DCD) با شات گاز مبرد منهای ۳۰ درجه، پوست را بی‌حس کرده و درد و ریسک سوختگی را به صفر می‌رساند.</p></div><!-- ════ Clinical Session Recommendations ════ --><div class="sessions-card" data-astro-cid-njl2q4gy><div class="sessions-card-head" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>توصیه‌های بالینی تعداد جلسات</span></div><div class="sessions-grid" data-astro-cid-njl2q4gy><div class="session-cell" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span class="cell-label" data-astro-cid-njl2q4gy>تعداد جلسات:</span><strong data-astro-cid-njl2q4gy>${meta.sessions}</strong></div><div class="session-cell" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span class="cell-label" data-astro-cid-njl2q4gy>فاصله جلسات:</span><strong data-astro-cid-njl2q4gy>${meta.interval}</strong></div><div class="session-cell" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span class="cell-label" data-astro-cid-njl2q4gy>میزان درد:</span><strong data-astro-cid-njl2q4gy>${meta.painLevel}</strong></div><div class="session-cell" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span class="cell-label" data-astro-cid-njl2q4gy>نتیجه مورد انتظار:</span><strong data-astro-cid-njl2q4gy>${meta.results}</strong></div></div></div><!-- ════ Preparation ════ --><div class="care-card" data-astro-cid-njl2q4gy><div class="care-card-head" data-astro-cid-njl2q4gy><div class="icon-circle-gold" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 20,
		"data-astro-cid-njl2q4gy": true
	})}</div><div data-astro-cid-njl2q4gy><h3 class="care-title" data-astro-cid-njl2q4gy>مراقبت‌های ضروری پیش از جلسه لیزر ${service.name}</h3><p class="care-subtitle" data-astro-cid-njl2q4gy>رعایت این موارد بازدهی جلسه را به حداکثر می‌رساند</p></div></div><ul class="care-list" data-astro-cid-njl2q4gy>${careSteps.map((step) => renderTemplate`<li data-astro-cid-njl2q4gy><span class="care-check" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-njl2q4gy": true
	})}</span><span data-astro-cid-njl2q4gy>${step}</span></li>`)}</ul></div><!-- ════ Aftercare ════ --><div class="care-card" data-astro-cid-njl2q4gy><div class="care-card-head" data-astro-cid-njl2q4gy><div class="icon-circle-gold" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 20,
		"data-astro-cid-njl2q4gy": true
	})}</div><div data-astro-cid-njl2q4gy><h3 class="care-title" data-astro-cid-njl2q4gy>مراقبت‌های پس از جلسه لیزر</h3><p class="care-subtitle" data-astro-cid-njl2q4gy>برای جلوگیری از تحریک و تسریع بهبودی پوست</p></div></div><ul class="care-list" data-astro-cid-njl2q4gy>${afterCareSteps.map((step) => renderTemplate`<li data-astro-cid-njl2q4gy><span class="care-check" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-njl2q4gy": true
	})}</span><span data-astro-cid-njl2q4gy>${step}</span></li>`)}</ul></div><!-- ════ Booking Actions ════ --><div class="detail-actions" data-astro-cid-njl2q4gy><a${addAttribute(`/booking?service=${service.slug}`, "href")} class="btn-3d-gold btn-block" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>رزرو آنلاین نوبت برای ${service.name}</span></a><div class="actions-row" data-astro-cid-njl2q4gy><a href="tel:+989****5090" class="btn-3d-subtle" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>مشاوره تلفنی</span></a><a href="/services" class="btn-3d-subtle" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronRight",
		"size": 16,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>بازگشت به لیست خدمات</span></a></div></div></div><!-- ════════════ SIDEBAR: Sticky Summary ════════════ --><aside class="detail-sidebar" aria-label="خلاصه خدمت" data-astro-cid-njl2q4gy><div class="sidebar-card" data-astro-cid-njl2q4gy><div class="sidebar-head" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 17,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>خلاصه خدمت</span></div><ul class="sidebar-list" data-astro-cid-njl2q4gy><li data-astro-cid-njl2q4gy><span class="sb-label" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})} مدت جلسه</span><strong data-astro-cid-njl2q4gy>${service.durationMinutes} دقیقه</strong></li><li data-astro-cid-njl2q4gy><span class="sb-label" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})} تعداد جلسات</span><strong data-astro-cid-njl2q4gy>${meta.sessions}</strong></li><li data-astro-cid-njl2q4gy><span class="sb-label" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})} طول موج</span><strong data-astro-cid-njl2q4gy>${meta.wavelengthShort}</strong></li><li data-astro-cid-njl2q4gy><span class="sb-label" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})} کولینگ</span><strong data-astro-cid-njl2q4gy>کرایو DCD</strong></li><li data-astro-cid-njl2q4gy><span class="sb-label" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})} دستگاه</span><strong data-astro-cid-njl2q4gy>جنتل‌مکس پرو ۲۰۲۴</strong></li></ul><div class="sidebar-price-box" data-astro-cid-njl2q4gy><span class="sb-price-label" data-astro-cid-njl2q4gy>تعرفه مصوب بانوان:</span>${femalePrice ? isPromo ? renderTemplate`<div class="sb-promo" data-astro-cid-njl2q4gy><span class="sb-old" data-astro-cid-njl2q4gy>${formatToman(promoOriginalPrice)}</span><span class="sb-final" data-astro-cid-njl2q4gy>${formatToman(promoFinalPrice)} تومان</span></div>` : renderTemplate`<span class="sb-final" data-astro-cid-njl2q4gy>${formatToman(basePrice)} تومان</span>` : renderTemplate`<span class="sb-note" data-astro-cid-njl2q4gy>استعلام تلفنی</span>`}</div><a${addAttribute(`/booking?service=${service.slug}`, "href")} class="btn-3d-gold btn-block" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 17,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>رزرو نوبت</span></a><div class="sidebar-trust" data-astro-cid-njl2q4gy><div class="trust-item" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>سری شخصی یکبار مصرف</span></div><div class="trust-item" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>ضمانت کیفیت کلینیکال</span></div><div class="trust-item" data-astro-cid-njl2q4gy>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 14,
		"data-astro-cid-njl2q4gy": true
	})}<span data-astro-cid-njl2q4gy>اپراتور دارای مدرک بین‌المللی</span></div></div></div></aside></div></section>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/services/[slug].astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/services/[slug].astro";
var $$url = "/services/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/services/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
