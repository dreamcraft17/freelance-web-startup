# NearWork — Implementation Status

> Terakhir diperbarui: **26 Juli 2026**  
> Referensi: MVP marketplace + **NearWork V2 Foundation**  
> Owner: Dozer · DN Tech · Local: `NearWorks/`

## Ringkasan

| Phase | Target | Status |
|-------|--------|--------|
| Phase 1 — Core Stabilization | Auth, jobs, bids, middleware, typecheck | **Done** |
| Phase 2 — User Experience | Messaging, notifications, saved, reviews, i18n | **Done** |
| Phase 3 — SaaS Features | Subscriptions, boosts, analytics | **Partial** |
| V2 Foundation | Escrow, PSP APIs, appeals, AI match batch, wallet | **Done (MOCK PSP)** |
| Production PSP / GA | Real keys, webhook harden, invoice, bank API | **Conditional / Open** |

## Matriks vs V2 spek

| Area | Kode | Catatan |
|------|------|---------|
| Schema V2 (escrow, boosts, wallet, appeals, recommendations) | Available | Migration `20260707120000_nearwork_v2` |
| Stripe create-intent + webhook | Conditional | MOCK tanpa key; **HMAC webhook belum benar** |
| Midtrans Snap + notification | Conditional | Signature skip jika field hilang — **risiko** |
| Escrow lifecycle + worker auto-release | Available | |
| Boost catalog + expiry worker | Available | |
| Recommendations daily batch | Available | |
| Suspension appeals | Available | |
| Admin analytics overview | Available | |
| Invoice PDF | Roadmap | |
| Real bank payout | Roadmap (MOCK receipts) | |
| WebSocket messaging | Roadmap | |

## Surface status

| Surface | Status |
|---------|--------|
| Public `/jobs`, `/freelancers`, landing | Done |
| Client / freelancer workspaces | Done |
| Messages / notifications / settings | Done |
| `/admin/*` di `apps/web` | Done (RBAC) |
| `apps/admin` package | Stub only |
| Auth forgot-password | UI only |
| CI + E2E smoke | Done |

## Inventori kode (snapshot)

| Area | Perkiraan |
|------|-----------|
| App pages (`page.tsx`) | ~52 |
| API route modules | ~52 |
| Prisma models | **42** |
| Unit test files (web-related) | ~11+ |
| Services | ~30 domain services |

## Verifikasi lokal

```bash
cd NearWorks
pnpm install
# copy packages/database/env.example.txt → .env (root)
pnpm db:migrate
pnpm db:seed          # non-prod only
pnpm --filter @acme/web dev
# http://localhost:3000

pnpm test:unit
# E2E butuh Postgres + DATABASE_URL_TEST disarankan:
pnpm test:e2e
```

Worker (terminal terpisah):

```bash
pnpm --filter @acme/worker dev
```

## Spek & audit

- [NEARWORK_V2_PRD.md](./NEARWORK_V2_PRD.md)
- [NEARWORK_V2_SRS.md](./NEARWORK_V2_SRS.md)
- [NEARWORK_V2_SDD.md](./NEARWORK_V2_SDD.md)
- [`../audit.md`](../audit.md)
- [`../SECURITY_AUDIT_2026-07-08.md`](../SECURITY_AUDIT_2026-07-08.md)
- [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)
