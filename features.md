# Fitur — seluruh proyek (Freelance-web)

> **Doc revision:** v1  
> Last synchronized: 2026-04-18 (post-accept handoff update applied across product and docs).

Dokumen ini merangkum fitur aktif dan struktur teknis terbaru di monorepo NearWork. Fokus: apa yang sudah dipakai user/staff saat ini, serta placeholder internal yang sudah disiapkan.

> Catatan: detail risiko, gap, dan technical debt tetap di `audit.md`.

## Update terbaru (April 2026)

- **2026-04-18 — Landing & chrome publik:** hero “marketplace stage” (split layout, blok search besar, *popular searches*, kategori ikon horizontal); preview hasil ilustratif dengan avatar inisial + zebra ringan; section bands (`nw-hero-stage`, `nw-section-mist`, `nw-section-slab`); footer marketing **kompak** (kolom Product / Company / Legal / Support + strip bawah).
- **2026-04-18 — API discovery:** perlindungan anti-scraping ringan + pagination/query hardening (detail di `audit.md` addendum).
- Sistem UI sudah bergerak ke arah **grounded product UI** (tanpa glassmorphism/gradient dekoratif) di public + app surfaces.
- Public discovery (`/freelancers`, `/jobs`) sekarang berorientasi **scanability dan decision flow**: filter lebih operasional, density list lebih rapat, dan nearby cues lebih nyata.
- Workflow client hiring ditingkatkan:
  - `/client/jobs` jadi control center dengan attention metrics (needs attention, new bid activity, stale jobs),
  - job detail menampilkan tabel perbandingan bid untuk client owner (harga, profile strength, lokasi/mode, status, next action),
  - aksi keputusan langsung (`Accept bid`) tersedia lewat API existing.
- Workflow freelancer earning diperjelas:
  - `/freelancers` punya rail terarah untuk profile/job/proposals,
  - proposal workspace lebih padat dan lebih fokus pada prioritas status.

---

## 1) Ringkasan produk

NearWork adalah marketplace freelance SaaS dengan area publik + workspace per role:

- Publik: discovery jobs/freelancers, marketing pages, auth.
- User app: workspace `CLIENT`, `FREELANCER`, shared tools (`messages`, `notifications`, `settings`).
- Internal app: workspace `/admin` untuk staff (`ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`) dengan RBAC per halaman.
- Auth berbasis cookie session tunggal (`acme_session`), tanpa auth system duplikat.

---

## 2) Struktur repo & tooling

| Bagian | Peran |
|---|---|
| `turbo.json` | Orkestrasi `build`, `dev`, `lint`, `typecheck`, `clean` |
| `pnpm-workspace.yaml` | Workspace linking (`workspace:*`) |
| Root `package.json` | script lint/build/typecheck + `db:*` + `test:e2e` |
| `scripts/e2e-marketplace-flow.mjs` | Uji end-to-end alur utama marketplace via HTTP |
| `tsconfig.base.json` | konfigurasi TS dasar lintas package |

---

## 3) `apps/web` (Next.js App Router) — fitur utama

Arsitektur backend in-app:

- Route handlers (`app/api/*`)
- Services (`server/services/*`)
- Policies (`server/policies/*`)
- Guard auth/role (`src/server/http/protect.ts`)
- Prisma via `@acme/database`

Session source tunggal:

- Cookie JWT `acme_session`
- helper: `src/lib/session.ts`, `src/lib/auth.ts`

### 3.1 Middleware & keamanan route

Middleware aktif untuk:

- `/login/*`, `/register/*`, `/forgot-password/*`
- `/admin`, `/admin/*`
- `/client/*`, `/freelancer/*`, `/messages/*`, `/notifications/*`, `/settings/*`

Perilaku penting:

- Unauthenticated ke protected route → `/login` dengan `returnUrl` aman.
- Auth pages (`/login`, `/register`) jika sudah login → redirect ke target aman berbasis role (`resolvePostLoginRedirect`).
- `/admin`:
  - wajib session aktif
  - non-staff diarahkan ke home role mereka (bukan masuk admin)
  - staff tanpa izin halaman diarahkan ke `/forbidden`

### 3.2 Public & auth UI

Rute publik utama:

- `/` landing (marketing shell)
- `/jobs`, `/jobs/[jobId]`
- `/freelancers`, `/freelancers/[username]`
- `/search/nearby`
- `/pricing`, `/how-it-works`, `/help`, `/early-access`
- `/login`, `/register`, `/forgot-password`

Navbar publik:

- Auth-aware (session real dari cookie, server-side)
- Logout state: `Log in`, `Register`, CTA `Early access`
- Login state role-aware:
  - freelancer → dashboard `/freelancer` (+ messages)
  - client → dashboard `/client` (+ post job)
  - staff/admin → `/admin`
- Includes `AuthUserMenu`, notifications/messages icon, mobile hamburger behavior

Branding:

