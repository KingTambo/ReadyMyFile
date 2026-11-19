import { DESTINATIONS, SOURCES } from '../data/schemas';
import { convertPath } from './convert-page';
import { HUBS } from './hubs';

export const SITEMAP_PAGE_SIZE = 1000;
export const SITEMAP_PAGE_COUNT = 5;

export function getSiteOrigin(site?: URL | string | undefined) {
  if (!site) return 'https://readymyfile.vercel.app';
  return String(site).replace(/\/$/, '');
}

export function getAllSitemapPaths() {
  const convertPaths = SOURCES.flatMap((source) =>
    DESTINATIONS.map((destination) => convertPath(source.id, destination.id))
  );

  return [
    '/',
    ...HUBS.map((hub) => `/hub/${hub.slug}`),
    ...convertPaths,
  ];
}

export function getSitemapPagePaths(page: number) {
  const all = getAllSitemapPaths();
  const start = (page - 1) * SITEMAP_PAGE_SIZE;
  return all.slice(start, start + SITEMAP_PAGE_SIZE);
}

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
