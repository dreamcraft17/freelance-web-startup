# Fitur — seluruh proyek (Freelance-web)

Dokumen ini merangkum **semua fitur dan aset** di monorepo: aplikasi (`apps/*`), pustaka bersama (`packages/*`), skrip root, dan pola arsitektur. Untuk risiko, utang teknis, dan checklist operasional, lihat **`audit.md`**.

**Ringkasan produk:** platform **marketplace freelance SaaS** (klien posting pekerjaan, freelancer bid, kontrak, pesan, notifikasi, review terikat kontrak, taxonomy, pencarian geo-aware, kuota/langganan placeholder, donasi mock, promosi featured/boost dengan pembersihan expiry).

---

## 1. Struktur repositori & tooling

| Bagian | Peran |
|--------|--------|
| **Turborepo** (`turbo.json`) | Orkestrasi `build`, `dev`, `lint`, `typecheck`, `clean` antar-paket. |
| **pnpm workspaces** | Dependensi ter-link (`workspace:*`). |
| **Root `package.json`** | `build`, `dev`, `lint`, `typecheck`, `db:*`, **`test:e2e`**. |
| **`tsconfig.base.json`** | Basis TypeScript bersama. |
| **`scripts/e2e-marketplace-flow.mjs`** | Uji HTTP alur marketplace (register → review); jalankan dengan server Next + DB + `SESSION_SECRET`. |

---

## 2. `apps/web` — aplikasi marketplace (Next.js 15, App Router)

Lapisan backend di dalam app: **route handlers** → **service** → **policy** → **repository** → **Prisma** (`@acme/database`). Auth **hanya dari cookie** `acme_session` (JWT via `jose`).

### 2.1 Middleware & keamanan edge

- **Matcher:** `/client/*`, `/freelancer/*`, `/messages/*`, `/notifications/*`, `/settings/*` — redirect ke `/login` + `returnUrl` jika tidak ada sesi.
- **Area publik** (contoh `/`, `/jobs`, `/freelancers`, marketing) tidak wajib sesi di edge.

### 2.2 Halaman & UI (routing)

| Area | Rute / isi |
|------|------------|
| **Marketing** | `/` — landing; **`/pricing`**, **`/how-it-works`**. |
| **Auth** | **`/login`**, **`/register`**, **`/forgot-password`**. |
| **Publik** | **`/jobs`** — board; **`/jobs/[jobId]`** — detail job; **`/freelancers`** — direktori; **`/freelancers/[username]`** — profil publik; **`/search/nearby`**. |
| **Checkout mock** | **`/checkout/mock`** — halaman debug `paymentIntentId` (placeholder PSP). |
| **App klien** | **`/client`**, **`/client/jobs`**, **`/client/jobs/new`**, **`/client/nearby`**. |
| **App freelancer** | **`/freelancer`**, **`/freelancer/proposals`**, **`/freelancer/nearby`**, **`/freelancer/profile`** (placeholder editor). |
| **Bersama (login)** | **`/messages`**, **`/notifications`**, **`/settings`** (saved items, dll.). |
| **Forbidden** | **`/forbidden`**. |

*(Beberapa halaman masih placeholder/CTA ke API — lihat `audit.md`.)*

### 2.3 API kanonik — referensi cepat

Semua di bawah prefix **`/api`**. Respons sukses umumnya `{ "success": true, "data": … }`.

