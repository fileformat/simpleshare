import type { APIRoute } from 'astro';
import { getAll } from '../sites';

export const GET: APIRoute = ({ url }) => {
  const data = { success: true, message: 'OK', timestamp: new Date().toISOString(), lastmod: import.meta.env.LASTMOD || null, commit: import.meta.env.COMMIT || null, tech: `NodeJS ${process.version}`, targetcount: getAll().length };
  const callback = url.searchParams.get('callback');
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET', 'Access-Control-Max-Age': '604800', 'Content-Type': callback && /^[$A-Za-z_][0-9A-Za-z_$]*$/.test(callback) ? 'text/javascript' : 'application/json' };
  return new Response(callback && /^[$A-Za-z_][0-9A-Za-z_$]*$/.test(callback) ? `${callback}(${JSON.stringify(data)});` : JSON.stringify(data), { headers });
};
