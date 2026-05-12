# R_HMT OFC Chat Channel

Aplikasi chat channel glassmorphism berbasis React, Vite, Tailwind CSS, dan Vercel Node Serverless Functions. Backend memakai Telegram Bot API sebagai jalur penyimpanan/penarikan pesan melalui grup privat.

## Fitur

- Registrasi tanpa email dengan validasi anti-spam di frontend.
- Sesi pengguna tersimpan di `localStorage`, sehingga reload tidak perlu login ulang.
- Pengiriman pesan public/private melalui `/api/send` ke Telegram.
- Feed public melalui `/api/get` yang hanya merender pesan bertag `#PUBLIC`.
- Panel `/admin` dengan validasi `ADMIN_PASSWORD` sebelum log public/private dibuka.
- Link preview otomatis untuk URL `https://`/`http://` via `/api/preview`.
- Tema glassmorphism hitam, hijau neon, dan ungu elektrik tanpa elemen biru.
- Power switch via command Telegram `/status CLOSED` atau `/status OPEN` untuk menutup/membuka form input pesan tanpa redeploy.

## Environment Variables

Atur variabel berikut di Vercel (`Project` → `Settings` → `Environment Variables`). Masukkan untuk environment **Production**, **Preview**, dan **Development** jika ingin semua deploy memakai konfigurasi yang sama.

| Key | Value yang diisi | Contoh | Dipakai oleh | Wajib |
| --- | --- | --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | HTTP API token dari BotFather. Jangan pakai nama bot, pakai token lengkap. | `1234567890:AAExampleTokenDariBotFather` | Serverless API `/api/send`, `/api/get`, `/api/status`, `/api/admin-log` | Ya |
| `TELEGRAM_CHAT_ID` | ID grup privat Telegram tempat bot menjadi admin. Biasanya diawali `-100` untuk supergroup/channel. | `-1001234567890` | Serverless API `/api/send`, `/api/status` | Ya |
| `ADMIN_PASSWORD` | Password bebas untuk membuka halaman `/admin`. Buat panjang dan sulit ditebak. | `RahasiaAdmin-2026!` | Serverless API `/api/admin-auth`, `/api/admin-log` | Ya |

Contoh `.env` lokal:

```env
TELEGRAM_BOT_TOKEN=1234567890:AAExampleTokenDariBotFather
TELEGRAM_CHAT_ID=-1001234567890
ADMIN_PASSWORD=RahasiaAdmin-2026!
```

Catatan penting:

- Status sesi chat sekarang dibaca runtime dari Telegram, jadi tidak perlu redeploy untuk buka/tutup sesi.
- Jangan commit token asli ke repository; simpan hanya di Vercel Environment Variables.

## Alur Telegram

1. Buat bot melalui BotFather dan simpan HTTP API Token.
2. Buat grup privat Telegram.
3. Masukkan bot ke grup dan jadikan admin.
4. Dapatkan `TELEGRAM_CHAT_ID` grup privat.
5. Pesan yang dikirim aplikasi akan memiliki format:
   - `#PUBLIC Dari: [Nama] - [Isi Pesan]`
   - `#PRIVATE Dari: [Nama] - [Isi Pesan]`

> Catatan: endpoint `/api/get`, `/api/status`, dan `/api/admin-log` memakai `getUpdates`, sehingga bot harus dapat menerima update dari grup Telegram terkait.

## Kontrol Status dari Telegram

Kirim command berikut di grup privat Telegram yang sama dengan `TELEGRAM_CHAT_ID`:

```text
/status CLOSED
```

Untuk membuka lagi:

```text
/status OPEN
```

Alternatif format yang juga diterima:

```text
#STATUS CLOSED
#STATUS OPEN
```

Frontend akan mengecek `/api/status` setiap 20 detik. Backend `/api/send` juga ikut mengecek status terbaru, sehingga pesan tidak bisa dikirim saat status `CLOSED` walaupun user mencoba memanggil API secara manual.

## Kesiapan Deploy Vercel

Project ini disiapkan untuk deploy di Vercel dengan struktur root standar:

- Frontend Vite berada di `src/` dan entry HTML di `index.html`.
- Serverless Functions berada di folder `api/` dan memakai signature Node Vercel `handler(request, response)`.
- Build command: `npm run build`.
- Output directory: `dist`.

Pastikan semua environment variables sudah diisi sebelum deploy production.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