| Metode | Path | Ringkas |
|--------|------|---------|
| POST | `/api/auth/register` | Daftar CLIENT \| FREELANCER + Set-Cookie sesi. |
| POST | `/api/auth/login` | Login + Set-Cookie. |
| POST | `/api/auth/logout` | Hapus cookie sesi. |
| GET | `/api/auth/session` | Payload sesi saat ini (401 tanpa cookie). |
| GET / POST | `/api/client-profiles` | Baca / buat profil klien (sesuai gate). |
| GET | `/api/freelancer-profiles?username=` | Profil publil freelancer. |
| GET | `/api/freelancer-profiles/me` | Profil freelancer sesi saat ini (`id`, `username`, …). |
| POST | `/api/freelancer-profiles` | Buat profil freelancer (onboarding). |
| PATCH | `/api/freelancer-profiles` | Update partial (bio, headline, workMode, availability, …). |
| GET / POST | `/api/jobs` | Daftar job publik (pagination/filter) \| buat job **OPEN** (klien). |
| GET / PATCH | `/api/jobs/[jobId]` | Detail publik \| update job (klien pemilik). |
| POST | `/api/bids` | Kirim bid (freelancer; kuota + profil lengkap). |
| POST | `/api/bids/[bidId]/accept` | Terima bid → kontrak **PENDING** (klien). |
| GET | `/api/contracts/[contractId]` | Detail kontrak (peserta / staff sesuai policy). |
| POST | `/api/contracts/[contractId]/complete` | Tandai **COMPLETED** (klien/freelancer). |
| GET / POST | `/api/messages` | Daftar thread \| buat thread DIRECT / JOB / CONTRACT. |
| GET / POST | `/api/messages/[threadId]` | Daftar pesan \| kirim pesan (+ notifikasi). |
| GET | `/api/notifications` | Daftar notifikasi user. |
| PATCH | `/api/notifications/[notificationId]` | `{ "read": true }`. |
| GET / POST | `/api/reviews` | Daftar publik per `freelancerProfileId` **atau** `clientProfileId` \| buat review (pasca **COMPLETED**). |
| GET / POST / DELETE | `/api/saved-items/jobs` | Daftar (opsi `idsOnly=1`) \| simpan \| hapus simpan. |
| GET / POST / DELETE | `/api/saved-items/freelancers` | Idem untuk profil freelancer. |
| GET | `/api/search/jobs` | Pencarian job (parameter di validators). |
| GET | `/api/search/freelancers` | Pencarian freelancer. |
| GET | `/api/categories` | Daftar kategori atau subkategori (`parentSlug`). |
| GET | `/api/categories/[slug]` | Detail kategori (+ subkategori bila ada). |
| GET | `/api/skills` | Daftar skill (filter opsional). |
| GET | `/api/skills/[skillId]` | Detail skill. |
| GET | `/api/quota/me` | Kuota pemakaian freelancer (entitlement plan). |
| GET / POST | `/api/subscriptions` | Ringkasan langganan \| inisiasi checkout (placeholder URL). |
| POST | `/api/donations` | Donasi mock (sesi opsional). |
| GET / POST | `/api/verification` | Daftar / ajukan permintaan verifikasi (freelancer). |
| GET / PATCH | `/api/verification/[requestId]` | Detail untuk aktor \| **staff** review APPROVED/REJECTED. |
| GET | `/**/api/v1/**` | **308** redirect ke `/api/*` (deprecation header). |

**Layanan internal (tanpa route khusus di daftar di atas)** — tetap bagian fitur domain di kode: mis. **`PaymentService`** (intent mock, alur featured job / boost freelancer), **`JobService.purchaseFeaturedJob`**, **`FreelancerProfileService.purchaseProfileBoost`**, **`SearchService`** (urutan featured/boost aktif), **`QuotaService`**, **`SubscriptionService`**, **`DonationService`**, dll.

### 2.4 Domain & perilaku utama (web)

- **Job:** status **OPEN** saat dibuat; listing publik + featured aktif; update/close oleh pemilik.
- **Bid:** status **SUBMITTED**; unik per `(jobId, freelancer)`; notifikasi **BID_SUBMITTED** ke klien; setelah accept **ACCEPTED** + kontrak.
- **Kontrak:** **PENDING** → **COMPLETED** via API; review hanya setelah **COMPLETED**; aturan peran untuk target review (klien → freelancer, sebaliknya).
- **Pesan:** thread bertipe **DIRECT**, **JOB** (job masih OPEN), **CONTRACT**; partisipan eksplisit; **NEW_MESSAGE** ke pihak lain.
- **Review:** agregat **`reviewCount`** / **`averageReviewRating`** di **ClientProfile** & **FreelancerProfile**.
- **Verifikasi:** permintaan dari freelancer; keputusan staff via PATCH (gate `protectStaff`).

