const publicPattern = /^#PUBLIC\s+Dari:\s+(.+?)\s+-\s+([\s\S]*)$/i;
const privatePattern = /^#PRIVATE\s+Dari:\s+(.+?)\s+-\s+([\s\S]*)$/i;

export function json(response, status = 200) {
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function ensureTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID wajib diatur.');
  }
  return { token, chatId };
}

export async function telegram(method, payload, searchParams = '') {
  const { token } = ensureTelegramConfig();
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}${searchParams}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'content-type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'Telegram API error.');
  }
  return data.result;
}

export function parseTelegramUpdate(update, includePrivate = false) {
  const message = update.message || update.channel_post || update.edited_message;
  const text = message?.text || '';
  const publicMatch = text.match(publicPattern);
  const privateMatch = includePrivate ? text.match(privatePattern) : null;
  const match = publicMatch || privateMatch;
  if (!message || !match) return null;

  return {
    id: `${update.update_id}-${message.message_id}`,
    visibility: publicMatch ? 'PUBLIC' : 'PRIVATE',
    sender: match[1].trim(),
    text: match[2].trim(),
    createdAt: message.date ? new Date(message.date * 1000).toISOString() : null,
  };
}

export function validateMessage({ sender, text, visibility }) {
  if (!/^[a-zA-Z0-9]{4,}$/.test(String(sender || '').trim())) {
    return 'Nama pengirim tidak valid.';
  }
  if (!String(text || '').trim() || String(text).length > 800) {
    return 'Pesan wajib diisi dan maksimal 800 karakter.';
  }
  if (!['PUBLIC', 'PRIVATE'].includes(String(visibility || '').toUpperCase())) {
    return 'Mode pesan tidak valid.';
  }
  return '';
}
