# Audit teknis — Freelance-web (monorepo)

**Lingkup:** `apps/web`, `packages/database`, paket workspace terkait.  
**Tanggal referensi:** April 2026 (sesuai snapshot repo saat audit).

---

## 1. Ringkasan eksekutif

Proyek ini adalah **marketplace freelance SaaS** berbasis Next.js 15 (App Router), Prisma/PostgreSQL, dan lapisan **service + policy + repository**. **Auth berbasis cookie JWT**, **job/bid/contract accept**, **profil**, **subscription**, **search**, **taxonomy (category/skill)**, **saved jobs & freelancers**, **pesan (thread + participant)**, **notifikasi**, **review terikat kontrak**, dan **halaman detail job** sudah terhubung ke Prisma/layanan. **Typecheck** `apps/web` bersih (`pnpm exec tsc --noEmit`).

**Kesiapan monetisasi (awal / tanpa paywall):** `packages/config` memuat **feature flags** + **`resolvePlanEntitlements`**; **QuotaService** membaca entitlement plan (merge opsional JSON plan) dengan mode **early access** (bypass enforcement lewat flag, tetap melaporkan pemakaian); **SubscriptionService** mengekspor ringkasan langganan + flag publik dan **`MONETIZATION_PRICING_PLACEHOLDER`** (harga/durasi placeholder, belum ditagih). **Donasi** — model **`Donation`**, **`DonationService`**, **`POST /api/donations`** (mock, `userId` opsional dari sesi). **Listing & pencarian:** job punya **`isFeatured` / `featuredUntil`**, profil freelancer **`isBoosted` / `boostedUntil`**; **SearchService** mengurutkan featured/boost aktif di atas hasil lain (SQL mentah + expiry). **JobService.listOpenJobs** memakai listing publik terurut itu dan mengekspor hook **`isFeatured` / `featuredUntil`** pada item; strip **early access** ringan di layout freelancer (kuota, teks upgrade opsional, CTA donasi).

Masih ada **placeholder / TODO** di beberapa area produk (mis. **VerificationService**, **checkout subscription** nyata, UI directory freelancer). **Penyelesaian kontrak** — `POST /api/contracts/[contractId]/complete` mengeset **COMPLETED** (gate review); idempotent **409** `ALREADY_COMPLETED`. **Tidak ada lagi duplikasi handler `/api/v1`** — diganti redirect ke `/api`.

**Kesiapan production:** memerlukan `DATABASE_URL`, `SESSION_SECRET`, migrasi `deploy` (termasuk migrasi setelah baseline: participant thread pesan, agregat review profil, dll.), serta peninjauan klien API (`credentials: 'include'` untuk cookie).

---

## 2. Arsitektur & konsistensi

| Area | Penilaian |
|------|-----------|
| **Pemisahan domain** | Service + policy + repository — konsisten untuk job/bid/quota, pesan, review, notifikasi. |
| **Path `@/` vs `@src/`** | `server/*` (root app) dan `src/*` (session, middleware, beberapa service) — impor re-export dari `server/services` ke `src/server/services` untuk auth/subscription/profile. |
| **API surface** | Satu kanonik `/api/*`; `/api/v1/*` → **308** ke `/api/*` (`[[...legacy]]`), header `X-Api-Deprecation`. |
| **Middleware** | Matcher: **`/client/*`**, **`/freelancer/*`**, **`/messages/*`**, **`/notifications/*`**, **`/settings/*`** — redirect ke `/login` + `returnUrl` jika tidak ada sesi. Publik **`/`**, **`/jobs`**, **`/freelancers`** tidak di-match. |
| **Parse query API** | `parseSearchParams` / `parseJson` memakai **`ZodType<Output, Def, Input>`** agar output schema dengan `.default()` (mis. `page`/`limit`) tidak melebar jadi bentuk input. |
| **Konfig & monetisasi** | `@acme/config`: **`plans.ts`** (tier FREE/PRO/AGENCY + entitlement), **`monetization.ts`** (flag + env `FEATURE_*`, **`shouldBypassQuotaEnforcement`**, **`resolvePlanEntitlements`**). |

---

## 3. Autentikasi & otorisasi

| Item | Status |
|------|--------|
| **Sesi** | Cookie `acme_session`, JWT (jose), klaim `sub`, `role`, `accountStatus`. |
| **Middleware** | `getSessionFromRequest` — selaras dengan API; area app terlindungi diperluas (lihat §2). |
| **`protect()` / `resolveActorFromRequest`** | Async; aktor hanya dari cookie; **tanpa** `dev-user-id` dan **tanpa** kepercayaan ke header `x-user-id` untuk akses terautentikasi. |
| **Peran di gate** | `protectClient` / `protectFreelancer` mengizinkan **ADMIN**; `protectClientOrFreelancer` termasuk **ADMIN**; staff tetap policy terpisah. |
| **RSC / halaman** | `getSessionFromCookies`, `requireAuthenticatedSession`, policy `access.policy` untuk asersi session. |

