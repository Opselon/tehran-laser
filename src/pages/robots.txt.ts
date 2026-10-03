import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const content = `# Robots.txt for Tehran Laser (Contract §133)
User-agent: *
Allow: /
Allow: /services
Allow: /clinic
Allow: /contact
Allow: /faq
Allow: /blog
Allow: /booking

Disallow: /admin
Disallow: /admin/*
Disallow: /api/*

Sitemap: https://tehranlaser.ir/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
};
