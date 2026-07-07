# NearWork — Ringkasan Proyek

> **Doc revision:** v2  
> Last synchronized: 2026-07-07 (NearWork V2 foundation implemented)

Dokumen ini merangkum **produk apa ini**, **fitur-fiturnya**, **tech stack**, dan **fase pengembangan** saat ini. Untuk detail teknis lebih dalam, lihat `README.md`, `features.md`, dan `audit.md`.

**NearWork V2 specs:** `docs/NEARWORK_V2_PRD.md`, `docs/NEARWORK_V2_SRS.md`, `docs/NEARWORK_V2_SDD.md`

---

## Apa itu NearWork?

**NearWork** adalah **marketplace freelance untuk merekrut** — klien memasang lowongan (job), freelancer mengirim proposal, dan percakapan tetap terikat pada lowongan yang sama. Platform mendukung kerja **remote**, **on-site**, dan **hybrid**.

Repositori ini (nama kerja: **Freelance-web**, package: `freelance-marketplace-saas`) adalah monorepo yang menjalankan seluruh produk NearWork: UI, API, database, dan autentikasi.

NearWork menggabungkan konsep:

- **Upwork / Freelancer** — sistem bidding & proposal
- **Fastwork** — layanan berbasis jasa
- **Marketplace lokal** — discovery berbasis lokasi (hyperlocal)

Platform dirancang untuk **semua jenis freelance**, bukan hanya IT:

| Kategori | Contoh |
|----------|--------|
| Digital | Desain, konten, pemasaran, development |
| Kreatif | Foto, video, editing |
| Profesional | Konsultasi, les, coaching |
| Hyperlocal | Event, perbaikan, beauty, handyman |

---

## Untuk Siapa?

| Peran | Fungsi di NearWork |
|-------|-------------------|
| **Client** | Posting job, review proposal, hire freelancer, kelola kontrak & pesan |
| **Freelancer** | Bangun profil publik, cari job, kirim proposal, negosiasi & kerja |
| **Staff** | Verifikasi, moderasi, operasional admin via workspace `/admin` |

Antarmuka tersedia dalam **Bahasa Indonesia** dan **English** (preferensi disimpan via cookie).

---

## Fitur Utama

### Marketplace Core

- **Job lifecycle** — buat, list, detail, discovery publik
- **Proposal / bidding** — submit bid, quota enforcement, shortlist, accept, buat kontrak
- **Kontrak** — lifecycle dasar (`ACTIVE`, `IN_PROGRESS`, selesai)
- **Profil** — profil client & freelancer, profil publik freelancer
- **Pesan** — thread-based, terikat job
- **Notifikasi** — in-app, terlokalisasi EN/ID, filter kategori
- **Ulasan** — review di profil publik, antrean admin
- **Saved items** — simpan job & freelancer favorit
- **Search & discovery** — keyword, kategori, kota, work mode, pagination

### Hyperlocal Discovery

- Pencarian berbasis koordinat (lat/lng + radius)
- Filter: kota, kategori, mode kerja (`REMOTE` / `ONSITE` / `HYBRID`)
- Service radius untuk freelancer lokal
- Halaman `/search/nearby`

### Subscription & Quota

| Plan | Active bids | Active contracts |
|------|-------------|------------------|
| **FREE** | 5 | 2 |
| **PRO** | 30 | 10 |
| **AGENCY** | Kuota lebih tinggi, multi-seat (future-ready) |

Logika quota sudah di-enforce; **pembayaran eksternal (Stripe/Midtrans) belum production-ready**.

### Auth & Keamanan

- Sesi cookie JWT (`acme_session`, HS256 via `jose`)
- CSRF double-submit pada mutasi
- Rate limiting pada auth, discovery, dan aksi sensitif
- RBAC: `CLIENT`, `FREELANCER`, `ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`
- Middleware proteksi untuk route workspace & admin

### Trust & Safety / Admin

- **Laporan moderasi** — intake `POST /api/reports`, dedupe, SLA berbasis kategori
- **Antrean admin** — `/admin/reports` (assign, catatan, resolve/dismiss)
- **Aksi staff** — suspend/reactivate user, sembunyikan job dari discovery
- **Verifikasi** — workflow approve/reject freelancer
- **Audit trail** — `AuditLog` untuk lifecycle moderasi
- **Worker escalation** — eskalasi tiket overdue otomatis

**Halaman admin:** `/admin`, `/admin/users`, `/admin/jobs`, `/admin/bids`, `/admin/contracts`, `/admin/verification`, `/admin/reviews`, `/admin/reports`, `/admin/donations`, `/admin/subscriptions`, `/admin/feature-flags`, `/admin/settings`

### Halaman Publik

- Landing `/[locale]` — hero hire/work, search, marketing sections
- `/jobs`, `/jobs/[jobId]` — job board decision-first
- `/freelancers`, `/freelancers/[username]` — direktori & profil hiring-oriented
- `/pricing`, `/how-it-works`, `/help`, `/early-access`
- Auth: `/login`, `/register`, `/forgot-password`