- `BrandLogo` dipakai lintas app
- asset aktif logo: `/logo/logo3.png`
- metadata icon/favicons app mengarah ke logo terbaru

### 3.3 Internal admin workspace (`/admin`)

#### Staff roles didukung

- `ADMIN`
- `SUPPORT_ADMIN`
- `MODERATOR`
- `FINANCE_ADMIN`

#### RBAC terpusat

File kunci:

- `features/admin/lib/access.ts`
- `features/admin/lib/server-auth.ts`

Helper utama:

- `isStaffRole(...)`
- `parseAdminPathname(...)`
- `canAccessAdminPage(...)`
- `canAccessAdminPageKey(...)`
- `requireStaffSession()`
- `requireAdminAccess(page)`

Matriks akses:

- `ADMIN`: full `/admin/*`
- `SUPPORT_ADMIN`: overview, users, jobs, bids, contracts, verification, reviews, settings
- `MODERATOR`: overview, jobs, verification, reviews, reports
- `FINANCE_ADMIN`: overview, donations, subscriptions, feature-flags, settings

#### Halaman admin yang tersedia

- `/admin` (overview dashboard operasional)
- `/admin/users`
- `/admin/jobs`
- `/admin/bids`
- `/admin/contracts`
- `/admin/verification` (termasuk aksi approve/reject untuk pending requests)
- `/admin/reviews`
- `/admin/reports` (placeholder trust/safety siap integrasi)
- `/admin/donations`
- `/admin/subscriptions`
- `/admin/feature-flags` (read-only resolved flags)
- `/admin/settings`

#### Catatan UI admin

- Shell internal terpisah dari landing
- Sidebar grup: Core / Operations / Finance / Platform
- Topbar role badge + account menu
- Reusable admin table/filter/empty-state components

### 3.4 API ringkas (kanonik `/api/*`)

Auth/session:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Marketplace core:

- jobs (`/api/jobs`, `/api/jobs/[jobId]`)
- bids (`/api/bids`, `/api/bids/[bidId]/accept`)
- contracts (`/api/contracts/[contractId]`, `/complete`)
- messages (`/api/messages`, `/api/messages/[threadId]`)
- notifications (`/api/notifications`, `/api/notifications/[notificationId]`)
- reviews (`/api/reviews`)
- saved items jobs/freelancers
- taxonomy/search (`/api/categories`, `/api/skills`, `/api/search/*`)

Monetization & trust:

- `GET /api/quota/me`
- `GET/POST /api/subscriptions`
- `POST /api/donations`
- `GET/POST /api/verification`
- `GET/PATCH /api/verification/[requestId]` (staff review approve/reject)

Compat:

- `/api/v1/*` → redirect/deprecation ke `/api/*`

---

## 4) `apps/admin` (terpisah) & `apps/worker`

### 4.1 `apps/admin`

- Masih skeleton/placeholder terpisah dari `apps/web`
- Internal UI real yang aktif saat ini ada di `/admin` dalam `apps/web`

### 4.2 `apps/worker`

- Worker background Node
- job utama: promotion sweep untuk menonaktifkan `featured/boost` yang expired

---

## 5) Package bersama

### 5.1 `packages/database`

- Prisma schema domain lengkap: users, profiles, jobs, bids, contracts, reviews, notifications, messages, subscriptions, donations, verification, search taxonomy, dsb.
- Script:
  - `db:generate`
  - `db:migrate`
  - `db:migrate:deploy`
  - `db:studio`
  - `db:seed`

Seed admin dev:

- Seed script: `packages/database/prisma/seed.ts`
- default (dev): `admin@nearwork.local` / `NearWorkAdminDev123!`
- override via env: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

### 5.2 `packages/config`

- Monetization plans + entitlements
- Feature flags env `FEATURE_*`
- `shouldBypassQuotaEnforcement`
- `getPublicMonetizationFlags`, `resolvePlanEntitlements`

### 5.3 `packages/validators`

- Zod schemas untuk request body/query seluruh API

### 5.4 `packages/types`

- Enum domain shared (`UserRole`, `JobStatus`, `BidStatus`, `ContractStatus`, `SubscriptionStatus`, dll.)

### 5.5 `packages/utils`

- Util umum (pagination, date helpers, safe JSON, dsb.)

---

## 6) Pengujian & operasional

- `pnpm typecheck`, `pnpm lint`, `pnpm build`
- E2E flow: `pnpm test:e2e`
- Kebutuhan env penting:
  - `DATABASE_URL`
  - `SESSION_SECRET` (min 16 chars)

---

## 7) Dependensi tinggi (ringkas)

```mermaid
flowchart LR
  subgraph Apps
    web[apps/web]
    admin[apps/admin]
    worker[apps/worker]
  end
  subgraph Packages
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

*Dokumen ini sudah diselaraskan dengan implementasi terbaru (admin workspace, RBAC, auth-aware navbar, seed admin, feature flags page). Jika ada route/fitur baru, update bagian routing + API + admin workspace di dokumen ini.*
