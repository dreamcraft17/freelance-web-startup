# Audit teknis — Freelance-web (monorepo)

> **Doc revision:** v17
> Last synchronized: 2026-06-19 (moderation SLA, escalation, dedupe, staff notifications, audit trail).

**Lingkup:** `apps/web`, `packages/*`, dan jalur operasional yang mempengaruhi produksi.  
**Tanggal referensi:** Mei 2026 (sinkron dengan update terakhir implementasi).

## Addendum update (April–Mei 2026)

- **2026-06-19 — Moderation operations:** laporan mendapat priority + SLA berbasis kategori, active-report dedupe atomik, notifikasi in-app ke moderation desk, audit log terpusat untuk create/assign/note/status, dan eskalasi overdue idempotent dari worker. `/admin/reports` menampilkan queue metrics, filter priority/attention, deadline, dan escalation badge. Loading skeleton admin dilengkapi untuk seluruh sub-route tabel.

- **2026-05-22 — CI GitHub Actions:** workflow `.github/workflows/ci.yml` — job **quality** (`typecheck`, lint `@acme/web`, `test:unit`) dan **integration** (Postgres 16 service, `db:migrate:deploy`, `db:seed`, build web, `SKIP_E2E_BUILD=1` + `pnpm test:e2e` dengan `DATABASE_URL_TEST`).
- **2026-05-16 — Listing sintetis di marketplace publik:** di lingkungan Vercel (`VERCEL=1`), job/profil yang cocok pola otomasi (judul E2E/Playwright, username `pw_`, dll.) disembunyikan dari board publik dan agregat marketing via `synthetic-public-content.ts`; override debug `NEARWORK_SHOW_SYNTHETIC_PUBLIC_LISTINGS=1`, paksa sembunyikan lokal `NEARWORK_HIDE_SYNTHETIC_PUBLIC_LISTINGS=1`.
- **2026-05-12 — E2E DB terisolasi:** `pnpm test:e2e` (`scripts/run-e2e-server.mjs`) memetakan **`DATABASE_URL_TEST`** → `DATABASE_URL` untuk build + `next start` agar smoke tidak menulis ke DB dev/staging bersama; tanpa itu wajib `DATABASE_URL` eksplisit ke DB throwaway.
- **2026-05-11 — Voice & copy operasional:** microcopy EN/ID (Messages/Pesan, “Contact freelancer” / “Hubungi freelancer”) menggantikan frasa pitch; bahasa Indonesia formal di CTA dashboard dan profil publik.
- **2026-05-11 — Loading & skeleton:** primitive `nw-skeleton*` + `LoadingSkeleton`; `loading.tsx` di route utama (jobs, freelancers, detail, dashboard client/freelancer, messages, notifications, settings, admin jobs/users/reports/verification).
- **2026-05-11 — Mata uang job vs locale UI:** anggaran/proposal/kontrak mengikuti **`Job.currency`** (IDR/USD); path `/en` vs `/id` hanya memengaruhi format angka (`format-money.ts`), bukan konversi mata uang.
- **2026-05-10 — Notifikasi in-app terlokalisasi:** `NotificationService` menyimpan `_nwCopy`; `listForActor(actor, locale)` + `GET /api/notifications` mem-format judul/bodi dari kamus aktif.
- **2026-05-10 — Workspace routing parity:** middleware mendeteksi `/(en|id)/(client|freelancer|messages|notifications|settings)` → rewrite ke path `/client`… yang sama seperti sebelumnya (tanpa menduplikasi tree App Router). Permintaan ke `/client`… tanpa prefix dialihkan ke `/<preferredLocale>/…` sebelum gate sesi; return URL ke `/login` dapat berupa URL bermerek locale penuh. Deep link lama tanpa prefix tetap valid via redirect.
- **2026-05-08 — Trust & safety MVP:** model **`ModerationReport`** + **`ModerationReportNote`**; status `OPEN` / `IN_REVIEW` / `RESOLVED` / `DISMISSED`; subjek `USER` / `JOB` / `BID` / `REVIEW` / `MESSAGE_THREAD` / `MESSAGE`; intake **`POST /api/reports`**; antrean **`/admin/reports`** (assign, catatan internal, resolve/dismiss); job **`moderationHiddenAt`** untuk sembunyikan dari discovery publik; **`ADMIN`/`SUPPORT_ADMIN`** suspend/reactivate **`CLIENT`/`FREELANCER`** di `/admin/users`. UI intake: `ModerationReportButton` di profil freelancer, owner job, proposal, Messages. E2E smoke memverifikasi laporan BID muncul di **`GET /api/admin/reports`** (butuh admin seed).
- **2026-05-09 — Pool pressure / `EMAXCONNSESSION` (read path):** halaman publik `/jobs` dan `/freelancers` memanggil **satu** transaksi Prisma untuk **`PublicStatsService.getPulseAndHeroForPublicBrowse`** (pulse + **momentum** + hero panels), bukan beberapa transaksi paralel terpisah. `SearchService` menyerialkan pasangan **`count` → `findMany`** untuk job list dan **`COUNT` → list** untuk freelancer `$queryRaw`; `CategoryService.list` juga menyerialkan pasangan tersebut. Layout freelancer menyerialkan **notifikasi unread** dan **inbox awaiting reply** (bukan `Promise.all`). Tujuan: menurunkan checkout koneksi bersamaan terhadap pool session (`pool_size` kecil di penyedia managed Postgres).
- **2026-05-09 — Nav badges & awaiting-reply (lanjutan):** `MarketingShell` (semua rute marketing/publik dengan sesi) tidak lagi memakai `Promise.all` untuk dua count badge. **`react` `cache()`** mem-dedupe hitungan notifikasi / thread awaiting reply per request antara **layout freelancer** dan **halaman dashboard** (`navigation-badges-cache.ts`), sehingga query berat tidak dijalankan dua kali per navigasi. `MessageService.countAwaitingReplyThreadsForUser` diganti **satu** `$queryRaw` agregat (bukan `findMany` peserta + nested message). Dashboard **client** dan **freelancer** menyerialkan blok query yang sebelumnya `Promise.all` (hingga 6 parallel).
- **2026-04-27 — Source tree consistency hardening:** struktur runtime `apps/web` dinormalisasi ke root-level folders (`app`, `components`, `features`, `lib`, `server`) dan ketergantungan pada `apps/web/src` dihapus untuk mengurangi ambiguitas path/alias yang rawan salah import.
- **2026-04-27 — Credential hygiene pass:** `credential.md` tidak lagi memuat nilai credential konkret; kini hanya berisi template env placeholders. `credential.example.md` ditambahkan sebagai referensi aman, sementara `.gitignore` tetap memblokir file credential lokal.
- **2026-04-24 — Graceful API degradation for pool exhaustion:** `withApiHandler` sekarang memetakan error Prisma `EMAXCONNSESSION` / `max clients reached` menjadi `503 Service Unavailable` dengan kode `DB_POOL_EXHAUSTED` dan header `Retry-After`, menggantikan pola unhandled 500 saat DB pool session sedang jenuh.
- **2026-05-09 — Job listings tanpa `$queryRaw`:** `SearchService.searchJobsInternal` memakai **`db.job.count` + `db.job.findMany`** dengan **`Prisma.JobWhereInput`** (`status OPEN`, **`moderationHiddenAt` null**, filter kota/kategori/mode kerja/rentang budget/tanggal/keyword (**`contains`**, case-insensitive), termasuk kolom translasi). Urutan daftar distabilkan sebagai **`createdAt` DESC** (tanpa CASE featured di SQL untuk menghindari raw query). Freelancer listing tetap memakai `$queryRaw`; raw job path dihapus menekan P2010/`$n` di bundling dev/production.
- **2026-04-24 — Search query compatibility hardening (legacy):** sebelum pemindahan ORM job, beberapa environment memprobe `information_schema` untuk kolom translasi pada raw SQL; kini skema **Prisma** menjadi sumber kolom untuk job listing.
- **Cookie preferensi bahasa:** `lang` disetel oleh `POST /api/locale` (nilai `en` \| `id`, path `/`, `SameSite=Lax`, `Secure` di produksi). Bukan secret; tetap jaga agar respons API tidak mem-cache konten sensitif lintas locale tanpa `Vary: Cookie` bila menambahkan cache edge di masa depan.
- **Google Translate untuk UGC job:** kunci API (`GOOGLE_TRANSLATE_API_KEY`) dipakai hanya di server saat create job; terjemahan disimpan ke DB untuk mencegah panggilan API per-request. Risiko biaya dibatasi oleh rate limit create job yang sudah ada; jangan pernah mengekspos key ke client bundle.
- UI telah bergeser dari “template-like” ke pendekatan **product-first** dengan hierarchy yang lebih operasional.
- Area discovery publik sekarang lebih kuat untuk pemindaian cepat dan keputusan:
  - struktur filter/list lebih jelas,
  - location/nearby cues lebih praktis,
  - empty states lebih actionable.
