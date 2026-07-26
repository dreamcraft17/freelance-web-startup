# NextWork — Docs Index (repo)

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** NextWork  
**Package:** `freelance-marketplace-saas`  
**Local path:** `nextwork/`  
**UpdatedAt:** 26 Juli 2026  
**Status:** **V2 Foundation + v2.1 webhook harden** · PSP LIVE = Conditional (keys + runbook)  
**Codebase:** ~52 pages · ~52 API routes · **42** Prisma models · CI (typecheck + unit + E2E)  
**Contact:** info@dntech.id  
**Wiki mirror:** `company-wiki/docs/products/nextwork/`

### Mulai di sini

| Peran | Baca dulu |
|-------|-----------|
| **Paham produk (non-teknis)** | [apa-itu-nextwork.md](./apa-itu-nextwork.md) |
| **Pakai app harian** | [USER-GUIDE.md](./USER-GUIDE.md) |
| **Staff / admin** | [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) |
| **Paham alur sistem** | [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) |
| **Deploy** | [DEPLOYMENT.md](./DEPLOYMENT.md) · [deploy-checklist.md](./deploy-checklist.md) |
| **Payments LIVE** | [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) |
| **PRD berikutnya** | [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) |
| **Baseline panjang** | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |

> **Spek produk:** [prd/NEXTWORK_PRD_V3.md](./prd/NEXTWORK_PRD_V3.md) · [prd/NEXTWORK_SRS_V1.md](./prd/NEXTWORK_SRS_V1.md) · [prd/NEXTWORK_SDD_V1.md](./prd/NEXTWORK_SDD_V1.md)  
> **Spek V2 historis:** [NEARWORK_V2_PRD.md](./NEARWORK_V2_PRD.md) · [NEARWORK_V2_SRS.md](./NEARWORK_V2_SRS.md) · [NEARWORK_V2_SDD.md](./NEARWORK_V2_SDD.md)  
> **Inventaris fitur hidup (root):** [`../features.md`](../features.md) · **Audit risiko:** [`../audit.md`](../audit.md)

| File | Deskripsi |
|------|-----------|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Ringkasan produk, persona, stack, fase |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Komponen monorepo, layering, deploy |
| [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) | Alur marketplace: job → bid → chat → hire → escrow |
| [API.md](./API.md) | Referensi endpoint `/api/*` |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Available / Conditional / Roadmap |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Matrix status vs spek V1/V2 |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline teknis kanonik |
| [USER-GUIDE.md](./USER-GUIDE.md) | Panduan client & freelancer |
| [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) | Panduan staff `/admin` |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Lokal, Vercel, worker, env |
| [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) | **v2.1** PSP webhook LIVE checklist |
| [SECURITY.md](./SECURITY.md) | Auth, CSRF, RBAC, webhook status |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat living docs / produk |
| [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) | Briefing PRD berikutnya (post-V2 foundation) |
| [application-overview.md](./application-overview.md) | Peta route & update surface UI (panjang) |
| [auth-session-persistence.md](./auth-session-persistence.md) | Detail sesi JWT cookie |
| [roles-and-permissions.md](./roles-and-permissions.md) | RBAC & staff matrix |
| [billing-architecture.md](./billing-architecture.md) | Escrow, Stripe/Midtrans, payouts |
| [pricing-and-plans.md](./pricing-and-plans.md) | FREE / PRO / AGENCY |
| [geo-matching.md](./geo-matching.md) | Hyperlocal discovery |
| [business-rules.md](./business-rules.md) | Aturan domain ringkas |
| [taxonomy-and-categories.md](./taxonomy-and-categories.md) | Kategori & skill |
| [engineering-conventions.md](./engineering-conventions.md) | Konvensi kode |
| [apps-structure.md](./apps-structure.md) | Struktur apps |
| [monorepo-directory-tree.md](./monorepo-directory-tree.md) | Tree monorepo |
| [deploy-checklist.md](./deploy-checklist.md) | Gate checklist produksi |
| [DOCUMENTATION-MAINTENANCE.md](./DOCUMENTATION-MAINTENANCE.md) | Aturan sync `.md` ↔ kode |
| [NEARWORK_V2_DESIGN_SYSTEM.md](./NEARWORK_V2_DESIGN_SYSTEM.md) | Design system V2 |

## Spec (PRD folder)

| Spec | Path |
|------|------|
| PRD V2 | [NEARWORK_V2_PRD.md](./NEARWORK_V2_PRD.md) |
| SRS V2 | [NEARWORK_V2_SRS.md](./NEARWORK_V2_SRS.md) |
| SDD V2 | [NEARWORK_V2_SDD.md](./NEARWORK_V2_SDD.md) |
| Copies (updated/) | `../updated/NEARWORK_V2_*.md` |

## Root living docs

| File | Isi |
|------|-----|
| [`../README.md`](../README.md) | Quick start, stack, roadmap detail |
| [`../PROJECT-OVERVIEW.md`](../PROJECT-OVERVIEW.md) | Mirror ringkas (root) |
| [`../features.md`](../features.md) | Inventaris fitur + changelog UI panjang |
| [`../audit.md`](../audit.md) | Audit teknis & residual risk |
| [`../SECURITY_AUDIT_2026-07-08.md`](../SECURITY_AUDIT_2026-07-08.md) | Temuan keamanan (webhook, seed, CSP) |

## Quick links

| | |
|---|---|
| App utama | `apps/web` (UI + API + `/admin`) |
| Worker | `apps/worker` (escalation, escrow, boost, recommendations, payouts) |
| Admin stub | `apps/admin` — **bukan** admin produksi |
| Database | `packages/database` (Prisma) |
| Tests | `pnpm test:unit` · `pnpm test:e2e` |
| Default locale | **`id`** |

## Sync ke wiki

```bash
cp nextwork/docs/*.md company-wiki/docs/products/nextwork/docs/
# Update 00_INDEX.md di wiki jika status berubah
```

---

*Last Updated: July 26, 2026*
