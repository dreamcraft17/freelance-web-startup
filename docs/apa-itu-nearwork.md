# Apa itu NearWork?

> **Doc revision:** v1  
> Last synchronized: 2026-04-18

Dokumen ini menjawab secara singkat: **produk ini apa**, **untuk siapa**, dan **apa yang dilakukan user di dalamnya**—tanpa detail teknis implementasi.

---

## NearWork dalam satu kalimat

**NearWork** adalah **marketplace kerja freelance**: tempat **client** memasang kebutuhan kerja (job), **freelancer** mengajukan penawaran (bid/proposal), dan kedua pihak berkolaborasi dalam alur yang terstruktur—bisa untuk kerja **jarak jauh (remote)** atau **di lokasi (on-site / hybrid)**.

Repo monorepo ini (nama kerja: **Freelance-web**) adalah **aplikasi web** yang menjalankan produk NearWork (UI, API, database, autentikasi).

---

## Untuk siapa?

| Peran | Siapa mereka? | Apa yang mereka lakukan di NearWork? |
|--------|----------------|--------------------------------------|
| **Client** | Individu atau bisnis yang butuh jasa | Membuat job, membandingkan bid, memilih freelancer, mengelola kontrak dan komunikasi terkait pekerjaan. |
| **Freelancer** | Penyedia jasa profesional / kreator / teknisi | Membangun profil publik, mencari job yang cocok, mengirim proposal, menegosiasikan dan mengerjakan melalui alur platform. |
| **Staff** | Tim internal operasional | Mengelola verifikasi, moderasi, dan tugas admin lain lewat workspace `/admin` (akses terbatas per peran). |

---

## Apa bedanya dengan “sekadar direktori”?

- Ada **siklus pekerjaan**: job → bid → penerimaan → kontrak (dan fitur pendukung seperti pesan, notifikasi, ulasan—sesuai kematangan rilis).
- Ada **aturan produk**: kuota bid, langganan/plan, kebijakan akses—bukan hanya daftar nama dan nomor telepon.
- **Discovery publik**: siapa pun bisa **melihat** job dan profil freelancer tertentu tanpa login; login baru wajib saat melakukan aksi yang dilindungi (misalnya posting job, mengirim bid, menyimpan favorit).

---

## Lingkup jenis pekerjaan

NearWork dirancang untuk **berbagai jenis freelance**, tidak terbatas ke IT:

- digital (desain, konten, pemasaran),
- kreatif (foto, video),
- profesional (konsultasi, les),
- jasa **hyperlocal** (event, perbaikan, layanan di kota tertentu).

Filter seperti **kota**, **mode kerja** (remote / on-site / hybrid), dan **kategori** membantu menemukan pihak yang cocok.

---

## Di mana detail teknis & fitur lengkap?

- **Ringkasan fitur & modul:** `features.md`
- **Gambaran aplikasi & route:** `docs/application-overview.md`
- **Risiko & audit teknis:** `audit.md`
- **Panduan menjaga dokumen tetap sinkron dengan kode:** `docs/DOCUMENTATION-MAINTENANCE.md`

---

## Nama & merek

- **NearWork** — nama produk yang ditampilkan ke pengguna.
- **Freelance-web** — nama umum monorepo / proyek pengembangan di repositori ini.
