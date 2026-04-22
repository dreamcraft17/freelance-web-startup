# Fitur — seluruh proyek (Freelance-web)

> **Doc revision:** v26  
> Last synchronized: 2026-04-22 (homepage action-clarity pass: hire/work mode switch, quick filters, CTA hierarchy).

Dokumen ini merangkum fitur aktif dan struktur teknis terbaru di monorepo NearWork. Fokus: apa yang sudah dipakai user/staff saat ini, serta placeholder internal yang sudah disiapkan.

> Catatan: penjelasan **produk ini apa** (non-teknis) ada di `docs/apa-itu-nearwork.md`. Detail risiko, gap, dan technical debt tetap di `audit.md`.

## Update terbaru (April 2026)

- **2026-04-22 — Homepage marketplace density pass:** section kategori horizontal ditingkatkan menjadi browse lanes yang lebih scanable (icon-first chips, target klik lebih jelas); hero menambahkan trust cues + quick browse entry ke active briefs; preview listing diperkuat sebagai row-style board dengan atribut operasional (harga, lokasi, tag kerja, action links) agar halaman terasa seperti marketplace aktif, bukan landing statis.
- **2026-04-22 — Homepage activity refinement pass:** listing preview menambahkan sinyal aktivitas ringan (`New`/`Active now` + konteks update), kolom kanan dirapikan agar price/location/actions lebih mudah dibandingkan lintas baris, kategori diperkuat sebagai lane navigasi (hierarki label + hover state lebih tegas), serta hero menambahkan satu baris urgensi produk tentang listing live yang rutin diperbarui.
- **2026-04-22 — Homepage decision-confidence pass:** setiap row preview kini menampilkan alasan memilih listing (`responds fast`, `popular choice`, `top rated local`) sebagai sinyal sekunder; beberapa row diberi penekanan ringan sebagai item unggulan tanpa memecah konsistensi list; CTA per-row diprioritaskan ke satu aksi utama (job/freelancer specific) dengan aksi sekunder ber-bobot lebih rendah; harga dilengkapi konteks value agar keputusan lebih cepat.
- **2026-04-22 — Homepage layout hierarchy upgrade:** area hero dipecah dari satu kontainer datar menjadi komposisi asimetris (headline/search kiri + visual board kanan), blok pencarian dipertegas sebagai tool strip mandiri, kategori diubah ke grid entry points berbasis ikon (lebih navigational), dan baris preview ditingkatkan dengan thumbnail-style visual anchors agar rasa marketplace lebih aktif dan tidak text-heavy.
- **2026-04-22 — Marketplace activity strip:** ditambahkan strip ringkas tepat di bawah hero untuk memperkuat rasa board aktif + eksplorasi cepat: status live (`open jobs`, proposal 24 jam), trending lanes, quick filters (`nearby`/`remote`), dan shortcut ke active briefs. Strip sengaja kompak (satu glance) agar actionable tanpa menambah noise section.
- **2026-04-22 — Public homepage metrics removal:** panel `Live board snapshot` dihapus dari hero dan counter numerik di activity strip dihilangkan agar homepage tidak menampilkan statistik sistem mentah; area tersebut diganti jalur aksi user-facing (browse/filter/active briefs) supaya tiap blok langsung membantu search, browse, dan keputusan.
- **2026-04-22 — Homepage action-clarity iteration:** ditambahkan mode switch `I want to hire` / `I want to work` di bawah area search untuk mengubah prioritas aksi; search kini punya quick filters (`Nearby`, `Remote`, `Budget`) + budget selector sederhana; hierarki CTA dipadatkan menjadi satu primary action per mode dengan secondary actions yang lebih ringan.
- **2026-04-20 — Multilingual SEO (production-safe):** ditambahkan route prefix locale `app/[locale]` untuk halaman SEO (`/en/*`, `/id/*`) mencakup home, jobs (+detail), freelancers (+detail), how-it-works, pricing, early-access, help; tiap halaman pakai metadata lokal + `alternates.languages` (`en`, `id`, `x-default`) dan canonical per-locale; sitemap sekarang mempublikasikan URL dua bahasa. Locale switcher kini **route-aware** sebagai source-of-truth (aktif mengikuti prefix URL), sehingga perpindahan EN/ID langsung memuat konten SSR sesuai route target.
- **2026-04-20 — Konsistensi locale publik (`/jobs`, `/freelancers`):** string UI yang masih hardcoded Inggris dipindah ke kamus `en.json` / `id.json` (header, toolbar hasil, paginasi, panel samping, filter, list labels, empty states, nearby/location prompts). Komponen publik sekarang membaca `t()` secara konsisten agar halaman Indonesia tidak lagi bercampur bahasa.
- **2026-04-20 — Lokalisasi halaman marketing:** konten user-facing di `/how-it-works`, `/pricing`, `/early-access`, `/help` dipindah ke kamus locale agar halaman `/id/*` tidak menampilkan copy Inggris; fallback teks pada profil publik freelancer juga dilokalisasi.
- **2026-04-20 — Lokalisasi halaman tersisa publik:** `/jobs/[jobId]` kini memakai key i18n untuk seluruh teks UI utama (breadcrumb, summary, tabel proposal, CTA, hint), legal pages `/terms` dan `/privacy` dipindah ke kamus locale, serta fallback page `/forbidden`, `/forgot-password`, dan `/search/nearby` ikut diselaraskan EN/ID.
- **2026-04-20 — Terjemahan konten user-generated job (server-side):** saat create job, sistem mendeteksi bahasa source (`id`/`en`) lalu menerjemahkan silang via Google Translate API dan menyimpan cache di DB (`language`, `titleId`, `titleEn`, `descriptionId`, `descriptionEn`). Listing/detail job sekarang merender field sesuai locale aktif dengan fallback ke teks asli bila terjemahan belum tersedia; halaman detail menambahkan opsi *Show original / Show translated*.
- **2026-04-20 — Homepage depth & hierarchy pass:** hero landing diperkuat tanpa gradient/glass (headline lebih dominan, spacing lebih rapat, search block dijadikan product interaction utama dengan border/elevation halus, panel “how hiring runs” diberi struktur langkah yang lebih jelas, dan urutan CTA disetel ulang agar primary action lebih tegas daripada secondary actions).
- **2026-04-20 — Homepage SEO & copy upgrade:** metadata `title`/`description` route `/[locale]` diperjelas dengan intent keyword (hire/cari freelancer nearby + remote) dan copy landing direvisi agar lebih product-first: H1 tegas, alur hiring operasional, CTA berbasis aksi nyata, serta section categories/preview/use-cases/final strip kini konsisten EN/ID via dictionary keys.
- **2026-04-20 — Hero/search restructure:** landing top area kini memakai komposisi dua-lapis (top: headline + flow panel, bottom: search tool block) dengan bobot visual search sebagai interaksi utama; panel flow dipadatkan dan CTA diurutkan primary (`Post a job`) lalu secondary (`Browse freelancers`, `Open job board`).
- **2026-04-20 — Navbar hierarchy redesign:** navbar publik diperjelas sebagai product navigation (logo lebih dominan, center nav primary vs secondary, right rail fokus EN/ID + auth + `Start hiring`) untuk mengurangi rasa template dan memperkuat action-first UX.
- **2026-04-20 — Navbar multilingual hardening:** layout marketing navbar disetel ulang agar label Indonesia yang lebih panjang tetap rapi: center nav tidak wrapping, breakpoint desktop dinaikkan ke `lg`, spacing antar-zona dipadatkan, bobot tipografi dibedakan (primary > secondary > utility), dan utility berprioritas rendah muncul saat ruang memadai.
- **2026-04-20 — Dukungan bahasa (i18n):** kamus di `apps/web/locales/en.json` dan `id.json`; helper `t(key)` lewat `I18nProvider` (client) dan `getServerTranslator()` (server); preferensi disimpan di **cookie `lang`** (`en` \| `id`, 1 tahun, `SameSite=Lax`) + sinkron UI instan; default dari **Accept-Language** lalu fallback `en`; `<html lang>` mengikuti locale; switcher **EN \| ID** (tanpa bendera) di navbar marketing, header workspace, header discovery ringkas, halaman login/register, dan rail akun; label navigasi dashboard memakai `labelKey` / `sectionKey` pada konfigurasi nav.
- **2026-04-20 — Navbar marketing (`MarketingNavBar`) jadi product navigation:** struktur kiri–tengah–kanan (brand / primary nav / utilitas-auth); logo **`/logo/logo_EN.png`** tetap anchor terkuat; tengah difokuskan ke **Jobs + Freelancers** (dengan intent hint “Find work” / “Hire talent”), lalu secondary nav ringan (How it works, Pricing, Help) dipisah divider halus; state aktif garis bawah brand; area kanan guest berisi Browse jobs, Log in, Register + CTA **Start hiring**; sesi login menampilkan **state “Signed in”**, unread notifications + unread message threads, serta CTA kontekstual (**Client: Post a job**, **Freelancer: Find jobs**).
- **2026-04-18 — Engagement tanpa dekorasi:** agregat ringan `PublicStatsService` + komponen `MarketplacePulse` (board terbuka, proposal 24 jam, freelancer berstatus available) di landing, `/jobs`, `/freelancers`; badge notifikasi **nyata** di `MarketingNavBar` (count dari DB, tanpa dot palsu); filter discovery punya `datalist` + tautan “Popular”; microcopy **proposal / hire** di job detail, client jobs, dan how-it-works; kartu freelancer menampilkan sinyal kepercayaan dari data yang ada (availability + ulasan berulang).
- **2026-04-18 — Landing & chrome publik:** hero “marketplace stage” (split layout, headline dominan tanpa label `nw-section-title` generik—mikro-label “Live freelancer directory”); blok search besar, *popular searches*, kategori ikon horizontal; preview ilustratif + zebra; section bands; footer **kompak** (Product / Company / Legal / Support + strip bawah).
- **2026-04-18 — API discovery:** perlindungan anti-scraping ringan + pagination/query hardening (detail di `audit.md` addendum).
- Sistem UI sudah bergerak ke arah **grounded product UI** (tanpa glassmorphism/gradient dekoratif) di public + app surfaces.
- Public discovery (`/freelancers`, `/jobs`) sekarang berorientasi **scanability dan decision flow**: filter lebih operasional, density list lebih rapat, dan nearby cues lebih nyata.
- Workflow client hiring ditingkatkan:
  - `/client/jobs` jadi control center dengan attention metrics (needs attention, new bid activity, stale jobs),
  - job detail menampilkan tabel perbandingan bid untuk client owner (harga, profile strength, lokasi/mode, status, next action),
  - aksi keputusan langsung (**Hire** pada proposal) tersedia lewat API existing.
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
- asset aktif logo: `/logo/logo_EN.png`
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
