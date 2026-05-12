import { json, parseTelegramUpdate, readJson, telegram } from './_telegram.js';

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const { password } = await readJson(request);
  if (!process.env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD belum diatur.' }, 500);
  if (password !== process.env.ADMIN_PASSWORD) return json({ error: 'Unauthorized.' }, 401);

  try {
    const updates = await telegram('getUpdates', null, '?limit=100');
    const logs = updates
      .map((update) => parseTelegramUpdate(update, true))
      .filter(Boolean)
      .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));

    return json(logs);
  } catch (error) {
    return json({ error: error.message || 'Gagal memuat log admin.' }, 500);
  }
}
