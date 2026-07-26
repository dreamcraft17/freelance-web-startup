# NextWork

**NextWork** adalah marketplace freelance untuk merekrut: klien memasang lowongan, freelancer mengirim proposal, dan percakapan tetap terikat pada job yang sama — remote, on-site, maupun hybrid (hyperlocal).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | NextWork |
| Package | `freelance-marketplace-saas` · folder `nextwork/` |
| Status | **V2 + v2.1 webhook harden** · PSP LIVE = Conditional (MOCK tanpa key) |
| Docs | **[Index](./docs/00_INDEX.md)** · [Payment runbook](./docs/PAYMENT-RUNBOOK.md) · [Cara pakai](./docs/USER-GUIDE.md) · [Deploy](./docs/DEPLOYMENT.md) |
| PRD berikutnya | **[NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md)** |
| UpdatedAt | 26 Juli 2026 |
| License | Private — internal use only |

> Nama kerja monorepo: **Freelance-web**. Produk ke pengguna: **NextWork**.

---

## Apa yang diselesaikan?

| Masalah | Jawaban di NextWork |
|---------|---------------------|
| Hiring freelance tersebar di chat | Job → proposal → chat terikat job → hire → kontrak |
| Butuh jasa lokal & remote | Filter kota, radius, work mode (`REMOTE` / `ONSITE` / `HYBRID`) |
| Kuota & paket tidak jelas | Plan FREE / PRO / AGENCY + enforcement kuota |
| Abuse & laporan | Trust & safety: reports, SLA, escalate worker, appeals |
| Escrow / bayar | V2 escrow + Stripe/Midtrans APIs (MOCK tanpa PSP key) |

**Bukan:** direktori kontak saja, ERP, atau app admin terpisah (`apps/admin` = stub; admin nyata = `/admin` di web).

---

## Fitur (ringkas)

Detail Available / Conditional / Roadmap: **[FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)**.

- [x] Auth cookie JWT (`acme_session`) + CSRF + rate limits + RBAC
- [x] Jobs, bids/proposals, contracts, profiles, saved items, reviews
- [x] Messaging & notifikasi in-app (EN/ID)
- [x] Public discovery `/jobs`, `/freelancers`, nearby search
- [x] i18n EN/ID (default publik **`id`**) + SEO locale routes
- [x] Admin workspace `/admin` (moderasi, verification, appeals, analytics, …)
- [x] Worker: SLA escalation, escrow/boost expiry, recommendations, payouts
- [x] V2 foundation: escrow, boosts, wallet, Stripe/Midtrans routes, AI match batch
- [x] **v2.1:** Stripe HMAC + Midtrans signature required — [PAYMENT-RUNBOOK.md](./docs/PAYMENT-RUNBOOK.md)
- [ ] Production LIVE keys + pilot txs + invoice PDF / bank payout
- [ ] Forgot-password email, WebSocket messaging, agency multi-seat UX

**Default lokal tanpa PSP keys:** checkout **MOCK** — aman untuk demo tanpa uang nyata.

---

## Inventori codebase (snapshot)

| Area | Angka |
|------|-------|
| App pages (`page.tsx`) | ~**52** |
| API route modules | ~**52** |
| Prisma models | **42** |
| Apps | `web` (produk) · `worker` · `admin` (stub) |
| Spec | NextWork V2 PRD / SRS / SDD |

