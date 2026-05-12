import { json, readJson } from './_telegram.js';

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const { password } = await readJson(request);
  if (!process.env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD belum diatur.' }, 500);
  if (password !== process.env.ADMIN_PASSWORD) return json({ error: 'Unauthorized.' }, 401);

  return json({ ok: true });
}
