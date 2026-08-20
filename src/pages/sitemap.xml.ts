import type { APIRoute } from 'astro';
import comparisonData from '../../data/comparison.json';

export const GET: APIRoute = () => {
  const urls = ['/comparison/index.html', ...comparisonData.filter((site) => site.slug).map((site) => `/comparison/${site.slug}/index.html`), '/index.html', '/linkbuilder.html'].sort();
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>https://simpleshare.dev${path}</loc></url>`).join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'text/xml;charset=utf-8' } });
};
