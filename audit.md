# Audit teknis — Freelance-web (monorepo)

**Lingkup:** `apps/web`, `packages/database`, paket workspace terkait.  
**Tanggal referensi:** April 2026 (sesuai snapshot repo saat audit).

---

## 1. Ringkasan eksekutif

Proyek ini adalah **marketplace freelance SaaS** berbasis Next.js 15 (App Router), Prisma/PostgreSQL, dan lapisan **service + policy + repository**. **Auth berbasis cookie JWT**, **job/bid/contract accept**, **profil**, **subscription**, **search**, **taxonomy (category/skill)**, **saved jobs & freelancers**, **pesan (thread + participant)**, **notifikasi**, **review terikat kontrak**, dan **halaman detail job** sudah terhubung ke Prisma/layanan. **Typecheck** `apps/web` bersih (`pnpm exec tsc --noEmit`).

Masih ada **placeholder / TODO** di beberapa area produk (mis. **VerificationService**, **checkout subscription**, transisi kontrak **COMPLETED** untuk review, UI directory freelancer). **Tidak ada lagi duplikasi handler `/api/v1`** — diganti redirect ke `/api`.

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
| **Migrasi** | Baseline **`20260412120000_init`** + migrasi lanjutan (mis. participant pesan, agregat review) — cek folder `prisma/migrations` sebelum `deploy`. |
| **Dokumentasi bootstrap** | `packages/database/README.md` — `pnpm db:generate`, `pnpm db:migrate:deploy`, `db:migrate` (dev). |
| **Contoh env** | `packages/database/env.example.txt` (bukan `.env.example` karena `.env*` di-ignore). |
| **Root scripts** | `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:studio`. |

**Catatan:** baseline dihasilkan dengan `prisma migrate diff` (bukan hanya `migrate dev` di satu mesin); tetap valid untuk `migrate deploy` pada DB kosong setelah semua file migrasi diterapkan.

---

## 5. Layanan — nyata vs stub

### Sudah berbasis DB / logika nyata (contoh)

- **AuthService** (`src/server/services`) — register/login, sesi.
- **JobService / JobRepository** — job **OPEN** + **PUBLIC** saat create/listing/detail publik; update/close; detail kategori + ringkasan klien.
- **BidService / BidRepository** — bid **SUBMITTED**, policy + kuota + unik `(jobId, freelancerId)`; **accept bid** → kontrak **PENDING** + notifikasi **BID_ACCEPTED**; notifikasi **BID_SUBMITTED** ke pemilik job.
- **SubscriptionService** — baca `UserSubscription` + plan, fallback `FREE`.
- **FreelancerProfileService / ClientProfileService** — CRUD Prisma + view types.
- **SearchService** — Prisma, filter + pagination; enum ke `@acme/types` lewat parser.
- **SavedItemsService** — `SavedJob` / `SavedFreelancer`, ownership `userId`, upsert + list + `idsOnly` untuk UI.
- **MessageService** — thread **DIRECT/JOB/CONTRACT**, participant, pesan, gate participant; notifikasi **NEW_MESSAGE** ke pihak lain.
- **NotificationService** — create/list/mark read di DB; event bid & pesan terhubung.
- **ReviewService** — review per kontrak **COMPLETED**, unik `(contractId, authorUserId, targetType)`, agregat `reviewCount` / `averageReviewRating` pada profil target.
- **CategoryService / SkillService** — list & detail dari Prisma; filter `parentSlug`, `categoryId`, `q`; respons kategori vs subkategori terdiskriminasi.

### Masih stub / TODO utama

| Service / area | Isu |
|----------------|-----|
| **VerificationService** | Mayoritas return placeholder / perlu alur staff lengkap. |
| **SubscriptionService** | `initiateSubscriptionCheckout` — `checkoutUrl: null` (billing/pembayaran belum). |
| **ContractService** | Baca kontrak ada; transisi status (mis. **COMPLETED** untuk review) & pembayaran TODO. |
| **UI publik** | Directory freelancer masih ringan; beberapa halaman settings placeholder. |

---

## 6. API routes & UI

- **Route API utama** memakai **`await protect*(request)`** — selaras cookie-session.
- **GET publik** (jobs list, search, **GET /api/reviews** dengan query profil) sesuai desain.
- **`/jobs/[jobId]`** — data nyata dari **`JobService.getJobByIdForPublic`** (budget, kategori, klien, loading/not-found).
- **Saved** — tombol simpan di browse/detail job & profil freelancer publik; daftar di **Settings** + nav **Saved**.
- **Notifikasi** — API list + PATCH read; event dari bid & pesan.

---

## 7. Build & typecheck

- **`pnpm exec tsc --noEmit`** di **`apps/web`** — **lulus** (pagination: perbaikan `ZodType<Output, _, Input>` di `route-helpers` + schema `paginationSchema.extend`).
- **`pnpm typecheck`** di root (turbo) — memvalidasi seluruh paket workspace yang dikonfigurasi.

---

## 8. Keamanan & operasional

| Checklist | |
|-----------|---|
| Set **`SESSION_SECRET`** (panjang memadai) di production. |
| Set **`DATABASE_URL`**; jalankan **`pnpm db:migrate:deploy`** sebelum app (semua migrasi). |
| Pastikan **HTTPS** di production agar flag **Secure** pada cookie sesi efektif. |
| **pnpm approve-builds** — build script Prisma/sharp mungkin perlu disetujui di CI. |
| Tinjau **matcher middleware** bila area `(app)` baru perlu wajib login di edge. |

---

## 9. Rekomendasi prioritas

1. **Kontrak** — alur menyelesaikan kontrak (**COMPLETED**) agar review konsisten dengan policy.  
2. **Pembayaran** — checkout subscription + integrasi provider.  
3. **VerificationService** — persistensi & UI staff.  
4. **Uji E2E** — register → login → cookie → job → bid → accept → pesan → notifikasi → (setelah COMPLETED) review.  
5. **SEO / konten** — halaman marketing & directory freelancer bila produk memerlukan.

---

## 10. Kesimpulan

Repo berada pada titik **MVP backend yang jauh lebih lengkap**: **taxonomy**, **saved items**, **messaging dengan participant**, **notifikasi**, **review + agregat profil**, **detail job publik**, dan **middleware app** terhubung. **Typecheck web** bersih. Utang utama bergeser ke **billing**, **verifikasi**, **transisi siklus hidup kontrak**, dan **kilasan UI** tertentu. File ini dapat diperbarui setelah setiap rilis besar.