Status: [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · baseline: [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md).

---

## Tech stack

| Layer | Teknologi |
|-------|-----------|
| Monorepo | pnpm 9 · Turborepo 2 · Node 20.x |
| App | Next.js 15 App Router · React 19 · TypeScript 5.7 |
| UI | Tailwind 3.4 · Radix · tokens `nw-*` |
| API | Route Handlers `app/api/*` |
| Domain | Service → Policy → Repository (Prisma) |
| DB | PostgreSQL · Prisma 5.22 |
| Auth | JWT (`jose`) cookie + bcrypt |
| Worker | `apps/worker` (Node/tsx) |
| Deploy web | Vercel (`@acme/web`) |
| Tests | Vitest · HTTP E2E · GitHub Actions |

### Struktur

```
apps/
  web/       # UI + /api + /admin  ← produk utama
  worker/    # background sweeps (wajib di produksi)
  admin/     # stub only — jangan dipakai sebagai admin live
packages/
  database/  # Prisma schema, migrations, seed
  config/    # plans, flags, V2 pricing
  types/ validators/ utils/
docs/        # living docs — mulai dari docs/00_INDEX.md
```

Layering: `route → service → policy → repository → Postgres`.  
Tanpa business logic di UI atau route handler.

---

## Quick start

**Prasyarat:** Node 20.x, pnpm 9, PostgreSQL 14+.

```bash
cd nextwork
pnpm install
cp packages/database/env.example.txt .env
# Wajib: DATABASE_URL, SESSION_SECRET (≥16 chars; prod pakai openssl rand -base64 32)

pnpm db:generate
pnpm db:migrate
pnpm db:seed                 # non-prod only

pnpm --filter @acme/web dev  # http://localhost:3000
# Terminal 2 (opsional lokal / wajib prod untuk SLA+escrow):
pnpm --filter @acme/worker dev
```

`pnpm dev` menjalankan semua package yang punya task `dev` (web + admin stub + worker). Worker membaca **root** `.env` / `.env.local` (bukan `apps/web/.env.local`).

### Scripts

| Script | Purpose |
|--------|---------|
| `pnpm --filter @acme/web dev` | Dev web saja |
| `pnpm build` | Production build (turbo) |
| `pnpm db:migrate` / `db:migrate:deploy` | Migrasi |
| `pnpm db:studio` | Prisma Studio |
| `pnpm test:unit` | Vitest |
| `pnpm test:e2e` | Build + `next start` :3041 + HTTP smoke |
| `pnpm test:all` | Unit lalu E2E |
| `pnpm --filter @acme/web typecheck` | Typecheck web |

**E2E:** set `DATABASE_URL_TEST` ke Postgres throwaway (disarankan). Jangan tulis smoke ke DB staging publik. Detail: [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**CI:** push/PR ke `main` → typecheck, lint, unit, Postgres migrate/seed/build/E2E.

### Troubleshooting lokal

| Gejala | Biasanya |
|--------|----------|
| Worker Prisma / `DATABASE_URL` | Root `.env` kosong — isi atau jalankan web-only |
| `EMAXCONNSESSION` / pool limit | Kurangi tab/proses, atau naikkan pool / pakai URL direct |
| `Cannot find module './vendor-chunks/…'` | Cache `.next` rusak → `pnpm --filter @acme/web clean` lalu `dev` / `dev:fresh` |

---

## Deploy (Vercel)

Target hanya **`@acme/web`**. Checklist: [deploy-checklist.md](./docs/deploy-checklist.md) · [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**Option A (recommended)** — Root Directory = `apps/web`:

| Setting | Value |
|---------|--------|
| Install | `cd ../.. && pnpm install` |
| Build | `cd ../.. && pnpm exec turbo run build --filter=@acme/web` |
| Output | *(kosong — default Next)* |

**Option B** — Root = repo: Output = `apps/web/.next`.

Jangan campur Root=`apps/web` + Output=`apps/web/.next`. Commit **`pnpm-lock.yaml`**. Env minimal: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_*` yang dibutuhkan. Deploy **worker** terpisah untuk SLA/escrow.

---

## Dokumentasi

Mulai dari **[docs/00_INDEX.md](./docs/00_INDEX.md)**.

| File | Untuk |
|------|--------|
| [apa-itu-nextwork.md](./docs/apa-itu-nextwork.md) | Produk non-teknis |
| [USER-GUIDE.md](./docs/USER-GUIDE.md) / [ADMIN-GUIDE.md](./docs/ADMIN-GUIDE.md) | Cara pakai |
| [HOW-IT-WORKS.md](./docs/HOW-IT-WORKS.md) / [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Alur & arsitektur |
| [API.md](./docs/API.md) | Endpoint `/api/*` |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Status fitur |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline teknis |
| [SECURITY.md](./docs/SECURITY.md) | Auth + temuan webhook |
| [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | **Dasar menulis PRD berikutnya** |
| [NEARWORK_V2_PRD.md](./docs/NEARWORK_V2_PRD.md) | Spek V2 |
| [DOCUMENTATION-MAINTENANCE.md](./docs/DOCUMENTATION-MAINTENANCE.md) | Aturan sync `.md` ↔ kode |
| [`features.md`](./features.md) / [`audit.md`](./audit.md) | Inventaris panjang / risiko |

---

## Status & roadmap

| Phase | Status |
|-------|--------|
| Core marketplace (auth, jobs, bids, messages, admin) | ✅ Done |
| i18n, trust & safety MVP, CI/E2E | ✅ Done |
| V2 foundation (escrow, PSP APIs, boosts, appeals, recommendations) | ✅ Done (PSP Conditional) |
| Production PSP harden + GA billing | 🔄 Open — [NEXT-PRD-BRIEF](./docs/NEXT-PRD-BRIEF.md) |
| Realtime messaging / agency seats | Roadmap |

---

## Contributing

Internal project. Ikuti:

- Logic di **service** layer; authz di **policy**
- Jangan campur business logic di UI
- Update living docs relevan + naikkan `Doc revision` (lihat `DOCUMENTATION-MAINTENANCE.md`)

## License

Private / internal use · DN Tech.

---

> **Doc revision:** v108  
> Last synchronized: 2026-07-26 — README dirapikan ke gaya produk + tautan suite docs kanonik.
