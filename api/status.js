import { getLatestSessionStatus, sendJson } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, { error: 'Method not allowed.' }, 405);

  try {
    return sendJson(response, await getLatestSessionStatus());
  } catch (error) {
    return sendJson(response, { error: error.message || 'Gagal memuat status sesi.' }, 500);
  }
}