- Client hiring workflow menunjukkan peningkatan nyata:
  - `/client/jobs` memunculkan indikator attention (pending decision/new bids/stale open jobs),
  - job detail menyediakan compact bid comparison untuk owner,
  - next action (**Hire** pada proposal) tidak tersembunyi di layer yang dalam.
- Risiko tersisa utama: **billing provider nyata**, trust & safety lanjutan (outbound real-time alert, appeal workflow, multi-level escalation), dan **konsistensi brand/visual** lintas rilis.

### Addendum 2026-04-18

- **Produksi / edge:** baseline security headers + optional HSTS (`NEARWORK_ENABLE_HSTS`) di `apps/web/next.config.ts`; `instrumentation.ts` memvalidasi `SESSION_SECRET` saat `NODE_ENV=production`.
- **Discovery publik:** limiter khusus + fingerprint query + skor UA ringan pada `GET /api/search/*` dan `GET /api/jobs` (`public-discovery-guard.ts`); validator discovery (`MAX_PUBLIC_DISCOVERY_PAGE`, panjang string query).
- **UI publik:** landing hero marketplace (stage putih, kategori horizontal ikon, preview baris); footer marketing **kompak** berkolom (Product / Company / Legal / Support) + strip copyright.
- **Dokumentasi:** panduan sinkronisasi file `.md` di `docs/DOCUMENTATION-MAINTENANCE.md`.

