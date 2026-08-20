import type { APIRoute } from 'astro';
import { get } from '../sites';

export const GET: APIRoute = ({ url, redirect }) => {
  const siteId = url.searchParams.get('site');
  const targetUrl = url.searchParams.get('url');
  const site = siteId ? get(siteId) : undefined;

  if (!siteId) return new Response(JSON.stringify({ success: false, code: 400, message: "Parameter 'site' is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  if (!site) return new Response(JSON.stringify({ success: false, code: 404, message: `Site '${siteId}' is not supported yet` }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  if (!targetUrl) return new Response(JSON.stringify({ success: false, code: 400, message: "Parameter 'url' is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const vars = {
    URL: encodeURIComponent(targetUrl),
    TEXT: encodeURIComponent(url.searchParams.get('text') || targetUrl),
    SUMMARY: encodeURIComponent(url.searchParams.get('summary') || ''),
    IMAGE: encodeURIComponent(url.searchParams.get('image') || ''),
  };
  return redirect(site.templateFn(vars), 302);
};
