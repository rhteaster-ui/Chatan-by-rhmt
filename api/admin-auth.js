import { readJson, sendJson } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, { error: 'Method not allowed.' }, 405);

  const { password } = readJson(request);
  if (!process.env.ADMIN_PASSWORD) return sendJson(response, { error: 'ADMIN_PASSWORD belum diatur.' }, 500);
  if (password !== process.env.ADMIN_PASSWORD) return sendJson(response, { error: 'Unauthorized.' }, 401);

  return sendJson(response, { ok: true });
}
