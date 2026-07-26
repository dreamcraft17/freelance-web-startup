# NextWork — Deployment

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Checklist gate: [deploy-checklist.md](./deploy-checklist.md)

## Lokal

```bash
cd nextwork
pnpm install
# Salin packages/database/env.example.txt → .env di root
# Wajib: DATABASE_URL, SESSION_SECRET (≥16 chars)

pnpm db:migrate
pnpm db:seed          # hanya non-prod
pnpm --filter @acme/web dev
# http://localhost:3000

# Terminal 2 — background jobs
pnpm --filter @acme/worker dev
```

Scripts berguna:

| Command | Fungsi |
|---------|--------|
| `pnpm db:migrate` / `db:migrate:deploy` | Prisma migrate |
| `pnpm db:studio` | Prisma Studio |
| `pnpm test:unit` | Vitest |
| `pnpm test:e2e` | Build + `next start` :3041 + HTTP smoke |
| `pnpm --filter @acme/web typecheck` | Typecheck |
| `pnpm --filter @acme/web build` | Production build |

E2E: set **`DATABASE_URL_TEST`** agar tidak menulis ke DB staging publik.

---

## Vercel (web)

Target hanya **`@acme/web`**.

### Option A (recommended)

- Root Directory: `apps/web`
- Install: `cd ../.. && pnpm install`
- Build: `cd ../.. && pnpm exec turbo run build --filter=@acme/web`
- Output: default / `.next`

### Option B

- Root Directory: repo root
- Install: `pnpm install`
- Build: `pnpm exec turbo run build --filter=@acme/web`
- Output: `apps/web/.next`

**Jangan** campur Root=`apps/web` + Output=`apps/web/.next`.

Pre-deploy:

1. `pnpm db:migrate:deploy` ke Postgres produksi
2. Set secrets (lihat bawah)
3. Deploy worker terpisah
4. Quality gate: typecheck, lint, build, CI hijau

Di Vercel (`VERCEL=1`), listing sintetis E2E otomatis disembunyikan dari board publik.

---

## Worker

Jalankan `@acme/worker` di VPS/container/PM2 dengan `DATABASE_URL` yang sama.

| Job | Interval default |
|-----|------------------|
| Moderation escalation | 5 menit |
| Promotion / escrow / boost / recommendations | ~6 jam |
| Batch payouts | 24 jam |

Tanpa worker: SLA overdue & escrow auto-release tidak berjalan.

---

## Env penting

| Variable | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | ✅ | Postgres |
| `SESSION_SECRET` | ✅ | JWT; prod 32+ |
| `NEXT_PUBLIC_APP_URL` / `SITE_URL` | Disarankan | Canonical URL |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | PSP | Tanpa ini → MOCK |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_IS_PRODUCTION` | PSP | Tanpa ini → MOCK |
| `GOOGLE_TRANSLATE_API_KEY` | Opsional | UGC job translate |
| `NEXTWORK_SUPPORT_EMAIL` | Opsional | `/help` (legacy: `NEARWORK_SUPPORT_EMAIL`) |
| `NEXTWORK_ENABLE_HSTS` | Opsional | `1` untuk HSTS (legacy: `NEARWORK_ENABLE_HSTS`) |
| `FEATURE_*` | Opsional | Monetization toggles |
| `DATABASE_URL_TEST` | CI/E2E | Isolasi tes |
| `SEED_*` | Seed only | **Jangan prod** |

Template aman: `credential.example.md`, `packages/database/env.example.txt`.

---

## CI

`.github/workflows/ci.yml` pada push/PR `main`:

1. **quality** — typecheck, lint web, unit tests  
2. **integration** — Postgres 16, migrate, seed, build, E2E (`SKIP_E2E_BUILD=1`)

Disarankan: branch protection wajibkan check CI.

---

## Rollback / cache Next

Jika 500 `Cannot find module './vendor-chunks/…'`:

```bash
pnpm --filter @acme/web clean && pnpm --filter @acme/web dev
```

---

## Post-deploy smoke

- [ ] `/id` landing load
- [ ] Login seed staging (bukan prod defaults)
- [ ] Create job + bid di staging
- [ ] `GET /api/auth/session` dengan cookie
- [ ] `/admin/reports` untuk staff
- [ ] Worker logs: escalation tick
- [ ] Jika PSP live: test webhook signature di staging dulu — lihat [SECURITY.md](./SECURITY.md)
