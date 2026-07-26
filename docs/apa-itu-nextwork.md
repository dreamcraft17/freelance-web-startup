# Apa itu NextWork?

> **Doc revision:** v8  
> Last synchronized: 2026-07-26 (tautan ke suite docs kanonik `00_INDEX`).

Dokumen ini menjawab secara singkat: **produk ini apa**, **untuk siapa**, dan **apa yang dilakukan user di dalamnya**—tanpa detail teknis implementasi.

---

## NextWork dalam satu kalimat

**NextWork** adalah **marketplace freelance untuk merekrut**: **klien** memasang lowongan (job), **freelancer** mengirim proposal, dan percakapan tetap terikat pada lowongan yang sama—untuk kerja **remote** maupun **di lokasi (on-site / hybrid)**.

Repo monorepo ini (nama kerja: **Freelance-web**) adalah **aplikasi web** yang menjalankan produk NextWork (UI, API, database, autentikasi).

Pengguna dapat memilih **Bahasa Indonesia** atau **English** pada antarmuka (preferensi tersimpan untuk kunjungan berikutnya).

Awal rilis: dasbor klien/freelancer dan beberapa halaman publik memberi **checklist langkah nyata** (bukan angka palsu) serta empty state yang menjelaskan *apa yang terjadi*, *mengapa kosong*, dan *apa yang dilakukan berikutnya*—termasuk pengingat bahwa proposal dan chat tetap terikat pada job yang sama. Form proposal dan tinjauan di sisi klien dirancang supaya **percakapan hiring** (bukan obrolan santai) tetap fokus pada scope, jadwal, dan keputusan di lowongan tersebut.

---

## Untuk siapa?

| Peran | Siapa mereka? | Apa yang mereka lakukan di NextWork? |
|--------|----------------|--------------------------------------|
| **Client** | Individu atau bisnis yang butuh jasa | Membuat job, membandingkan bid, memilih freelancer, mengelola kontrak dan komunikasi terkait pekerjaan. |
| **Freelancer** | Penyedia jasa profesional / kreator / teknisi | Membangun profil publik, mencari job yang cocok, mengirim proposal, menegosiasikan dan mengerjakan melalui alur platform. |
| **Staff** | Tim internal operasional | Mengelola verifikasi, moderasi, dan tugas admin lain lewat workspace `/admin` (akses terbatas per peran). |

---

## Apa bedanya dengan “sekadar direktori”?

- Ada **siklus pekerjaan**: job → bid → penerimaan → kontrak (dan fitur pendukung seperti pesan, notifikasi, ulasan—sesuai kematangan rilis).
- Ada **aturan produk**: kuota bid, langganan/plan, kebijakan akses—bukan hanya daftar nama dan nomor telepon.
- **Discovery publik**: siapa pun bisa **melihat** job dan profil freelancer tertentu tanpa login; login baru wajib saat melakukan aksi yang dilindungi (misalnya posting job, mengirim bid, menyimpan favorit).
- **Navigasi publik**: halaman ber-chrome marketing memakai bilah atas yang terasa seperti **produk** (jelas ke Jobs/Freelancers, informasi produk, bantuan, dan akun)—bukan sekadar “header template”; setelah login, area akun dan notifikasi mengikuti **status sungguhan** Anda.

---

## Lingkup jenis pekerjaan

NextWork dirancang untuk **berbagai jenis freelance**, tidak terbatas ke IT:

- digital (desain, konten, pemasaran),
- kreatif (foto, video),
- profesional (konsultasi, les),
- jasa **hyperlocal** (event, perbaikan, layanan di kota tertentu).

Filter seperti **kota**, **mode kerja** (remote / on-site / hybrid), dan **kategori** membantu menemukan pihak yang cocok.

---

## Di mana detail teknis & fitur lengkap?

- **Index dokumen:** [`00_INDEX.md`](./00_INDEX.md)
- **Overview & cara kerja:** [`PROJECT-OVERVIEW.md`](./PROJECT-OVERVIEW.md), [`HOW-IT-WORKS.md`](./HOW-IT-WORKS.md)
- **Panduan pakai:** [`USER-GUIDE.md`](./USER-GUIDE.md)
- **Ringkasan fitur & modul:** `../features.md`, [`FEATURE-CATALOG.md`](./FEATURE-CATALOG.md)
- **Gambaran aplikasi & route:** [`application-overview.md`](./application-overview.md)
- **Risiko & audit teknis:** `../audit.md`, [`SECURITY.md`](./SECURITY.md)
- **Panduan menjaga dokumen tetap sinkron dengan kode:** [`DOCUMENTATION-MAINTENANCE.md`](./DOCUMENTATION-MAINTENANCE.md)

---

## Nama & merek

- **NextWork** — nama produk yang ditampilkan ke pengguna.
- **Freelance-web** — nama umum monorepo / proyek pengembangan di repositori ini.
