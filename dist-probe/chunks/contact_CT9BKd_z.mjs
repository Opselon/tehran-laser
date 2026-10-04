globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { r as resolveCanonicalOrigin } from "./canonical_ssJtZI0c.mjs";
//#region src/pages/contact.astro
var contact_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Contact,
	file: () => $$file,
	url: () => $$url
});
var $$Contact = createComponent(($$result, $$props, $$slots) => {
	const origin = resolveCanonicalOrigin();
	const contactJsonLd = {
		"@context": "https://schema.org",
		"@type": ["ContactPage", "MedicalWebPage"],
		"@id": `${origin}/contact#contact`,
		url: `${origin}/contact`,
		name: "تماس و آدرس کلینیک تهران لیزر پاسداران",
		description: "راه‌های ارتباطی، آدرس دقیق در پاسداران خیابان پایدارفرد، شماره تماس مستقیم پذیرش، مشاوره فوری در واتساپ و لوکیشن مسیریابی.",
		inLanguage: "fa-IR",
		mainEntity: { "@id": `${origin}/#clinic` },
		isPartOf: { "@id": `${origin}/#website` }
	};
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "تماس و آدرس",
		url: "/contact"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "تماس و آدرس کلینیک تهران لیزر — پاسداران، خیابان پایدارفرد",
		"description": "راه‌های ارتباطی، آدرس دقیق در پاسداران خیابان پایدارفرد، شماره تماس مستقیم پذیرش، مشاوره فوری در واتساپ و لوکیشن مسیریابی کلینیک تهران لیزر.",
		"canonicalUrl": "/contact",
		"keywords": [
			"تماس کلینیک تهران لیزر",
			"آدرس لیزر پاسداران",
			"شماره تلفن لیزر پایدارفرد",
			"واتساپ کلینیک لیزر تهران"
		],
		"jsonLd": [contactJsonLd, breadcrumbJsonLd],
		"theme": "dark",
		"data-astro-cid-6bfsojfh": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="contact-page-wrapper" data-astro-cid-6bfsojfh><!-- Header Hero --><div class="contact-hero-strip" data-astro-cid-6bfsojfh><div class="container text-center" data-astro-cid-6bfsojfh><div class="luxury-badge" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14,
		"class": "badge-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>ارتباط مستقیم با مرکز تخصصی پاسداران</span></div><h1 class="page-title" data-astro-cid-6bfsojfh>تماس با کلینیک تهران لیزر</h1><p class="page-subtitle" data-astro-cid-6bfsojfh>تیم پذیرش و مشاورین پوست و لیزر ما همه‌روزه در ساعات کاری آماده پاسخگویی، مشاوره تخصصی و راهنمایی شما هستند</p><!-- Live Operating Status Indicator --><div class="live-status-pill" id="liveStatusPill" data-astro-cid-6bfsojfh><span class="status-dot" data-astro-cid-6bfsojfh></span><span class="status-text" id="liveStatusText" data-astro-cid-6bfsojfh>ساعات پاسخگویی: شنبه تا چهارشنبه ۹ الی ۲۰ | پنجشنبه ۹ الی ۱۸</span></div></div></div><!-- Main Content Section --><section class="contact-main-section" data-astro-cid-6bfsojfh><div class="container container-contact" data-astro-cid-6bfsojfh><!-- 3 Primary Communication Cards --><div class="contact-cards-grid" data-astro-cid-6bfsojfh><!-- Card 1: Direct Phone Call --><div class="contact-glass-card phone-card" data-astro-cid-6bfsojfh><div class="card-icon-wrap gold-glow" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 26,
		"class": "card-icon",
		"data-astro-cid-6bfsojfh": true
	})}</div><h3 class="card-title" data-astro-cid-6bfsojfh>تماس تلفنی مستقیم</h3><p class="card-desc" data-astro-cid-6bfsojfh>رزرو تلفنی سریع، پیگیری پرونده، مشاوره اولیه و استعلام تعرفه اختصاصی آقایان</p><div class="card-actions-box" data-astro-cid-6bfsojfh><a href="tel:+989035555090" class="btn-contact-gold dial-link" dir="ltr" aria-label="تماس مستقیم با 09035555090" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>+98 903 555 5090</span></a><button type="button" class="btn-contact-outline copy-trigger-btn" data-copy="09035555090" data-label="شماره تلفن" aria-label="کپی شماره تلفن کلینیک" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 15,
		"class": "btn-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span class="btn-text" data-astro-cid-6bfsojfh>کپی شماره تماس</span></button></div><div class="card-footer-meta" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>پاسخگویی سریع توسط مشاورین پذیرش</span></div></div><!-- Card 2: WhatsApp Instant Consultation --><div class="contact-glass-card whatsapp-card" data-astro-cid-6bfsojfh><div class="card-icon-wrap emerald-glow" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 26,
		"class": "card-icon",
		"data-astro-cid-6bfsojfh": true
	})}</div><div class="card-badge-instant" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 12,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>پاسخگویی آنلاین</span></div><h3 class="card-title" data-astro-cid-6bfsojfh>مشاوره فوری در واتساپ</h3><p class="card-desc" data-astro-cid-6bfsojfh>مشاوره نوع پوست و مو، استعلام تخفیف‌ها، ارسال عکس و دریافت لوکیشن مستقیم</p><div class="whatsapp-triggers-list" data-astro-cid-6bfsojfh><a href="https://wa.me/989035555090?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%AC%D9%87%D8%AA%20%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D9%87%20%D9%88%20%D8%B1%D8%B2%D8%B1%D9%88%20%D9%86%D9%88%D8%A8%D8%AA%20%D9%84%DB%8C%D8%B2%D8%B1%20%D9%BE%DB%8C%D8%A7%D9%85%20%D9%85%DB%8C%E2%80%8C%D8%AF%D9%87%D9%85." target="_blank" rel="noopener noreferrer" class="btn-contact-gold wa-main-btn" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 16,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>شروع گفتگوی فوری و مشاوره</span></a><div class="quick-wa-chips" data-astro-cid-6bfsojfh><a href="https://wa.me/989035555090?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%AC%D9%87%D8%AA%20%D8%A7%D8%B3%D8%AA%D8%B9%D9%84%D8%A7%D9%85%20%D8%AA%D8%B9%D8%B1%D9%81%D9%87%20%D9%88%20%D9%86%D9%88%D8%A8%D8%AA%E2%80%8C%D8%AF%D9%87%DB%8C%20%D9%84%D8%A7%DB%8C%D9%86%20%D8%A2%D9%82%D8%A7%DB%8C%D8%A7%D9%86%20%D9%BE%DB%8C%D8%A7%D9%85%20%D9%85%DB%8C%E2%80%8C%D8%AF%D9%87%D9%85." target="_blank" rel="noopener noreferrer" class="wa-chip" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 12,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>استعلام تعرفه آقایان</span></a><a href="https://wa.me/989035555090?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D9%84%D8%B7%D9%81%D8%A7%D9%8B%20%D9%84%D9%88%DA%A9%DB%8C%D8%B4%D9%86%20%D8%AF%D9%82%DB%8C%D9%82%20%DA%A9%D9%84%DB%8C%D9%86%DB%8C%DA%A9%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86%20%D9%84%DB%8C%D8%B2%D8%B1%20%D8%B1%D8%A7%20%D8%A7%D8%B1%D8%B3%D8%A7%D9%84%20%D9%81%D8%B1%D9%85%D8%A7%DB%8C%DB%8C%D8%AF." target="_blank" rel="noopener noreferrer" class="wa-chip" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 12,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>ارسال لوکیشن در واتساپ</span></a></div></div><div class="card-footer-meta" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 13,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>پاسخگویی آنلاین در کمتر از ۱۵ دقیقه</span></div></div><!-- Card 3: Telegram & Social Channels --><div class="contact-glass-card social-card" data-astro-cid-6bfsojfh><div class="card-icon-wrap sapphire-glow" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 26,
		"class": "card-icon",
		"data-astro-cid-6bfsojfh": true
	})}</div><h3 class="card-title" data-astro-cid-6bfsojfh>کانال تلگرام و رسانه‌ها</h3><p class="card-desc" data-astro-cid-6bfsojfh>اطلاع‌رسانی جشنواره‌های ماهانه، تخفیف‌های لحظه‌ای و محتوای علمی مراقبت از پوست</p><div class="social-links-stack" data-astro-cid-6bfsojfh><a href="https://t.me/tehranlaser_clinic" target="_blank" rel="noopener noreferrer" class="btn-contact-outline social-link-item" data-astro-cid-6bfsojfh><div class="social-btn-inner" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "send",
		"size": 16,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>عضویت در کانال تلگرام</span></div>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 14,
		"class": "ext-icon",
		"data-astro-cid-6bfsojfh": true
	})}</a><a href="https://instagram.com/tehranlaser" target="_blank" rel="noopener noreferrer" class="btn-contact-outline social-link-item" data-astro-cid-6bfsojfh><div class="social-btn-inner" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "camera",
		"size": 16,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>صفحه اینستاگرام کلینیک</span></div>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 14,
		"class": "ext-icon",
		"data-astro-cid-6bfsojfh": true
	})}</a></div><div class="card-footer-meta" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 13,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>کدهای تخفیف فصلی ویژه اعضای کانال</span></div></div></div><!-- Address & Navigation Card (Hub) --><div class="contact-glass-card location-hub-card mt-5" data-astro-cid-6bfsojfh><div class="location-header-row" data-astro-cid-6bfsojfh><div class="location-title-group" data-astro-cid-6bfsojfh><div class="card-icon-wrap gold-glow sm" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 22,
		"class": "card-icon",
		"data-astro-cid-6bfsojfh": true
	})}</div><div data-astro-cid-6bfsojfh><h2 class="location-card-title" data-astro-cid-6bfsojfh>نشانی حضوری و نقشه کلینیک تهران لیزر</h2><p class="location-card-subtitle" data-astro-cid-6bfsojfh>دسترسی سرراست و بدون ترافیک در منطقه پاسداران تهران</p></div></div><div class="copy-address-action" data-astro-cid-6bfsojfh><button type="button" class="btn-contact-outline copy-trigger-btn copy-address-btn" data-copy="تهران، خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم، کلینیک تهران لیزر" data-label="نشانی کامل" aria-label="کپی نشانی کامل کلینیک" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 16,
		"class": "btn-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span class="btn-text" data-astro-cid-6bfsojfh>کپی نشانی کامل</span></button></div></div><div class="address-highlight-box" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 20,
		"class": "pin-gold",
		"data-astro-cid-6bfsojfh": true
	})}<span class="address-main-text" data-astro-cid-6bfsojfh>تهران، خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم</span></div><!-- Quick Navigation Apps --><div class="navigation-apps-container" data-astro-cid-6bfsojfh><span class="nav-apps-label" data-astro-cid-6bfsojfh>مسیریابی هوشمند با اپلیکیشن‌های نقشه:</span><div class="nav-apps-grid" data-astro-cid-6bfsojfh><a href="https://nshn.ir" target="_blank" rel="noopener noreferrer" class="nav-app-btn" aria-label="مسیریابی در نشان" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 15,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>مسیریابی با نشان</span></a><a href="https://balad.ir/location?latitude=35.7645&longitude=51.4628" target="_blank" rel="noopener noreferrer" class="nav-app-btn" aria-label="مسیریابی در بلد" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 15,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>مسیریابی با بلد</span></a><a href="https://maps.google.com/?q=35.7645,51.4628+(Tehran+Laser+Clinic)" target="_blank" rel="noopener noreferrer" class="nav-app-btn" aria-label="مسیریابی در گوگل مپ" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 15,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>Google Maps</span></a><a href="https://waze.com/ul?ll=35.7645,51.4628&navigate=yes" target="_blank" rel="noopener noreferrer" class="nav-app-btn" aria-label="مسیریابی در ویز" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 15,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>Waze</span></a></div></div><!-- Stylized Dark 3D Obsidian Visual Map --><div class="map-visual-container" data-astro-cid-6bfsojfh><div class="map-visual-bg" data-astro-cid-6bfsojfh><div class="map-grid-overlay" data-astro-cid-6bfsojfh></div><div class="map-pin-pulse" data-astro-cid-6bfsojfh><div class="pulse-ring" data-astro-cid-6bfsojfh></div><div class="pulse-ring delay" data-astro-cid-6bfsojfh></div><div class="pin-marker" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 24,
		"data-astro-cid-6bfsojfh": true
	})}</div><div class="pin-popup" data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>کلینیک تهران لیزر</strong><span data-astro-cid-6bfsojfh>پاسداران، نبش بوستان ۷</span></div></div><div class="map-coords-badge" data-astro-cid-6bfsojfh><span data-astro-cid-6bfsojfh>35.7645° N, 51.4628° E</span></div></div></div><!-- Access and Parking Guide --><div class="access-guide-grid" data-astro-cid-6bfsojfh><div class="access-guide-item" data-astro-cid-6bfsojfh><div class="access-icon-col" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 20,
		"class": "text-gold",
		"data-astro-cid-6bfsojfh": true
	})}</div><div class="access-text-col" data-astro-cid-6bfsojfh><h4 class="access-item-title" data-astro-cid-6bfsojfh>ساعات کاری و پذیرش کلینیک</h4><p class="access-item-desc" data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>شنبه تا چهارشنبه:</strong> ۹:۰۰ صبح الی ۲۰:۰۰ شب<br data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>پنجشنبه‌ها:</strong> ۹:۰۰ صبح الی ۱۸:۰۰ عصر<br data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>جمعه‌ها و تعطیلات رسمی:</strong> تعطیل (پشتیبانی واتساپ فعال)</p></div></div><div class="access-guide-item" data-astro-cid-6bfsojfh><div class="access-icon-col" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 20,
		"class": "text-gold",
		"data-astro-cid-6bfsojfh": true
	})}</div><div class="access-text-col" data-astro-cid-6bfsojfh><h4 class="access-item-title" data-astro-cid-6bfsojfh>راهنمای دسترسی و پارکینگ</h4><p class="access-item-desc" data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>دسترسی خودرو:</strong> دسترسی روان از بزرگراه صیاد شیرازی و شهید همت به پاسداران.<br data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>جای پارک:</strong> امکان پارک خودرو در خیابان پایدارفرد و بوستان هفتم فراهم است.<br data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>مترو:</strong> ایستگاه میدان نوبنیاد (خط ۳) یا شریعتی + تاکسی خطی پاسداران.</p></div></div></div></div><!-- Official Bank / Sheba Account Details Card (Copyable) --><div class="contact-glass-card sheba-details-card mt-5" data-astro-cid-6bfsojfh><div class="sheba-header-row" data-astro-cid-6bfsojfh><div class="sheba-title-group" data-astro-cid-6bfsojfh><div class="card-icon-wrap gold-glow sm" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 22,
		"class": "card-icon",
		"data-astro-cid-6bfsojfh": true
	})}</div><div data-astro-cid-6bfsojfh><h2 class="sheba-card-title" data-astro-cid-6bfsojfh>اطلاعات حساب و شماره شبا جهت واریز بیعانه</h2><p class="sheba-card-subtitle" data-astro-cid-6bfsojfh>اطلاعات حساب رسمی کلینیک جهت بیعانه رزرو نوبت، تسویه و پیش‌پرداخت پکیج‌ها</p></div></div><div class="sheba-security-tag" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>حساب رسمی معتبر</span></div></div><div class="sheba-items-grid" data-astro-cid-6bfsojfh><!-- Account Owner & Bank --><div class="sheba-item" data-astro-cid-6bfsojfh><div class="sheba-item-head" data-astro-cid-6bfsojfh><span class="sheba-label" data-astro-cid-6bfsojfh>صاحب حساب رسمی:</span></div><div class="sheba-value-display" data-astro-cid-6bfsojfh><strong data-astro-cid-6bfsojfh>کلینیک تخصصی تهران لیزر (مدیریت مالی)</strong><span class="bank-name" data-astro-cid-6bfsojfh>بانک سامان / ملت</span></div></div><!-- Card Number --><div class="sheba-item" data-astro-cid-6bfsojfh><div class="sheba-item-head" data-astro-cid-6bfsojfh><span class="sheba-label" data-astro-cid-6bfsojfh>شماره کارت:</span><button type="button" class="btn-copy-chip copy-trigger-btn" data-copy="6104337890123456" data-label="شماره کارت" aria-label="کپی شماره کارت" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"class": "btn-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span class="btn-text" data-astro-cid-6bfsojfh>کپی کارت</span></button></div><div class="sheba-value-display code-font" dir="ltr" data-astro-cid-6bfsojfh><span data-astro-cid-6bfsojfh>6104-3378-9012-3456</span></div></div><!-- Sheba IBAN Number --><div class="sheba-item sheba-item-full" data-astro-cid-6bfsojfh><div class="sheba-item-head" data-astro-cid-6bfsojfh><span class="sheba-label" data-astro-cid-6bfsojfh>شماره شبا (IBAN):</span><button type="button" class="btn-copy-chip copy-trigger-btn" data-copy="IR820120000000001234567890" data-label="شماره شبا" aria-label="کپی شماره شبا" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 14,
		"class": "btn-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span class="btn-text" data-astro-cid-6bfsojfh>کپی شبا</span></button></div><div class="sheba-value-display code-font sheba-code" dir="ltr" data-astro-cid-6bfsojfh><span data-astro-cid-6bfsojfh>IR82 0120 0000 0000 1234 5678 90</span></div></div></div><div class="sheba-notice-box" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 16,
		"class": "info-icon",
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>نکته مهم: لطفاً پس از واریز بیعانه، تصویر رسید یا شناسه پیگیری را در واتساپ ارسال فرمایید تا نوبت شما بلافاصله در سامانه قطعی گردد.</span></div></div><!-- Bottom Quick Action Strip --><div class="contact-bottom-cta mt-5" data-astro-cid-6bfsojfh><div class="cta-inner" data-astro-cid-6bfsojfh><div class="cta-text" data-astro-cid-6bfsojfh><h3 class="cta-title" data-astro-cid-6bfsojfh>آماده رزرو نوبت خود هستید؟</h3><p class="cta-desc" data-astro-cid-6bfsojfh>رزرو اینترنتی شامل ۱۵٪ تخفیف ویژه پکیج کل بدن می‌باشد</p></div><div class="cta-buttons" data-astro-cid-6bfsojfh><a href="/booking" class="btn-contact-gold cta-book-btn" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>رزرو آنلاین نوبت (با تخفیف)</span></a><a href="/faq" class="btn-contact-outline" data-astro-cid-6bfsojfh>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 18,
		"data-astro-cid-6bfsojfh": true
	})}<span data-astro-cid-6bfsojfh>مشاهده سوالات متداول</span></a></div></div></div></div></section></div><script>
    // Copy to clipboard with visual feedback
    document.querySelectorAll('.copy-trigger-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var textToCopy = btn.getAttribute('data-copy');
        var label = btn.getAttribute('data-label') || '';
        var btnTextEl = btn.querySelector('.btn-text');
        var originalText = btnTextEl ? btnTextEl.textContent : '';

        if (!textToCopy) return;

        function showSuccess() {
          btn.classList.add('copied-success');
          if (btnTextEl) btnTextEl.textContent = 'کپی شد!';
          setTimeout(function() {
            btn.classList.remove('copied-success');
            if (btnTextEl) btnTextEl.textContent = originalText;
          }, 2000);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(function() {
            fallbackCopy(textToCopy, showSuccess);
          });
        } else {
          fallbackCopy(textToCopy, showSuccess);
        }
      });
    });

    function fallbackCopy(text, cb) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        if (typeof document.execCommand === 'function') {
          document.execCommand('copy');
        }
        cb();
      } catch (e) {
        console.error('Copy failed', e);
      }
      document.body.removeChild(textarea);
    }

    // Live clinic opening status checker (Asia/Tehran timezone)
    function updateClinicStatus() {
      try {
        var now = new Date();
        var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        var tehranDate = new Date(utc + (3.5 * 3600000));
        var day = tehranDate.getDay(); // 0 is Sunday, 6 is Saturday
        var hour = tehranDate.getHours();
        var minute = tehranDate.getMinutes();
        var timeDecimal = hour + (minute / 60);

        var isOpen = false;
        var statusMsg = '';

        if (day === 5) {
          // Friday
          isOpen = false;
          statusMsg = 'جمعه: کلینیک تعطیل است (پاسخگویی آنلاین واتساپ فعال)';
        } else if (day === 4) {
          // Thursday: 9:00 - 18:00
          if (timeDecimal >= 9 && timeDecimal < 18) {
            isOpen = true;
            statusMsg = 'هم‌اکنون کلینیک باز است (پاسخگویی تلفنی و حضوری تا ۱۸:۰۰)';
          } else {
            isOpen = false;
            statusMsg = 'کلینیک اکنون خارج از ساعت کاری است (بازگشایی: شنبه ۹ صبح)';
          }
        } else {
          // Saturday to Wednesday: 9:00 - 20:00
          if (timeDecimal >= 9 && timeDecimal < 20) {
            isOpen = true;
            statusMsg = 'هم‌اکنون کلینیک باز است (پاسخگویی تلفنی و پذیرش تا ۲۰:۰۰)';
          } else {
            isOpen = false;
            statusMsg = 'کلینیک اکنون خارج از ساعت کاری است (بازگشایی: فردا ۹ صبح)';
          }
        }

        var pill = document.getElementById('liveStatusPill');
        var textEl = document.getElementById('liveStatusText');
        if (pill && textEl) {
          if (isOpen) {
            pill.classList.add('status-open');
            pill.classList.remove('status-closed');
          } else {
            pill.classList.add('status-closed');
            pill.classList.remove('status-open');
          }
          textEl.textContent = statusMsg;
        }
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
    updateClinicStatus();
  <\/script>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/contact.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/contact.astro";
var $$url = "/contact";
//#endregion
//#region \0virtual:astro:page:src/pages/contact@_@astro
var page = () => contact_exports;
//#endregion
export { page };
