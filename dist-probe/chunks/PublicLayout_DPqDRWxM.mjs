globalThis.process ??= {};
globalThis.process.env ??= {};
import { D as createAstro, T as unescapeHTML, _ as addAttribute, d as renderSlot, g as renderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
/* empty css                    */
import { n as buildCanonicalUrl, r as resolveCanonicalOrigin, t as DEFAULT_CANONICAL_ORIGIN } from "./canonical_ssJtZI0c.mjs";
//#region src/lib/seo/schema.ts
/**
* Comprehensive Schema.org JSON-LD Structured Data Generators for Tehran Laser Clinic
*
* Implements Google-compliant schema specifications for:
* - MedicalClinic & MedicalBusiness
* - MedicalProcedure / HealthAndBeautyBusiness (Candela GentleMax Pro)
* - FAQPage
* - BreadcrumbList
* - Article & MedicalWebPage
*/
/**
* 1. MedicalClinic / MedicalBusiness Core Schema (§31, §135)
*/
function createMedicalClinicSchema(origin = DEFAULT_CANONICAL_ORIGIN) {
	return {
		"@context": "https://schema.org",
		"@type": [
			"MedicalClinic",
			"MedicalBusiness",
			"HealthAndBeautyBusiness"
		],
		"@id": `${origin}/#clinic`,
		name: "کلینیک تخصصی تهران لیزر",
		alternateName: [
			"Tehran Laser Clinic",
			"کلینیک تهران لیزر پاسداران",
			"مرکز تخصصی لیزر موهای زائد تهران"
		],
		url: origin,
		logo: `${origin}/favicon.svg`,
		image: [`${origin}/images/og-share.jpg`],
		telephone: "+989035555090",
		priceRange: "IRR",
		currenciesAccepted: "IRR, IRT",
		paymentAccepted: "کارت‌خوان بانکی، پرداخت نقدی، پرداخت آنلاین شتاب",
		medicalSpecialty: ["https://schema.org/Dermatology", "https://schema.org/PlasticSurgery"],
		address: {
			"@type": "PostalAddress",
			streetAddress: "خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم",
			addressLocality: "تهران",
			addressRegion: "منطقه ۴ - پاسداران",
			postalCode: "1666612345",
			addressCountry: "IR"
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: 35.7645,
			longitude: 51.4628
		},
		openingHoursSpecification: [{
			"@type": "OpeningHoursSpecification",
			dayOfWeek: [
				"Saturday",
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday"
			],
			opens: "09:00",
			closes: "20:00"
		}, {
			"@type": "OpeningHoursSpecification",
			dayOfWeek: "Thursday",
			opens: "09:00",
			closes: "18:00"
		}],
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "خدمات تخصصی لیزر موهای زائد بانوان و آقایان",
			itemListElement: [{
				"@type": "OfferCatalog",
				name: "پکیج‌های لیزر الکساندرایت کندلا ۲۰۲۶",
				itemListElement: [{
					"@type": "Offer",
					itemOffered: {
						"@type": "MedicalProcedure",
						name: "لیزر کل بدن بانوان (Full Body)",
						description: "پکیج کامل دست، پا، بیکینی، زیر بغل، خط باسن، خط ناف و شکم با شات نامحدود کندلا جنتل مکس پرو"
					},
					price: "1940000",
					priceCurrency: "IRT"
				}, {
					"@type": "Offer",
					itemOffered: {
						"@type": "MedicalProcedure",
						name: "لیزر موهای زائد کاربردی (بیکینی و زیر بغل)",
						description: "لیزر نواحی حساس با سیستم کولینگ بدون درد و سری‌های استریل یکبار مصرف"
					},
					price: "980000",
					priceCurrency: "IRT"
				}]
			}]
		},
		sameAs: ["https://t.me/tehranlaser_clinic", "https://wa.me/989035555090"]
	};
}
/**
* 2. MedicalProcedure / HealthAndBeautyBusiness Schema for specific treatments
*/
function createMedicalProcedureSchema(service, origin = DEFAULT_CANONICAL_ORIGIN) {
	const serviceUrl = `${origin}/services/${service.slug}`;
	return {
		"@context": "https://schema.org",
		"@type": "MedicalProcedure",
		"@id": `${serviceUrl}#procedure`,
		name: `لیزر موهای زائد ${service.name} با کندلا جنتل مکس پرو`,
		procedureType: "https://schema.org/NonSurgicalProcedure",
		bodyLocation: service.name,
		description: service.description || `خدمات تخصصی لیزر موهای زائد ناحیه ${service.name} با دستگاه الکساندرایت کندلا جنتل مکس پرو ۲۰۲۶ در کلینیک تهران لیزر پاسداران.`,
		preparation: "شیو کامل ناحیه با تیغ یا ژیلت ۲۴ ساعت قبل از جلسه، عدم مصرف داروهای لایه‌بردار و پرهیز از برنزه کردن و آفتاب گرفتن.",
		followup: "استفاده از کرم زینک اکساید و ژل آلوئه‌ورا، پرهیز از دوش آب داغ، سونا و ورزش سنگین تا ۲۴ ساعت پس از جلسه.",
		howPerformed: "تابش پالس‌های متمرکز لیزر الکساندرایت با طول موج ۷۵۵ نانومتر همزمان با اسپری خنک‌کننده داینامیک کندلا (DCD) جهت مهار قطعی فولیکول مو بدون کوچک‌ترین درد و سوختگی.",
		provider: {
			"@type": "MedicalClinic",
			name: "کلینیک تخصصی تهران لیزر",
			url: origin,
			telephone: "+989035555090",
			address: {
				"@type": "PostalAddress",
				streetAddress: "خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم",
				addressLocality: "تهران",
				addressCountry: "IR"
			}
		},
		offers: service.price ? {
			"@type": "Offer",
			url: serviceUrl,
			price: service.price,
			priceCurrency: "IRT",
			priceSpecification: {
				"@type": "UnitPriceSpecification",
				price: service.price,
				priceCurrency: "IRT",
				valueAddedTaxIncluded: true
			},
			availability: "https://schema.org/InStock",
			validFrom: "2026-01-01"
		} : void 0
	};
}
/**
* 3. BreadcrumbList Schema for hierarchical search engine navigation (§31, §135)
*/
function createBreadcrumbSchema(items, origin = DEFAULT_CANONICAL_ORIGIN) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => {
			const fullUrl = item.url.startsWith("http") ? item.url : `${origin}${item.url.startsWith("/") ? item.url : `/${item.url}`}`;
			return {
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				item: fullUrl
			};
		})
	};
}
/**
* 4. FAQPage Schema for Rich Snippets / Google FAQ Accordions (§31, §135)
*/
function createFAQPageSchema(faqs) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer
			}
		}))
	};
}
/**
* 5. Article & MedicalWebPage Schema for blog posts (§31, §135)
*/
function createArticleSchema(post, origin = DEFAULT_CANONICAL_ORIGIN) {
	const articleUrl = `${origin}/blog/${post.slug}`;
	const defaultImage = `${origin}/images/og-share.jpg`;
	return {
		"@context": "https://schema.org",
		"@type": ["Article", "MedicalWebPage"],
		"@id": `${articleUrl}#article`,
		isPartOf: {
			"@type": "WebSite",
			"@id": `${origin}/#website`,
			name: "کلینیک تهران لیزر",
			url: origin
		},
		headline: post.title,
		description: post.excerpt,
		url: articleUrl,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": articleUrl
		},
		image: post.coverImage ? post.coverImage.startsWith("http") ? post.coverImage : `${origin}${post.coverImage}` : defaultImage,
		datePublished: post.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
		dateModified: post.updatedAt || post.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
		inLanguage: "fa-IR",
		author: {
			"@type": "Person",
			name: post.author || "تیم علمی و تخصصی تهران لیزر",
			url: `${origin}/clinic`
		},
		publisher: {
			"@type": "MedicalClinic",
			name: "کلینیک تخصصی تهران لیزر",
			url: origin,
			logo: {
				"@type": "ImageObject",
				url: `${origin}/favicon.svg`
			}
		},
		about: {
			"@type": "MedicalTherapy",
			name: "لیزر موهای زائد الکساندرایت کندلا ۲۰۲۶",
			description: "استاندارد طلایی رفع موهای زائد با طول موج ۷۵۵ نانومتر و سیستم خنک‌کننده DCD"
		}
	};
}
//#endregion
//#region src/lib/seo/meta.ts
/**
* High-converting SEO keywords, metadata defaults, and geo-targeting coordinates
* for Tehran Laser Clinic (تهران لیزر)
*/
var DEFAULT_SEO_TITLE = "کلینیک تهران لیزر — مرکز تخصصی لیزر موهای زائد با کندلا ۲۰۲۶ در پاسداران";
var DEFAULT_SEO_DESCRIPTION = "کلینیک تخصصی تهران لیزر در خیابان پایدارفرد پاسداران. مجهز به پیشرفته‌ترین دستگاه الکساندرایت کندلا جنتل مکس پرو ۲۰۲۶، سری‌های یکبار مصرف استریل، کولینگ بدون درد، تعرفه شفاف و ۱۵٪ تخفیف رزرو آنلاین.";
var PRIMARY_KEYWORDS = [
	"لیزر موهای زائد تهران",
	"لیزر پاسداران",
	"کندلا جنتل مکس پرو ۲۰۲۶",
	"کلینیک لیزر پایدارفرد",
	"لیزر الکساندرایت تهران",
	"قیمت لیزر فول بادی بانوان",
	"لیزر بدون درد با کولینگ",
	"رزرو آنلاین لیزر پاسداران",
	"بهترین مرکز لیزر شمال شرق تهران",
	"لیزر موهای زائد آقایان و بانوان"
];
var CLINIC_GEO_LOCATION = {
	region: "IR-07",
	placename: "Tehran, Pasdaran",
	position: "35.7645;51.4628",
	icbm: "35.7645, 51.4628"
};
//#endregion
//#region src/layouts/PublicLayout.astro
createAstro("https://astro.build");
var $$PublicLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PublicLayout;
	const { title = DEFAULT_SEO_TITLE, description = DEFAULT_SEO_DESCRIPTION, canonicalUrl, ogType = "website", ogImage = "/images/og-share.jpg", keywords, noindex = false, nofollow = false, jsonLd, theme = "light", bodyClass = "" } = Astro.props;
	const siteOrigin = resolveCanonicalOrigin();
	const currentPath = Astro.url.pathname;
	const resolvedCanonical = buildCanonicalUrl(Astro.url, canonicalUrl, siteOrigin);
	const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${siteOrigin}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`;
	const robotsContent = [noindex ? "noindex" : "index", nofollow ? "nofollow" : "follow"].join(", ");
	const resolvedKeywords = keywords && keywords.length > 0 ? keywords : PRIMARY_KEYWORDS;
	const clinicJsonLd = createMedicalClinicSchema(siteOrigin);
	const websiteJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${siteOrigin}/#website`,
		url: siteOrigin,
		name: "کلینیک تخصصی تهران لیزر",
		alternateName: "Tehran Laser Clinic",
		description: DEFAULT_SEO_DESCRIPTION,
		inLanguage: "fa-IR",
		publisher: { "@id": `${siteOrigin}/#clinic` },
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${siteOrigin}/services?q={search_term_string}`
			},
			"query-input": "required name=search_term_string"
		}
	};
	const structuredData = jsonLd ? Array.isArray(jsonLd) ? [
		clinicJsonLd,
		websiteJsonLd,
		...jsonLd
	] : [
		clinicJsonLd,
		websiteJsonLd,
		jsonLd
	] : [clinicJsonLd, websiteJsonLd];
	return renderTemplate`<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="format-detection" content="telephone=no"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><meta name="keywords"${addAttribute(resolvedKeywords.join("، "), "content")}><meta name="author" content="کلینیک تخصصی تهران لیزر"><meta name="robots"${addAttribute(robotsContent, "content")}><meta name="googlebot"${addAttribute(robotsContent, "content")}><link rel="canonical"${addAttribute(resolvedCanonical, "href")}><!-- Geo-targeting for local Pasdaran / Tehran SEO (§133) --><meta name="geo.region"${addAttribute(CLINIC_GEO_LOCATION.region, "content")}><meta name="geo.placename"${addAttribute(CLINIC_GEO_LOCATION.placename, "content")}><meta name="geo.position"${addAttribute(CLINIC_GEO_LOCATION.position, "content")}><meta name="ICBM"${addAttribute(CLINIC_GEO_LOCATION.icbm, "content")}><!-- Open Graph / Facebook (§134) --><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:url"${addAttribute(resolvedCanonical, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(absoluteOgImage, "content")}><meta property="og:image:secure_url"${addAttribute(absoluteOgImage, "content")}><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="کلینیک تخصصی تهران لیزر — مرکز لیزر موهای زائد پاسداران"><meta property="og:locale" content="fa_IR"><meta property="og:locale:alternate" content="en_US"><meta property="og:site_name" content="تهران لیزر"><!-- Twitter Card (§134) --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(absoluteOgImage, "content")}><meta name="twitter:image:alt" content="کلینیک تخصصی تهران لیزر — مرکز لیزر موهای زائد پاسداران"><!-- PWA metadata --><meta name="theme-color" content="#d4af37"><meta name="application-name" content="کلینیک تهران لیزر"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="تهران لیزر"><link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icons/icon-192.png"><!-- Favicons --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png"><link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png"><link rel="shortcut icon" href="/favicon.ico"><!-- Sitemap & hreflang discovery --><link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml"><link rel="alternate" hreflang="fa-IR"${addAttribute(resolvedCanonical, "href")}><link rel="alternate" hreflang="x-default"${addAttribute(resolvedCanonical, "href")}><!-- Resource hints for Core Web Vitals (§136) --><link rel="preconnect" href="https://images.unsplash.com" crossorigin><link rel="dns-prefetch" href="https://images.unsplash.com"><!-- JSON-LD Structured Data (§31, §135) --><script type="application/ld+json">${unescapeHTML(JSON.stringify(structuredData))}<\/script><!-- Service worker registration (§47) --><script>
      if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    <\/script>${renderHead($$result)}</head><body${addAttribute([theme === "dark" ? "theme-dark-obsidian" : "", bodyClass], "class:list")}><!-- Top announcement / trust strip --><div class="announcement-strip"><div class="container announcement-inner"><span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14,
		"aria-hidden": true
	})} جشنواره پاییزه تهران لیزر: ۱۵٪ تخفیف ویژه پکیج کل بدن در رزرو آنلاین</span><a href="/booking" class="announcement-link">رزرو با تخفیف</a></div></div><!-- Header --><header class="site-header"><div class="container header-inner"><a href="/" class="brand-logo" aria-label="صفحه اصلی تهران لیزر"><span class="logo-mark">TL</span><div class="logo-text"><span class="logo-title">تهران لیزر</span><span class="logo-sub">کلینیک تخصصی زیبایی و لیزر</span></div></a><!-- Desktop Navigation --><nav class="desktop-nav" aria-label="منوی اصلی"><a href="/"${addAttribute(currentPath === "/" ? "nav-link active" : "nav-link", "class")}>صفحه اصلی</a><a href="/services"${addAttribute(currentPath.startsWith("/services") ? "nav-link active" : "nav-link", "class")}>خدمات و تعرفه‌ها</a><a href="/clinic"${addAttribute(currentPath === "/clinic" ? "nav-link active" : "nav-link", "class")}>درباره کلینیک</a><a href="/faq"${addAttribute(currentPath === "/faq" ? "nav-link active" : "nav-link", "class")}>سوالات متداول</a><a href="/blog"${addAttribute(currentPath.startsWith("/blog") ? "nav-link active" : "nav-link", "class")}>مجله تخصصی</a><a href="/contact"${addAttribute(currentPath === "/contact" ? "nav-link active" : "nav-link", "class")}>تماس و آدرس</a></nav><!-- Header Actions --><div class="header-actions"><a href="tel:+989035555090" class="btn btn-ghost header-phone" aria-label="تماس با کلینیک"><span class="icon-phone">${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"aria-hidden": true
	})}</span><span class="phone-digits">۰۹۰۳ ۵۵۵ ۵۰۹۰</span></a><a href="/booking" class="btn btn-primary header-cta">رزرو آنلاین نوبت</a><!-- Mobile Menu Trigger --><button id="mobileMenuBtn" class="mobile-menu-btn" aria-label="باز کردن منو" aria-expanded="false"><span class="bar"></span><span class="bar"></span><span class="bar"></span></button></div></div><!-- Mobile Navigation Drawer --><div id="mobileDrawer" class="mobile-drawer" hidden><nav class="mobile-drawer-nav"><a href="/" class="drawer-link">صفحه اصلی</a><a href="/services" class="drawer-link">خدمات و تعرفه‌ها</a><a href="/clinic" class="drawer-link">درباره کلینیک</a><a href="/faq" class="drawer-link">سوالات متداول</a><a href="/blog" class="drawer-link">مجله تخصصی</a><a href="/contact" class="drawer-link">تماس و آدرس</a><div class="drawer-actions"><a href="/booking" class="btn btn-primary btn-block">رزرو آنلاین نوبت</a><a href="tel:+989035555090" class="btn btn-outline btn-block mt-2">تماس: ۰۹۰۳ ۵۵۵ ۵۰۹۰</a></div></nav></div></header><!-- Main Content --><main id="mainContent">${renderSlot($$result, $$slots["default"])}</main><!-- Footer --><footer class="site-footer"><div class="container footer-content"><div class="footer-col brand-col"><div class="brand-logo mb-3"><span class="logo-mark">TL</span><div class="logo-text"><span class="logo-title">تهران لیزر</span><span class="logo-sub">مرکز تخصصی لیزر پاسداران</span></div></div><p class="footer-desc">تهران لیزر با بهره‌گیری از پیشرفته‌ترین تکنولوژی‌های روز دنیا و رعایت بالاترین استانداردهای بهداشتی، محیطی لوکس و آرام برای تجربه بهترین نتایج لیزر موهای زائد فراهم آورده است.</p><div class="clinic-direct-contact mt-3"><p><strong>آدرس:</strong> پاسداران، خیابان پایدارفرد، نبش بوستان هفتم</p><p><strong>شماره تماس:</strong> <a href="tel:+989035555090" dir="ltr">+98 903 555 5090</a></p></div></div><div class="footer-col"><h4 class="footer-heading">دسترسی سریع</h4><ul class="footer-links"><li><a href="/services">تعرفه لیزر بانوان و آقایان</a></li><li><a href="/booking">سامانه رزرو آنلاین</a></li><li><a href="/clinic">معرفی کلینیک و دستگاه‌ها</a></li><li><a href="/faq">سوالات متداول مراجعین</a></li><li><a href="/blog">مقالات و راهنمای مراقبت</a></li><li><a href="/contact">راه‌های ارتباطی و نقشه</a></li></ul></div><div class="footer-col"><h4 class="footer-heading">خدمات پرطرفدار بانوان</h4><ul class="footer-links"><li><a href="/services/full-body">لیزر کل بدن (پکیج تخفیف‌دار)</a></li><li><a href="/services/underarm">لیزر زیر بغل</a></li><li><a href="/services/bikini">لیزر بیکینی</a></li><li><a href="/services/full-legs">لیزر فول بادی پا</a></li><li><a href="/services/full-arms">لیزر دست کامل</a></li><li><a href="/services/face">لیزر کامل صورت</a></li></ul></div><div class="footer-col"><h4 class="footer-heading">ساعات کاری و پذیرش</h4><p class="footer-hours">شنبه تا چهارشنبه: ۰۹:۰۰ الی ۲۰:۰۰<br>پنجشنبه‌ها: ۰۹:۰۰ الی ۱۸:۰۰<br>جمعه‌ها: تعطیل</p><div class="footer-cta-box mt-3"><p class="small text-muted mb-2">پذیرش فقط با هماهنگی و رزرو قبلی</p><a href="/booking" class="btn btn-primary btn-sm btn-block">رزرو اینترنتی نوبت</a></div></div></div><div class="footer-bottom"><div class="container footer-bottom-inner"><p class="copyright">© ${(/* @__PURE__ */ new Date()).getFullYear()} کلینیک تخصصی تهران لیزر. تمامی حقوق محفوظ است.</p><div class="legal-links"><a href="/privacy">حریم خصوصی</a><span class="sep">•</span><a href="/terms">قوانین و مقررات</a><span class="sep">•</span><a href="/admin/login" class="admin-entry-link">ورود پرسنل</a></div></div></div></footer><!-- Sticky Mobile CTA (§140, §141) --><div class="mobile-sticky-bar"><a href="tel:+989035555090" class="btn btn-outline sticky-phone" aria-label="تماس تلفنی"><span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"aria-hidden": true
	})} تماس</span></a><a href="/booking" class="btn btn-primary sticky-book"><span>رزرو آنلاین نوبت</span><span class="promo-tag">۱۵٪ تخفیف</span></a></div><!-- Client-side navigation toggle script --><script>
      const btn = document.getElementById('mobileMenuBtn');
      const drawer = document.getElementById('mobileDrawer');

      function setDrawer(open) {
        if (!btn || !drawer) return;
        drawer.hidden = !open;
        drawer.style.display = open ? 'block' : 'none';
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
        document.body.classList.toggle('drawer-open', open);
      }

      if (btn && drawer) {
        btn.addEventListener('click', () => {
          const isOpen = !drawer.hidden && drawer.style.display !== 'none';
          setDrawer(!isOpen);
        });

        drawer.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => setDrawer(false));
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') setDrawer(false);
        });

        // Reset state when crossing to desktop width
        const mq = window.matchMedia('(min-width: 993px)');
        mq.addEventListener('change', (e) => {
          if (e.matches) setDrawer(false);
        });
      }
    <\/script></body></html>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/layouts/PublicLayout.astro", void 0);
//#endregion
export { createMedicalProcedureSchema as a, createFAQPageSchema as i, createArticleSchema as n, createBreadcrumbSchema as r, $$PublicLayout as t };