---

## 3. `apps/admin` — konsol admin (kerangka)

- **Next.js** minimal: halaman beranda placeholder (**moderation, verification, billing, analytics** — teks orientasi).
- Belum modul CRUD nyata; diposisikan untuk tim internal.

---

## 4. `apps/worker` — pekerja latar belakang

- Proses Node (`tsx` dev / `node dist` produksi).
- **`promotionSweep`:** interval (default 6 jam, override `PROMOTION_SWEEP_INTERVAL_MS`) memanggil **`clearExpiredPromotionFlags`** — menurunkan flag **`isFeatured`** / **`isBoosted`** setelah **`featuredUntil`** / **`boostedUntil`** lewat, selaras dengan ranking di pencarian.

---

## 5. `packages/database` — data & migrasi

- **Prisma** + **`schema.prisma`**: user & peran, profil klien/freelancer, job, bid, kontrak, thread pesan & partisipan & pesan, notifikasi, review, langganan/plan, kuota, donasi, kategori/subkategori/skill, saved jobs/freelancers, verifikasi, payment intents (sesuai migrasi terbaru), kolom promosi & agregat review, dll.
- **Skrip:** `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:studio` (via filter `@acme/database`).
- **`README.md` / `env.example.txt`** — bootstrap DB.

---

## 6. `packages/config` — konfigurasi produk & monetisasi

- **`plans.ts`:** tier (mis. FREE / PRO / AGENCY), entitlement JSON.
- **`monetization.ts`:** feature flags env (`FEATURE_*`), **`shouldBypassQuotaEnforcement`**, **`resolvePlanEntitlements`**, placeholder harga/durasi.
- Diekspor melalui **`@acme/config`** untuk web & layanan terkait.

---

## 7. `packages/validators` — kontrak request API

- Skema **Zod** untuk body/query (register, login, job, bid, review, pesan, notifikasi, verifikasi, subscription, pagination, dll.).
- Dipakai handler `parseJson` / `parseSearchParams` agar input API konsisten.

---

## 8. `packages/types` — tipe & enum bersama

- Enum domain: peran user, status job/bid/kontrak, tipe notifikasi, mode kerja, status ketersediaan freelancer, jenis verifikasi, dll.
- Dipakai Prisma, policy, dan validators (di mana relevan).

---

## 9. `packages/utils` — utilitas agnostik framework

- Pagination (`clampPage`, `clampLimit`, `offsetFromPage`), tanggal, JSON aman, helper error — dipakai service & validators.

---

## 10. Pengujian & otomasi

- **`pnpm test:e2e`** — menjalankan **`scripts/e2e-marketplace-flow.mjs`**: alur register (klien + freelancer), login/sesi, PATCH bio, job, bid, notifikasi, accept, pesan kontrak, complete kontrak, review silang, agregat, penolakan duplikat.
- **Syarat:** `DATABASE_URL`, `SESSION_SECRET` (≥16), migrasi DB, server **`pnpm --filter @acme/web dev`** (atau `start`). **`BASE_URL`** default **`http://127.0.0.1:3000`** — samakan dengan host di banner Next; override jika perlu (mis. `http://localhost:3000` hanya jika tidak memicu loop redirect).

---

## 11. Ringkasan dependensi antar-bagian

```mermaid
flowchart LR
  subgraph apps [Apps]
    web[apps/web]
    admin[apps/admin]
    worker[apps/worker]
  end
  subgraph pkgs [Packages]
    db[@acme/database]
    cfg[@acme/config]
    val[@acme/validators]
    typ[@acme/types]
    utl[@acme/utils]
  end
  web --> db
  web --> cfg
  web --> val
  web --> typ
  web --> utl
  worker --> db
  worker --> typ
  worker --> utl
  val --> typ
  cfg --> typ
  admin --> db
```

---

*Terakhir diselaraskan dengan struktur repo saat penulisan; bila menambah app/route baru, perbarui bagian API dan UI di atas.*
