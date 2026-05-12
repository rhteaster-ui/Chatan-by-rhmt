import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const SESSION_KEY = 'rhmt-chat-session';
const urlRegex = /(https?:\/\/[^\s]+)/gi;

function randomToken() {
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16)).join('-');
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(username) {
  const session = { username, token: randomToken(), createdAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function validateUsername(username) {
  return /^[a-zA-Z0-9]{4,}$/.test(username.trim());
}

function Registration({ onRegistered }) {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!validateUsername(form.username)) {
      setError('Nama minimal 4 karakter dan hanya boleh huruf/angka.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password wajib cocok.');
      return;
    }
    onRegistered(saveSession(form.username.trim()));
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-xl items-center px-5 py-12">
      <form onSubmit={submit} className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-lg">
        <p className="text-sm font-bold uppercase tracking-[0.45em] text-neon">R_HMT OFC</p>
        <h1 className="mt-4 text-4xl font-black text-white">Masuk ke Chat Channel</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          Registrasi ringan tanpa email. Identitas akan dikunci di browser ini memakai localStorage agar reload tidak perlu login ulang.
        </p>
        <div className="mt-8 space-y-4">
          <input name="username" value={form.username} onChange={updateField} placeholder="Nama pengguna" className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-neon" />
          <input name="password" value={form.password} onChange={updateField} type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-neon" />
          <input name="confirmPassword" value={form.confirmPassword} onChange={updateField} type="password" placeholder="Konfirmasi password" className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-neon" />
        </div>
        {error && <p className="mt-4 rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 text-sm text-fuchsia-100">{error}</p>}
        <button className="mt-6 w-full rounded-2xl bg-neon px-5 py-4 font-black text-black shadow-glow transition hover:scale-[1.01]">Buat Sesi</button>
      </form>
    </section>
  );
}

function LinkPreview({ url }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/preview?url=${encodeURIComponent(url)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!preview?.title && !preview?.description && !preview?.image) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-2xl border border-white/10 bg-black/35 transition hover:border-neon/60">
      {preview.image && <img src={preview.image} alt="Link preview" className="h-36 w-full object-cover" />}
      <div className="space-y-1 p-4">
        <p className="line-clamp-2 font-bold text-white">{preview.title || url}</p>
        {preview.description && <p className="line-clamp-3 text-sm text-zinc-300">{preview.description}</p>}
        <p className="truncate text-xs text-neon">{preview.siteName || new URL(url).hostname}</p>
      </div>
    </a>
  );
}

function ChatBubble({ message }) {
  const links = useMemo(() => message.text.match(urlRegex) || [], [message.text]);

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-purpleGlow backdrop-blur-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-neon">{message.sender}</p>
        <time className="text-xs text-zinc-500">{message.createdAt ? new Date(message.createdAt).toLocaleString('id-ID') : 'baru'}</time>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-zinc-100">{message.text}</p>
      {links.slice(0, 2).map((url) => <LinkPreview key={url} url={url} />)}
    </article>
  );
}

function AdminPanel() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  async function unlock(event) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setError('Password admin salah.');
      return;
    }
    setAuthorized(true);
    const logResponse = await fetch('/api/admin-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (logResponse.ok) setLogs(await logResponse.json());
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <a href="/" className="text-sm font-bold text-neon">← Kembali ke chat</a>
      <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <h1 className="text-3xl font-black text-white">Log Admin</h1>
        {!authorized ? (
          <form onSubmit={unlock} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="ADMIN_PASSWORD" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-neon" />
            <button className="rounded-2xl bg-neon px-6 py-4 font-black text-black">Buka Log</button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            {logs.map((log) => <ChatBubble key={log.id} message={log} />)}
            {!logs.length && <p className="text-zinc-300">Belum ada log dari Telegram.</p>}
          </div>
        )}
        {error && <p className="mt-4 text-sm text-fuchsia-200">{error}</p>}
      </div>
    </section>
  );
}

function ChatApp() {
  const [session, setSession] = useState(loadSession());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('PUBLIC');
  const [status, setStatus] = useState('');
  const [sessionStatus, setSessionStatus] = useState('OPEN');
  const isClosed = sessionStatus.toUpperCase() === 'CLOSED';

  async function loadSessionStatus() {
    const response = await fetch('/api/status');
    if (response.ok) {
      const payload = await response.json();
      setSessionStatus(payload.status || 'OPEN');
    }
  }

  async function loadMessages() {
    const response = await fetch('/api/get');
    if (response.ok) setMessages(await response.json());
  }

  useEffect(() => {
    loadSessionStatus();
    loadMessages();
    const timer = setInterval(() => {
      loadSessionStatus();
      loadMessages();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setStatus('Mengirim pesan...');
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: session.username, token: session.token, text, visibility: mode }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setStatus(payload.error || 'Pesan gagal dikirim.');
      return;
    }
    setText('');
    setStatus('Pesan terkirim.');
    await loadMessages();
  }

  if (!session?.username || !session?.token) return <Registration onRegistered={setSession} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-lg md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.45em] text-neon">R_HMT OFC</p>
          <h1 className="mt-2 text-4xl font-black text-white">Chat Channel</h1>
          <p className="mt-2 text-zinc-300">Halo, <span className="font-bold text-neon">{session.username}</span>. Public feed dan status sesi ditarik dari Telegram.</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Status sesi: <span className={isClosed ? 'text-fuchsia-200' : 'text-neon'}>{sessionStatus}</span></p>
        </div>
        <a href="/admin" className="rounded-2xl border border-electric/40 px-5 py-3 text-center font-bold text-fuchsia-100 transition hover:bg-electric/20">Admin</a>
      </header>

      {isClosed && (
        <div className="mt-6 rounded-[1.5rem] border border-electric/40 bg-white/5 p-5 text-center font-bold text-fuchsia-100 shadow-purpleGlow backdrop-blur-lg">
          Sesi Chat Sedang Ditutup. Pantau terus Saluran WhatsApp R_hmt ofc untuk update selanjutnya!
        </div>
      )}

      <section className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-h-[28rem] space-y-4 overflow-y-auto rounded-[2rem] border border-white/10 bg-black/25 p-5 backdrop-blur-lg scrollbar-thin">
          {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          {!messages.length && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-zinc-400">Belum ada pesan public.</p>}
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
          {!isClosed ? (
            <form onSubmit={sendMessage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['PUBLIC', 'PRIVATE'].map((item) => (
                  <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-2xl px-4 py-3 font-black transition ${mode === item ? 'bg-neon text-black' : 'border border-white/10 text-zinc-200 hover:border-neon'}`}>{item}</button>
                ))}
              </div>
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows="8" maxLength="800" placeholder="Tulis pesan... Link https:// akan dibuat preview otomatis." className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-neon" />
              <button className="w-full rounded-2xl bg-neon px-5 py-4 font-black text-black shadow-glow transition hover:scale-[1.01]">Kirim {mode}</button>
              {status && <p className="text-sm text-zinc-300">{status}</p>}
            </form>
          ) : (
            <p className="rounded-2xl border border-white/10 bg-black/30 p-5 text-zinc-300">Form input pesan nonaktif karena sesi sedang ditutup.</p>
          )}
        </aside>
      </section>
    </main>
  );
}

function App() {
  return window.location.pathname === '/admin' ? <AdminPanel /> : <ChatApp />;
}

createRoot(document.getElementById('root')).render(<App />);
