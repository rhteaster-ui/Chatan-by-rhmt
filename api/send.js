import { ensureTelegramConfig, json, readJson, telegram, validateMessage } from './_telegram.js';

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const { chatId } = ensureTelegramConfig();
    const payload = await readJson(request);
    const visibility = String(payload.visibility || '').toUpperCase();
    const validationError = validateMessage({ ...payload, visibility });
    if (validationError) return json({ error: validationError }, 400);

    const label = visibility === 'PRIVATE' ? '#PRIVATE' : '#PUBLIC';
    const sender = String(payload.sender).trim();
    const text = String(payload.text).trim();

    await telegram('sendMessage', {
      chat_id: chatId,
      text: `${label} Dari: ${sender} - ${text}`,
      disable_web_page_preview: false,
    });

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message || 'Gagal mengirim pesan.' }, 500);
  }
}