**Risiko sisa:** klien yang memanggil API tanpa `credentials: 'include'` tidak mengirim cookie → 401 (perilaku benar, perlu dokumentasi produk).

---

## 4. Basis data & Prisma

| Item | Status |
|------|--------|
| **Skema** | `packages/database/prisma/schema.prisma` — model lengkap; tambahan **`MessageThreadParticipant`**, kolom agregat review di **`ClientProfile` / `FreelancerProfile`**, dll. |
| **Migrasi** | Baseline **`20260412120000_init`** + lanjutan (participant pesan, agregat review, **`Donation`**, kolom **job featured** / **freelancer boost**) — cek folder `prisma/migrations` sebelum `deploy`. |
| **Dokumentasi bootstrap** | `packages/database/README.md` — `pnpm db:generate`, `pnpm db:migrate:deploy`, `db:migrate` (dev). |
| **Contoh env** | `packages/database/env.example.txt` (bukan `.env.example` karena `.env*` di-ignore). |
| **Root scripts** | `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:studio`. |

**Catatan:** baseline dihasilkan dengan `prisma migrate diff` (bukan hanya `migrate dev` di satu mesin); tetap valid untuk `migrate deploy` pada DB kosong setelah semua file migrasi diterapkan.

---

## 5. Layanan — nyata vs stub

### Sudah berbasis DB / logika nyata (contoh)

- **AuthService** (`src/server/services`) — register/login, sesi.
- **JobService / JobRepository** — job **OPEN** saat create; listing publik **`listOpenJobs`** memakai **SearchService.listPublicOpenJobsPaginated** (hanya **PUBLIC** + urutan featured aktif); detail publik menyertakan **`isFeatured` / `featuredUntil`**; update/close; detail kategori + ringkasan klien.
- **BidService / BidRepository** — bid **SUBMITTED**, policy + kuota + unik `(jobId, freelancerId)`; **accept bid** → kontrak **PENDING** + notifikasi **BID_ACCEPTED**; notifikasi **BID_SUBMITTED** ke pemilik job.
- **QuotaService** — entitlement efektif via **SubscriptionService**; enforcement dapat dilewati lewat **`shouldBypassQuotaEnforcement()`**; respons kuota menyertakan **`remaining`**, **`quotasUnlimited`**, snapshot entitlement.
- **SubscriptionService** — **`resolveEffectivePlanContextForUser`** (satu baca DB: `planKey` + entitlement merge JSON plan), ringkasan aktif + **`getPublicMonetizationFlags`**, harga placeholder **`MONETIZATION_PRICING_PLACEHOLDER`**.
- **FreelancerProfileService / ClientProfileService** — Prisma + view types; **GET publik** `?username=`, **`GET /api/freelancer-profiles/me`** (sesi freelancer), **`POST` buat profil**, **`PATCH /api/freelancer-profiles`** (partial: bio, headline, workMode, availability, dll.) — **wajib** untuk melengkapi **`bio`** setelah register agar **BidPolicy** (`isComplete`) mengizinkan bid; view freelancer menyertakan **`isBoosted` / `boostedUntil`** (hook UI, bukan gate).
- **SearchService** — pencarian job & freelancer dengan **`$queryRaw`** terparameter: filter + pagination + **urutan featured/boost aktif** (expiry dipertimbangkan), lalu recency; **`listPublicOpenJobsPaginated`** untuk board publik.
- **DonationService** — **`POST /api/donations`**, provider **MOCK**, amount + pesan opsional.
- **SavedItemsService** — `SavedJob` / `SavedFreelancer`, ownership `userId`, upsert + list + `idsOnly` untuk UI.
- **MessageService** — thread **DIRECT/JOB/CONTRACT**, participant, pesan, gate participant; notifikasi **NEW_MESSAGE** ke pihak lain.
- **NotificationService** — create/list/mark read di DB; event bid & pesan terhubung.
- **ReviewService** — review per kontrak **COMPLETED**, unik `(contractId, authorUserId, targetType)`, agregat `reviewCount` / `averageReviewRating` pada profil target.
- **CategoryService / SkillService** — list & detail dari Prisma; filter `parentSlug`, `categoryId`, `q`; respons kategori vs subkategori terdiskriminasi.

### Masih stub / TODO utama

| Service / area | Isu |
|----------------|-----|
| **VerificationService** | Mayoritas return placeholder / perlu alur staff lengkap. |
| **SubscriptionService** | `initiateSubscriptionCheckout` — `checkoutUrl: null` (billing/pembayaran belum). Harga/feature tier sudah di-*placeholder*; penagihan & gate fitur belum diaktifkan. |
| **Donasi** | Hanya persistensi + respons sukses; **belum** gateway (Stripe/Midtrans/Xendit). |
| **Featured / boost** | Flag & ranking ada; **belum** alur pembelian/pembaruan otomatis atau cron pembersihan expiry (bisa ditambah). |
| **ContractService** | **Selesai:** `completeContract` → **COMPLETED** + policy peserta; pembayaran escrow nyata tetap TODO. |
| **UI publik** | Directory freelancer masih ringan; beberapa halaman settings placeholder. |

