globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { i as createFAQPageSchema, r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { _ as listFaqItems, x as listPublicServices } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/components/public/CandelaShowcase.astro
var $$CandelaShowcase = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section class="section candela-showcase-section"><div class="container"><div class="candela-showcase-card"><div class="candela-badge-row"><span class="candela-gold-pill">${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 16
	})}<span>استاندارد طلایی درماتولوژی جهانی (Gold Standard)</span></span><span class="candela-sub-tag">تأییدیه رسمی FDA آمریکا و وزارت بهداشت</span></div><div class="candela-header-block"><h2 class="candela-title">تکنولوژی الکساندرایت کندلا جنتل‌مکس پرو ۲۰۲۶<span class="candela-en-sub">Candela GentleMax Pro</span></h2><p class="candela-lead">دستگاه Candela GentleMax Pro استاندارد بلامنازع کلینیک‌های پوست و لیزر جهان است. با ترکیب همزمان لیزر الکساندرایت ۷۵۵nm و ان‌دی یاگ ۱۰۶۴nm، بالاترین اثربخشی بالینی با امنیت مطلق برای انواع پوست ۱ تا ۶ فراهم گردیده است.</p></div><div class="candela-features-grid"><div class="candela-feature-card"><div class="candela-feat-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 26
	})}</div><h4 class="candela-feat-title">کولینگ پویا DCD کرایوژن</h4><p class="candela-feat-desc">پاشش میکروثانیه‌ای کرایوژن فریز پیش و پس از هر شات، پوست را در سطح ایمن خنک کرده و درمان را کاملاً بدون درد و سوزش می‌نماید.</p></div><div class="candela-feature-card"><div class="candela-feat-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 26
	})}</div><h4 class="candela-feat-title">طول موج دوگانه Alex + Nd:YAG</h4><p class="candela-feat-desc">طول موج ۷۵۵nm برای پوست‌های روشن و موهای نازک صورت، و طول موج ۱۰۶۴nm برای پوست‌های گندمی و تیره با تضمین عدم سوختگی.</p></div><div class="candela-feature-card"><div class="candela-feat-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 26
	})}</div><h4 class="candela-feat-title">اسپات‌سایزهای بزرگ تا ۲۴mm</h4><p class="candela-feat-desc">پوشش عمیق ریشه فولیکول‌ها و سرعت بالا؛ اجرای پکیج کامل کل بدن در کمتر از ۴۵ دقیقه با شات نامحدود واقعی در هر جلسه.</p></div><div class="candela-feature-card"><div class="candela-feat-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 26
	})}</div><h4 class="candela-feat-title">تست شات رایگان و ایمنی ۱۰۰٪</h4><p class="candela-feat-desc">بررسی حساسیت پوستی پیش از شروع دوره و پایش مستمر درجه انرژی ژول توسط کادر مجرب زیر نظر پزشک کلینیک.</p></div></div></div></div></section>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/components/public/CandelaShowcase.astro", void 0);
//#endregion
//#region src/components/public/ProtocolSection.astro
var $$ProtocolSection = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section class="section protocol-section"><div class="container"><div class="section-header text-center"><span class="section-subtitle">مسیر درمانی مطمئن</span><h2 class="section-title">مراحل درمان استاندارد در کلینیک تهران لیزر</h2></div><div class="protocol-grid"><div class="protocol-step"><div class="step-num">۰۱</div><div class="step-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 22
	})}</div><h4 class="step-title">مشاوره و آنالیز فوتوتایپ پوست</h4><p class="step-desc">بررسی ضخامت مو، تیپ پوستی، سابقه مصرف داروها و تنظیم دوز اولیه انرژی ژول کندلا.</p></div><div class="protocol-step"><div class="step-num">۰۲</div><div class="step-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 22
	})}</div><h4 class="step-title">تست شات رایگان و کالیبراسیون</h4><p class="step-desc">اجرای تست شات جهت اطمینان از راحتی مراجع، عدم حساسیت و انتخاب دقیق طول موج ۷۵۵ یا ۱۰۶۴nm.</p></div><div class="protocol-step"><div class="step-num">۰۳</div><div class="step-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 22
	})}</div><h4 class="step-title">جلسه درمان با کولینگ DCD</h4><p class="step-desc">شات‌زدن یکنواخت با اسپات‌سایز مناسب و اسپری هوشمند کرایوژن فریز بدون کوچکترین درد و سوزش.</p></div><div class="protocol-step"><div class="step-num">۰۴</div><div class="step-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 22
	})}</div><h4 class="step-title">مراقبت پس از لیزر و پایش پرونده</h4><p class="step-desc">ارائه راهنمای مراقبت خانگی و پیگیری منظم جلسات تا دستیابی به ریزش دائمی ۹۰ درصدی موها.</p></div></div></div></section>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/components/public/ProtocolSection.astro", void 0);
