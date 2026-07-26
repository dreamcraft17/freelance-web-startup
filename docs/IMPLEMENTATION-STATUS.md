# NextWork — Implementation Status

> Terakhir diperbarui: **26 Juli 2026**  
> Referensi: MVP + V2 + **v2.1 current-scope DoD (code-as-truth)**  
> Owner: Dozer · DN Tech · Local: `nextwork/`

## Ringkasan

| Phase | Target | Status |
|-------|--------|--------|
| Phase 1 — Core Stabilization | Auth, jobs, bids, middleware, typecheck | **Done** |
| Phase 2 — User Experience | Messaging, notifications, saved, reviews, i18n | **Done** |
| Phase 3 — SaaS Features | Subscriptions, boosts, analytics | **Done** (paid gates + seed plans) |
| V2 Foundation | Escrow, PSP APIs, appeals, AI match batch, wallet | **Done** (MOCK tanpa key) |
| **Current-scope 100%** | Money safety, real checkout UI, ops/finance, residual SRS | **Done (engineering)** |
| Production PSP / GA | Live keys, invoice PDF, bank API, pilot txs | **Conditional** — [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) |

## Current-scope DoD (2026-07-26)

| Item | Status |
|------|--------|
| Spec sync (SRS/SDD/PRD → code-as-truth) | Done |
| Escrow bypass blocked; worker → money-jobs | Done |
| Boost/sub paid gates; mock non-prod only | Done |
| Webhook amount/currency + fee = base×rate | Done |
| Stripe.js / Midtrans Snap checkout UI | Done |
| Admin disputes / payouts / reconciliation | Done |
| Money notifications + AuditLog | Done |
| Auth refresh, attachments, viewCount, cancel sub | Done |
| Webhook rate limit; prod `NEXT_PUBLIC_APP_URL` assert | Done |
| **LIVE PSP credentials / legal / pilot txs** | **Conditional** (ops runbook) |

## Matriks vs V2 spek

| Area | Kode | Catatan |
|------|------|---------|
| Schema V2 (escrow, boosts, wallet, appeals, recommendations) | Available | + Phase 4 `viewCount` / `Message.metadata` |
| Stripe create-intent + webhook + Stripe.js confirm | Conditional | MOCK tanpa key; HMAC + amount check Available |
| Midtrans Snap + notification | Conditional | signature + amount check; Snap UI Available |
| Escrow lifecycle + holdback 80/20 | Available | Canonical `@acme/database` money-jobs |
| Boost / subscription paid activation | Available | Seed FREE/PRO/AGENCY |
| Admin disputes / payouts / reconciliation | Available | `/admin/disputes`, `/payouts`, `/reconciliation` |
| Invoice PDF | Roadmap | |
| Real bank payout | Roadmap (MOCK receipts after admin approve) | |
| WebSocket messaging | Roadmap (v2.2+) | |

## Surface status

| Surface | Status |
|---------|--------|
| Public `/jobs`, `/freelancers`, landing | Done |
| Client / freelancer workspaces | Done |
| Messages / notifications / settings | Done |
| Checkout `/checkout/mock` + PSP confirm | Done |
| `/admin/*` finance + trust | Done (RBAC) |
| `apps/admin` package | Stub only |
| Auth forgot-password | UI only |
| CI + E2E smoke | Done |
| Unit tests | 82 passed |

## Verifikasi lokal

```bash
cd nextwork
pnpm install
# copy packages/database/env.example.txt → .env (root)
pnpm db:migrate
pnpm db:seed          # non-prod only — @nextwork.local accounts
pnpm --filter @acme/web dev
pnpm --filter @acme/worker dev
pnpm test:unit
```

## Spek & audit

- [prd/NEXTWORK_PRD_V3.md](./prd/NEXTWORK_PRD_V3.md) · [NEXTWORK_SRS_V1.md](./prd/NEXTWORK_SRS_V1.md) · [NEXTWORK_SDD_V1.md](./prd/NEXTWORK_SDD_V1.md)
- [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) · [SECURITY.md](./SECURITY.md) · [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)