---

## 6. API routes & UI

- **Route API utama** memakai **`await protect*(request)`** — selaras cookie-session.
- **GET publik** (jobs list, search, **GET /api/reviews** dengan query profil) sesuai desain; respons pencarian / list job publik dapat menyertakan **`isFeatured` / `featuredUntil`**; pencarian freelancer **`isBoosted` / `boostedUntil`** + **`isFeatured`**.
- **`POST /api/donations`** — tanpa wajib auth; sesi opsional mengisi `userId`.
- **`GET /api/quota/me`** — bentuk respons diperluas (remaining, unlimited early access, entitlement).
- **`GET /api/subscriptions`** — menyertakan `entitlements`, `launch`, `featureFlags` (baca saja).
- **`/jobs/[jobId]`** — data nyata dari **`JobService.getJobByIdForPublic`** (budget, kategori, klien, **flag featured**, loading/not-found).
- **Freelancer `(app)`** — banner early access (kuota, label upgrade opsional, CTA donasi) di **`DashboardShell.topBanner`**.
- **Saved** — tombol simpan di browse/detail job & profil freelancer publik; daftar di **Settings** + nav **Saved**.
- **Notifikasi** — API list + PATCH read; event dari bid & pesan.
- **Freelancer profil** — **`PATCH /api/freelancer-profiles`**, **`GET /api/freelancer-profiles/me`** (lihat §5).

---

## 7. Build, typecheck & E2E

- **`pnpm exec tsc --noEmit`** di **`apps/web`** — **lulus** (pagination: perbaikan `ZodType<Output, _, Input>` di `route-helpers` + schema `paginationSchema.extend`).
- **`pnpm typecheck`** di root (turbo) — memvalidasi seluruh paket workspace yang dikonfigurasi.
- **Uji HTTP alur marketplace** — **`pnpm test:e2e`** menjalankan **`scripts/e2e-marketplace-flow.mjs`** (`node:test` + `fetch`). **Syarat:** server Next aktif (mis. `pnpm --filter @acme/web dev`), **`DATABASE_URL`**, **`SESSION_SECRET`** (≥16), migrasi DB. Opsional **`BASE_URL`**. Tanpa server yang merespons, tes gagal dengan **`fetch failed`**.

---

## 8. Keamanan & operasional

| Checklist | |
|-----------|---|
| Set **`SESSION_SECRET`** (panjang memadai) di production. |
| Set **`DATABASE_URL`**; jalankan **`pnpm db:migrate:deploy`** sebelum app (semua migrasi). Opsional: set env **`FEATURE_*`** (lihat `packages/config/src/monetization.ts`) untuk uji coba bypass kuota / flag produk. |
| Pastikan **HTTPS** di production agar flag **Secure** pada cookie sesi efektif. |
| **pnpm approve-builds** — build script Prisma/sharp mungkin perlu disetujui di CI. |
| Tinjau **matcher middleware** bila area `(app)` baru perlu wajib login di edge. |

---

## 9. Rekomendasi prioritas

1. ~~**Kontrak** — alur **COMPLETED**~~ — **Sudah:** `POST …/complete` + gate review; lanjutkan **pembayaran / escrow** bila produk memerlukan.  
2. **Pembayaran** — checkout subscription + integrasi provider; donasi (PSP) + penjualan featured/boost bila produk memerlukan.  
3. **VerificationService** — persistensi & UI staff.  
4. **Uji E2E** — **Skrip ada:** `scripts/e2e-marketplace-flow.mjs` + `pnpm test:e2e`; pertimbangkan **CI** (services DB + `next start` + env) agar lari otomatis.  
5. **SEO / konten** — halaman marketing & directory freelancer bila produk memerlukan.  
6. **Monetisasi lanjutan** — cron / webhook untuk **`featuredUntil` / `boostedUntil`**; selaraskan **`GET /api/search/jobs`** dengan filter **PUBLIC** bila ingin identik dengan board publik.

---

## 10. Kesimpulan

Repo berada pada titik **MVP backend yang jauh lebih lengkap**: **taxonomy**, **saved items**, **messaging dengan participant**, **notifikasi**, **review + agregat profil**, **detail job publik**, **penyelesaian kontrak (COMPLETED)**, **update profil freelancer (PATCH) + profil “me”**, **persiapan monetisasi (flag, entitlement, kuota, donasi, ranking featured/boost)**, **skrip uji E2E HTTP**, dan **middleware app** terhubung. **Typecheck web** bersih. Utang utama bergeser ke **billing nyata**, **verifikasi**, **otomasi expiry promosi**, dan **kilasan UI** tertentu. Ringkasan fitur **seluruh monorepo** (apps + packages + skrip): **`features.md`**. File ini dapat diperbarui setelah setiap rilis besar.
