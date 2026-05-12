# R_HMT OFC Chat Channel

Aplikasi chat channel glassmorphism berbasis React, Vite, Tailwind CSS, dan Vercel Serverless Functions. Backend memakai Telegram Bot API sebagai jalur penyimpanan/penarikan pesan melalui grup privat.

## Fitur

- Registrasi tanpa email dengan validasi anti-spam di frontend.
- Sesi pengguna tersimpan di `localStorage`, sehingga reload tidak perlu login ulang.
- Pengiriman pesan public/private melalui `/api/send` ke Telegram.
- Feed public melalui `/api/get` yang hanya merender pesan bertag `#PUBLIC`.
- Panel `/admin` dengan validasi `ADMIN_PASSWORD` sebelum log public/private dibuka.
- Link preview otomatis untuk URL `https://`/`http://` via `/api/preview`.
- Tema glassmorphism hitam, hijau neon, dan ungu elektrik tanpa elemen biru.
- Power switch via `VITE_SESSION_STATUS=CLOSED` untuk menutup form input pesan.

## Environment Variables

Atur variabel berikut di Vercel (`Settings` → `Environment Variables`):

```env
TELEGRAM_BOT_TOKEN=token-dari-botfather
TELEGRAM_CHAT_ID=id-grup-privat
ADMIN_PASSWORD=password-admin
VITE_SESSION_STATUS=OPEN
```

Ubah `VITE_SESSION_STATUS` menjadi `CLOSED`, lalu redeploy untuk menutup sesi chat dan menampilkan banner penutupan.

## Alur Telegram

1. Buat bot melalui BotFather dan simpan HTTP API Token.
2. Buat grup privat Telegram.
3. Masukkan bot ke grup dan jadikan admin.
4. Dapatkan `TELEGRAM_CHAT_ID` grup privat.
5. Pesan yang dikirim aplikasi akan memiliki format:
   - `#PUBLIC Dari: [Nama] - [Isi Pesan]`
   - `#PRIVATE Dari: [Nama] - [Isi Pesan]`

> Catatan: endpoint `/api/get` dan `/api/admin-log` memakai `getUpdates`, sehingga bot harus dapat menerima update dari grup Telegram terkait.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
