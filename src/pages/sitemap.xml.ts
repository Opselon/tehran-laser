import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { resolveCanonicalOrigin } from '../lib/seo/canonical';
import { all } from '../db/query';

/**
 * Canonical origin emitted in every <loc>. `SITE_URL` var wins, so the sitemap
 * always points at the live origin (see resolveCanonicalOrigin). Do not
 * hardcode the tehranlaser.ir vanity domain here — it is not live yet.
 */
const ORIGIN = resolveCanonicalOrigin();

/** Escape XML special characters so DB-sourced slugs/titles can't break the sitemap. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface StaticUrl {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string | undefined;
}

/** All indexable public pages (admin/api excluded — see robots.txt). */
const staticUrls: StaticUrl[] = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/services', changefreq: 'weekly', priority: '0.9' },
  { loc: '/booking', changefreq: 'daily', priority: '0.9' },
  { loc: '/clinic', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
];

function buildUrlEntry(url: StaticUrl): string {
  const lastmod = url.lastmod ? `\n    <lastmod>${xmlEscape(url.lastmod)}</lastmod>` : '';
  return `  <url>
    <loc>${ORIGIN}${url.loc}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  let serviceRows: Array<{ slug: string; updatedAt: string }> = [];
  let blogRows: Array<{ slug: string; publishedAt: string; updatedAt?: string }> = [];

  try {
    serviceRows = await all<{ slug: string; updatedAt: string }>(
      env.DB,
      `SELECT slug, updated_at AS updatedAt FROM services WHERE active = 1 ORDER BY display_order ASC`,
    );
    blogRows = await all<{ slug: string; publishedAt: string; updatedAt?: string }>(
      env.DB,
      `SELECT slug, published_at AS publishedAt, updated_at AS updatedAt FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`,
    );
  } catch {
    // If DB is unreachable during static generation, static URLs still emit cleanly
  }

  const serviceUrls: StaticUrl[] = serviceRows.map((s): StaticUrl => ({
    loc: `/services/${s.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: s.updatedAt ? s.updatedAt.slice(0, 10) : undefined,
  }));

  const blogUrls: StaticUrl[] = blogRows.map((b): StaticUrl => ({
    loc: `/blog/${b.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: (b.updatedAt || b.publishedAt || '').slice(0, 10) || undefined,
  }));

  const items = [...staticUrls, ...serviceUrls, ...blogUrls].map((url) =>
    buildUrlEntry(url as StaticUrl),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
