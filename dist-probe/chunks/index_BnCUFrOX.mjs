globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { y as listPublicBlogPosts } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/blog/index.astro
var blog_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let postsPage = {
		items: [],
		nextCursor: null
	};
	try {
		postsPage = await listPublicBlogPosts(env.DB, 24);
	} catch (e) {
		console.error("Failed to load blog posts:", e);
	}
	const allPosts = postsPage.items;
	function getReadingTime(text) {
		const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
		return Math.max(3, Math.ceil(words / 150));
	}
	function getCategory(title, excerpt) {
		const combined = (title + " " + excerpt).toLowerCase();
		if (combined.includes("مراقبت") || combined.includes("آمادگی") || combined.includes("شیو") || combined.includes("قبل") || combined.includes("بعد")) return {
			id: "care",
			label: "آمادگی و مراقبت",
			icon: "shield"
		};
		if (combined.includes("دستگاه") || combined.includes("الکساندرایت") || combined.includes("کندلا") || combined.includes("کولینگ") || combined.includes("تکنولوژی")) return {
			id: "tech",
			label: "دستگاه و تکنولوژی",
			icon: "lightning"
		};
		if (combined.includes("پوست") || combined.includes("دارو") || combined.includes("راکوتان") || combined.includes("سولاریوم") || combined.includes("پزشک")) return {
			id: "health",
			label: "سلامت و تیپ پوستی",
			icon: "gem"
		};
		return {
			id: "standards",
			label: "استاندارد کلینیکال",
			icon: "sparkles"
		};
	}
	const featuredPost = allPosts.length > 0 ? allPosts[0] : null;
	const regularPosts = allPosts.length > 1 ? allPosts.slice(1) : [];
	const categories = [
		{
			id: "all",
			label: "همه مقالات",
			icon: "list"
		},
		{
			id: "care",
			label: "آمادگی و مراقبت",
			icon: "shield"
		},
		{
			id: "tech",
			label: "تکنولوژی و دستگاه‌ها",
			icon: "lightning"
		},
		{
			id: "health",
			label: "سلامت و تیپ پوستی",
			icon: "gem"
		},
		{
			id: "standards",
			label: "استاندارد کلینیکال",
			icon: "sparkles"
		}
	];
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "مجله تخصصی",
		url: "/blog"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "مجله تخصصی زیبایی و لیزر — کلینیک تهران لیزر",
		"description": "مرجع علمی و کاربردی مراقبت‌های پوستی، چک‌لیست قبل و بعد از لیزر، تکنولوژی الکساندرایت و استانداردهای کلینیکال پاسداران.",
		"canonicalUrl": "/blog",
		"keywords": [
			"مجله لیزر موهای زائد",
			"مقالات لیزر الکساندرایت",
			"مراقبت‌های بعد از لیزر",
			"راهنمای لیزر موهای زائد"
		],
		"jsonLd": breadcrumbJsonLd,
		"theme": "dark",
		"bodyClass": "blog-page-obsidian",
		"data-astro-cid-x255k2k2": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="blog-obsidian-wrapper" data-astro-cid-x255k2k2><!-- Hero / Header Section --><header class="blog-hero-section" data-astro-cid-x255k2k2><div class="container text-center" data-astro-cid-x255k2k2><div class="hero-badge" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"class": "badge-icon",
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>مرجع علمی و آموزش کلینیکال تهران لیزر</span></div><h1 class="blog-hero-title" data-astro-cid-x255k2k2>مجله تخصصی و راهنمای مراجعین</h1><p class="blog-hero-desc" data-astro-cid-x255k2k2>راهنماهای گام‌به‌گام آمادگی جلسات، مراقبت‌های پس از درمان، تحلیل تکنولوژی لیزر الکساندرایت و سلامت پوست تحت نظارت تیم پزشکی</p><!-- Fast Patient Guides Strip --><div class="patient-guides-grid" data-astro-cid-x255k2k2><div class="patient-guide-card" data-astro-cid-x255k2k2><div class="guide-icon-box" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 22,
		"data-astro-cid-x255k2k2": true
	})}</div><div class="guide-text" data-astro-cid-x255k2k2><div class="guide-title" data-astro-cid-x255k2k2>چک‌لیست قبل از لیزر</div><div class="guide-sub" data-astro-cid-x255k2k2>شیو با تیغ ۲۴ ساعت قبل، عدم آفتاب‌سوختگی، پوست کاملاً تمیز</div></div></div><div class="patient-guide-card" data-astro-cid-x255k2k2><div class="guide-icon-box" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 22,
		"data-astro-cid-x255k2k2": true
	})}</div><div class="guide-text" data-astro-cid-x255k2k2><div class="guide-title" data-astro-cid-x255k2k2>مراقبت ۲۴ ساعت طلایی</div><div class="guide-sub" data-astro-cid-x255k2k2>ژل زینک اکساید، پرهیز از دوش آب داغ و استخر، کرم ضدآفتاب</div></div></div><div class="patient-guide-card" data-astro-cid-x255k2k2><div class="guide-icon-box" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 22,
		"data-astro-cid-x255k2k2": true
	})}</div><div class="guide-text" data-astro-cid-x255k2k2><div class="guide-title" data-astro-cid-x255k2k2>تکنولوژی الکساندرایت</div><div class="guide-sub" data-astro-cid-x255k2k2>طول موج ۷۵۵ نانومتر کندلا با سیستم کولینگ سرمایشی بدون درد</div></div></div></div></div></header><!-- Main Content Container --><main class="container blog-main-container" data-astro-cid-x255k2k2><!-- Category Filter Tabs --><nav class="blog-category-bar" aria-label="فیلتر دسته‌بندی مقالات" data-astro-cid-x255k2k2><div class="category-chips-list" id="categoryChips" data-astro-cid-x255k2k2>${categories.map((cat) => renderTemplate`<button type="button"${addAttribute(`category-chip ${cat.id === "all" ? "active" : ""}`, "class")}${addAttribute(cat.id, "data-cat")} data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": cat.icon,
		"size": 15,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>${cat.label}</span></button>`)}</div></nav>${allPosts.length === 0 ? renderTemplate`<div class="empty-state-3d text-center" data-astro-cid-x255k2k2><div class="empty-icon-wrap" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "blog",
		"size": 36,
		"data-astro-cid-x255k2k2": true
	})}</div><h2 class="empty-title" data-astro-cid-x255k2k2>به‌زودی مقالات جدید منتشر می‌شود</h2><p class="empty-desc" data-astro-cid-x255k2k2>تیم تولید محتوای پزشکی کلینیک در حال آماده‌سازی راهنماهای تخصصی جدید است.</p></div>` : renderTemplate`<div class="articles-flow" data-astro-cid-x255k2k2><!-- Featured Article Hero Card -->${featuredPost && renderTemplate`<section class="featured-article-section" id="featuredSection"${addAttribute(getCategory(featuredPost.title, featuredPost.excerpt).id, "data-category")} data-astro-cid-x255k2k2><article class="featured-card-3d" data-astro-cid-x255k2k2><div class="featured-image-col" data-astro-cid-x255k2k2>${featuredPost.coverImage ? renderTemplate`<img${addAttribute(featuredPost.coverImage, "src")}${addAttribute(featuredPost.title, "alt")} class="featured-img" loading="eager" onerror="this.style.display='none';this.parentElement.classList.add('img-load-failed')" data-astro-cid-x255k2k2>` : renderTemplate`<div class="featured-img-fallback" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 48,
		"data-astro-cid-x255k2k2": true
	})}</div>`}<div class="featured-img-fallback img-failed-layer" aria-hidden="true" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 48,
		"data-astro-cid-x255k2k2": true
	})}</div><div class="featured-badge-pill" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 13,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>مقاله ویژه و برگزیده</span></div></div><div class="featured-content-col" data-astro-cid-x255k2k2><div class="card-meta-row" data-astro-cid-x255k2k2><span class="meta-tag meta-category" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": getCategory(featuredPost.title, featuredPost.excerpt).icon,
		"size": 13,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>${getCategory(featuredPost.title, featuredPost.excerpt).label}</span></span><span class="meta-tag meta-time" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>${getReadingTime(featuredPost.excerpt)} دقیقه مطالعه</span></span>${featuredPost.publishedAt && renderTemplate`<span class="meta-tag meta-date" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 13,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>${formatJalaliDate(featuredPost.publishedAt.slice(0, 10))}</span></span>`}</div><h2 class="featured-title" data-astro-cid-x255k2k2><a${addAttribute(`/blog/${featuredPost.slug}`, "href")} data-astro-cid-x255k2k2>${featuredPost.title}</a></h2><p class="featured-excerpt" data-astro-cid-x255k2k2>${featuredPost.excerpt}</p><div class="featured-footer" data-astro-cid-x255k2k2><div class="author-badge" data-astro-cid-x255k2k2><div class="author-avatar-mini" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"data-astro-cid-x255k2k2": true
	})}</div><span class="author-name" data-astro-cid-x255k2k2>${featuredPost.author || "تیم علمی تهران لیزر"}</span></div><a${addAttribute(`/blog/${featuredPost.slug}`, "href")} class="btn-read-featured" data-astro-cid-x255k2k2><span data-astro-cid-x255k2k2>مطالعه کامل مقاله</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 16,
		"data-astro-cid-x255k2k2": true
	})}</a></div></div></article></section>`}<!-- Regular Articles Grid --><section class="articles-grid-section" data-astro-cid-x255k2k2><div class="blog-grid" id="articlesGrid" data-astro-cid-x255k2k2>${(regularPosts.length > 0 ? regularPosts : allPosts).map((post) => {
		const cat = getCategory(post.title, post.excerpt);
		const readMinutes = getReadingTime(post.excerpt);
		return renderTemplate`<article class="article-card-3d"${addAttribute(cat.id, "data-category")} data-astro-cid-x255k2k2><div class="article-card-img-wrap" data-astro-cid-x255k2k2>${post.coverImage ? renderTemplate`<img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} class="article-card-img" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('img-load-failed')" data-astro-cid-x255k2k2>` : renderTemplate`<div class="article-card-img-fallback" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": "document",
			"size": 32,
			"data-astro-cid-x255k2k2": true
		})}</div>`}<div class="article-card-img-fallback img-failed-layer" aria-hidden="true" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": "document",
			"size": 32,
			"data-astro-cid-x255k2k2": true
		})}</div><span class="card-category-tag" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": cat.icon,
			"size": 12,
			"data-astro-cid-x255k2k2": true
		})}<span data-astro-cid-x255k2k2>${cat.label}</span></span></div><div class="article-card-body" data-astro-cid-x255k2k2><div class="card-meta-row mb-2" data-astro-cid-x255k2k2><span class="meta-item" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-x255k2k2": true
		})}<span data-astro-cid-x255k2k2>${readMinutes} دقیقه</span></span>${post.publishedAt && renderTemplate`<span class="meta-item" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 13,
			"data-astro-cid-x255k2k2": true
		})}<span data-astro-cid-x255k2k2>${formatJalaliDate(post.publishedAt.slice(0, 10))}</span></span>`}</div><h3 class="article-card-title" data-astro-cid-x255k2k2><a${addAttribute(`/blog/${post.slug}`, "href")} data-astro-cid-x255k2k2>${post.title}</a></h3><p class="article-card-excerpt" data-astro-cid-x255k2k2>${post.excerpt}</p><div class="article-card-footer" data-astro-cid-x255k2k2><div class="author-inline" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
			"name": "users",
			"size": 13,
			"data-astro-cid-x255k2k2": true
		})}<span data-astro-cid-x255k2k2>${post.author || "تهران لیزر"}</span></div><a${addAttribute(`/blog/${post.slug}`, "href")} class="read-link-action" data-astro-cid-x255k2k2><span data-astro-cid-x255k2k2>مطالعه</span>${renderComponent($$result, "Icon", $$Icon, {
			"name": "arrowLeft",
			"size": 14,
			"data-astro-cid-x255k2k2": true
		})}</a></div></div></article>`;
	})}</div></section></div>`}<!-- Bottom Clinical Consultation CTA --><section class="blog-cta-banner" data-astro-cid-x255k2k2><div class="cta-inner" data-astro-cid-x255k2k2><div class="cta-text-col" data-astro-cid-x255k2k2><span class="cta-label" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 16,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>مشاوره تخصصی و تعیین تیپ پوستی</span></span><h2 class="cta-title" data-astro-cid-x255k2k2>سوالی درباره روند درمان و جلسات لیزر دارید؟</h2><p class="cta-sub" data-astro-cid-x255k2k2>پزشکان و کارشناسان کلینیک تخصصی تهران لیزر در خیابان پایدارفرد پاسداران آماده پاسخگویی و ارائه مشاوره دقیق به شما هستند.</p></div><div class="cta-actions-col" data-astro-cid-x255k2k2><a href="/booking" class="btn-cta-primary" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 17,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>رزرو آنلاین نوبت با تخفیف</span></a><a href="tel:09000005090" class="btn-cta-secondary" data-astro-cid-x255k2k2>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 17,
		"data-astro-cid-x255k2k2": true
	})}<span data-astro-cid-x255k2k2>تماس مستقیم با کلینیک</span></a></div></div></section></main></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/index.astro";
var $$url = "/blog";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/index@_@astro
var page = () => blog_exports;
//#endregion
export { page };
