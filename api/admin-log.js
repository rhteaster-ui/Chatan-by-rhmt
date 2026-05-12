import { parseTelegramUpdate, readJson, sendJson, telegram } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, { error: 'Method not allowed.' }, 405);

  const { password } = readJson(request);
  if (!process.env.ADMIN_PASSWORD) return sendJson(response, { error: 'ADMIN_PASSWORD belum diatur.' }, 500);
  if (password !== process.env.ADMIN_PASSWORD) return sendJson(response, { error: 'Unauthorized.' }, 401);

  try {
    const updates = await telegram('getUpdates', null, '?limit=100');
    const logs = updates
      .map((update) => parseTelegramUpdate(update, true))
      .filter(Boolean)
      .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));

    return sendJson(response, logs);
  } catch (error) {
    return sendJson(response, { error: error.message || 'Gagal memuat log admin.' }, 500);
  }
}