---

## 1) Ringkasan eksekutif

NearWork sudah berada di fase **MVP+ operasional**:

- core marketplace aktif (jobs, bids, contracts, messages, notifications, reviews, saved items, taxonomy, search),
- auth cookie-based stabil (`acme_session`),
- internal staff workspace `/admin` sudah real (bukan scaffold lagi) dengan RBAC dan banyak halaman operasional.

Perubahan besar sejak audit sebelumnya:

- `/admin` fully integrated di `apps/web` (overview + users/jobs/bids/contracts/verification/reviews/**reports (moderasi)** /donations/subscriptions/feature-flags/settings),
- **Trust & safety MVP:** `ModerationReport`, intake `POST /api/reports`, sembunyikan job publik, suspend user,
- guard staff sudah konsisten antara middleware, server guard, dan API (`protectStaff`),
- navbar public sudah auth-aware (tidak lagi selalu menampilkan login/register saat sesi valid),
- redirect post-login dipusatkan (`resolvePostLoginRedirect`) dan staff default ke `/admin`.

Status umum:

- **Typecheck `apps/web` bersih** pada perubahan terbaru.
- Arsitektur service/policy/repository tetap rapi.
- Risiko utama tersisa: billing provider nyata, moderasi lanjutan (eskalasi, notifikasi staff, kebijakan abuse), dan hardening operasional lanjutan (branch protection, staging gate).

---

## 2) Arsitektur & konsistensi

| Area | Status |
|---|---|
| Domain layering | Konsisten: route handler → service → policy → repository/prisma |
| Session source | Satu sumber (`acme_session` cookie JWT, `jose`) |
| API canonical | `/api/*` aktif, legacy `/api/v1/*` tetap redirect/deprecation |
| Shared config | `@acme/config` dipakai lintas service (flags, plans, entitlement) |
| DTO validation | Zod validators tetap jadi kontrak input API |

Catatan:

- Ada dual-path impor `@/` dan `@src/` yang masih valid, tapi tetap perlu disiplin agar tidak membingungkan contributor baru.

---

## 3) Auth, redirect, dan otorisasi

### 3.1 Session & login redirect

- Session payload: `userId`, `role`, `accountStatus`.
- Redirect sesudah login/register sekarang dipusatkan di:
  - `homePathForSessionRole`
  - `resolvePostLoginRedirect`
- Perilaku:
  - `ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN` → fallback `/admin`
  - `CLIENT` → `/client`
  - `FREELANCER` → `/freelancer`
  - `returnUrl` valid tetap diprioritaskan.

### 3.2 Proteksi `/admin`

Sudah benar-benar staff-only:

- middleware memproteksi `/admin` dan nested routes,
- account inactive ditolak (`/forbidden`),
- non-staff diarahkan aman ke home role masing-masing,
- staff tanpa akses page-level diarahkan ke `/forbidden`.

### 3.3 Konsistensi guard

- `protectStaff()` di API sudah align dengan staff roles yang sama dengan admin access helpers.
- `requireStaffSession()` dan `requireAdminAccess()` di RSC juga align dengan middleware.

**Residual risk:** client-side fetch tanpa `credentials: "include"` tetap 401 (expected), perlu dijaga konsisten di seluruh UI baru.

---

## 4) Status internal `/admin` (yang kini sudah real)

### 4.1 Kekuatan saat ini

- UI shell internal terstruktur (sidebar grouped + topbar + role badge + account menu).
- Halaman operasional read-first sudah kaya data:
  - users, jobs, bids, contracts, reviews, donations, subscriptions, feature flags.
- **`/admin/reports`:** antrean moderasi nyata (filter, assign, catatan, resolve/dismiss) terhubung `ModerationReportService`.
- Verification queue sudah punya aksi moderasi nyata (approve/reject) ke endpoint yang ada.
- **`/admin/users`:** suspend/reactivate akun klien/freelancer untuk staff `ADMIN`/`SUPPORT_ADMIN`.
- Overview dashboard sudah memakai data real (bukan fake metrics) + panel aktivitas.

### 4.2 Gap yang masih ada

- **Moderasi lanjutan:** SLA, satu level eskalasi otomatis, dedupe, audit trail, dan notifikasi in-app sudah aktif. Belum ada outbound push/email real-time, multi-level on-call escalation, appeal workflow, atau policy engine lintas sinyal.
- Feature flags page masih read-only (sudah tepat untuk tahap sekarang).
- Mutasi admin selain verifikasi/suspend/moderasi masih terbatas (mis. bulk actions, audit log terpusat untuk setiap aksi staff) — sengaja read-first di banyak halaman.

---

## 5) Database, migrasi, dan seed

### 5.1 Prisma

- Skema domain sudah luas: users/profiles/jobs/bids/contracts/messages/notifications/reviews/subscriptions/donations/verification, dll.
- Indeks dan model terbaru sudah dipakai oleh halaman admin.

### 5.2 Seed dev & E2E

- `packages/database/prisma/seed.ts`: admin dev (`admin@nearwork.local` default), **taxonomy** (kategori/skill untuk create job), dan **akun E2E tetap** (`e2e.client@nearwork.local`, `e2e.freelancer@nearwork.local`, password `NearWorkE2eDev123!` default) — override via `SEED_ADMIN_*`, `SEED_E2E_*`.
- Root script `pnpm db:seed` sudah tersedia; wajib di DB test yang sama sebelum `pnpm test:e2e` (kategori + admin untuk assert laporan).
- Setelah E2E, `e2e-test-accounts.local.md` (gitignored) mencatat URL/thread dari run terakhir untuk cek manual browser.

**Catatan keamanan:** credential default dev tidak boleh dipakai di shared/staging/prod; jangan jalankan harness E2E terhadap `DATABASE_URL` produksi.

---

## 6) UI/UX audit (public + auth pages)

### 6.1 Public navbar

Positif:

- auth-aware (session real), role-aware actions, mobile drawer, badge notifikasi unread nyata.
- iterasi **2026-04-18:** struktur produk kiri–tengah–kanan, brand `logo_EN.png` via `BrandLogo`, nav pusat lengkap dengan hierarki tipografi + indikator aktif garis bawah brand (kurangi rasa template SaaS).

Perlu perhatian:

- iterasi cepat → tetap rawan inkonsistensi spacing/brand tone antar halaman (dashboard vs marketing).
- **Aset:** freeze satu **source-of-truth** (`/public/logo/logo_EN.png` + varian ID jika dipakai) + token tinggi logo per permukaan (navbar / auth / dashboard) agar tidak regress.

### 6.2 Auth pages (login/register)

- logo sudah dibesarkan dan dipusatkan.
- brand visibility naik, namun aset PNG membuat kontrol warna/kontras lebih bergantung ke file desain final.

Rekomendasi: freeze satu brand source-of-truth (PNG atau SVG final) + token ukuran resmi untuk navbar/auth/dashboard.

### 6.3 Loading & perceived performance

Sudah ada:

- `app/loading.tsx` global + route-level skeleton di discovery, workspace, dan admin utama,
- utilitas `nw-skeleton*` / `LoadingSkeleton` selaras token NearWork.

Residual:

- sub-route tabel admin sudah memakai loading skeleton bersama; beberapa interaksi client-only (filter, composer) masih mengandalkan pending state lokal.

---

## 7) Monetisasi & trust/safety readiness

### Monetisasi

Sudah ada:

- plan/entitlement resolution,
- subscription records & plan catalog,
- donation records,
- feature flags visibility.

Belum ada:

- payment provider real end-to-end (checkout, webhook, reconciliation),
- status transaksi finansial yang kaya (chargeback/dispute states).

### Trust/Safety

Sudah ada:

- verification workflow staff (approved/rejected),
- **`ModerationReport`** persist + **`POST /api/reports`** + antrean **`/admin/reports`** (status, assignee, catatan internal),
- sembunyikan job dari discovery publik (`moderationHiddenAt`),
- suspend/reactivate akun `CLIENT`/`FREELANCER` dari `/admin/users`,
- intake UI konsisten (`ModerationReportButton` / `ReportJobButton`) di surface publik dan Messages.

Belum ada / partial:

- outbound push/email untuk alert moderasi dan eskalasi on-call bertingkat,
- appeal workflow untuk user serta policy engine abuse lintas akun/perangkat,
- dashboard histori audit khusus (record `AuditLog` sudah ditulis untuk seluruh lifecycle laporan).

---

## 8) Kualitas build/test/ops

- `apps/web` typecheck: lulus di update terbaru.
- Lints file yang disentuh: bersih.
- **Unit:** `pnpm test:unit` (Vitest, mis. `format-money.unit.test.ts`, validators).
- **E2E HTTP:** `pnpm test:e2e` → `run-e2e-server.mjs` (build + `next start` port **3041**) → `e2e-marketplace-flow.mjs`: register/login, job, bid, accept, kontrak, messages pre-hire & kontrak, **laporan moderasi BID** + assert admin queue, auth contract. Disarankan **`DATABASE_URL_TEST`**; butuh migrasi + **`pnpm db:seed`** pada DB yang sama. Mutasi memakai CSRF (`GET /api/auth/csrf`, `X-CSRF-Token`, rotasi cookie sesi).
- **CI di repo:** GitHub Actions `.github/workflows/ci.yml` pada push/PR ke `main` — **quality** (typecheck, lint web, unit) lalu **integration** (Postgres service, migrate, seed, build `@acme/web`, E2E HTTP). Set `DATABASE_URL_TEST` di job integration; jangan arahkan workflow ke DB produksi.

Ops checklist yang tetap wajib:

1. set `SESSION_SECRET` kuat,
2. set `DATABASE_URL` benar (E2E: **`DATABASE_URL_TEST`** atau DB throwaway eksplisit),
3. jalankan migrasi deploy sebelum startup app,
4. pastikan HTTPS prod untuk cookie security behavior,
5. hindari commit file kredensial/rahasia real (`e2e-test-accounts.local.md`, `credential.md` lokal),
6. produksi: pertimbangkan `NEARWORK_HIDE_SYNTHETIC_PUBLIC_LISTINGS` / perilaku default Vercel untuk menyembunyikan data otomasi dari board publik.

---

## 9) Prioritas rekomendasi berikutnya

1. **Billing real integration** (Stripe/Midtrans/Xendit: checkout, webhook, rekonsiliasi; ganti `/checkout/mock` dan provider `MOCK` pada donation/subscription).
2. **Moderasi lanjutan tahap 2** (outbound alert, multi-level on-call escalation, appeal workflow, kebijakan abuse lintas sinyal).
3. **Branch protection** — wajibkan status check CI hijau sebelum merge ke `main`; pertimbangkan job staging deploy terpisah.
4. **Admin action layer** bertahap (mutasi aman + jejak audit untuk operasi sensitif di luar verifikasi/suspend yang sudah ada).
5. **Stabilisasi design system** (`nw-*`, brand/logo, spacing) agar iterasi UI tidak regress antar halaman marketing vs workspace.

---

## 10) Kesimpulan

Freelance-web saat ini sudah lebih dari “backend MVP”: sekarang ada **internal admin workspace yang usable**, **RBAC yang terpusat**, **redirect/auth flow yang lebih benar**, dan **UI publik yang session-aware**. Fondasi teknisnya kuat untuk lanjut ke fase operasi awal.

Utang utama bukan lagi core CRUD, intake laporan dasar, atau CI dasar di repo, melainkan **operasional produksi**: billing nyata, moderasi/SLA staff, dan standardisasi visual brand agar stabil lintas rilis.
