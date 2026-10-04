globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { r as resolveCanonicalOrigin } from "./canonical_ssJtZI0c.mjs";
//#region src/pages/robots.txt.ts
var robots_txt_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var ORIGIN = resolveCanonicalOrigin();
var GET = () => {
	const content = `# Robots.txt — Tehran Laser Clinic (§133)
# Canonical origin is provided at runtime via the SITE_URL var (see wrangler.jsonc).

User-agent: *
Allow: /
Allow: /services
Allow: /services/
Allow: /clinic
Allow: /contact
Allow: /faq
Allow: /blog
Allow: /blog/
Allow: /booking
Allow: /privacy
Allow: /terms

# Administrative & API surfaces are never indexable
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /api/v1/
Disallow: /_actions/
Disallow: /404
Disallow: /500

# Search engine specific directives
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

# Social media crawler access for rich Open Graph previews
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Explicit sitemap declaration
Sitemap: ${ORIGIN}/sitemap.xml
`;
	return new Response(content, {
		status: 200,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=86400"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/robots.txt@_@ts
var page = () => robots_txt_exports;
//#endregion
export { page };
