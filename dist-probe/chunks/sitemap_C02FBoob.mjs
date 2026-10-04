globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { r as resolveCanonicalOrigin } from "./canonical_ssJtZI0c.mjs";
import { t as all } from "./query_DDZB-tD1.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/sitemap.xml.ts
var sitemap_xml_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
/**
* Canonical origin emitted in every <loc>. `SITE_URL` var wins, so the sitemap
* always points at the live origin (see resolveCanonicalOrigin). Do not
* hardcode the tehranlaser.ir vanity domain here — it is not live yet.
*/
var ORIGIN = resolveCanonicalOrigin();
/** Escape XML special characters so DB-sourced slugs/titles can't break the sitemap. */
function xmlEscape(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
/** All indexable public pages (admin/api excluded — see robots.txt). */
var staticUrls = [
	{
		loc: "/",
		changefreq: "daily",
		priority: "1.0"
	},
	{
		loc: "/services",
		changefreq: "weekly",
		priority: "0.9"
	},
	{
		loc: "/booking",
		changefreq: "daily",
		priority: "0.9"
	},
	{
		loc: "/clinic",
		changefreq: "monthly",
		priority: "0.8"
	},
	{
		loc: "/contact",
		changefreq: "monthly",
		priority: "0.8"
	},
	{
		loc: "/faq",
		changefreq: "monthly",
		priority: "0.7"
	},
	{
		loc: "/blog",
		changefreq: "weekly",
		priority: "0.8"
	},
	{
		loc: "/privacy",
		changefreq: "yearly",
		priority: "0.3"
	},
	{
		loc: "/terms",
		changefreq: "yearly",
		priority: "0.3"
	}
];
function buildUrlEntry(url) {
	const lastmod = url.lastmod ? `\n    <lastmod>${xmlEscape(url.lastmod)}</lastmod>` : "";
	return `  <url>
    <loc>${ORIGIN}${url.loc}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
}
var GET = async () => {
	let serviceRows = [];
	let blogRows = [];
	try {
		serviceRows = await all(env.DB, `SELECT slug, updated_at AS updatedAt FROM services WHERE active = 1 ORDER BY display_order ASC`);
		blogRows = await all(env.DB, `SELECT slug, published_at AS publishedAt, updated_at AS updatedAt FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`);
	} catch {}
	const serviceUrls = serviceRows.map((s) => ({
		loc: `/services/${s.slug}`,
		changefreq: "weekly",
		priority: "0.8",
		lastmod: s.updatedAt ? s.updatedAt.slice(0, 10) : void 0
	}));
	const blogUrls = blogRows.map((b) => ({
		loc: `/blog/${b.slug}`,
		changefreq: "monthly",
		priority: "0.7",
		lastmod: (b.updatedAt || b.publishedAt || "").slice(0, 10) || void 0
	}));
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
		...staticUrls,
		...serviceUrls,
		...blogUrls
	].map((url) => buildUrlEntry(url)).join("\n")}
</urlset>`;
	return new Response(xml, {
		status: 200,
		headers: {
			"content-type": "application/xml; charset=utf-8",
			"cache-control": "public, max-age=3600"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/sitemap.xml@_@ts
var page = () => sitemap_xml_exports;
//#endregion
export { page };
