# NearWork — Architecture

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Alur bisnis: [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) · Spek: [NEARWORK_V2_SDD.md](./NEARWORK_V2_SDD.md)

## Deploy shape

```
Browser ──HTTPS──► Vercel (@acme/web)
                      │
                      ├── App Router UI
                      ├── /api/* Route Handlers
                      └── /admin (staff)
                      
Postgres ◄── Prisma ── apps/web + apps/worker

apps/worker (host/PM2/container terpisah)
  ├── moderation SLA escalation (~5m)
  ├── escrow auto-release / boost expiry (~6h)
  ├── daily recommendations (~6h)
  └── batch payouts MOCK (~24h)
```

- **Web:** Vercel monorepo → hanya `@acme/web`.
- **Worker:** wajib dijalankan terpisah di produksi untuk SLA + escrow.
- **`apps/admin`:** stub port 3001 — admin nyata = `/admin` di web.

## Monorepo

| Unit | Peran |
|------|--------|
| `apps/web` | UI + API + admin |
| `apps/worker` | Background jobs |
| `packages/database` | Prisma schema / migrations / seed |
| `packages/config` | Plans, flags, V2 pricing, moderation triage |
| `packages/validators` | Zod contracts |
| `packages/types` | Enums shared |
| `packages/utils` | Pagination, dates, errors |

## Layering (apps/web)

```
Route handler (app/api/*)
    → Service
        → Policy (authz)
            → Repository / Prisma
                → PostgreSQL
```

Prinsip: tidak ada business logic di komponen UI; validasi input lewat Zod; satu sumber sesi (`acme_session`).

## Request auth flow

1. Middleware cek path protected (`/client`, `/freelancer`, `/messages`, `/admin`, …).
2. Baca cookie JWT `acme_session` (jose HS256).
3. Valid → lanjut; invalid → `/login?returnUrl=…`.
4. Mutasi API: CSRF double-submit + origin check + rate limit.

Detail: [auth-session-persistence.md](./auth-session-persistence.md), [SECURITY.md](./SECURITY.md).

## i18n routing

- SEO publik: `/en/*`, `/id/*` (`app/[locale]`).
- Workspace: URL `/en|id/(client|…)` di-rewrite ke tree App Router tanpa duplikasi folder.
- Preferensi cookie `lang`; default first-visit **`id`**.
- Mata uang mengikuti `Job.currency` (IDR/USD); locale hanya format angka.

## Data domains (Prisma)

Identity · Taxonomy · Jobs/Bids/Contracts · Messaging/Notifications · Monetization (subscriptions, escrow, boosts, wallet) · Trust (reports, verification, appeals, audit) · Recommendations.

42 models — lihat [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md).

## Security surface (ringkas)

| Kontrol | Status |
|---------|--------|
| Password bcrypt (cost 12) | ✅ |
| Session HttpOnly + SameSite=Lax | ✅ |
| CSRF pada mutasi | ✅ |
| Staff RBAC `/admin` + `protectStaff` | ✅ |
| Rate limits in-memory | ⚠️ Per-instance (bukan Redis) |
| CSP | ❌ Belum |
| HSTS | Opt-in `NEARWORK_ENABLE_HSTS=1` |
| Webhook Stripe/Midtrans | ⚠️ Perlu harden — [SECURITY.md](./SECURITY.md) |

## Batasan sadar

- Rate limit tidak shared lintas serverless instance.
- PSP tanpa key → MOCK checkout.
- Messaging masih polling (bukan WebSocket).
- Agency roles di enum; UX multi-seat belum primary.
