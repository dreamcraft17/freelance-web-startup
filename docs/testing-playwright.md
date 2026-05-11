# Playwright browser E2E (NearWork)

> **Doc revision:** v1  
> Last synchronized: 2026-05-11 — dedicated test DB (`DATABASE_URL_TEST`), project groups, storageState fixtures, artifact layout, CI notes.

This document describes how NearWork runs **Playwright** browser tests: isolation from dev databases, Prisma pool pressure, execution groups, authenticated fixtures, and where artifacts land.

## Goals

- **Stable runs:** avoid exhausting hosted Postgres session pools (`EMAXCONNSESSION`) by using a dedicated test database and fewer redundant registrations.
- **Targeted feedback:** run only the project group you care about (`pnpm test:playwright:auth`, etc.).
- **CI-ready:** deterministic port (`PLAYWRIGHT_WEB_PORT`), serialized workers (`workers: 1`), conservative retries (`retries: 1` in CI only).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL_TEST` | **Preferred** for Playwright. When set, `playwright.config.ts` passes its value to the Next.js web server as `DATABASE_URL` (Prisma reads `DATABASE_URL` only). Use a separate database from local dev to avoid pool contention with an active `pnpm dev`. |
| `DATABASE_URL` | Fallback when `DATABASE_URL_TEST` is unset (local convenience only). |
| `SESSION_SECRET` | Required for auth cookies; defaults to a dev-only value in Playwright webServer env if unset. |
| `PLAYWRIGHT_BASE_URL` / `BASE_URL` | App origin (default `http://localhost:${PLAYWRIGHT_WEB_PORT}`). |
| `PLAYWRIGHT_WEB_PORT` | Port for `next start` and default base URL (default **3000**). |
| `PLAYWRIGHT_REUSE_SERVER` | Set to `1` to skip starting a second server when one is already running on the same URL. |
| `PLAYWRIGHT_E2E_PASSWORD` | Password for fixture accounts and auth specs (default matches historical E2E string). |
| `PLAYWRIGHT_VISUAL_SNAPSHOTS` | Set to `1` to enable screenshot assertions in design QA specs. |

## Test database setup

1. Create a dedicated Postgres database (example: `nearwork_playwright`).
2. Point `DATABASE_URL_TEST` at it (connection string with credentials).
3. Apply schema: `DATABASE_URL=$DATABASE_URL_TEST pnpm db:migrate:deploy` (or `db:migrate` in dev).
4. Seed categories/admin if your specs need them: `DATABASE_URL=$DATABASE_URL_TEST pnpm db:seed`.

Do **not** point Playwright at production. Keep seed credentials dev-only.

## Storage state (shared fixtures)

Before marketplace, messaging, and authenticated design specs, the **`setup`** project runs `storage-state.setup.ts`, which:

1. Registers one **CLIENT** and one **FREELANCER** (unique emails per run).
2. Completes the freelancer profile (required for proposal flows).
3. Writes `tests/playwright/.auth/client.json`, `freelancer.json`, and `credentials.json` (all **gitignored**).

Specs use `test.use({ storageState: … })` or `browser.newContext({ storageState: … })` to reuse sessions instead of registering on every test.

## Project groups (scripts)

| Script | Projects |
|--------|----------|
| `pnpm test:playwright` | All projects (setup runs as a dependency where needed). |
| `pnpm test:playwright:setup` | Fixture generation only. |
| `pnpm test:playwright:auth` | `auth-en`, `auth-id` |
| `pnpm test:playwright:marketplace` | `marketplace-en`, `marketplace-id` (depends on `setup`) |
| `pnpm test:playwright:messaging` | `messaging-en`, `messaging-id` (depends on `setup`) |
| `pnpm test:playwright:mobile` | `mobile-en`, `mobile-id` |
| `pnpm test:playwright:design` | `design-en`, `design-id` (depends on `setup` for authenticated message QA) |
| `pnpm test:playwright:report` | Opens HTML report at `playwright-report/nearwork`. |

**Note:** `messaging-*` maps to `freelancer-client.spec.ts` (client job + freelancer proposal + messages + notifications).

## Artifacts

| Output | Location |
|--------|----------|
| Per-test output (screenshots, videos, traces) | `test-results/playwright/` |
| HTML report | `playwright-report/nearwork/` |

Traces: `trace: "on-first-retry"`. Videos/screenshots: on failure.

## CI (GitHub Actions / hosted runners)

Suggested pattern:

- Start Postgres service (or use a branch DB) and set `DATABASE_URL_TEST`.
- `pnpm install` + `pnpm exec playwright install chromium` (or `install --with-deps` per Playwright docs).
- `pnpm db:generate`, `pnpm db:migrate:deploy` against the test DB URL.
- `pnpm db:seed` when admin/category data is required.
- Run a subset in parallel jobs only if each job uses its **own** database instance; otherwise keep **`workers: 1`** and split jobs by **script** (auth vs marketplace) to reduce peak connections.

## Prisma / connection notes

The app uses a **singleton** `PrismaClient` per Node process (`packages/database/src/index.ts`). Playwright starts **one** `next start` process by default, so client explosion usually comes from **parallel Next workers** or **many concurrent DB sessions** from heavy pages—not from multiple Prisma instances in one server. Prefer `DATABASE_URL_TEST` with adequate pool headroom and avoid running the full matrix against a tiny session pooler limit.

## Further reading

- Root **`README.md`** — script table and quickstart.
- **`packages/database/README.md`** — `EMAXCONNSESSION` mitigations and pooler guidance.
