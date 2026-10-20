# IPFEST 2027

Website IPFEST 2027: landing page, pendaftaran, acara, kompetisi, absensi, dan dashboard operasional. Hosting menggunakan Firebase; backend berjalan di Firebase Cloud Functions.

## Struktur proyek

```text
.
├── .github/             # Workflow CI untuk Firebase Hosting
├── design/               # Referensi dan bahan desain; bukan aset runtime
├── functions/            # Cloud Functions dan dependensi backend terisolasi
├── public/               # Root berkas yang dipublikasikan Firebase Hosting
│   ├── attendance/       # Halaman absensi
│   ├── competitions/     # Halaman kompetisi
│   ├── dashboard/        # Halaman operasional/admin
│   ├── events/           # Halaman acara
│   ├── static/           # CSS, gambar, font, pustaka browser
│   └── dist/             # Bundel browser hasil Webpack; jangan edit manual
├── scripts/              # Pemeriksaan struktur/layout frontend
├── src/                  # Source JavaScript frontend dan modul bersama
├── static/               # Aset tingkat repo; tidak otomatis disajikan Hosting
└── konfigurasi root      # Firebase, aturan Firestore/Storage, Webpack, Babel, npm
```

### Batas tanggung jawab

- `src/` berisi source JavaScript yang dibangun Webpack, termasuk integrasi Firebase Web SDK dan modul UI bersama.
- `public/` berisi HTML dan aset yang harus tetap tersedia melalui URL situs. Susunan halaman dan aset mempertahankan URL publik yang sudah ada.
- `public/dist/` adalah output build yang dimuat oleh halaman. Edit source di `src/`, lalu jalankan build.
- `functions/` adalah backend; `functions/index.js` menjadi entry point, sedangkan `functions/package.json` mengelola dependensi dan perintahnya sendiri.
- `design/` untuk referensi desain. `static/` di root tidak dipublikasikan oleh Hosting kecuali disalin ke `public/` atau konfigurasi Hosting diubah.
- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, dan `storage.rules` mengatur Firebase. `webpack.config.babel.js` mengatur entry frontend dan output build.

## Pengembangan website

Dari root repo:

```sh
npm ci
npm run start
```

Buka `http://localhost:9000/` dan biarkan terminal berjalan. Build produksi:

```sh
npm run build
npm test
```

`npm test` memeriksa entry Webpack, import lokal frontend, dan agar halaman tidak memuat source JS langsung dari luar bundle.

## Cloud Functions dan email secret

Pasang dependensi backend dari `functions/` dengan `npm ci`, lalu jalankan `npm test` di folder tersebut untuk memeriksa binding secret dan konfigurasi trigger. Perintah emulator, deploy, dan log juga tersedia di `functions/package.json`.

Certificate trigger membutuhkan Firebase Secret Manager secret bernama `MAILGUN_SMTP_PASSWORD`. Siapkan atau rotasi kredensial di provider email, lalu set nilainya secara interaktif (jangan masukkan nilainya ke Git, chat, atau log):

```sh
firebase functions:secrets:set MAILGUN_SMTP_PASSWORD
```

Untuk emulator lokal, simpan secret hanya di `functions/.secret.local` dengan format `MAILGUN_SMTP_PASSWORD=...`. File `*.local` di folder Functions diabaikan Git; jangan menghapus aturan tersebut atau membagikan file ini.

Setelah secret tersedia, deploy Functions secara terpisah:

```sh
firebase deploy --only functions
```

Trigger sertifikat menggunakan Cloud Functions generasi kedua agar dapat mengikat Secret Manager. Jika fungsi generasi pertama dengan nama yang sama sudah terdeploy, periksa rencana perubahan Firebase CLI; penggantian generasi dapat memerlukan penghapusan fungsi lama sebelum deploy dan menimbulkan jeda layanan. Deploy tidak dijalankan otomatis oleh perubahan kode ini.

**Penting:** password SMTP sebelumnya tertulis di source dan riwayat Git. Anggap telah terekspos: rotasi/revoke kredensial lama di provider email, lalu simpan kredensial baru sebagai secret di atas. Menghapusnya dari file saat ini tidak menghapus nilai lama dari riwayat Git.
