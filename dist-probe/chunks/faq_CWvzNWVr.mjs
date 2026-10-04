globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { i as createFAQPageSchema, r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { _ as listFaqItems } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/faq.astro
var faq_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Faq,
	file: () => $$file,
	url: () => $$url
});
var $$Faq = createComponent(async ($$result, $$props, $$slots) => {
	let dbFaqs = [];
	try {
		if (env?.DB) dbFaqs = await listFaqItems(env.DB);
	} catch (e) {
		console.error("Failed to load DB FAQs:", e);
	}
	const combinedFaqs = [...[
		{
			id: "prep-shave",
			category: "preparation",
			categoryLabel: "آمادگی قبل از لیزر",
			question: "نحوه اصلاح (شیو) موها قبل از جلسه لیزر چگونه باید باشد؟",
			answer: "حدود ۱۲ الی ۲۴ ساعت قبل از جلسه، ناحیه مورد نظر را فقط با ژیلت یا تیغ خودتراش تمیز کاملاً شیو نمایید. به هیچ عنوان از وکس، شمع، اپیلاسیون، موچین یا کرم‌های موبر استفاده نکنید؛ چرا که اشعه لیزر جهت سوزاندن ریشه فولیکول، به وجود ساقه مو در عمق پوست نیاز دارد.",
			keyTakeaway: "شیو فقط با ژیلت ۱۲ تا ۲۴ ساعت قبل از نوبت؛ از وکس و اپیلاسیون خودداری شود."
		},
		{
			id: "prep-clean-skin",
			category: "preparation",
			categoryLabel: "آمادگی قبل از لیزر",
			question: "آیا در روز مراجعه می‌توان از لوسیون، کرم پودر یا مام ضدتعریق استفاده کرد؟",
			answer: "خیر، پوست در زمان تابش لیزر باید کاملاً خشک، تمیز و عاری از هرگونه لوسیون، بادی اسپلش، مام ضدتعریق، کرم مرطوب‌کننده و مواد آرایشی باشد. وجود این ترکیبات می‌تواند مانند مانعی در برابر پرتو عمل کرده و سبب تجمع حرارت و بروز تاول یا سوختگی سطحی شود.",
			keyTakeaway: "پوست باید در روز مراجعه کاملاً تمیز، شسته شده و بدون کرم و مام باشد."
		},
		{
			id: "prep-sun-tan",
			category: "preparation",
			categoryLabel: "آمادگی قبل از لیزر",
			question: "فاصله زمانی مناسب پس از آفتاب گرفتن یا سولاریوم چقدر است؟",
			answer: "حداقل باید ۴ الی ۶ هفته از آخرین باری که آفتاب گرفته‌اید، به سولاریوم رفته‌اید یا از کرم‌های برنزه‌کننده استفاده کرده‌اید گذشته باشد. انجام لیزر روی پوست برنزه و ملتهب ممنوع است و می‌تواند منجر به ایجاد لکه‌های هایپرپیگمنتیشن یا تغییر رنگدانه‌های پوستی شود.",
			keyTakeaway: "حداقل ۴ تا ۶ هفته وقفه پس از آخرین حمام آفتاب یا سولاریوم الزامی است."
		},
		{
			id: "prep-exfoliation",
			category: "preparation",
			categoryLabel: "آمادگی قبل از لیزر",
			question: "استفاده از لایه‌بردارهای شیمیایی یا اسکراب قبل از لیزر مجاز است؟",
			answer: "خیر، مصرف محصولات لایه‌بردار پوستی حاوی AHA، BHA، سالیسیلیک اسید، رتینول یا اسکراب‌های زبر فیزیکی باید از حداقل ۷ الی ۱۰ روز قبل از جلسه لیزر متوقف گردد تا لایه محافظ شاخی پوست دچار نازکی و حساسیت مفرط نشود.",
			keyTakeaway: "قطع مصرف رتینول و لایه‌بردارها حداقل ۷ روز پیش از نوبت لیزر."
		},
		{
			id: "contra-pregnancy",
			category: "contraindications",
			categoryLabel: "موارد منع و محدودیت‌ها",
			question: "آیا لیزر موهای زائد در دوران بارداری یا شیردهی مجاز است؟",
			answer: "انجام لیزر در دوران بارداری به عنوان یک اقدام احتیاطی پزشکی کاملاً ممنوع است. در دوران شیردهی، انجام لیزر در نواحی غیر از سینه کاملاً ایمن است، هرچند به علت نوسانات هورمونی این دوران ممکن است سرعت پاسخ‌دهی فولیکول‌ها کمی متفاوت باشد.",
			keyTakeaway: "ممنوعیت قطعی در بارداری؛ در دوران شیردهی در نواحی غیر از سینه بلامانع است."
		},
		{
			id: "contra-roaccutane",
			category: "contraindications",
			categoryLabel: "موارد منع و محدودیت‌ها",
			question: "مصرف کپسول راکوتان (ایزوترتینوئین) چه شرایطی برای انجام لیزر ایجاد می‌کند؟",
			answer: "داروی راکوتان حساسیت سلول‌های پوستی را به شدت افزایش داده و بافت اپیدرم را شکننده و ترمیم را کند می‌کند. بنابراین لازم است حداقل ۶ ماه از قطع کامل آخرین دوز داروی راکوتان گذشته باشد تا بتوان با خیالی آسوده و بدون خطر ایجاد اسکار لیزر را شروع نمود.",
			keyTakeaway: "گذشت حداقل ۶ ماه از آخرین مصرف داروی راکوتان ضروری است."
		},
		{
			id: "contra-diseases",
			category: "contraindications",
			categoryLabel: "موارد منع و محدودیت‌ها",
			question: "کدام بیماری‌ها یا شرایط پوستی مانع از انجام لیزر هستند؟",
			answer: "بیماری‌های خودایمنی پوستی فعال (مانند پسوریازیس، لوپوس یا اگزما در محل درمان)، عفونت‌های قارچی یا ویروسی فعال نظیر تبخال، سابقه تشنج‌های حساس به نور، و داشتن سابقه بدخیمی و سرطان پوست از موارد منع انجام لیزر محسوب می‌شوند.",
			keyTakeaway: "وجود تبخال یا عفونت فعال، بیماری‌های پوستی عودکننده و صرع حساس به نور منع دارند."
		},
		{
			id: "contra-tattoos",
			category: "contraindications",
			categoryLabel: "موارد منع و محدودیت‌ها",
			question: "آیا روی پوست دارای تتو یا خال‌های گوشتی می‌توان لیزر کرد؟",
			answer: "پرتوهای لیزر توسط رنگدانه‌های تیره جذب می‌شوند و تابش مستقیم روی تتو می‌تواند باعث سوختگی شدید، تاول و از بین رفتن طرح تتو شود. در کلینیک تهران لیزر، نواحی دارای تتو یا خال‌های برجسته با برچسب‌های محافظتی پوشانده شده و لیزر با فاصله ایمن ۲ تا ۳ سانتی‌متری اطراف آن شات زده می‌شود.",
			keyTakeaway: "روی تتو شات زده نمی‌شود و با برچسب محافظتی پوشانده خواهد شد."
		},
		{
			id: "interval-schedule",
			category: "intervals",
			categoryLabel: "فواصل و تعداد جلسات",
			question: "فاصله زمانی استاندارد بین هر جلسه لیزر چقدر است؟",
			answer: "برای نواحی بدن (نظیر بیکینی، زیر بغل، پاها و دست‌ها) فواصل بین جلسات ۴ الی ۶ هفته یک‌بار تنظیم می‌شود. برای ناحیه صورت به علت چرخه سریع‌تر رشد و فاز آناژن موها، این فاصله معمولاً ۳ الی ۴ هفته در نظر گرفته می‌شود. رعایت دقیق این تقویم نقش مستقیم در ریزش حداکثری موها دارد.",
			keyTakeaway: "فاصله ۴ تا ۶ هفته برای نواحی بدن و ۳ تا ۴ هفته برای صورت."
		},
		{
			id: "interval-total-sessions",
			category: "intervals",
			categoryLabel: "فواصل و تعداد جلسات",
			question: "برای رسیدن به نتیجه دائمی و کامل به چند جلسه درمانی نیاز است؟",
			answer: "یک دوره کامل و استاندارد درمانی معمولاً بین ۶ الی ۸ جلسه منظم به طول می‌انجامد. پس از این دوره، بیش از ۸۵ الی ۹۰ درصد موهای زائد برای همیشه از بین می‌روند و موهای باقیمانده به حالت کرکی، بسیار روشن و نازک تبدیل می‌شوند.",
			keyTakeaway: "میانگین دوره استاندارد: ۶ الی ۸ جلسه منظم ماهیانه."
		},
		{
			id: "interval-maintenance",
			category: "intervals",
			categoryLabel: "فواصل و تعداد جلسات",
			question: "آیا پس از پایان جلسات، نیاز به جلسات یادآور (شارژ) وجود دارد؟",
			answer: "بله؛ فولیکول‌های خفته و تغییرات هورمونی طبیعی بدن ممکن است در گذر زمان تارهای موی جدیدی ایجاد کنند. جهت حفظ پوست مخملی و صاف، توصیه می‌شود پس از اتمام دوره اصلی، سالانه ۱ یا نهایتاً ۲ جلسه یادآور (هر ۶ تا ۱۲ ماه یک‌بار) انجام پذیرد.",
			keyTakeaway: "یک جلسه شارژ یادآور سالانه هر ۶ تا ۱۲ ماه جهت تثبیت نتیجه."
		},
		{
			id: "pain-level",
			category: "pain",
			categoryLabel: "مدیریت درد و کولینگ",
			question: "میزان درد حین لیزر چقدر است و سیستم خنک‌کننده چگونه عمل می‌کند؟",
			answer: "دستگاه‌های مورد استفاده در کلینیک تهران لیزر به سیستم خنک‌کننده تماسی و هوای سرد تا منفی ۱۰ درجه سانتی‌گراد مجهز هستند. حس دریافتی در اکثر بخش‌ها صرفاً خنکی آرامش‌بخش و گزگز بسیار خفیف شبیه به تماس کش باریک لاستیکی است و تجربه‌ای کاملاً بدون درد و بدون سوختگی را رقم می‌زند.",
			keyTakeaway: "سیستم سرمایش تماسی تا منفی ۱۰ درجه، درد و سوزش را به حداقل می‌رساند."
		},
		{
			id: "pain-numbing-cream",
			category: "pain",
			categoryLabel: "مدیریت درد و کولینگ",
			question: "آیا استفاده از پماد بی‌حسی مانند زایلاپی الزامی است؟",
			answer: "برای بیش از ۹۵٪ مراجعین نیازی به هیچ‌گونه بی‌حسی موضعی نیست. اگر آستانه درد بسیار پایینی دارید، می‌توانید ۴۵ دقیقه پیش از مراجعه پماد زایلاپی را روی ناحیه بمالید و با سلفون بپوشانید؛ اما دقت فرمایید که دقیقاً پیش از شروع تابش، پوست باید کاملاً با آب و مایع شوینده از پماد پاک و خشک گردد.",
			keyTakeaway: "اکثر مراجعین نیاز به بی‌حسی ندارند؛ در صورت استفاده باید قبل لیزر شسته شود."
		},
		{
			id: "pain-aftercare",
			category: "pain",
			categoryLabel: "مدیریت درد و کولینگ",
			question: "مراقبت‌های لازم بلافاصله پس از اتمام جلسه لیزر چیست؟",
			answer: "تا ۲۴ ساعت از دوش با آب داغ، سونا، جکوزی، استخر، فعالیت‌های ورزشی سنگین و ماساژ ناحیه اجتناب کنید. در صورت مشاهده قرمزی گذرا، می‌توانید از ژل آلوئه‌ورا خنک یا کرم زینک اکساید استفاده کنید. در نواحی در معرض نور خورشید نیز استفاده از کرم ضدآفتاب بدون رنگ ضروری است.",
			keyTakeaway: "پرهیز از آب داغ و تعریق تا ۲۴ ساعت و استفاده از زینک یا آلوئه‌ورا در صورت نیاز."
		},
		{
			id: "book-online-discount",
			category: "booking",
			categoryLabel: "رزرو و تعرفه‌ها",
			question: "چگونه نوبت خود را ثبت کنم و آیا رزرو اینترنتی تخفیف دارد؟",
			answer: "ساده‌ترین روش، استفاده از سامانه رزرواسیون آنلاین همین وب‌سایت است. با رزرو اینترنتی پکیج کل بدن، ۱۵٪ تخفیف ویژه به صورت خودکار بر روی فاکتور شما اعمال خواهد شد. همچنین می‌توانید در ساعات کاری با شماره تلفن مستقیم یا از طریق واتساپ کلینیک نوبت خود را ثبت فرمایید.",
			keyTakeaway: "سامانه رزرو آنلاین ۲۴ ساعته همراه با ۱۵٪ تخفیف ویژه پکیج کل بدن."
		},
		{
			id: "book-gender-separation",
			category: "booking",
			categoryLabel: "رزرو و تعرفه‌ها",
			question: "آیا لاین آقایان و بانوان در کلینیک تهران لیزر تفکیک شده است؟",
			answer: "بله، کلینیک تهران لیزر دارای لاین‌های مجزا با حضور اپراتورهای ارشد خانم و آقا بوده و فضاها کاملاً مستقل هستند تا حریم خصوصی، راحتی و بهداشت کامل مراجعین به طور کامل تضمین گردد.",
			keyTakeaway: "لاین‌های کاملاً تفکیک‌شده بانوان و آقایان با اپراتورهای مجرب هم‌جنس."
		},
		{
			id: "book-cancellation",
			category: "booking",
			categoryLabel: "رزرو و تعرفه‌ها",
			question: "قوانین جابجایی یا کنسلی نوبت‌های ثبت‌شده چگونه است؟",
			answer: "در صورت بروز پیشامدهای غیرمنتظره، مراجعین گرامی می‌توانند تا حداقل ۲۴ ساعت پیش از فرارسیدن موعد نوبت، از طریق تماس تلفنی یا ارسال پیام در واتساپ به پذیرش اطلاع دهند تا زمان جلسه بدون هیچ‌گونه سوخت بیعانه به روز دیگری منتقل گردد.",
			keyTakeaway: "امکان جابجایی نوبت با اطلاع حداقل ۲۴ ساعت قبل بدون کسر هزینه."
		}
	]];
	if (dbFaqs && dbFaqs.length > 0) dbFaqs.forEach((item) => {
		if (!combinedFaqs.some((f) => f.question.trim().toLowerCase() === item.question.trim().toLowerCase())) combinedFaqs.push({
			id: `db-${item.id}`,
			category: "booking",
			categoryLabel: "رزرو و کلینیک",
			question: item.question,
			answer: item.answer
		});
	});
	const faqJsonLd = createFAQPageSchema(combinedFaqs.map((f) => ({
		question: f.question,
		answer: f.answer
	})));
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "سوالات متداول",
		url: "/faq"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "سوالات متداول لیزر موهای زائد — کلینیک تخصصی تهران لیزر",
		"description": "مرجع کامل پرسش و پاسخ‌های لیزر موهای زائد در پاسداران: مراقبت‌های قبل و بعد، راکوتان و بارداری، فواصل جلسات، سیستم خنک‌کننده بدون درد و تعرفه‌ها.",
		"canonicalUrl": "/faq",
		"jsonLd": [faqJsonLd, breadcrumbJsonLd],
		"theme": "dark",
		"data-astro-cid-vagwt47q": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="faq-page-wrapper" data-astro-cid-vagwt47q><!-- Header Hero Strip --><div class="faq-hero-strip" data-astro-cid-vagwt47q><div class="container text-center" data-astro-cid-vagwt47q><div class="luxury-badge" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 14,
		"class": "badge-icon",
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>مرجع راهنما و پاسخگویی مراجعین</span></div><h1 class="page-title" data-astro-cid-vagwt47q>سوالات متداول مراجعین تهران لیزر</h1><p class="page-subtitle" data-astro-cid-vagwt47q>پاسخ‌های شفاف، علمی و تخصصی به پرسش‌های شما پیرامون آمادگی پیش از لیزر، موارد منع مصرف، تعداد جلسات و مراقبت‌ها</p><!-- Search Bar with 3D Obsidian-Gold styling --><div class="faq-search-wrapper" data-astro-cid-vagwt47q><div class="search-input-box" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 20,
		"class": "search-icon",
		"data-astro-cid-vagwt47q": true
	})}<input type="search" id="faqSearchInput" class="faq-search-input" placeholder="جستجو در سوالات و پاسخ‌ها (مثلاً: شیو، درد، راکوتان، تعداد جلسات...)" autocomplete="off" aria-label="جستجو در سوالات متداول" data-astro-cid-vagwt47q><button type="button" id="faqSearchClear" class="faq-search-clear" aria-label="پاک کردن جستجو" style="display: none;" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 16,
		"data-astro-cid-vagwt47q": true
	})}</button></div><div class="faq-search-meta" data-astro-cid-vagwt47q><span id="faqCounterText" class="counter-badge" data-astro-cid-vagwt47q>نمایش ${combinedFaqs.length} سوال تخصصی</span></div></div></div></div><!-- Main Content Section --><section class="faq-main-section" data-astro-cid-vagwt47q><div class="container container-faq" data-astro-cid-vagwt47q><!-- Category Filter Pills in 3D Obsidian-Gold --><div class="category-pills-bar" role="tablist" aria-label="دسته‌بندی سوالات متداول" data-astro-cid-vagwt47q><button type="button" class="cat-pill active" data-category="all" role="tab" aria-selected="true" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>همه سوالات (${combinedFaqs.length})</span></button><button type="button" class="cat-pill" data-category="preparation" role="tab" aria-selected="false" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>آمادگی قبل از لیزر</span></button><button type="button" class="cat-pill" data-category="contraindications" role="tab" aria-selected="false" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>منع مصرف و ایمنی</span></button><button type="button" class="cat-pill" data-category="intervals" role="tab" aria-selected="false" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>فواصل و تعداد جلسات</span></button><button type="button" class="cat-pill" data-category="pain" role="tab" aria-selected="false" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>مدیریت درد و کولینگ</span></button><button type="button" class="cat-pill" data-category="booking" role="tab" aria-selected="false" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "card",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>رزرو و تعرفه‌ها</span></button></div><!-- FAQ Accordion List --><div class="faq-accordion-list" id="faqAccordionList" data-astro-cid-vagwt47q>${combinedFaqs.map((faq, index) => renderTemplate`<details class="faq-obsidian-card"${addAttribute(faq.category, "data-category")}${addAttribute(`${faq.question} ${faq.answer} ${faq.categoryLabel} ${faq.keyTakeaway || ""}`.toLowerCase(), "data-search")}${addAttribute(index === 0, "open")} data-astro-cid-vagwt47q><summary class="faq-summary" data-astro-cid-vagwt47q><div class="faq-question-col" data-astro-cid-vagwt47q><span class="faq-cat-tag" data-astro-cid-vagwt47q>${faq.categoryLabel}</span><h3 class="faq-q-text" data-astro-cid-vagwt47q>${faq.question}</h3></div><div class="faq-toggle-circle" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"class": "toggle-icon-svg",
		"data-astro-cid-vagwt47q": true
	})}</div></summary><div class="faq-answer-body" data-astro-cid-vagwt47q><p class="answer-text" data-astro-cid-vagwt47q>${faq.answer}</p>${faq.keyTakeaway && renderTemplate`<div class="takeaway-box" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"class": "takeaway-icon",
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q><strong data-astro-cid-vagwt47q>نکته کلیدی:</strong> ${faq.keyTakeaway}</span></div>`}</div></details>`)}</div><!-- Empty Search State --><div id="faqEmptyState" class="faq-empty-state" style="display: none;" data-astro-cid-vagwt47q><div class="empty-icon-wrap" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 36,
		"class": "empty-icon",
		"data-astro-cid-vagwt47q": true
	})}</div><h3 class="empty-title" data-astro-cid-vagwt47q>سوالی با این عبارت یافت نشد!</h3><p class="empty-desc" data-astro-cid-vagwt47q>می‌توانید عبارت دیگری را جستجو کنید یا سوال خود را مستقیماً از کارشناسان پذیرش ما بپرسید.</p><div class="empty-actions" data-astro-cid-vagwt47q><button type="button" id="emptyResetBtn" class="btn-faq-outline" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 15,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>پاک کردن فیلترها</span></button><a href="tel:+989035555090" class="btn-faq-gold" dir="ltr" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>+98 903 555 5090</span></a></div></div><!-- Bottom Assistance CTA Box --><div class="faq-bottom-cta-box mt-5" data-astro-cid-vagwt47q><div class="cta-inner-grid" data-astro-cid-vagwt47q><div class="cta-info" data-astro-cid-vagwt47q><div class="cta-badge" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 14,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>مشاوره و راهنمایی رایگان</span></div><h3 class="cta-heading" data-astro-cid-vagwt47q>پاسخ سوال خود را پیدا نکردید؟</h3><p class="cta-sub" data-astro-cid-vagwt47q>تیم مشاورین پوست و پذیرش کلینیک تهران لیزر در ساعات کاری آماده پاسخگویی دقیق به تمامی سوالات شما هستند.</p></div><div class="cta-buttons-stack" data-astro-cid-vagwt47q><a href="https://wa.me/989035555090?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%AF%D8%B1%D8%A8%D8%A7%D8%B1%D9%87%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D9%84%DB%8C%D8%B2%D8%B1%20%D8%B3%D9%88%D8%A7%D9%84%DB%8C%20%D8%AF%D8%A7%D8%B4%D8%AA%D9%85." target="_blank" rel="noopener noreferrer" class="btn-faq-wa" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sms",
		"size": 18,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>مشاوره فوری در واتساپ</span></a><a href="tel:+989035555090" class="btn-faq-gold" dir="ltr" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>تماس مستقیم: ۰۹۰۳ ۵۵۵ ۵۰۹۰</span></a><a href="/booking" class="btn-faq-outline" data-astro-cid-vagwt47q>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-vagwt47q": true
	})}<span data-astro-cid-vagwt47q>رزرو آنلاین نوبت (۱۵٪ تخفیف)</span></a></div></div></div></div></section></div><script>
    (function() {
      var searchInput = document.getElementById('faqSearchInput');
      var searchClear = document.getElementById('faqSearchClear');
      var counterText = document.getElementById('faqCounterText');
      var emptyState = document.getElementById('faqEmptyState');
      var emptyResetBtn = document.getElementById('emptyResetBtn');
      var cards = Array.from(document.querySelectorAll('.faq-obsidian-card'));
      var catPills = Array.from(document.querySelectorAll('.cat-pill'));

      var activeCategory = 'all';
      var searchQuery = '';

      function filterFaqs() {
        var visibleCount = 0;
        var query = searchQuery.trim().toLowerCase();

        cards.forEach(function(card) {
          var cardCategory = card.getAttribute('data-category');
          var cardSearchText = card.getAttribute('data-search') || '';

          var matchesCat = (activeCategory === 'all') || (cardCategory === activeCategory);
          var matchesSearch = !query || cardSearchText.indexOf(query) !== -1;

          if (matchesCat && matchesSearch) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // Update counter
        if (counterText) {
          counterText.textContent = 'نمایش ' + visibleCount + ' سوال از کل ' + cards.length + ' سوال';
        }

        // Show/hide empty state
        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
      }

      // Search input handler
      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          searchQuery = e.target.value;
          if (searchClear) {
            searchClear.style.display = searchQuery ? 'flex' : 'none';
          }
          filterFaqs();
        });
      }

      // Search clear button
      if (searchClear) {
        searchClear.addEventListener('click', function() {
          if (searchInput) {
            searchInput.value = '';
            searchQuery = '';
            searchClear.style.display = 'none';
            searchInput.focus();
          }
          filterFaqs();
        });
      }

      // Category pills handler
      catPills.forEach(function(pill) {
        pill.addEventListener('click', function() {
          catPills.forEach(function(p) {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
          });
          pill.classList.add('active');
          pill.setAttribute('aria-selected', 'true');
          activeCategory = pill.getAttribute('data-category') || 'all';
          filterFaqs();
        });
      });

      // Reset button in empty state
      if (emptyResetBtn) {
        emptyResetBtn.addEventListener('click', function() {
          if (searchInput) {
            searchInput.value = '';
            searchQuery = '';
            if (searchClear) searchClear.style.display = 'none';
          }
          activeCategory = 'all';
          catPills.forEach(function(p) {
            if (p.getAttribute('data-category') === 'all') {
              p.classList.add('active');
              p.setAttribute('aria-selected', 'true');
            } else {
              p.classList.remove('active');
              p.setAttribute('aria-selected', 'false');
            }
          });
          filterFaqs();
        });
      }
    })();
  <\/script>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/faq.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/faq.astro";
var $$url = "/faq";
//#endregion
//#region \0virtual:astro:page:src/pages/faq@_@astro
var page = () => faq_exports;
//#endregion
export { page };
