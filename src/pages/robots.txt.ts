import type { APIRoute } from 'astro';

const ORIGIN = 'https://tehranlaser.ir';

export const GET: APIRoute = () => {
  const content = `# Robots.txt — Tehran Laser Clinic (§133)
# Official canonical domain: https://tehranlaser.ir

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
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
};