//#endregion
//#region src/components/public/TestimonialsSection.astro
var $$TestimonialsSection = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section class="section testimonials-section"><div class="container"><div class="section-header text-center"><span class="section-subtitle">رضایت مراجعین محترم</span><h2 class="section-title">تجربه مراجعین کلینیک تهران لیزر پاسداران</h2></div><div class="testimonials-grid"><div class="testimonial-card"><div class="testi-rating">${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}</div><p class="testi-quote">«دستگاه کندلا ۲۰۲۶ این کلینیک فوق‌العاده‌ست. کولینگش اونقدر خنکه که اصلاً درد رو حس نکردم. از جلسه سوم به بعد ریزش موها عالی بود و محیط کلینیک فوق‌العاده تمیز و باکلاسه.»</p><div class="testi-author"><div class="author-avatar">س.ر</div><div class="author-details"><span class="author-name">سارا ر. (ساکن پاسداران)</span><span class="author-tag">${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 13
	})}<span>مراجع پکیج طلایی کل بدن</span></span></div></div></div><div class="testimonial-card"><div class="testi-rating">${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}</div><p class="testi-quote">«بزرگترین مزیت تهران لیزر وقت‌شناسی و احترام به بیمار هست. هیچ معطلی نداشتم و دقیقاً سر ساعت وارد اتاق شدم. پک بهداشتی و سری دستگاه کاملاً جلوی خودم باز شد.»</p><div class="testi-author"><div class="author-avatar">ن.م</div><div class="author-details"><span class="author-name">نیلوفر م. (ساکن دروس)</span><span class="author-tag">${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 13
	})}<span>مراجع دوره فول‌بادی بانوان</span></span></div></div></div><div class="testimonial-card"><div class="testi-rating">${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 17,
		"class": "star-gold"
	})}</div><p class="testi-quote">«برای آنکارد ریش و خط گردن مراجعه کردم. اپراتور آقا بسیار مسلط و خوش‌برخورد بود و بعد از جلسه هیچ سوزش یا برآمدگی نداشتم. دسترسی به کلینیک در پایدارفرد هم خیلی راحته.»</p><div class="testi-author"><div class="author-avatar">ک.ف</div><div class="author-details"><span class="author-name">کامران ف. (ساکن اختیاریه)</span><span class="author-tag">${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 13
	})}<span>مراجع لاین اختصاصی آقایان</span></span></div></div></div></div></div></section>`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/components/public/TestimonialsSection.astro", void 0);
//#endregion
//#region src/data/faqs.ts
var defaultFaqs = [
	{
		id: "faq-1",
		question: "چرا دستگاه الکساندرایت کندلا ۲۰۲۶ برترین دستگاه لیزر جهان است؟",
		answer: "کندلا جنتل‌مکس پرو مجهز به دو طول موج الکساندرایت ۷۵۵ نانومتر و ان‌دی یاگ ۱۰۶۴ نانومتر است که تمامی تیپ‌های پوستی از روشن تا تیره را پوشش می‌دهد. سیستم کولینگ DCD انحصاری آن با پاشش کرایوژن فریز، درمان را کاملاً بدون درد و سوختگی تضمین می‌کند.",
		displayOrder: 1,
		category: "technology"
	},
	{
		id: "faq-2",
		question: "تعداد جلسات مورد نیاز برای نتیجه‌گیری کامل چند جلسه است؟",
		answer: "دوره استاندارد لیزر موهای زائد با کندلا ۶ الی ۸ جلسه با فواصل زمانی ۴ الی ۶ هفته است که طی آن بین ۸۵ تا ۹۵ درصد موهای زائد به طور دائمی ریشه‌کن می‌گردند.",
		displayOrder: 2,
		category: "treatment"
	},
	{
		id: "faq-3",
		question: "آیا لیزر با کندلا درد یا سوختگی به همراه دارد؟",
		answer: "خیر. به لطف سیستم خنک‌کننده پیشرفته پویا (DCD Cryogen Cooling)، پیش از اصابت هر شات لیزر، سطح پوست خنک و بی‌حس می‌گردد و تجربه لیزر کاملاً بدون درد و بدون کوچکترین اثر سوختگی خواهد بود.",
		displayOrder: 3,
		category: "safety"
	},
	{
		id: "faq-4",
		question: "پروتکل‌های بهداشتی در کلینیک تهران لیزر به چه صورت است؟",
		answer: "تمامی قطعات تماسی شامل سری دستگاه، سلفون، ملحفه و عینک برای هر مراجع به صورت پک کاملاً استریل و اختصاصی یکبار مصرف استفاده شده و محیط کابین پس از هر جلسه کاملاً ضدعفونی می‌گردد.",
		displayOrder: 4,
		category: "hygiene"
	},
	{
		id: "faq-5",
		question: "آیا برای آقایان نیز لاین و اپراتور مجزا وجود دارد؟",
		answer: "بله. کلینیک تهران لیزر دارای لاین مجزا با اپراتورهای مجرب آقا و پروتکل‌های اختصاصی موهای ضخیم آقایان (آنکارد ریش، خط گردن، پشت و سینه) با تعیین وقت قبلی است.",
		displayOrder: 5,
		category: "men"
	},
	{
		id: "faq-6",
		question: "تخفیف ویژه ۱۵٪ رزرو آنلاین چگونه اعمال می‌شود؟",
		answer: "با ثبت نوبت پکیج کل بدن از طریق وب‌سایت تهران لیزر، تخفیف ۱۵ درصدی به صورت خودکار در فاکتور شما منظور شده و نیازی به وارد کردن کد تخفیف نیست.",
		displayOrder: 6,
		category: "pricing"
	}
];
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let services = [];
	let faqs = [];
	try {
		[services, faqs] = await Promise.all([listPublicServices(env.DB), listFaqItems(env.DB)]);
	} catch (e) {
		console.error("SSR homepage data fetch failure:", e);
	}
	const activeFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;
	const faqJsonLd = createFAQPageSchema(activeFaqs.slice(0, 6).map((f) => ({
		question: f.question,
		answer: f.answer
	})));
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "تهران لیزر — مرکز تخصصی لیزر الکساندرایت کندلا ۲۰۲۶ در پاسداران",
		"description": "کلینیک تخصصی تهران لیزر در خیابان پایدارفرد پاسداران. مجهز به الکساندرایت کندلا ۲۰۲۶ آمریکایی با کولینگ داینامیک بدون درد، پک استریل اختصاصی، تعرفه شفاف و ۱۵٪ تخفیف رزرو آنلاین.",
		"canonicalUrl": "/",
		"jsonLd": [faqJsonLd, breadcrumbJsonLd],
		"theme": "dark"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="hero-section"><div class="container hero-container"><div class="hero-content"><div class="hero-badge animate-fade-in">${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"class": "gold-icon-glow"
	})}<span>مرکز تخصصی لیزر و زیبایی پاسداران — مجهز به الکساندرایت کندلا ۲۰۲۶</span></div><h1 class="hero-title animate-fade-up">تجربه‌ای لوکس، بدون درد و قطعی از <span class="gold-gradient-text">لیزر موهای زائد</span> در پاسداران</h1><p class="hero-subtitle animate-fade-up delay-1">در کلینیک تهران لیزر، فناوری طلایی الکساندرایت کندلا ۲۰۲۶ (Candela GentleMax Pro) را با سیستم خنک‌کننده داینامیک DCD کرایوژن، نظارت مستقیم کادر درمانی و پک‌های استریل اختصاصی در محیطی VIP و آرام تجربه فرمایید.</p><div class="hero-cta-group animate-fade-up delay-2"><a href="/booking" class="btn btn-primary btn-lg hero-btn-book">${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18
	})}<span>رزرو آنلاین نوبت (۱۵٪ تخفیف)</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 18
	})}</a><a href="#services" class="btn btn-outline btn-lg hero-btn-services">${renderComponent($$result, "Icon", $$Icon, {
		"name": "services",
		"size": 18
	})}<span>مشاهده تعرفه‌ها و پکیج‌ها</span></a><a href="tel:+989035555090" class="hero-phone-chip" aria-label="تماس فوری با پذیرش کلینیک">${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 15
	})}<span>مشاوره و پذیرش: ۰۹۰۳ ۵۵۵ ۵۰۹۰</span></a></div><!-- Hero Trust Metrics Grid --><div class="hero-trust-metrics animate-fade-up delay-3"><div class="metric-item"><div class="metric-top">${renderComponent($$result, "Icon", $$Icon, {
		"name": "clean",
		"size": 18,
		"class": "metric-icon"
	})}<span class="metric-val">۱۰۰٪</span></div><span class="metric-label">پک بهداشتی و سری استریل اختصاصی هر مراجع</span></div><div class="metric-divider"></div><div class="metric-item"><div class="metric-top">${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 18,
		"class": "metric-icon"
	})}<span class="metric-val">۱۵٪</span></div><span class="metric-label">تخفیف ویژه رزرو اینترنتی پکیج فول بادی</span></div><div class="metric-divider"></div><div class="metric-item"><div class="metric-top">${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 18,
		"class": "metric-icon"
	})}<span class="metric-val">۷۵۵+۱۰۶۴</span></div><span class="metric-label">طول موج دوگانه الکس و یاگ برای انواع تیپ پوست</span></div><div class="metric-divider"></div><div class="metric-item"><div class="metric-top">${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 18,
		"class": "metric-icon"
	})}<span class="metric-val">پاسداران</span></div><span class="metric-label">لوکیشن پایدارفرد با دسترسی آسان و پارکینگ</span></div></div></div></div></section>${renderComponent($$result, "CandelaShowcase", $$CandelaShowcase, {})}<section class="trust-strip"><div class="container trust-grid"><div class="trust-card"><div class="trust-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 26
	})}</div><h3 class="trust-title">اپراتورهای ارشد دوره‌دیده</h3><p class="trust-desc">ارائه خدمات توسط اپراتورهای دارای سرتیفیکیت رسمی کندلا، در لاین‌های کاملاً مجزای بانوان و آقایان</p></div><div class="trust-card"><div class="trust-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "clean",
		"size": 26
	})}</div><h3 class="trust-title">پک بهداشتی و سری اختصاصی</h3><p class="trust-desc">سلفون‌کشی کامل، ملحفه یکبار مصرف و سری مجزا برای هر مراجعه‌کننده با تضمین سلامت کامل پزشکی</p></div><div class="trust-card"><div class="trust-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 26
	})}</div><h3 class="trust-title">تعرفه‌های شفاف و مصوب</h3><p class="trust-desc">هزینه‌های اعلامی قطعی بوده و هیچ‌گونه هزینه پنهان یا تغییر قیمت در محل کلینیک اخذ نمی‌گردد</p></div><div class="trust-card"><div class="trust-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 26
	})}</div><h3 class="trust-title">گارانتی اثربخشی دوره</h3><p class="trust-desc">ریزش بین ۸۰ تا ۹۵ درصد موهای زائد در پایان دوره استاندارد ۶ الی ۸ جلسه‌ای تحت پروتکل علمی</p></div></div></section><section id="services" class="section services-section"><div class="container"><div class="section-header text-center"><span class="section-subtitle">تعرفه‌های مصوب و شفاف کلینیک</span><h2 class="section-title">خدمات تخصصی لیزر موهای زائد بانوان</h2><p class="section-desc">تعرفه‌های رسمی کلینیک تهران لیزر برای بخش بانوان با دستگاه الکساندرایت کندلا ۲۰۲۶. رزرو آنلاین پکیج کل بدن مشمول ۱۵٪ تخفیف ویژه می‌باشد.</p></div><!-- Featured Promo Banner --><div class="featured-promo-card"><div class="promo-badge-ribbon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14
	})}<span>پیشنهاد طلایی رزرو آنلاین</span></div><div class="promo-content"><div class="promo-info"><h3 class="promo-title">پکیج طلایی کل بدن بانوان (Full Body)</h3><p class="promo-desc">شامل دست کامل، پا کامل، زیر بغل، بیکینی، خط باسن، خط ناف و شکم با شات نامحدود کندلا</p><ul class="promo-features"><li>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"class": "check-icon"
	})}<span>انجام توسط اپراتور ارشد با شات نامحدود واقعی</span></li><li>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"class": "check-icon"
	})}<span>سیستم کولینگ هوشمند کرایوژن فریز بدون درد</span></li><li>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"class": "check-icon"
	})}<span>پک بهداشتی و سری اختصاصی استریل</span></li></ul></div><div class="promo-pricing-box"><div class="old-price"><span class="strikethrough">۲/۲۹۰/۰۰۰</span><span class="price-unit">تومان</span></div><div class="new-price"><span class="final-amount">۱/۹۴۰/۰۰۰</span><span class="price-unit">تومان</span></div><span class="discount-tag">۱۵٪ تخفیف اختصاصی رزرو سایت</span><a href="/booking?service=full-body" class="btn btn-primary btn-block mt-3">${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18
	})}<span>رزرو نوبت پکیج کل بدن</span></a></div></div></div><!-- Services Grid (SSR rendered) --><div class="services-grid mt-5">${services.slice(0, 12).map((service) => {
		const femalePrice = service.prices.find((p) => p.pricingCategory === "female");
		const isFullBody = service.slug === "full-body";
		return renderTemplate`<div class="service-card"><div class="service-card-header"><h4 class="service-name">${service.name}</h4><span class="duration-badge">${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13
		})}<span>${service.durationMinutes} دقیقه</span></span></div><p class="service-desc">${service.shortDescription || service.description}</p><div class="service-pricing-row"><div class="price-details"><span class="price-label">تعرفه بانوان:</span><span class="price-amount">${femalePrice ? `${femalePrice.amount.toLocaleString("fa-IR")} هزار تومان` : "استعلام تلفنی"}</span></div>${isFullBody && renderTemplate`<span class="badge badge-success">۱۵٪ تخفیف سایت</span>`}</div><div class="service-card-actions"><a${addAttribute(`/booking?service=${service.slug}`, "href")} class="btn btn-outline btn-sm btn-block">${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 15
		})}<span>رزرو این خدمت</span></a></div></div>`;
	})}</div><div class="text-center mt-5"><a href="/services" class="btn btn-outline btn-lg"><span>مشاهده تمام ۲۰ ناحیه و لیست کامل قیمت‌ها</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 18
	})}</a></div></div></section><section class="section male-services-strip"><div class="container male-strip-inner"><div class="male-text"><span class="badge badge-outline">${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 14
	})}<span>لاین درمانی مجزا</span></span><h3 class="male-title">خدمات اختصاصی لیزر آقایان با اپراتور آقا</h3><p class="male-desc">کلینیک تهران لیزر مجهز به لاین اختصاصی آقایان با اپراتورهای مجرب آقا و پروتکل‌های ویژه موهای ضخیم می‌باشد. نواحی آنکارد ریش، خط گردن و گونه، پشت، شانه‌ها، سینه و پکیج کامل کل بدن با تعیین وقت قبلی و در کمال حریم شخصی ارائه می‌گردد.</p></div><div class="male-cta"><a href="tel:+989035555090" class="btn btn-outline btn-lg">${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 18
	})}<span>مشاوره تلفنی و استعلام تعرفه آقایان</span></a></div></div></section>${renderComponent($$result, "ProtocolSection", $$ProtocolSection, {})}${renderComponent($$result, "TestimonialsSection", $$TestimonialsSection, {})}<section id="faq" class="section faq-section"><div class="container"><div class="section-header text-center"><span class="section-subtitle">پاسخ به سوالات پرتکرار</span><h2 class="section-title">سوالات متداول مراجعین تهران لیزر</h2></div><div class="faq-accordion">${activeFaqs.map((faq) => renderTemplate`<details class="faq-card"><summary class="faq-question"><span>${faq.question}</span><span class="faq-toggle-icon">${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 18
	})}</span></summary><div class="faq-answer"><p>${faq.answer}</p></div></details>`)}</div></div></section><section class="section clinic-location-section"><div class="container location-container"><div class="location-card"><span class="section-subtitle">موقعیت مکانی و راه‌های ارتباطی</span><h2 class="location-heading">کلینیک تهران لیزر در منطقه پاسداران</h2><div class="location-details-list"><div class="loc-detail-item">${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 20,
		"class": "loc-icon"
	})}<div class="loc-text"><strong>نشانی دقیق:</strong> تهران، پاسداران، خیابان پایدارفرد، نبش بوستان هفتم</div></div><div class="loc-detail-item">${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 20,
		"class": "loc-icon"
	})}<div class="loc-text"><strong>تلفن پذیرش و هماهنگی:</strong><a href="tel:+989035555090" dir="ltr" class="loc-phone-link">+98 903 555 5090</a></div></div><div class="loc-detail-item">${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 20,
		"class": "loc-icon"
	})}<div class="loc-text"><strong>ساعات پذیرش:</strong> شنبه تا چهارشنبه ۹ الی ۲۰ | پنجشنبه ۹ الی ۱۸</div></div></div><div class="location-actions mt-4"><a href="https://maps.google.com/?q=Pasdaran+Paydarfard+Tehran" target="_blank" rel="noopener noreferrer" class="btn btn-outline loc-map-btn">${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 17
	})}<span>مسیریابی روی نقشه گوگل</span></a><a href="/booking" class="btn btn-primary loc-book-btn">${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 17
	})}<span>رزرو آنلاین نوبت (۱۵٪ تخفیف)</span></a></div></div></div></section>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
