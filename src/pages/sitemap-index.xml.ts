import type { APIRoute } from 'astro';
import {
  SITEMAP_PAGE_COUNT,
  getSiteOrigin,
  xmlEscape,
} from '../lib/sitemap';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = getSiteOrigin(site);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: SITEMAP_PAGE_COUNT }, (_, i) => {
  const page = i + 1;
  return `  <sitemap>
    <loc>${xmlEscape(`${origin}/sitemap-${page}.xml`)}</loc>
  </sitemap>`;
}).join('\n')}
</sitemapindex>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
