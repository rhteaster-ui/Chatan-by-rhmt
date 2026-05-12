import { ensureTelegramConfig, readJson, sendJson, telegram, validateMessage } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, { error: 'Method not allowed.' }, 405);

  try {
    const { chatId } = ensureTelegramConfig();
    const payload = readJson(request);
    const visibility = String(payload.visibility || '').toUpperCase();
    const validationError = validateMessage({ ...payload, visibility });
    if (validationError) return sendJson(response, { error: validationError }, 400);

    const label = visibility === 'PRIVATE' ? '#PRIVATE' : '#PUBLIC';
    const sender = String(payload.sender).trim();
    const text = String(payload.text).trim();

    await telegram('sendMessage', {
      chat_id: chatId,
      text: `${label} Dari: ${sender} - ${text}`,
      disable_web_page_preview: false,
    });

    return sendJson(response, { ok: true });
  } catch (error) {
    return sendJson(response, { error: error.message || 'Gagal mengirim pesan.' }, 500);
  }
}
