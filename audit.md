# Audit teknis — Freelance-web (monorepo)

**Lingkup:** `apps/web`, `packages/database`, paket workspace terkait.  
**Tanggal referensi:** April 2026 (sesuai snapshot repo saat audit).

---

## 1. Ringkasan eksekutif

Proyek ini adalah **marketplace freelance SaaS** berbasis Next.js 15 (App Router), Prisma/PostgreSQL, dan lapisan **service + policy + repository**. Bagian **auth berbasis cookie JWT**, **job/bid**, **profil**, **subscription**, **search**, dan **migrasi Prisma baseline** sudah relatif matang. Masih ada **layanan stub**, **celah UX/API** (halaman publik tanpa data), dan **utang typecheck** di beberapa route publik. **Tidak ada lagi duplikasi handler `/api/v1`** — diganti redirect ke `/api`.

**Kesiapan production:** memerlukan `DATABASE_URL`, `SESSION_SECRET`, migrasi `deploy`, serta peninjauan klien API (fetch dengan `credentials: 'include'` untuk cookie).

---

## 2. Arsitektur & konsistensi

| Area | Penilaian |
|------|-----------|
| **Pemisahan domain** | Service + policy + repository — konsisten untuk job/bid/quota. |
| **Path `@/` vs `@src/`** | `server/*` (root app) dan `src/*` (session, middleware, beberapa service) — impor re-export dari `server/services` ke `src/server/services` untuk auth/subscription/profile. |
| **API surface** | Satu kanonik `/api/*`; `/api/v1/*` → **308** ke `/api/*` (`[[...legacy]]`), header `X-Api-Deprecation`. |
| **Middleware** | Hanya matcher **`/client/*`** dan **`/freelancer/*`**; sesi dari cookie; tanpa `x-user-id`. Route app lain (`/messages`, `/settings`, dll.) **tidak** dilindungi middleware (hanya API `protect()` jika dipanggil). |

---

## 3. Autentikasi & otorisasi

| Item | Status |
|------|--------|
| **Sesi** | Cookie `acme_session`, JWT (jose), klaim `sub`, `role`, `accountStatus`. |
| **Middleware** | `getSessionFromRequest` — selaras dengan API. |
| **`protect()` / `resolveActorFromRequest`** | Async; aktor hanya dari cookie; **tanpa** `dev-user-id` dan **tanpa** kepercayaan ke header `x-user-id` untuk akses terautentikasi. |
| **Peran di gate** | `protectClient` / `protectFreelancer` mengizinkan **ADMIN**; `protectClientOrFreelancer` termasuk **ADMIN**; staff tetap policy terpisah. |
| **RSC / halaman** | `getSessionFromCookies`, `requireAuthenticatedSession`, policy `access.policy` untuk asersi session. |

**Risiko sisa:** klien yang memanggil API tanpa `credentials: 'include'` tidak mengirim cookie → 401 (perilaku benar, perlu dokumentasi produk).

---

## 4. Basis data & Prisma

| Item | Status |
|------|--------|
| **Skema** | `packages/database/prisma/schema.prisma` — model lengkap (User, Job, Bid, Contract, Subscription, dll.). |
| **Migrasi** | Baseline **`20260412120000_init`** + `migration_lock.toml` (PostgreSQL). |
| **Dokumentasi bootstrap** | `packages/database/README.md` — `pnpm db:generate`, `pnpm db:migrate:deploy`, `db:migrate` (dev). |
| **Contoh env** | `packages/database/env.example.txt` (bukan `.env.example` karena `.env*` di-ignore). |
| **Root scripts** | `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:studio`. |

**Catatan:** baseline dihasilkan dengan `prisma migrate diff` (bukan hanya `migrate dev` di satu mesin); tetap valid untuk `migrate deploy` pada DB kosong.

---

## 5. Layanan — nyata vs stub

### Sudah berbasis DB / logika nyata (contoh)

- **AuthService** (`src/server/services`) — register/login, sesi.
- **JobService / JobRepository** — job **OPEN** saat create, listing publik, update/close.
- **BidService / BidRepository** — bid **SUBMITTED**, policy + kuota + unik `(jobId, freelancerId)`.
- **SubscriptionService** — baca `UserSubscription` + plan, fallback `FREE`.
- **FreelancerProfileService / ClientProfileService** — CRUD Prisma + view types.
- **SearchService** — Prisma, filter kategori/kota/work mode/keyword, pagination.

### Masih stub / TODO utama

| Service | Isu |
|---------|-----|
| **MessageService** | Thread/message tidak persist penuh. |
| **NotificationService** | List kosong; mark read / create belum DB penuh. |
| **ReviewService** | Review tidak load contract / persist list. |
| **VerificationService** | Mayoritas return placeholder. |
| **CategoryService / SkillService** | `items: []` / `getBySlug`/`getById` tidak dari DB. |
| **SavedItemsService** | Save/unsave tidak persist. |
| **SubscriptionService** | `initiateSubscriptionCheckout` — `checkoutUrl: null` (billing belum). |
| **ContractService** | Baca kontrak ada; transisi/pembayaran TODO di komentar. |

---

## 6. API routes & UI

- **Route API utama** memakai **`await protect*(request)`** — selaras cookie-session.
- **GET publik** (jobs list, search) tanpa auth — sesuai desain.
- **Halaman:** `(public)/jobs`, dashboard `(app)/freelancer` & `(app)/client` sudah memuat data dari service/Prisma; **`jobs/[jobId]`** detail masih placeholder (`EmptyStateCard`) — tidak selaras dengan list jobs.

---

## 7. Build & typecheck

- **`pnpm exec tsc --noEmit`** di `apps/web` masih melaporkan error **pagination** di beberapa route (`categories`, `search/jobs`, `search/freelancers`, `skills`, `jobs` GET): tipe hasil parse query (`page`/`limit` optional) vs service yang mengharapkan `page`/`limit` wajib — perlu perapihan tipe atau default eksplisit di route (bukan bug runtime jika Zod selalu mengisi default).

---

## 8. Keamanan & operasional

| Checklist | |
|-----------|---|
| Set **`SESSION_SECRET`** (panjang memadai) di production. |
| Set **`DATABASE_URL`**; jalankan **`pnpm db:migrate:deploy`** sebelum app. |
| Pastikan **HTTPS** di production agar flag **Secure** pada cookie sesi efektif. |
| **pnpm approve-builds** — build script Prisma/sharp mungkin perlu disetujui di CI. |
| Tinjau **matcher middleware** jika semua area `(app)` harus wajib login di edge. |

---

## 9. Rekomendasi prioritas

1. Perbaiki **typecheck** route publik (pagination DTO ↔ service).  
2. Hubungkan **`/jobs/[jobId]`** ke `JobService.getJobByIdForPublic` atau API.  
3. Implementasi berurutan sesuai produk: **Category/Skill** (taxonomy) → **Saved items** → **Messages** → **Notifications** → **Reviews**.  
4. **Payment / checkout** untuk subscription.  
5. Uji E2E alur: register → login → cookie → POST job (client) → POST bid (freelancer).

---

## 10. Kesimpulan

Repo berada pada titik **MVP backend yang bisa di-bootstrap** (migrasi + dokumen), **auth API disatukan dengan cookie**, dan **domain inti job/bid** operasional. Area **komunikasi, notifikasi, taxonomy API, dan saved items** masih dominan stub; **typecheck** perlu dibersihkan sebelum CI ketat. File ini dapat diperbarui setelah setiap rilis besar.
