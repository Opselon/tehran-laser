import type { APIRoute } from 'astro';
import { resolveCanonicalOrigin } from '../lib/seo/canonical';

// Canonical origin for the Sitemap: directive. Resolved from the SITE_URL var
// (live workers origin), never the parked tehranlaser.ir vanity domain.
const ORIGIN = resolveCanonicalOrigin();

/** Paths that must never be crawled OR indexed. */
const DISALLOW = ['/admin', '/admin/', '/api/', '/api/v1/', '/_actions/', '/404', '/500'];

/**
 * Crawlers explicitly invited. Each one is given the SAME allow/disallow
 * policy, and that repetition is load-bearing: a crawler obeys only the single
 * most specific group matching its own product token, so a `User-agent:
 * Googlebot` group containing nothing but `Allow: /` silently OPTS GOOGLEBOT
 * OUT of the `Disallow: /admin` rule in the `User-agent: *` group — making
 * admin and API surfaces crawlable by exactly the bots whose crawl budget
 * matters most.
 */
const NAMED_CRAWLERS = [
  'Googlebot',
  'Googlebot-Image',
  'Bingbot',
  'YandexBot',
  // Social unfurlers need the article/service pages for rich OG previews.
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
];

function policyFor(agent: string): string {
  return [`User-agent: ${agent}`, 'Allow: /', ...DISALLOW.map((p) => `Disallow: ${p}`)].join('\n');
}

export const GET: APIRoute = () => {
  const content = `# Robots.txt — Tehran Laser Clinic (§133)
# Canonical origin is provided at runtime via the SITE_URL var (see wrangler.jsonc).
# The site is Persian-only (fa-IR); there is no second-language tree to manage.

${policyFor('*')}

# Named crawlers: each repeats the full policy (see NAMED_CRAWLERS).
${NAMED_CRAWLERS.map((agent) => policyFor(agent)).join('\n\n')}

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
