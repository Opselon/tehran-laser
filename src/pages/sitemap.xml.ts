import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { all } from '../db/query';

export const GET: APIRoute = async () => {
  const staticUrls = [
    { loc: 'https://tehranlaser.ir/', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://tehranlaser.ir/services', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://tehranlaser.ir/booking', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://tehranlaser.ir/clinic', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://tehranlaser.ir/contact', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://tehranlaser.ir/faq', changefreq: 'monthly', priority: '0.7' },
    { loc: 'https://tehranlaser.ir/blog', changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://tehranlaser.ir/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: 'https://tehranlaser.ir/terms', changefreq: 'yearly', priority: '0.3' },
  ];

  // Fetch published service slugs
  let serviceRows: Array<{ slug: string; updatedAt: string }> = [];
  let blogRows: Array<{ slug: string; publishedAt: string }> = [];

  try {
    serviceRows = await all<{ slug: string; updatedAt: string }>(
      env.DB,
      `SELECT slug, updated_at AS updatedAt FROM services WHERE active = 1 ORDER BY display_order ASC`,
    );
    blogRows = await all<{ slug: string; publishedAt: string }>(
      env.DB,
      `SELECT slug, published_at AS publishedAt FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`,
    );
  } catch {
    // If DB is unreachable during static generation, static URLs still emit cleanly
  }

  const items = [
    ...staticUrls.map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    ),
    ...serviceRows.map(
      (s) => `  <url>
    <loc>https://tehranlaser.ir/services/${s.slug}</loc>
    <lastmod>${s.updatedAt ? s.updatedAt.slice(0, 10) : ''}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
    ...blogRows.map(
      (b) => `  <url>
    <loc>https://tehranlaser.ir/blog/${b.slug}</loc>
    <lastmod>${b.publishedAt ? b.publishedAt.slice(0, 10) : ''}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    ),
  ];

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
