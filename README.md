This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sinkronisasi data SPMB

Portal menggunakan database MySQL yang sama untuk akun pelajar, aktivitas pendaftaran/perubahan, dan berkas unggahan. Pastikan database `spmb` tersedia dan konfigurasi koneksi di `app/lib/db.js` cocok dengan Laragon. Jalankan `npm run db:init` untuk menyiapkan schema, roles, akun demo, dan data contoh; tabel `portal_activity` serta `portal_documents` juga dibuat otomatis bila belum ada.

Login dan pendaftaran dilakukan melalui server. Pendaftar baru langsung masuk ke daftar Admin dan Kepala Sekolah, sementara feed notifikasi kedua peran diperbarui otomatis kira-kira setiap tiga detik. Unggahan PDF/JPG/PNG disimpan di MySQL dengan batas 5 MB. Data contoh statis yang sudah ada tetap ditampilkan terpisah dari pendaftar baru.

Untuk deployment, atur `SPMB_SESSION_SECRET` ke nilai acak rahasia yang sama di seluruh instance aplikasi. Contoh membuat secret dengan Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Jangan gunakan secret development di production. Cookie sesi bersifat HttpOnly; gunakan HTTPS di lingkungan production. Akun demo database yang seed awalnya memakai password teks biasa akan dipindahkan ke hash scrypt saat login berhasil.

## Deployment SPMB ke Vercel dan Railway

Proyek ini berdiri sendiri di folder `spmb`; jangan gunakan folder/repository website kasir untuk deployment ini. Vercel dan Railway mendeteksi Next.js dari `package.json` secara otomatis. Atur variabel berikut secara terpisah di pengaturan environment kedua platform:

| Variabel | Keterangan |
| --- | --- |
| `MYSQLHOST` | Host MySQL production |
| `MYSQLUSER` | User database |
| `MYSQLPASSWORD` | Password database |
| `MYSQLDATABASE` | Nama database yang sudah dibuat |
| `MYSQLPORT` | Port MySQL |
| `SPMB_SESSION_SECRET` | Secret sesi acak yang sama di seluruh deployment |

Railway menyediakan variabel MySQL tersebut pada service database. Untuk Vercel, gunakan host/port publik database Railway (bukan hostname private Railway) atau MySQL production lain yang dapat dijangkau Vercel. Jangan commit nilai variabel atau file `.env` ke Git.

Setelah database production tersedia, jalankan `npm run db:init` dengan `NODE_ENV=production` dan variabel MySQL di atas untuk membuat tabel serta role dasar tanpa akun demo. Untuk data contoh lokal, jalankan perintah yang sama tanpa `NODE_ENV=production`; akun demo dan data contoh hanya dimasukkan di mode lokal.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
