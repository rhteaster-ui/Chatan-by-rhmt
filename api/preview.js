import { json } from './_telegram.js';

function pickMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return '';
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function toAbsoluteUrl(value, base) {
  if (!value) return '';
  try {
    return new URL(value, base).toString();
  } catch {
    return '';
  }
}

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);

  try {
    const rawUrl = new URL(request.url, 'http://localhost').searchParams.get('url');
    const target = new URL(rawUrl);
    if (!['http:', 'https:'].includes(target.protocol)) return json({ error: 'URL tidak valid.' }, 400);

    const response = await fetch(target.toString(), {
      headers: { 'user-agent': 'R-HMT-OFC-LinkPreview/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    const html = (await response.text()).slice(0, 300000);
    const title = pickMeta(html, 'og:title') || decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '');
    const description = pickMeta(html, 'og:description') || pickMeta(html, 'description');
    const image = toAbsoluteUrl(pickMeta(html, 'og:image'), target.toString());
    const siteName = pickMeta(html, 'og:site_name') || target.hostname;

    return json({ title, description, image, siteName });
  } catch {
    return json({ error: 'Preview tidak tersedia.' }, 400);
  }
}
