# Fitur marketplace — ringkasan

Dokumen ini merangkum **kapabilitas produk/API** yang ada di monorepo (fokus `apps/web` + `packages/database`). Untuk status teknis, risiko, dan utang, lihat **`audit.md`**.

---

## Autentikasi & sesi

- **Register** (`POST /api/auth/register`) — peran **CLIENT** atau **FREELANCER**; set cookie sesi **`acme_session`** (JWT).
- **Login** (`POST /api/auth/login`) — cookie sesi; payload mencakup `userId`, `role`, `accountStatus`.
- **Sesi saat ini** (`GET /api/auth/session`) — validasi cookie.
- **Logout** (`POST /api/auth/logout`) — hapus cookie.

Middleware melindungi area **`/client/*`**, **`/freelancer/*`**, **`/messages/*`**, **`/notifications/*`**, **`/settings/*`**.

---

## Profil

### Klien

- **Profil saya** (`GET /api/client-profiles`) — untuk pengguna terautentikasi.
- **Buat profil** (`POST /api/client-profiles`) — jika belum ada (register CLIENT sudah membuat profil default).

### Freelancer

- **Profil publik** (`GET /api/freelancer-profiles?username=…`) — tampilan publik (username case-insensitive).
- **Profil saya** (`GET /api/freelancer-profiles/me`) — `id`, `username`, dan field tampilan untuk sesi freelancer.
- **Buat profil** (`POST /api/freelancer-profiles`) — onboarding eksplisit (alternatif dari profil auto saat register).
- **Perbarui profil** (`PATCH /api/freelancer-profiles`) — partial update (mis. **`bio`**, headline, work mode, availability) — **diperlukan** agar kebijakan “profil lengkap” terpenuhi sebelum mengirim bid (`bio` + username + work mode).

---

## Job & pencarian

- **Buat job** (`POST /api/jobs`) — klien; job langsung **OPEN** untuk bidding.
- **Daftar job publik** (`GET /api/jobs`) — pagination + filter; urutan mempertimbangkan **featured** aktif.
- **Detail job publik** (`GET /api/jobs/[jobId]`) — halaman UI + data kategori/klien.
- **Update / tutup job** — sesuai kebijakan pemilik.
- **Pencarian** — `GET /api/search/jobs`, `GET /api/search/freelancers` (filter geo, kategori, skill, dll.).

---

## Bid & kontrak

- **Kirim bid** (`POST /api/bids`) — freelancer; kuota + kebijakan profil lengkap + unik per pasangan `(jobId, freelancer)`.
- **Terima bid** (`POST /api/bids/[bidId]/accept`) — klien pemilik job → kontrak **PENDING** + notifikasi **BID_ACCEPTED** ke freelancer.
- **Notifikasi bid baru** — **BID_SUBMITTED** ke pemilik job.

---

## Kontrak

- **Selesaikan kontrak** (`POST /api/contracts/[contractId]/complete`) — klien atau freelancer → status **COMPLETED** (idempotent: panggilan kedua → **409** `ALREADY_COMPLETED`).
- **Baca kontrak** — untuk peserta (sesuai policy).

---

## Pesan

- **Daftar thread** (`GET /api/messages`).
- **Buat thread** (`POST /api/messages`) — tipe **DIRECT**, **JOB** (job masih OPEN), atau **CONTRACT** (hanya pihak kontrak).
- **Daftar / kirim pesan** (`GET` / `POST /api/messages/[threadId]`) — peserta thread; notifikasi **NEW_MESSAGE** ke penerima.

---

## Notifikasi

- **Daftar** (`GET /api/notifications`) — termasuk bid, pesan, hasil verifikasi (bila terhubung).
- **Tandai dibaca** (`PATCH /api/notifications/[notificationId]` dengan body `{ "read": true }`).

---

## Review

- **Buat review** (`POST /api/reviews`) — hanya jika kontrak **COMPLETED**; klien menilai **FREELANCER**, freelancer menilai **CLIENT**; satu review per penulis per target per kontrak.
- **Daftar publik** (`GET /api/reviews?freelancerProfileId=…` atau `?clientProfileId=…`) — item + **agregat** `reviewCount` / `averageReviewRating` pada profil target.

---

## Item tersimpan, kategori & skill

- **Simpan job / freelancer** + daftar di pengaturan (`/api/saved-items/...`).
- **Kategori & subkategori** (`GET /api/categories`, detail bila ada).
- **Skill** — listing dengan filter kategori / query.

---

## Langganan, kuota & monetisasi (placeholder / awal)

- **Paket & entitlement** — `@acme/config` (`plans`, feature flags).
- **Kuota freelancer** (`GET /api/quota/me`) — pemakaian vs limit plan; mode early access bisa melewati enforcement.
- **Langganan** (`GET /api/subscriptions`, checkout masih placeholder di beberapa alur).
- **Donasi** (`POST /api/donations`) — mock persistensi.
- **Job featured & boost freelancer** — pembelian simulasi + ranking di pencarian (detail di `audit.md`).

---

## Uji alur end-to-end

- Skrip **`scripts/e2e-marketplace-flow.mjs`** — register (client + freelancer), login + sesi, PATCH bio freelancer, job, bid, notifikasi, accept → kontrak, pesan kontrak, complete, review silang, agregat review, penolakan review duplikat.
- Jalankan: **`pnpm test:e2e`** dengan server web aktif dan env **`DATABASE_URL`**, **`SESSION_SECRET`** (≥16 karakter), migrasi DB terpasang. Opsional: **`BASE_URL`** jika bukan `http://localhost:3000`.

---

## Admin & lainnya

- Aplikasi **`apps/admin`** (bila dikonfigurasi) untuk staf; **VerificationService** masih sebagian placeholder — lihat **`audit.md`**.
