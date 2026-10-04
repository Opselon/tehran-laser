globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { r as resolveCanonicalOrigin } from "./canonical_ssJtZI0c.mjs";
//#region src/pages/clinic.astro
var clinic_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Clinic,
	file: () => $$file,
	url: () => $$url
});
var $$Clinic = createComponent(($$result, $$props, $$slots) => {
	const origin = resolveCanonicalOrigin();
	const aboutJsonLd = {
		"@context": "https://schema.org",
		"@type": ["AboutPage", "MedicalWebPage"],
		"@id": `${origin}/clinic#about`,
		url: `${origin}/clinic`,
		name: "درباره کلینیک تخصصی تهران لیزر پاسداران",
		description: "مرکز تخصصی لیزر و زیبایی تهران لیزر در پاسداران با تجهیزات اورجینال کندلا جنتل مکس پرو ۲۰۲۶، سیستم سرمایش DCD و کادر مجرب پزشکی.",
		inLanguage: "fa-IR",
		mainEntity: { "@id": `${origin}/#clinic` },
		isPartOf: { "@id": `${origin}/#website` }
	};
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "درباره کلینیک",
		url: "/clinic"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "درباره کلینیک و تکنولوژی کندلا ۲۰۲۶ — کلینیک تهران لیزر پاسداران",
		"description": "معرفی فناوری کندلا جنتل مکس پرو ۲۰۲۶ (الکساندرایت ۷۵۵nm و ان‌دی‌یاگ ۱۰۶۴nm)، خنک‌کننده کرایوژنیک DCD، اسپات سایز ۲۴mm و پروتکل‌های بهداشتی کلینیک تهران لیزر.",
		"canonicalUrl": "/clinic",
		"keywords": [
			"کلینیک لیزر پاسداران",
			"کندلا جنتل مکس پرو ۲۰۲۶",
			"مرکز لیزر الکساندرایت تهران",
			"کلینیک زیبایی پایدارفرد"
		],
		"jsonLd": [aboutJsonLd, breadcrumbJsonLd],
		"bodyClass": "clinic-obsidian-root",
		"data-astro-cid-5e2fna4y": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="clinic-page-wrapper" data-astro-cid-5e2fna4y><!-- Hero / Header Showcase --><header class="clinic-hero" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="hero-chip" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 16,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>مرکز تخصصی لیزر و زیبایی پاسداران</span></div><h1 class="hero-title" data-astro-cid-5e2fna4y>تکنولوژی فوق‌پیشرفته <span class="gold-gradient-text" data-astro-cid-5e2fna4y>کندلا جنتل مکس پرو ۲۰۲۶</span> در تهران</h1><p class="hero-desc" data-astro-cid-5e2fna4y>استاندارد طلایی پزشکی پوست و مو با تلفیق دو طول موج الکساندرایت و ان‌دی‌یاگ، سرمایش داینامیک کرایوژنیک بدون درد و نظارت مستقیم پزشکان متخصص در محیطی آرام و استاندارد.</p><!-- Trust Badges Strip --><div class="hero-badges-grid" data-astro-cid-5e2fna4y><div class="hero-badge-card" data-astro-cid-5e2fna4y><div class="badge-icon-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><div class="badge-title" data-astro-cid-5e2fna4y>تاییدیه رسمی FDA و CE</div><div class="badge-sub" data-astro-cid-5e2fna4y>مجوز رسمی تجهیزات پزشکی آمریکا و اروپا</div></div></div><div class="hero-badge-card" data-astro-cid-5e2fna4y><div class="badge-icon-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><div class="badge-title" data-astro-cid-5e2fna4y>دو طول موج همزمان</div><div class="badge-sub" data-astro-cid-5e2fna4y>Alexandrite 755nm + Nd:YAG 1064nm</div></div></div><div class="hero-badge-card" data-astro-cid-5e2fna4y><div class="badge-icon-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><div class="badge-title" data-astro-cid-5e2fna4y>کولینگ کرایوژنیک DCD</div><div class="badge-sub" data-astro-cid-5e2fna4y>خنک‌کنندگی منفی ۲۰ درجه، تجربه بدون درد</div></div></div><div class="hero-badge-card" data-astro-cid-5e2fna4y><div class="badge-icon-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><div class="badge-title" data-astro-cid-5e2fna4y>تحت نظارت پزشک متخصص</div><div class="badge-sub" data-astro-cid-5e2fna4y>پرونده بالینی و اپراتورهای ارشد آموزش‌دیده</div></div></div></div></div></header><!-- Candela GentleMax Pro 2026 Showcase --><section class="section tech-section" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="section-heading text-center" data-astro-cid-5e2fna4y><div class="pill-label" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 14,
		"data-astro-cid-5e2fna4y": true
	})} شناسنامه فناوری</div><h2 class="section-title" data-astro-cid-5e2fna4y>بررسی تخصصی دستگاه <span class="gold-gradient-text" data-astro-cid-5e2fna4y>Candela GentleMax Pro 2026</span></h2><p class="section-lead" data-astro-cid-5e2fna4y>دستگاه کندلا ۲۰۲۶ برترین پلتفرم درمانی موهای زائد در کلینیک‌های معتبر بین‌المللی است که اثربخشی قطعی را با حداکثر ایمنی و سرعت ترکیب کرده است.</p></div><!-- Interactive Wavelength Explorer --><div class="tech-explorer-card" data-astro-cid-5e2fna4y><div class="wavelength-tabs" role="tablist" data-astro-cid-5e2fna4y><button class="wl-tab active" data-target="alex" role="tab" aria-selected="true" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>الکساندرایت ۷۵۵ نانومتر (Alexandrite)</span></button><button class="wl-tab" data-target="yag" role="tab" aria-selected="false" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>ان‌دی‌یاگ ۱۰۶۴ نانومتر (Nd:YAG)</span></button></div><div class="wavelength-panel active" id="panel-alex" data-astro-cid-5e2fna4y><div class="wl-grid" data-astro-cid-5e2fna4y><div class="wl-content" data-astro-cid-5e2fna4y><span class="wl-pill" data-astro-cid-5e2fna4y>پیک جذب ملانین فوق‌العاده بالا</span><h3 class="wl-title" data-astro-cid-5e2fna4y>طول موج ۷۵۵nm الکساندرایت؛ طلایه‌دار موهای روشن و نازک</h3><p class="wl-text" data-astro-cid-5e2fna4y>طول موج ۷۵۵ نانومتر دارای بالاترین ضریب جذب نوری توسط رنگدانه‌های ملانین در ساقه و ریشه مو است. این ویژگی سبب تخریب حرارتی کامل پیاز مو (Papilla) در کمترین تعداد جلسات درمانی می‌شود.</p><ul class="spec-checks" data-astro-cid-5e2fna4y><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>ایده‌آل برای تیپ‌های پوستی روشن تا گندمی (Fitzpatrick I-III)</span></li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>قدرت برتر در تخریب موهای کرکی، نازک و کم‌رنگ باقی‌مانده</span></li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>ریزش تا ۹۰ درصدی موها تنها پس از جلسه اول و دوم</span></li></ul></div><div class="wl-stats" data-astro-cid-5e2fna4y><div class="stat-box" data-astro-cid-5e2fna4y><span class="stat-num" data-astro-cid-5e2fna4y>۷۵۵</span><span class="stat-unit" data-astro-cid-5e2fna4y>نانومتر</span><span class="stat-desc" data-astro-cid-5e2fna4y>طول موج فوتونیک دقیق</span></div><div class="stat-box" data-astro-cid-5e2fna4y><span class="stat-num" data-astro-cid-5e2fna4y>۶-۸</span><span class="stat-unit" data-astro-cid-5e2fna4y>جلسه</span><span class="stat-desc" data-astro-cid-5e2fna4y>طول دوره پاسخ کامل</span></div></div></div></div><div class="wavelength-panel" id="panel-yag" data-astro-cid-5e2fna4y><div class="wl-grid" data-astro-cid-5e2fna4y><div class="wl-content" data-astro-cid-5e2fna4y><span class="wl-pill yag" data-astro-cid-5e2fna4y>نفوذ ایمن و عمیق به درمیس</span><h3 class="wl-title" data-astro-cid-5e2fna4y>طول موج ۱۰۶۴nm ان‌دی‌یاگ؛ امنیت ۱۰۰٪ برای پوست‌های سبزه و برنزه</h3><p class="wl-text" data-astro-cid-5e2fna4y>پالس‌های بلند ۱۰۶۴ نانومتر از ملانین سطحی اپیدرم عبور کرده و انرژی گرمایی را مستقیماً به عروق تغذیه‌کننده فولیکول در لایه‌های عمقی می‌رسانند. بدون کوچک‌ترین ریسک سوختگی یا لک.</p><ul class="spec-checks" data-astro-cid-5e2fna4y><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>کاملاً ایمن برای پوست‌های سبزه، گندمی تیره و برنزه (Fitzpatrick IV-VI)</span></li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>پیشگیری مطلق از هایپرپیگمانتاسیون (PIH) پس از درمان</span></li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} <span data-astro-cid-5e2fna4y>نفوذ عمیق برای موهای ریشه‌دار و ضخیم نواحی مقاوم بدن</span></li></ul></div><div class="wl-stats" data-astro-cid-5e2fna4y><div class="stat-box" data-astro-cid-5e2fna4y><span class="stat-num" data-astro-cid-5e2fna4y>۱۰۶۴</span><span class="stat-unit" data-astro-cid-5e2fna4y>نانومتر</span><span class="stat-desc" data-astro-cid-5e2fna4y>طول موج نفوذ عمقی</span></div><div class="stat-box" data-astro-cid-5e2fna4y><span class="stat-num" data-astro-cid-5e2fna4y>۰٪</span><span class="stat-unit" data-astro-cid-5e2fna4y>ریسک لک</span><span class="stat-desc" data-astro-cid-5e2fna4y>ایمنی اثبات‌شده بالینی</span></div></div></div></div></div><!-- 3D Feature Cards: DCD Cooling & 24mm Spot Size --><div class="features-dual-grid" data-astro-cid-5e2fna4y><div class="feature-card-3d" data-astro-cid-5e2fna4y><div class="card-icon-accent" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 30,
		"data-astro-cid-5e2fna4y": true
	})}</div><h3 class="card-title" data-astro-cid-5e2fna4y>سیستم خنک‌کننده کرایوژنیک DCD هوشمند</h3><p class="card-body" data-astro-cid-5e2fna4y>فناوری انحصاری Dynamic Cooling Device کندلا، پیش از هر پالس لیزر، مه خنک‌کننده کرایوژنیک گاز هیدروفلوئوروکربن را در کسر کسری از ثانیه روی اپیدرم اسپری می‌کند. دمای پوست تا منفی ۲۰ درجه سانتی‌گراد افت کرده و گیرنده‌های درد را موقتاً بی‌حس می‌سازد.</p><div class="card-metric-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>محافظت کامل لایه شاخی پوست در برابر شوک حرارتی</span></div></div><div class="feature-card-3d" data-astro-cid-5e2fna4y><div class="card-icon-accent" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "target",
		"size": 30,
		"data-astro-cid-5e2fna4y": true
	})}</div><h3 class="card-title" data-astro-cid-5e2fna4y>اسپات سایز بزرگ ۲۴ میلی‌متری و فرکانس 10Hz</h3><p class="card-body" data-astro-cid-5e2fna4y>قطر تابش ۲۴ میلی‌متری کندلا ۲۰۲۶ با کاهش پدیده پراکندگی نوری (Optical Scattering)، عمق نفوذ فوتون‌ها را تا ۴۰٪ افزایش می‌دهد. علاوه بر افزایش اثربخشی، مدت زمان درمان کل بدن (Full Body) به زیر ۳۵ دقیقه کاهش یافته است.</p><div class="card-metric-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>کاهش زمان جلسه تا ۵۰٪ همراه با پوشش یکنواخت شات‌ها</span></div></div></div><!-- Interactive Metrics Strip --><div class="metrics-grid" data-astro-cid-5e2fna4y><div class="metric-card" data-astro-cid-5e2fna4y><div class="m-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div class="m-val" data-astro-cid-5e2fna4y>۱۰۰ J/cm²</div><div class="m-label" data-astro-cid-5e2fna4y>حداکثر توان خروجی فلوئنس</div><div class="m-sub" data-astro-cid-5e2fna4y>تخریب حرارتی قوی‌ترین فولیکول‌ها</div></div><div class="metric-card" data-astro-cid-5e2fna4y><div class="m-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div class="m-val" data-astro-cid-5e2fna4y>۲ الی ۳۰۰ ms</div><div class="m-label" data-astro-cid-5e2fna4y>پهنای پالس فوق متغیر</div><div class="m-sub" data-astro-cid-5e2fna4y>تنظیم میلی‌ثانیه‌ای مطابق ضخامت مو</div></div><div class="metric-card" data-astro-cid-5e2fna4y><div class="m-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chart",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div class="m-val" data-astro-cid-5e2fna4y>۹۲٪+</div><div class="m-label" data-astro-cid-5e2fna4y>راندمان پاکسازی دائمی</div><div class="m-sub" data-astro-cid-5e2fna4y>تایید بالینی مستند در دوره درمان</div></div><div class="metric-card" data-astro-cid-5e2fna4y><div class="m-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 22,
		"data-astro-cid-5e2fna4y": true
	})}</div><div class="m-val" data-astro-cid-5e2fna4y>روزانه</div><div class="m-label" data-astro-cid-5e2fna4y>کالیبراسیون و تست توان سنجی</div><div class="m-sub" data-astro-cid-5e2fna4y>تضمین ثبات انرژی شات‌ها در هر شیفت</div></div></div></div></section><!-- Medical Team & Supervision Section --><section class="section team-section" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="section-heading text-center" data-astro-cid-5e2fna4y><div class="pill-label" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 14,
		"data-astro-cid-5e2fna4y": true
	})} سرمایه انسانی متخصص</div><h2 class="section-title" data-astro-cid-5e2fna4y>تیم پزشکی و کادر درمانی تهران لیزر</h2><p class="section-lead" data-astro-cid-5e2fna4y>کیفیت نتایج لیزر به اندازه دستگاه، به مهارت و دانش اپراتور و پزشک وابسته است. در تهران لیزر هر شات بر اساس پروتکل پزشکی ثبت‌شده شلیک می‌شود.</p></div><div class="team-grid" data-astro-cid-5e2fna4y><div class="team-card" data-astro-cid-5e2fna4y><div class="team-avatar-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 44,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<div class="team-badge" data-astro-cid-5e2fna4y>پزشک ناظر</div></div><div class="team-info" data-astro-cid-5e2fna4y><h3 class="team-name" data-astro-cid-5e2fna4y>دکتر مریم سلیمانی</h3><div class="team-role" data-astro-cid-5e2fna4y>پزشک پوست، مو و زیبایی — شماره نظام پزشکی ۱۲۸۴۷۱</div><p class="team-desc" data-astro-cid-5e2fna4y>ویزیت اولیه و ارزیابی فیتزپاتریک پوستی مراجعین، تعیین سطح ایمن فلوئنس و نظارت مستمر بر روند پاسخ‌دهی فولیکول‌ها.</p><div class="team-skills" data-astro-cid-5e2fna4y><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} پچ‌تست حساسیت</span><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} پروتکل درمانی شخصی</span></div></div></div><div class="team-card" data-astro-cid-5e2fna4y><div class="team-avatar-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 44,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<div class="team-badge" data-astro-cid-5e2fna4y>لاین بانوان</div></div><div class="team-info" data-astro-cid-5e2fna4y><h3 class="team-name" data-astro-cid-5e2fna4y>اپراتورهای ارشد بانوان</h3><div class="team-role" data-astro-cid-5e2fna4y>دارای گواهینامه معتبر کاربری لیزرهای پزشکی کندلا</div><p class="team-desc" data-astro-cid-5e2fna4y>بیش از ۵۰۰۰ ساعت تجربه بالینی در لاین اختصاصی بانوان با شات‌های دقیق بدون جاانداختگی، حفظ کامل حریم خصوصی و بهداشت فردی.</p><div class="team-skills" data-astro-cid-5e2fna4y><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} شات نامحدود دقیق</span><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} محیط کاملاً محرمانه</span></div></div></div><div class="team-card" data-astro-cid-5e2fna4y><div class="team-avatar-box" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 44,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<div class="team-badge" data-astro-cid-5e2fna4y>لاین آقایان</div></div><div class="team-info" data-astro-cid-5e2fna4y><h3 class="team-name" data-astro-cid-5e2fna4y>اپراتور تخصصی آقایان</h3><div class="team-role" data-astro-cid-5e2fna4y>کادر مجرب در اتاق مجزا با تجهیزات بهداشتی یکبارمصرف</div><p class="team-desc" data-astro-cid-5e2fna4y>تنظیم انرژی ویژه فولیکول‌های ضخیم آقایان (آنکارد ریش، خط گردن، کمر، ورزشکاران) با بالاترین سرعت و بدون سوزش.</p><div class="team-skills" data-astro-cid-5e2fna4y><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} لاین مستقل آقایان</span><span class="skill-tag" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 12,
		"data-astro-cid-5e2fna4y": true
	})} تنظیم ویژه ریش و گردن</span></div></div></div></div></div></section><!-- Hygiene & Certification Protocols --><section class="section hygiene-section" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="hygiene-layout" data-astro-cid-5e2fna4y><div class="hygiene-content" data-astro-cid-5e2fna4y><div class="pill-label" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clean",
		"size": 14,
		"data-astro-cid-5e2fna4y": true
	})} پروتکل سلامت</div><h2 class="section-title" data-astro-cid-5e2fna4y>بهداشت و استریلیزاسیون فراتر از استانداردهای بیمارستانی</h2><p class="section-lead" data-astro-cid-5e2fna4y>سلامت و آسودگی خیال شما اولویت مطلق ماست. تمام مراحل آماده‌سازی اتاق و تجهیزات در حضور خود مراجع انجام می‌پذیرد.</p><div class="hygiene-list" data-astro-cid-5e2fna4y><div class="hygiene-item" data-astro-cid-5e2fna4y><div class="h-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clean",
		"size": 20,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><h4 class="h-title" data-astro-cid-5e2fna4y>سری‌های شخصی و پک بهداشتی انحصاری</h4><p class="h-desc" data-astro-cid-5e2fna4y>سری هندپیس به صورت پلمپ و یکبار مصرف برای هر شخص باز شده و ملحفه و عینک ایمنی اختصاصی تحویل داده می‌شود.</p></div></div><div class="hygiene-item" data-astro-cid-5e2fna4y><div class="h-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 20,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><h4 class="h-title" data-astro-cid-5e2fna4y>ضدعفونی با استانداردهای بیمارستانی سطح بالا</h4><p class="h-desc" data-astro-cid-5e2fna4y>سلفون‌کشی کامل سیم‌ها و پروب دستگاه و شستشوی سطوح با مواد مجاز وزارت بهداشت بین هر دو نوبت مراجعین.</p></div></div><div class="hygiene-item" data-astro-cid-5e2fna4y><div class="h-icon" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 20,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><h4 class="h-title" data-astro-cid-5e2fna4y>سیستم فیلتراسیون هوا و تهویه فعال</h4><p class="h-desc" data-astro-cid-5e2fna4y>فیلترهای هپای فعال در اتاق‌های لیزر برای حذف فوری ذرات هوابرد و تضمین هوای مطبوع و پاکیزه.</p></div></div></div></div><!-- Official Accreditations Card --><div class="certifications-card" data-astro-cid-5e2fna4y><h3 class="cert-title" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 22,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})} گواهی‌ها و اعتبارسنجی‌های بین‌المللی</h3><ul class="cert-list" data-astro-cid-5e2fna4y><li class="cert-item" data-astro-cid-5e2fna4y><div class="cert-check" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>مجوز رسمی وزارت بهداشت و درمان ایران</strong><span data-astro-cid-5e2fna4y>شناسه مرکز درمانی معتبر ثبت‌شده در سامانه پزشکی</span></div></li><li class="cert-item" data-astro-cid-5e2fna4y><div class="cert-check" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>تاییدیه سازمان غذا و داروی آمریکا (US FDA)</strong><span data-astro-cid-5e2fna4y>استاندارد اثربخشی بالینی دائم برای کندلا جنتل مکس پرو</span></div></li><li class="cert-item" data-astro-cid-5e2fna4y><div class="cert-check" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>نشان استاندارد سلامت اروپا (CE Mark)</strong><span data-astro-cid-5e2fna4y>مطابقت کامل با الزامات ایمنی تجهیزات پزشکی ایمن</span></div></li><li class="cert-item" data-astro-cid-5e2fna4y><div class="cert-check" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</div><div data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>گواهینامه مدیریت کیفیت ISO 13485</strong><span data-astro-cid-5e2fna4y>استاندارد بین‌المللی کنترل فرآیندهای تجهیزات کلینیکی</span></div></li></ul></div></div></div></section><!-- Clinic Highlights & Pasdaran Location --><section class="section location-info-section" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="location-card-3d" data-astro-cid-5e2fna4y><div class="loc-grid" data-astro-cid-5e2fna4y><div class="loc-details" data-astro-cid-5e2fna4y><div class="pill-label" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 14,
		"data-astro-cid-5e2fna4y": true
	})} دسترسی و لوکیشن</div><h3 class="loc-title" data-astro-cid-5e2fna4y>محیطی لوکس و آرام در قلب منطقه پاسداران</h3><p class="loc-desc" data-astro-cid-5e2fna4y>کلینیک تهران لیزر در خیابان پایدارفرد، نبش بوستان هفتم واقع شده است؛ موقعیتی دنج و با دسترسی آسان به بزرگراه‌های شهید صیاد شیرازی و شهید همت با امکان پارک خودرو بدون دغدغه ترافیک.</p><div class="loc-meta" data-astro-cid-5e2fna4y><div class="meta-row" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "pin",
		"size": 18,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>آدرس:</strong> تهران، پاسداران، خیابان پایدارفرد، نبش بوستان هفتم</span></div><div class="meta-row" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 18,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>شماره تماس پذیرش:</strong> <a href="tel:+989035555090" dir="ltr" data-astro-cid-5e2fna4y>۰۹۰۳ ۵۵۵ ۵۰۹۰</a></span></div><div class="meta-row" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 18,
		"class": "gold-icon",
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y><strong data-astro-cid-5e2fna4y>ساعات کاری:</strong> شنبه الی چهارشنبه ۹:۰۰ الی ۲۰:۰۰ | پنجشنبه‌ها ۹:۰۰ الی ۱۸:۰۰</span></div></div></div><div class="loc-amenities" data-astro-cid-5e2fna4y><h4 class="amenities-title" data-astro-cid-5e2fna4y>امکانات رفاهی مرکز:</h4><ul class="amenities-list" data-astro-cid-5e2fna4y><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} سالن انتظار VIP با پذیرایی گرم و سرد</li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} اینترنت بی‌سیم پرسرعت و رایگان</li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} اتاق‌های ایزوله با سیستم موسیقی آرامش‌بخش</li><li data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "check",
		"size": 16,
		"data-astro-cid-5e2fna4y": true
	})} کمدهای قفل‌دار اختصاصی برای لوازم مراجعین</li></ul></div></div></div></div></section><!-- FAQ Accordion --><section class="section faq-section" data-astro-cid-5e2fna4y><div class="container container-narrow" data-astro-cid-5e2fna4y><div class="section-heading text-center" data-astro-cid-5e2fna4y><div class="pill-label" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 14,
		"data-astro-cid-5e2fna4y": true
	})} پاسخ به ابهامات</div><h2 class="section-title" data-astro-cid-5e2fna4y>پرسش‌های متداول مراجعین درباره تکنولوژی کندلا ۲۰۲۶</h2></div><div class="faq-accordion" data-astro-cid-5e2fna4y><details class="faq-item" open data-astro-cid-5e2fna4y><summary class="faq-summary" data-astro-cid-5e2fna4y><span class="faq-q" data-astro-cid-5e2fna4y>آیا لیزر با کندلا جنتل مکس پرو ۲۰۲۶ احساس درد دارد؟</span><span class="faq-arrow" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</span></summary><div class="faq-answer" data-astro-cid-5e2fna4y>به لطف سیستم کولینگ داینامیک کرایوژنیک DCD که در کسر ثانیه قبل از شات پوست را به دمای منفی ۲۰ درجه می‌رساند، عمده مراجعین فقط حس خنکی ملایمی را گزارش می‌کنند و هیچ نیازی به پمادهای بی‌حسی زایلاپی یا بی‌حس‌کننده نیست.</div></details><details class="faq-item" data-astro-cid-5e2fna4y><summary class="faq-summary" data-astro-cid-5e2fna4y><span class="faq-q" data-astro-cid-5e2fna4y>تفاوت کندلا جنتل مکس پرو اصل با دستگاه‌های تیتانیوم و رولی چیست؟</span><span class="faq-arrow" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</span></summary><div class="faq-answer" data-astro-cid-5e2fna4y>دستگاه‌های رولی (مانند تیتانیوم یا دایودهای تماسی) بر پایه ژل کار می‌کنند و تماس مداوم هندپیس دارند. کندلا ۲۰۲۶ یک لیزر شاتی واقعی و غیرتماسی از برند Candela آمریکا است که بدون نیاز به ژل و با سری اختصاصی یکبارمصرف شلیک می‌شود و عمق تخریب بسیار بالاتر و ماندگارتری دارد.</div></details><details class="faq-item" data-astro-cid-5e2fna4y><summary class="faq-summary" data-astro-cid-5e2fna4y><span class="faq-q" data-astro-cid-5e2fna4y>چند جلسه برای حذف دائمی موها نیاز است؟</span><span class="faq-arrow" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</span></summary><div class="faq-answer" data-astro-cid-5e2fna4y>پروتکل استاندارد پزشکی بین ۶ الی ۸ جلسه با فواصل زمانی ۴ تا ۶ هفته بسته به ناحیه درمان است. پس از اتمام دوره، بیش از ۹۰ درصد موها به طور دائم از بین رفته و تنها جلسات شارژ سالانه توصیه می‌گردد.</div></details><details class="faq-item" data-astro-cid-5e2fna4y><summary class="faq-summary" data-astro-cid-5e2fna4y><span class="faq-q" data-astro-cid-5e2fna4y>آیا افراد با پوست سبزه یا برنزه می‌توانند با این دستگاه لیزر انجام دهند؟</span><span class="faq-arrow" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}</span></summary><div class="faq-answer" data-astro-cid-5e2fna4y>بله، دستگاه ما مجهز به طول موج اختصاصی ان‌دی‌یاگ (Nd:YAG 1064nm) است که منحصراً برای تایپ‌های پوستی سبزه و تیره طراحی شده و ایمن‌ترین لیزر تاییدشده بدون هیچ‌گونه ریسک لک یا تغییر رنگدانه است.</div></details></div></div></section><!-- Obsidian-Gold Booking CTA --><section class="section cta-section" data-astro-cid-5e2fna4y><div class="container" data-astro-cid-5e2fna4y><div class="obsidian-cta-card" data-astro-cid-5e2fna4y><div class="cta-sparkle-decor" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 48,
		"data-astro-cid-5e2fna4y": true
	})}</div><h2 class="cta-title" data-astro-cid-5e2fna4y>تجربه بالاترین سطح درمان و آرامش در کلینیک تهران لیزر</h2><p class="cta-desc" data-astro-cid-5e2fna4y>هم‌اکنون نوبت خود را به صورت آنلاین ثبت نمایید و از ۱۵٪ تخفیف ویژه رزرو اینترنتی پکیج کل بدن به همراه جلسه مشاوره رایگان بهره‌مند شوید.</p><div class="cta-actions" data-astro-cid-5e2fna4y><a href="/booking" class="btn-3d-gold" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>رزرو آنلاین نوبت با ۱۵٪ تخفیف</span></a><a href="tel:+989035555090" class="btn-obsidian-outline" data-astro-cid-5e2fna4y>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 18,
		"data-astro-cid-5e2fna4y": true
	})}<span data-astro-cid-5e2fna4y>مشاوره تلفنی: ۰۹۰۳ ۵۵۵ ۵۰۹۰</span></a></div></div></div></section></div>` })}<!-- Client Script for Interactive Wavelength Switcher -->${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/clinic.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/clinic.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/clinic.astro";
var $$url = "/clinic";
//#endregion
//#region \0virtual:astro:page:src/pages/clinic@_@astro
var page = () => clinic_exports;
//#endregion
export { page };