### i18n & UGC Translation

- Kamus JSON: `apps/web/locales/en.json`, `apps/web/locales/id.json`
- Route SEO: `/en/*`, `/id/*`
- Workspace locale-prefixed: `/<lang>/client`, `/<lang>/messages`, dll.
- Terjemahan UGC job (server-side via Google Translate API, disimpan ke DB)

### Testing & CI

- **Unit tests** — Vitest (`pnpm test:unit`)
- **E2E smoke** — register → job → bid → messages → report (`pnpm test:e2e`)
- **CI** — GitHub Actions: typecheck, lint, unit, Postgres integration + E2E

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Monorepo** | pnpm 9, Turborepo 2, Node 20.x |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| **Backend** | Next.js Route Handlers (`app/api/*`) |
| **Arsitektur** | Service → Policy → Repository (Prisma) |
| **Database** | PostgreSQL 14+, Prisma ORM |
| **Validasi** | Zod (`@acme/validators`) |
| **Auth** | JWT via `jose`, bcryptjs |
| **Testing** | Vitest (unit), Node test runner (E2E HTTP) |
| **Deploy** | Vercel (monorepo, root `apps/web`) |

### Struktur Monorepo

```
apps/
  web/      # Aplikasi utama (UI + API + /admin)
  admin/    # Scaffold terpisah (admin nyata ada di apps/web)
  worker/   # Background jobs (escalation, expiry sweep, dll.)

packages/
  database/   # Prisma schema + migrations
  config/     # Plans, entitlements, feature flags
  types/      # Shared enums
  validators/ # Zod schemas
  utils/      # Shared utilities
```

### Model Domain Utama (Prisma)

`User`, `FreelancerProfile`, `ClientProfile`, `Category`, `Skill`, `Job`, `Bid`, `Contract`, `SubscriptionPlan`, `UserSubscription`, `PaymentIntent`, `Donation`, `Review`, `PortfolioItem`, `VerificationRequest`, `SavedJob`, `SavedFreelancer`, `MessageThread`, `Message`, `Notification`, `AuditLog`, `ModerationReport`, `ModerationReportNote`

---

## Fase Pengembangan

### Status Saat Ini: **V2 Foundation / Pre-production PSP**

NearWork V2 foundation sudah diimplementasikan di codebase (Juli 2026):

- ✅ Schema & migration V2 (escrow, boosts, recommendations, appeals, wallet/payout)
- ✅ Stripe + Midtrans payment APIs (MOCK fallback tanpa env key)
- ✅ Escrow lifecycle (submit work, review, auto-release worker)
- ✅ AI matching MVP (daily batch + dashboard widget)
- ✅ Boost catalog & activation
- ✅ Suspension appeals (user submit + admin queue)
- ✅ Admin analytics overview
- 🔄 Production PSP keys, invoice PDF, real bank payout API — env-dependent
- 🔄 WebSocket messaging — deferred (polling tetap dipakai)

Timeline target GA: **Q1 2027** (lihat V2 PRD).

### Roadmap per Phase

| Phase | Fokus | Status |
|-------|-------|--------|
| **Phase 1 — Core Stabilization** | Typecheck, job detail, middleware coverage | ✅ Largely done |
| **Phase 2 — User Experience** | Messaging, notifications, saved items, reviews | ✅ Mostly implemented |
| **Phase 3 — SaaS Features** | Subscription billing, boosted listings, analytics | 🔄 In progress / backlog |
| **Phase 4 — Advanced** | AI matching, realtime messaging, escrow/payments, admin moderation | ⚡ Partially started |

### Sudah Selesai

- Auth, CSRF, rate limits
- Job creation, listing, public discovery
- Bid submission + quota enforcement
- Profil, search, messaging, notifications, reviews, saved items
- Verifikasi freelancer
- Admin workspace dengan RBAC
- Trust & safety MVP + SLA escalation
- UI bilingual EN/ID
- CI pipeline + E2E smoke tests

### Masih Dalam Progress / Backlog

1. **Production billing** — payment provider nyata, webhooks, reconciliation
2. **Moderation phase 2** — outbound alerts, appeals, multi-level escalation
3. **Branch protection / staging gates**
4. **Phase 4** — AI smart matching, realtime messaging, escrow, boosted listings, analytics dashboard

---

## Dokumentasi Terkait

| File | Isi |
|------|-----|
| `docs/apa-itu-nearwork.md` | Penjelasan produk non-teknis |
| `features.md` | Inventaris fitur lengkap |
| `docs/application-overview.md` | Gambaran aplikasi & peta route |
| `audit.md` | Audit teknis, risiko, gap |
| `README.md` | Setup dev, deploy, roadmap detail |
| `docs/billing-architecture.md` | Arsitektur billing V2 |
| `docs/NEARWORK_V2_PRD.md` | Product requirements V2 |
| `docs/NEARWORK_V2_SRS.md` | Software requirements V2 |
| `docs/NEARWORK_V2_SDD.md` | Software design V2 |

---

## Lisensi

Proyek **private / internal use**.
