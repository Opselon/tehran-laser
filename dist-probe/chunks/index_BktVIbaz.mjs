globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { c as listAdminBlogPosts } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/blog/index.astro
var blog_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let posts = {
		items: [],
		nextCursor: null
	};
	try {
		posts = await listAdminBlogPosts(env.DB, 50);
	} catch (e) {
		console.error("Failed to load admin blog posts:", e);
	}
	const publishedCount = posts.items.filter((p) => p.status === "published").length;
	const draftCount = posts.items.filter((p) => p.status === "draft").length;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "مدیریت مقالات و محتوا",
		"activeNav": "blog",
		"data-astro-cid-a7eumksq": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-a7eumksq><!-- 3D Header Row --><div class="dashboard-header-row" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><h1 class="admin-page-title" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 26,
		"class": "title-icon",
		"data-astro-cid-a7eumksq": true
	})} سامانه مدیریت و نگارش مقالات کلینیک (Blog CMS)</h1><p class="section-block-sub" data-astro-cid-a7eumksq>تولید مقالات تخصصی، آموزش‌های مراقبت از پوست و تنظیمات سئو با ویرایشگر فوق‌حرفه‌ای HTML (API First)</p></div><div class="actions" style="display: flex; gap: 12px; align-items: center;" data-astro-cid-a7eumksq><span style="font-size: 0.85rem; color: #f5d77f; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 8px 16px; border-radius: 12px;" data-astro-cid-a7eumksq>منتشرشده: ${publishedCount.toLocaleString("fa-IR")} | پیش‌نویس: ${draftCount.toLocaleString("fa-IR")}</span><button type="button" id="newArticleBtn" class="btn-3d-refresh" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px;" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "plus",
		"size": 16,
		"data-astro-cid-a7eumksq": true
	})} نگارش مقاله جدید</button></div></div><!-- Alert Box --><div id="blogAlert" class="alert-3d-danger" style="display: none; margin-bottom: 20px;" data-astro-cid-a7eumksq><span id="blogAlertText" data-astro-cid-a7eumksq></span></div><!-- Articles Table --><div class="admin-section-block" style="padding: 0; overflow: hidden; margin-bottom: 30px;" data-astro-cid-a7eumksq>${posts.items.length === 0 ? renderTemplate`<div class="empty-state-card" style="border: none; margin: 20px;" data-astro-cid-a7eumksq><span class="empty-icon" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "blog",
		"size": 30,
		"data-astro-cid-a7eumksq": true
	})}</span><p class="empty-text" data-astro-cid-a7eumksq>هنوز مقاله‌ای در سامانه ثبت نشده است. روی دکمه «نگارش مقاله جدید» کلیک کنید.</p></div>` : renderTemplate`<div class="today-table-wrapper" style="border: none; border-radius: 0;" data-astro-cid-a7eumksq><table class="admin-table" data-astro-cid-a7eumksq><thead data-astro-cid-a7eumksq><tr data-astro-cid-a7eumksq><th style="width: 70px;" data-astro-cid-a7eumksq>تصویر</th><th data-astro-cid-a7eumksq>عنوان مقاله</th><th data-astro-cid-a7eumksq>پیوند یکتا (Slug)</th><th data-astro-cid-a7eumksq>نویسنده</th><th data-astro-cid-a7eumksq>تاریخ انتشار</th><th data-astro-cid-a7eumksq>وضعیت</th><th data-astro-cid-a7eumksq>عملیات</th></tr></thead><tbody data-astro-cid-a7eumksq>${posts.items.map((p) => renderTemplate`<tr data-astro-cid-a7eumksq><td data-astro-cid-a7eumksq>${p.coverImage ? renderTemplate`<div style="width: 52px; height: 38px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);" data-astro-cid-a7eumksq><img${addAttribute(p.coverImage, "src")}${addAttribute(p.title, "alt")} style="width: 100%; height: 100%; object-fit: cover;" data-astro-cid-a7eumksq></div>` : renderTemplate`<div class="thumb-fallback-icon" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 18,
		"data-astro-cid-a7eumksq": true
	})}</div>`}</td><td${addAttribute({
		fontWeight: 800,
		color: "#ffffff",
		maxWidth: "280px"
	}, "style")} data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq>${p.title}</div><div${addAttribute({
		fontSize: "0.78rem",
		color: "#94a3b8",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap"
	}, "style")} data-astro-cid-a7eumksq>${p.excerpt}</div></td><td dir="ltr"${addAttribute({
		fontFamily: "monospace",
		color: "#f5d77f",
		fontSize: "0.82rem"
	}, "style")} data-astro-cid-a7eumksq>${p.slug}</td><td${addAttribute({ color: "#cbd5e1" }, "style")} data-astro-cid-a7eumksq>${p.author || "تهران لیزر"}</td><td data-astro-cid-a7eumksq>${p.publishedAt ? renderTemplate`<span${addAttribute({ color: "#f5d77f" }, "style")} data-astro-cid-a7eumksq>${formatJalaliDate(p.publishedAt.slice(0, 10))}</span>` : renderTemplate`<span${addAttribute({ color: "#64748b" }, "style")} data-astro-cid-a7eumksq>—</span>`}</td><td data-astro-cid-a7eumksq><span${addAttribute(`badge-status ${p.status === "published" ? "badge-status-completed" : "badge-status-pending"}`, "class")} data-astro-cid-a7eumksq>${p.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span></td><td data-astro-cid-a7eumksq><div style="display: flex; gap: 6px; flex-wrap: wrap;" data-astro-cid-a7eumksq>${p.status === "published" && renderTemplate`<a${addAttribute(`/blog/${p.slug}`, "href")} target="_blank" class="btn-table-action" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; text-decoration: none; padding: 6px 10px; font-size: 0.78rem;" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} نمایش</a>`}<button type="button" class="btn-table-action edit-post-btn" style="border-color: rgba(212, 175, 55, 0.45); color: #f5d77f; padding: 6px 10px; font-size: 0.78rem;"${addAttribute(p.id, "data-id")}${addAttribute(p.title, "data-title")}${addAttribute(p.slug, "data-slug")}${addAttribute(p.excerpt, "data-excerpt")}${addAttribute(p.coverImage || "", "data-cover")}${addAttribute(p.author || "", "data-author")}${addAttribute(p.status, "data-status")}${addAttribute(p.seoTitle || "", "data-seotitle")}${addAttribute(p.seoDescription || "", "data-seodesc")}${addAttribute(encodeURIComponent(p.content || ""), "data-content")} data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} ویرایش</button><button type="button" class="btn-3d-reject delete-post-btn" style="padding: 6px 10px; font-size: 0.78rem;"${addAttribute(p.id, "data-id")} aria-label="حذف مقاله" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "trash",
		"size": 14,
		"data-astro-cid-a7eumksq": true
	})}</button></div></td></tr>`)}</tbody></table></div>`}</div><!-- 3D Professional Article Studio / Editor Modal --><div id="articleModal" class="modal-backdrop" style="display: none; align-items: flex-start; padding: 30px 15px; overflow-y: auto;" data-astro-cid-a7eumksq><div class="modal-dialog" style="max-width: 1040px; width: 100%; margin: auto;" data-astro-cid-a7eumksq><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 14px;" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><h3 class="modal-title" id="articleModalTitle" style="margin: 0; display: flex; align-items: center; gap: 8px;" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "edit",
		"size": 20,
		"data-astro-cid-a7eumksq": true
	})} نگارش مقاله و آموزش تخصصی</h3><span style="font-size: 0.82rem; color: #94a3b8;" data-astro-cid-a7eumksq>ویرایشگر پیشرفته HTML با پشتیبانی از کادرهای کلینیکال و سئو</span></div><button type="button" id="closeArticleModalBtn" class="modal-close-btn" aria-label="بستن پنجره" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "close",
		"size": 20,
		"data-astro-cid-a7eumksq": true
	})}</button></div><form id="articleForm" data-astro-cid-a7eumksq><input type="hidden" id="articleId" data-astro-cid-a7eumksq><!-- Row 1: Title & Slug --><div class="g-2-12" style="display: grid; gap: 16px; margin-bottom: 16px" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq>عنوان رسمی مقاله:</label><input type="text" id="articleTitle" class="form-control-modal" placeholder="مثال: راهنمای جامع مراقبت‌های پوستی قبل و بعد از لیزر الکساندرایت" required data-astro-cid-a7eumksq></div><div data-astro-cid-a7eumksq><label style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq><span data-astro-cid-a7eumksq>پیوند یکتا (Slug انگلیسی):</span><button type="button" id="autoSlugBtn" class="smart-slug-btn" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 12,
		"data-astro-cid-a7eumksq": true
	})} اسلاگ هوشمند</button></label><input type="text" id="articleSlug" dir="ltr" class="form-control-modal" placeholder="laser-skin-care-guide" required data-astro-cid-a7eumksq></div></div><!-- Row 2: Excerpt & Cover Image --><div class="g-2-12" style="display: grid; gap: 16px; margin-bottom: 16px" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq>چکیده و معرفی کوتاه (جهت نمایش در کارت مقاله):</label><textarea id="articleExcerpt" class="form-control-modal"${addAttribute(2, "rows")} placeholder="خلاصه ۲ خطی جذاب از محتوای مقاله برای کاربران..." required data-astro-cid-a7eumksq></textarea></div><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq>آدرس تصویر شاخص (URL):</label><input type="url" id="articleCover" dir="ltr" class="form-control-modal" placeholder="https://images.unsplash.com/..." data-astro-cid-a7eumksq><span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 4px;" data-astro-cid-a7eumksq>می‌توانید تصویر دلخواه از آنسپلش یا هاست تصویر وارد کنید.</span></div></div><!-- Row 3: Author & Status --><div class="g-2" style="display: grid; gap: 16px; margin-bottom: 20px" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq>نام نویسنده / تیم تولید محتوا:</label><input type="text" id="articleAuthor" class="form-control-modal" value="دکتر تیم پزشکی تهران لیزر" data-astro-cid-a7eumksq></div><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.85rem; font-weight: 700; color: #f5d77f; margin-bottom: 6px;" data-astro-cid-a7eumksq>وضعیت انتشار در وب‌سایت:</label><select id="articleStatus" class="form-control-modal" data-astro-cid-a7eumksq><option value="published" data-astro-cid-a7eumksq>انتشار عمومی در سایت</option><option value="draft" data-astro-cid-a7eumksq>ذخیره به صورت پیش‌نویس محرمانه</option></select></div></div><!-- Professional HTML Editor Suite --><div style="margin-bottom: 20px;" data-astro-cid-a7eumksq><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" data-astro-cid-a7eumksq><label style="font-size: 0.92rem; font-weight: 800; color: #f5d77f;" data-astro-cid-a7eumksq>محتوای کامل مقاله (Professional HTML Studio):</label><!-- Editor Mode Tabs --><div style="display: flex; gap: 6px; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" data-astro-cid-a7eumksq><button type="button" id="tabVisualBtn" class="editor-tab-btn active" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "eye",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} بصری (WYSIWYG)</button><button type="button" id="tabSourceBtn" class="editor-tab-btn" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "document",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} کدهای HTML</button><button type="button" id="tabPreviewBtn" class="editor-tab-btn" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "mobile",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} پیش‌نمایش سایت</button></div></div><!-- Toolbar (for Visual Mode) --><div id="editorToolbar" class="html-toolbar" data-astro-cid-a7eumksq><select id="formatBlockSelect" class="tb-select" title="سطح سرتیتر" data-astro-cid-a7eumksq><option value="p" data-astro-cid-a7eumksq>پاراگراف عادی</option><option value="h2" data-astro-cid-a7eumksq>تیتر ۲ (بخش اصلی)</option><option value="h3" data-astro-cid-a7eumksq>تیتر ۳ (زیربخش)</option><option value="h4" data-astro-cid-a7eumksq>تیتر ۴</option></select><div class="tb-divider" data-astro-cid-a7eumksq></div><button type="button" class="tb-btn" data-cmd="bold" title="درشت (Bold)" data-astro-cid-a7eumksq><b data-astro-cid-a7eumksq>B</b></button><button type="button" class="tb-btn" data-cmd="italic" title="کج (Italic)" data-astro-cid-a7eumksq><i data-astro-cid-a7eumksq>I</i></button><button type="button" class="tb-btn" data-cmd="underline" title="خط زیر (Underline)" data-astro-cid-a7eumksq><u data-astro-cid-a7eumksq>U</u></button><button type="button" class="tb-btn" data-cmd="strikeThrough" title="خط‌خورده" data-astro-cid-a7eumksq><s data-astro-cid-a7eumksq>S</s></button><div class="tb-divider" data-astro-cid-a7eumksq></div><button type="button" class="tb-btn" data-cmd="justifyRight" title="راست‌چین" data-astro-cid-a7eumksq>≡→</button><button type="button" class="tb-btn" data-cmd="justifyCenter" title="وسط‌چین" data-astro-cid-a7eumksq>≡</button><button type="button" class="tb-btn" data-cmd="justifyLeft" title="چپ‌چین" data-astro-cid-a7eumksq>←≡</button><div class="tb-divider" data-astro-cid-a7eumksq></div><button type="button" class="tb-btn" data-cmd="insertUnorderedList" title="لیست بالت‌دار" data-astro-cid-a7eumksq>• لیست</button><button type="button" class="tb-btn" data-cmd="insertOrderedList" title="لیست شماره‌دار" data-astro-cid-a7eumksq>1. لیست</button><div class="tb-divider" data-astro-cid-a7eumksq></div><button type="button" class="tb-btn" id="insertLinkBtn" title="درج پیوند اینترنتی" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "external",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} لینک</button><button type="button" class="tb-btn" id="insertImgBtn" title="درج تصویر" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "camera",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} عکس</button><button type="button" class="tb-btn" id="insertHrBtn" title="خط جداکننده" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "minus",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} خط</button><div class="tb-divider" data-astro-cid-a7eumksq></div><!-- Special Clinic Callouts --><button type="button" class="tb-btn callout-tb-btn" id="insertTipBtn" title="درج باکس نکته طلایی" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} نکته طلایی</button><button type="button" class="tb-btn callout-tb-btn" id="insertWarnBtn" title="درج باکس هشدار پوست" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} هشدار</button><button type="button" class="tb-btn callout-tb-btn" id="insertDocBtn" title="درج توصیه پزشک" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "doctor",
		"size": 13,
		"data-astro-cid-a7eumksq": true
	})} توصیه پزشک</button></div><!-- 1. Visual WYSIWYG Container --><div id="visualEditor" contenteditable="true" class="visual-editor-surface" dir="rtl" data-astro-cid-a7eumksq></div><!-- 2. Source Code HTML Textarea --><textarea id="sourceEditor" class="source-editor-surface" dir="ltr" style="display: none;" placeholder="&lt;!-- کدهای استاندارد HTML مقاله --&gt;" data-astro-cid-a7eumksq></textarea><!-- 3. Public Site Real Live Preview --><div id="livePreviewContainer" class="live-preview-surface" style="display: none;" data-astro-cid-a7eumksq><div id="livePreviewContent" class="article-content-body" data-astro-cid-a7eumksq></div></div></div><!-- SEO Drawer / Collapsible --><details style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; margin-bottom: 22px;" data-astro-cid-a7eumksq><summary style="font-size: 0.88rem; font-weight: 700; color: #cbd5e1; cursor: pointer;" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 14,
		"data-astro-cid-a7eumksq": true
	})} تنظیمات متاتگ‌ها و بهینه‌سازی سئو (Google SEO Meta Tags)</summary><div class="g-2" style="display: grid; gap: 14px; margin-top: 14px" data-astro-cid-a7eumksq><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.82rem; font-weight: 700; color: #94a3b8; margin-bottom: 6px;" data-astro-cid-a7eumksq>عنوان صفحه در نتایج گوگل (SEO Title):</label><input type="text" id="seoTitle" class="form-control-modal" placeholder="حداکثر ۶۰ کاراکتر..." data-astro-cid-a7eumksq></div><div data-astro-cid-a7eumksq><label style="display: block; font-size: 0.82rem; font-weight: 700; color: #94a3b8; margin-bottom: 6px;" data-astro-cid-a7eumksq>توضیحات متا در گوگل (Meta Description):</label><input type="text" id="seoDescription" class="form-control-modal" placeholder="حداکثر ۱۶۰ کاراکتر جذاب..." data-astro-cid-a7eumksq></div></div></details><!-- Form Actions --><div class="modal-actions-row" data-astro-cid-a7eumksq><button type="button" id="cancelArticleBtn" class="btn-table-action" data-astro-cid-a7eumksq>انصراف</button><button type="submit" id="saveArticleBtn" class="btn-3d-accept save-btn-fixed" style="flex: none; padding: 12px 30px;" data-astro-cid-a7eumksq><span id="saveArticleBtnLabel" class="save-btn-label" data-astro-cid-a7eumksq>${renderComponent($$result, "Icon", $$Icon, {
		"name": "upload",
		"size": 15,
		"data-astro-cid-a7eumksq": true
	})} ثبت و ذخیره مقاله در دیتابیس D1</span></button></div></form></div></div></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/blog/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/blog/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/blog/index.astro";
var $$url = "/admin/blog";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/blog/index@_@astro
var page = () => blog_exports;
//#endregion
export { page };
