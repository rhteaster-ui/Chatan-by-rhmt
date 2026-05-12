import { json, parseTelegramUpdate, telegram } from './_telegram.js';

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);

  try {
    const updates = await telegram('getUpdates', null, '?limit=100');
    const messages = updates
      .map((update) => parseTelegramUpdate(update, false))
      .filter(Boolean)
      .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));

    return json(messages);
  } catch (error) {
    return json({ error: error.message || 'Gagal memuat pesan.' }, 500);
  }
}
