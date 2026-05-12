import { parseTelegramUpdate, sendJson, telegram } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, { error: 'Method not allowed.' }, 405);

  try {
    const updates = await telegram('getUpdates', null, '?limit=100');
    const messages = updates
      .map((update) => parseTelegramUpdate(update, false))
      .filter(Boolean)
      .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));

    return sendJson(response, messages);
  } catch (error) {
    return sendJson(response, { error: error.message || 'Gagal memuat pesan.' }, 500);
  }
}
