import type { APIRoute, GetStaticPaths } from 'astro';
import {
  SITEMAP_PAGE_COUNT,
  getSiteOrigin,
  getSitemapPagePaths,
  xmlEscape,
} from '../lib/sitemap';

export const prerender = true;

export const getStaticPaths = (() =>
  Array.from({ length: SITEMAP_PAGE_COUNT }, (_, i) => ({
    params: { page: String(i + 1) },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params, site }) => {
  const page = Number(params.page);
  if (!Number.isFinite(page) || page < 1 || page > SITEMAP_PAGE_COUNT) {
    return new Response('Not found', { status: 404 });
  }

  const origin = getSiteOrigin(site);
  const paths = getSitemapPagePaths(page);
  const lastmod = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${xmlEscape(`${origin}${path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
