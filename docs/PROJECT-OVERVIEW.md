# NearWork — Project Overview

> **Doc revision:** v1  
> Last synchronized: 2026-07-26 (suite docs kanonik; audit codebase V2 foundation)

**Owner:** Dozer · DN Tech  
**Path:** `NearWorks/`  
**Status:** V2 Foundation / Pre-production PSP

Dokumen ini merangkum **produk apa ini**, **untuk siapa**, **stack**, dan **fase**. Detail teknis: [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md). Fitur: [FEATURE-CATALOG.md](./FEATURE-CATALOG.md).

---

## Apa itu NearWork?

**NearWork** adalah **marketplace freelance untuk merekrut** — klien memasang lowongan (job), freelancer mengirim proposal, dan percakapan tetap terikat pada lowongan yang sama. Mendukung kerja **remote**, **on-site**, dan **hybrid**.

Monorepo (package: `freelance-marketplace-saas`) menjalankan UI, API, database, auth, dan worker.

| Konsep | Peran di NearWork |
|--------|-------------------|
| Upwork / Freelancer | Bidding & proposal |
| Fastwork | Layanan berbasis jasa |
| Marketplace lokal | Discovery hyperlocal (kota / radius) |

Bukan hanya IT: digital, kreatif, profesional, jasa lokal (event, perbaikan, beauty, dll.).

Versi non-teknis: [apa-itu-nearwork.md](./apa-itu-nearwork.md).

---

## Untuk siapa?

| Peran | Fungsi |
|-------|--------|
| **Client** | Post job, review proposal, hire, kontrak, pesan |
| **Freelancer** | Profil publik, cari job, proposal, kerja |
| **Staff** | Verifikasi, moderasi, ops via `/admin` |

UI bilingual: **Bahasa Indonesia** (default) + **English**.

---

## Fitur utama (ringkas)

- Job lifecycle + discovery publik (`/jobs`, `/freelancers`)
- Proposal / bidding + kuota plan
- Kontrak + escrow V2 (MOCK tanpa PSP key)
- Messaging terikat job, notifikasi in-app EN/ID
- Saved items, reviews, verification
- Hyperlocal: lat/lng + radius, work mode
- Trust & safety: laporan, SLA, escalate worker, appeals
- Subscription FREE / PRO / AGENCY (+ `FEATURE_*` early-access)
- Admin RBAC: users, jobs, bids, contracts, reports, appeals, analytics, …

---

## Tech stack

| Layer | Teknologi |
|-------|-----------|
| Monorepo | pnpm 9, Turborepo 2, Node 20.x |
| App | Next.js 15 App Router, React 19, TypeScript 5.7 |
| UI | Tailwind 3.4, Radix, design tokens `nw-*` |
| API | Route Handlers `app/api/*` |
| Domain | Service → Policy → Repository (Prisma) |
| DB | PostgreSQL 14+, Prisma 5.22 |
| Auth | JWT cookie `acme_session` (jose) + CSRF |
| Worker | `apps/worker` (Node/tsx) |
| Deploy web | Vercel (`@acme/web`) |
| Tests | Vitest unit + HTTP E2E smoke + GitHub Actions |

### Struktur

```
apps/web      # Produk + /admin + /api
apps/worker   # Background sweeps
apps/admin    # Stub saja — jangan dipakai sebagai admin live
packages/     # database, config, types, validators, utils
```

---

## Fase

| Phase | Fokus | Status |
|-------|--------|--------|
| Phase 1 — Core | Auth, jobs, bids, middleware | ✅ Done |
| Phase 2 — UX | Messages, notifications, saved, reviews | ✅ Done |
| Phase 3 — SaaS | Billing, boosts, analytics | 🔄 Partial (V2 foundation) |
| Phase 4 — Advanced | Escrow, AI match, realtime chat | ⚡ Partial / MOCK |

**GA target (V2 PRD):** Q1 2027 — lihat [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md).

### Conditional / belum produksi

- Stripe / Midtrans **real** (tanpa key → MOCK; webhook crypto masih perlu harden)
- Forgot-password email backend
- WebSocket messaging (polling tetap)
- Agency multi-seat UX
- Invoice PDF / bank payout API nyata

---

## Dokumentasi terkait

| File | Isi |
|------|-----|
| [00_INDEX.md](./00_INDEX.md) | Index semua docs |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagram komponen |
| [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) | Alur bisnis |
| [`../features.md`](../features.md) | Inventaris panjang |
| [`../audit.md`](../audit.md) | Risiko & debt |
| [NEARWORK_V2_PRD.md](./NEARWORK_V2_PRD.md) | Spek produk V2 |

---

## Lisensi

Private / internal use · DN Tech.
