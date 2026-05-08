# @acme/database

> **Doc revision:** v5  
> Last synchronized: 2026-05-09 (seed loads root `.env` + taxonomy for E2E categories/skills).

PostgreSQL access via **Prisma**: schema, migrations, and generated client.

## Prerequisites

- PostgreSQL 14+ (or compatible)
- `DATABASE_URL` pointing at your database, for example:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/freelance_dev"
```

For local setup, copy `env.example.txt` to `.env` in this package (or set `DATABASE_URL` in the monorepo root `.env` when your tooling loads it). Files matching `.env*` are gitignored by the monorepo.

## Bootstrap (reproducible)

From the **monorepo root**:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
```

- **`pnpm db:generate`** — runs `prisma generate` in `@acme/database` (updates the Prisma Client from `prisma/schema.prisma`).
- **`pnpm db:migrate:deploy`** — runs `prisma migrate deploy`, applying every migration under `prisma/migrations/` that is not yet recorded in `_prisma_migrations`. Use this in **CI and production** so the schema matches the repo.

From **this package** (`packages/database`) you can use the same commands via `pnpm exec prisma …` or the npm scripts in `package.json`.

## Local development (new migrations)

When you change `prisma/schema.prisma` and need a **new** migration:

```bash
cd packages/database
pnpm db:migrate
```

(`db:migrate` → `prisma migrate dev` — creates a migration from schema drift and applies it to the database pointed to by `DATABASE_URL`.)

## Initial migration

The folder `prisma/migrations/20260412120000_init/` contains the **baseline** SQL for the current schema (generated with `prisma migrate diff --from-empty --to-schema-datamodel`). New environments apply it with `migrate deploy` after `DATABASE_URL` is set.

## Useful scripts (package)

| Script | Command |
|--------|---------|
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:migrate:deploy` | `prisma migrate deploy` |
| `db:studio` | `prisma studio` |
| `db:push` | `prisma db push` (prototyping only; prefer migrations for shared environments) |
| `db:seed` | `prisma db seed` — taxonomy (category / subcategory / skill) + dev **ADMIN** user (see below) |

## Seed (local / internal / E2E)

After migrations apply, from the **monorepo root**:

```bash
pnpm db:seed
```

`prisma/seed.ts` reads the **monorepo root** `.env` and `.env.local` (later file wins for unset keys only; variables already exported in your shell stay put), then **`DATABASE_URL` must resolve** against the DB your app uses.

Idempotent taxonomy (stable slugs) so `GET /api/categories` always has at least one active category locally:

| Entity | Purpose |
|--------|---------|
| Category | Active parent row for job `categoryId` |
| Subcategory | Linked row for UI flows that drill into a category |
| Skill | Active skill linked to that category/subcategory |

Admin defaults (override with env — never commit real secrets):

| Variable | Default |
|----------|---------|
| `SEED_ADMIN_EMAIL` | `admin@nearwork.local` |
| `SEED_ADMIN_PASSWORD` | `NearWorkAdminDev123!` |

Example:

```bash
set SEED_ADMIN_EMAIL=you@company.com
set SEED_ADMIN_PASSWORD=YourStrongPass123
pnpm db:seed
```

Then sign in at `/login` and open `/admin`. **Do not use default passwords in production** — set strong values via env or skip seed and promote users manually.

## Prisma client usage (Next.js / small pools)

- **`@acme/database` export `db`:** satu `PrismaClient` per proses Node, disimpan di **`globalThis`** supaya hot reload / bundler tidak membuat banyak instance (mengurangi risiko **“max clients reached”** pada pool kecil, mis. Supabase session mode).
- **Kueri agregat ringan publik:** gunakan **`$transaction`** berurutan bila beberapa `count` harus jalan dalam satu permintaan HTTP—lebih ramah koneksi daripada `Promise.all` paralel pada pool `pool_size` kecil.
- **Kompatibilitas skema lintas environment:** jika ada rollout bertahap kolom baru (contoh translasi `titleEn/titleId/descriptionEn/descriptionId`), pastikan query read-path punya fallback aman agar environment yang belum termigrasi tidak langsung gagal runtime.
- **Degradasi operasional saat pool jenuh:** di layer API, map error Prisma pool exhaustion ke `503` + `Retry-After` agar caller dapat retry terkontrol dan log produksi tidak didominasi unhandled `PrismaClientInitializationError`.

## Documentation

When schema, seed defaults, or migration workflow change, update this README and any references in root `README.md` / `audit.md`. See `docs/DOCUMENTATION-MAINTENANCE.md` for the full doc map.
