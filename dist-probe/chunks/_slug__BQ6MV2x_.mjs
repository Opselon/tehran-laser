globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { D as createAstro, T as unescapeHTML, _ as addAttribute, c as Fragment, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { n as createArticleSchema, r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { n as findPublicBlogPostBySlug, y as listPublicBlogPosts } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/blog/[slug].astro
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
	if (!slug) return Astro.redirect("/blog");
	const post = await findPublicBlogPostBySlug(env.DB, slug);
	if (!post) return Astro.redirect("/404");
	let related = [];
	try {
		related = (await listPublicBlogPosts(env.DB, 6)).items.filter((p) => p.slug !== post.slug).slice(0, 3);
	} catch (e) {
		console.error("Failed to load related posts:", e);
	}
	const readingMinutes = Math.max(3, Math.ceil(post.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length / 150));
	function extractToc(html) {
		const items = [];
		const seen = /* @__PURE__ */ new Set();
		const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
		let match;
		while ((match = headingRe.exec(html)) !== null) {
			if (!match[2]) continue;
			const level = Number(match[1]);
			const raw = match[2].replace(/<[^>]*>/g, "").trim();
			if (!raw) continue;
			let id = raw.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60);
			if (!id) id = "section-" + items.length;
			let unique = id;
			let n = 2;
			while (seen.has(unique)) {
				unique = `${id}-${n}`;
				n += 1;
			}
			seen.add(unique);
			items.push({
				id: unique,
				text: raw,
				level
			});
		}
		return items;
	}
	function injectHeadingIds(html, toc) {
		let idx = 0;
		return html.replace(/<h([23])([^>]*)>/gi, (full, level, attrs) => {
			const item = toc[idx];
			idx += 1;
			if (!item) return full;
			if (/id\s*=\s*["'][^"']*["']/i.test(attrs)) return full;
			return `<h${level}${attrs} id="${item.id}">`;
		});
	}
	const toc = extractToc(post.content);
	const contentWithIds = injectHeadingIds(post.content, toc);
	const hasToc = toc.length > 0;
	const preCareHtml = `
<div class="clinical-callout callout-pre">
  <div class="callout-icon-box"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 19.5 5.5v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6L12 2.5Zm-3.2 8.2 2.3 2.3 4.2-4.2"></path></svg></div>
  <div class="callout-body">
    <div class="callout-title">چک‌لیست قبل از جلسه لیزر</div>
    <div class="callout-text">شیو با تیغ ۲۴ ساعت قبل، پوست تمیز و بدون لوسیون، پرهیز ۳ تا ۴ هفته‌ای از برنزه‌سازی و سولاریوم.</div>
  </div>
</div>`;
	const postCareHtml = `
<div class="clinical-callout callout-post">
  <div class="callout-icon-box"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm-3 10 2.5 2.5 5-5"></path></svg></div>
  <div class="callout-body">
    <div class="callout-title">مراقبت ۲۴ ساعت طلایی پس از درمان</div>
    <div class="callout-text">استفاده از ژل زینک اکساید و آلوئه‌ورا، پرهیز از دوش آب داغ، استخر، سونا و ورزش‌های تعریق‌زا تا ۲۴ ساعت.</div>
  </div>
</div>`;
	const blogJsonLdArray = [createArticleSchema({
		title: post.title,
		slug: post.slug,
		excerpt: post.excerpt,
		coverImage: post.coverImage ?? void 0,
		author: post.author || void 0,
		publishedAt: post.publishedAt || void 0
	}), createBreadcrumbSchema([
		{
			name: "صفحه اصلی",
			url: "/"
		},
		{
			name: "مجله تخصصی",
			url: "/blog"
		},
		{
			name: post.title,
			url: `/blog/${post.slug}`
		}
	])];
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": `${post.seo.seoTitle || post.title} — تهران لیزر`,
		"description": post.seo.seoDescription || post.excerpt,
		"canonicalUrl": post.seo.canonicalUrl || `/blog/${post.slug}`,
		"ogType": "article",
		"ogImage": post.coverImage ?? void 0,
		"jsonLd": blogJsonLdArray,
		"theme": "dark",
		"bodyClass": "blog-article-obsidian",
		"data-astro-cid-zg7dkzxc": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="article-obsidian-wrapper" data-astro-cid-zg7dkzxc><!-- Article Header --><header class="article-hero-section" data-astro-cid-zg7dkzxc><div class="container container-sm text-center" data-astro-cid-zg7dkzxc><nav class="article-breadcrumbs" aria-label="مسیر صفحه" data-astro-cid-zg7dkzxc><a href="/" data-astro-cid-zg7dkzxc>صفحه اصلی</a>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronLeft",
		"size": 13,
		"class": "bc-sep-icon",
		"data-astro-cid-zg7dkzxc": true
	})}<a href="/blog" data-astro-cid-zg7dkzxc>مجله تخصصی</a>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronLeft",
		"size": 13,
		"class": "bc-sep-icon",
		"data-astro-cid-zg7dkzxc": true
	})}<span class="bc-current" data-astro-cid-zg7dkzxc>${post.title}</span></nav><h1 class="article-hero-title" data-astro-cid-zg7dkzxc>${post.title}</h1><div class="article-meta-row" data-astro-cid-zg7dkzxc><span class="meta-pill" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>${post.author || "تیم علمی تهران لیزر"}</span></span><span class="meta-pill" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 14,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>${formatJalaliDate(post.publishedAt.slice(0, 10))}</span></span><span class="meta-pill meta-pill-gold" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>${readingMinutes} دقیقه مطالعه</span></span></div></div></header><!-- Article Body + Sticky TOC --><section class="article-body-section" data-astro-cid-zg7dkzxc><div class="container article-layout-grid" data-astro-cid-zg7dkzxc><!-- Sticky Table of Contents Sidebar (RTL: right column) -->${hasToc && renderTemplate`<aside class="article-toc-sidebar" id="tocSidebar" aria-label="فهرست بخش‌های مقاله" data-astro-cid-zg7dkzxc><div class="toc-inner" data-astro-cid-zg7dkzxc><div class="toc-header" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 16,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>فهرست بخش‌ها</span></div><nav class="toc-nav" data-astro-cid-zg7dkzxc><ul class="toc-list" data-astro-cid-zg7dkzxc>${toc.map((item) => renderTemplate`<li${addAttribute(`toc-item toc-level-${item.level}`, "class")} data-astro-cid-zg7dkzxc><a${addAttribute(`#${item.id}`, "href")} class="toc-link"${addAttribute(item.id, "data-toc-id")} data-astro-cid-zg7dkzxc>${item.text}</a></li>`)}</ul></nav><a href="/booking" class="toc-cta-btn" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 15,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>رزرو نوبت</span></a></div></aside>`}<!-- Main Article Column --><article class="article-main-col" data-astro-cid-zg7dkzxc>${post.coverImage && renderTemplate`<div class="article-cover-wrap" id="articleCoverWrap" data-astro-cid-zg7dkzxc><img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} class="article-cover-img" loading="eager" onerror="this.style.display='none';document.getElementById('articleCoverWrap').classList.add('cover-fallback')" data-astro-cid-zg7dkzxc><div class="article-cover-shade" data-astro-cid-zg7dkzxc></div><div class="article-cover-fallback" aria-hidden="true" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "camera",
		"size": 34,
		"class": "cover-fallback-icon",
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>کلینیک تهران لیزر</span></div></div>`}<div class="article-excerpt-callout" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 17,
		"class": "callout-spark",
		"data-astro-cid-zg7dkzxc": true
	})}<p data-astro-cid-zg7dkzxc>${post.excerpt}</p></div>${hasToc && renderTemplate`<details class="toc-mobile-details" data-astro-cid-zg7dkzxc><summary class="toc-mobile-summary" data-astro-cid-zg7dkzxc><span class="toc-mobile-title" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 16,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>فهرست بخش‌های مقاله</span></span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronDown",
		"size": 16,
		"class": "toc-mobile-chevron",
		"data-astro-cid-zg7dkzxc": true
	})}</summary><nav class="toc-nav toc-nav-mobile" data-astro-cid-zg7dkzxc><ul class="toc-list" data-astro-cid-zg7dkzxc>${toc.map((item) => renderTemplate`<li${addAttribute(`toc-item toc-level-${item.level}`, "class")} data-astro-cid-zg7dkzxc><a${addAttribute(`#${item.id}`, "href")} class="toc-link"${addAttribute(item.id, "data-toc-id")} data-astro-cid-zg7dkzxc>${item.text}</a></li>`)}</ul></nav></details>`}<div class="article-content-body" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result) => renderTemplate`${unescapeHTML(preCareHtml)}` })}${/<[a-z][\s\S]*>/i.test(contentWithIds) ? renderTemplate`<div class="rich-article-content" data-astro-cid-zg7dkzxc>${unescapeHTML(contentWithIds)}</div>` : renderTemplate`<div class="rich-article-content" data-astro-cid-zg7dkzxc>${contentWithIds.split("\n\n").map((paragraph) => {
		if (paragraph.startsWith("## ")) return renderTemplate`<h2 class="article-h2" data-astro-cid-zg7dkzxc>${paragraph.replace("## ", "")}</h2>`;
		if (paragraph.startsWith("### ")) return renderTemplate`<h3 class="article-h3" data-astro-cid-zg7dkzxc>${paragraph.replace("### ", "")}</h3>`;
		if (paragraph.startsWith("- ")) return renderTemplate`<ul class="article-list" data-astro-cid-zg7dkzxc>${paragraph.split("\n").map((item) => renderTemplate`<li data-astro-cid-zg7dkzxc>${item.replace(/^- /, "")}</li>`)}</ul>`;
		return renderTemplate`<p class="article-p" data-astro-cid-zg7dkzxc>${paragraph}</p>`;
	})}</div>`}${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result) => renderTemplate`${unescapeHTML(postCareHtml)}` })}</div><!-- Author Footer --><div class="article-author-card" data-astro-cid-zg7dkzxc><div class="author-avatar" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 22,
		"data-astro-cid-zg7dkzxc": true
	})}</div><div class="author-info" data-astro-cid-zg7dkzxc><div class="author-label" data-astro-cid-zg7dkzxc>نویسنده مقاله</div><div class="author-name-big" data-astro-cid-zg7dkzxc>${post.author || "تیم علمی تهران لیزر"}</div><div class="author-bio" data-astro-cid-zg7dkzxc>تیم تولید محتوای علمی و کلینیکال کلینیک تخصصی تهران لیزر پاسداران</div></div></div><!-- Article CTA Cards --><div class="article-cta-grid" data-astro-cid-zg7dkzxc><a href="/booking" class="article-cta-card cta-gold" data-astro-cid-zg7dkzxc><div class="cta-icon-box" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 22,
		"data-astro-cid-zg7dkzxc": true
	})}</div><div class="cta-card-text" data-astro-cid-zg7dkzxc><div class="cta-card-title" data-astro-cid-zg7dkzxc>رزرو آنلاین نوبت</div><div class="cta-card-sub" data-astro-cid-zg7dkzxc>با ۱۵٪ تخفیف ویژه پکیج کل بدن در سامانه رزرو</div></div>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 18,
		"class": "cta-arrow",
		"data-astro-cid-zg7dkzxc": true
	})}</a><a href="tel:09000005090" class="article-cta-card cta-outline" data-astro-cid-zg7dkzxc><div class="cta-icon-box" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 22,
		"data-astro-cid-zg7dkzxc": true
	})}</div><div class="cta-card-text" data-astro-cid-zg7dkzxc><div class="cta-card-title" data-astro-cid-zg7dkzxc>مشاوره تلفنی رایگان</div><div class="cta-card-sub" data-astro-cid-zg7dkzxc>پاسخگویی به سوالات شما توسط کارشناسان کلینیک</div></div>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 18,
		"class": "cta-arrow",
		"data-astro-cid-zg7dkzxc": true
	})}</a></div><a href="/blog" class="back-to-blog" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowRight",
		"size": 16,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>بازگشت به فهرست همه مقالات</span></a></article></div></section><!-- Related Articles -->${related.length > 0 && renderTemplate`<section class="related-section" data-astro-cid-zg7dkzxc><div class="container" data-astro-cid-zg7dkzxc><h2 class="related-section-title" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 20,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>مقالات مرتبط و پیشنهادی</span></h2><div class="related-grid" data-astro-cid-zg7dkzxc>${related.map((rp) => renderTemplate`<a${addAttribute(`/blog/${rp.slug}`, "href")} class="related-card" data-astro-cid-zg7dkzxc>${rp.coverImage ? renderTemplate`<div class="related-img-wrap" data-astro-cid-zg7dkzxc><img${addAttribute(rp.coverImage, "src")}${addAttribute(rp.title, "alt")} class="related-img" loading="lazy" data-astro-cid-zg7dkzxc></div>` : renderTemplate`<div class="related-img-wrap related-img-fallback" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 26,
		"data-astro-cid-zg7dkzxc": true
	})}</div>`}<div class="related-body" data-astro-cid-zg7dkzxc><span class="related-date" data-astro-cid-zg7dkzxc>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 12,
		"data-astro-cid-zg7dkzxc": true
	})}<span data-astro-cid-zg7dkzxc>${rp.publishedAt ? formatJalaliDate(rp.publishedAt.slice(0, 10)) : ""}</span></span><h3 class="related-title" data-astro-cid-zg7dkzxc>${rp.title}</h3><p class="related-excerpt" data-astro-cid-zg7dkzxc>${rp.excerpt}</p><span class="related-read-more" data-astro-cid-zg7dkzxc><span data-astro-cid-zg7dkzxc>مطالعه مقاله</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "arrowLeft",
		"size": 13,
		"data-astro-cid-zg7dkzxc": true
	})}</span></div></a>`)}</div></div></section>`}</div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/[slug].astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/[slug].astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/blog/[slug].astro";
var $$url = "/blog/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
