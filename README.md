# 🚀 Freelance-Web — Hyperlocal Freelance SaaS Platform

> **Doc revision:** v2  
> Last synchronized: 2026-04-18 — keep in sync with code changes; see `docs/DOCUMENTATION-MAINTENANCE.md`.

Freelance-Web adalah platform marketplace freelance berbasis SaaS yang menggabungkan konsep:
- Upwork / Freelancer (bidding system)
- Fastwork (service-based)
- Marketplace jasa lokal (hyperlocal discovery)

Platform ini dirancang untuk mendukung **semua jenis freelance**, bukan hanya programmer:
- Digital services (dev, design, marketing)
- Creative (photo, video, content)
- Professional (consulting, tutoring)
- Local services (event, beauty, handyman, dll)

---

## ✨ Core Features

### 🔹 Marketplace Core
- Client dapat membuat job/project
- Freelancer dapat submit bid/proposal
- Quota-based system (tanpa wajib subscribe untuk bidding)
- Contract lifecycle (basic)

### 🔹 Hyperlocal Discovery
- Cari freelancer berdasarkan lokasi (lat/lng + radius)
- Filter:
  - city
  - category
  - work mode (REMOTE / ONSITE / HYBRID)
- Support freelancer dengan service radius

### 🔹 Subscription & Quota
- Free tier:
  - max active bids
  - max active contracts
- Pro tier:
  - lebih banyak quota
  - fitur tambahan (future-ready)
- SubscriptionService membaca plan dari database

### 🔹 Auth & Security
- Cookie-based JWT session (`acme_session`), HS256 via `jose`
- **Production:** `apps/web/instrumentation.ts` requires `SESSION_SECRET` (min 16 chars; prefer 32+ random bytes)
- **CSRF:** double-submit cookie + `X-CSRF-Token` on mutations (see `server/security/csrf.ts`)
- **Rate limits:** in-memory sliding windows per IP/user on auth, public reads, discovery, and sensitive mutations (`apps/web/server/security/`)
- **Public discovery:** dedicated limits + light scrape heuristics on `GET /api/search/*` and `GET /api/jobs` (`public-discovery-guard.ts`)
- **HTTP headers:** baseline security headers + optional HSTS via `NEARWORK_ENABLE_HSTS=1` in `apps/web/next.config.ts`
- Middleware protection untuk route sensitif
- Role-based access: CLIENT, FREELANCER, ADMIN (+ staff roles untuk `/admin`)

### 🔹 Search
- Keyword search
- Filter category / city / work mode
- Pagination support

---

## 🧱 Tech Stack

### Frontend & App
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js Route Handlers (API)
- Service Layer Architecture
- Policy Layer (authorization rules)

### Database
- PostgreSQL
- Prisma ORM

### Auth
- JWT (jose)
- Cookie session

---

## 📁 Monorepo Structure
apps/
web/ # Main Next.js app
admin/ # (future) Admin panel
worker/ # (future) background jobs

packages/
database/ # Prisma schema + migrations
types/ # Shared types & enums
utils/ # Utilities
validators/ # Zod schemas
config/ # Constants & plan configs

docs/ # Product & architecture docs (see docs/DOCUMENTATION-MAINTENANCE.md when editing)


---

## 🧠 Architecture Overview

### Layered Architecture
Route (API)
↓
Service Layer
↓
Policy Layer (rules)
↓
Repository (Prisma)
↓
Database


### Key Principles
- ❌ No business logic in UI
- ❌ No business logic in route handlers
- ✅ Centralized policy & quota logic
- ✅ Clear separation of concerns

---

## 🔐 Authentication & Authorization

### Session
- Cookie: `acme_session`
- Contains:
  - userId
  - role
  - accountStatus

### Middleware
Melindungi route:
/client/*
/freelancer/*
/messages/*
/notifications/*
/settings/*


### Policy Layer
- `requireAuth()`
- `requireRole()`
- `requireActiveAccount()`

---

## 📊 Core Domain Models

- User
- FreelancerProfile
- ClientProfile
- Job
- Bid
- Contract
- SubscriptionPlan
- UserSubscription
- Review (partial)
- MessageThread / Message (partial)
- Notification (partial)

---

## ⚙️ Setup & Installation

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

```bash
cp packages/database/env.example.txt .env
```

Set at minimum `DATABASE_URL` and `SESSION_SECRET` (strong random; use `openssl rand -base64 32` in production).

### 3. Prisma client

```bash
pnpm db:generate
```

### 4. Migrations

```bash
pnpm db:migrate:deploy
```

Development iterations:

```bash
pnpm db:migrate
```

### 5. Run the app

```bash
pnpm dev
```

### Type checking

```bash
pnpm exec tsc --noEmit -p apps/web
```

### Common scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start` | Production start |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:migrate` | Dev migrations |
| `pnpm db:migrate:deploy` | Prod/CI migrations |
| `pnpm db:studio` | Prisma Studio |

---

## 🚧 Current status

### Implemented

- Auth (JWT cookie), CSRF on mutations, rate limits on sensitive routes
- Job creation & listing; public discovery with layered limits (`public-discovery-guard`)
- Bid submission + quota enforcement; subscription plan resolution
- Profile CRUD; search with validation caps
- Messaging, notifications, reviews, saved items, verification (maturity varies by area)
- NearWork UI tokens + compact marketing footer

### In progress / roadmap

- Full production billing provider
- Trust & safety reporting depth
- Broader package typecheck parity

### Production checklist

- Set `SESSION_SECRET` and `DATABASE_URL`
- Run `pnpm db:migrate:deploy`
- HTTPS + review `next.config.ts` security headers / optional `NEARWORK_ENABLE_HSTS`
- `pnpm exec tsc --noEmit -p apps/web`
- Smoke: register → login → create job → submit bid

---

## 📚 Documentation

Topic docs live in **`docs/`**. See **`docs/DOCUMENTATION-MAINTENANCE.md`** for which files to touch when you change security, UI, or APIs.

### Vercel (monorepo → `apps/web`)

**Commit `pnpm-lock.yaml`.** It must not be gitignored: without it, Turbo warns and Vercel can fall back to **npm** (~few dozen packages), which skips workspace linking and omits devDependencies your Next build needs (`tailwindcss`, Radix, etc.).

**Recommended project settings (fixes unstyled `/login` + `/_next/static` 307 on deploy)**

Use **Root Directory = `apps/web`** so Vercel treats the folder as a normal Next app (correct `/_next` routing). Do **not** set a custom **Output Directory** for Next.js — use the framework default (see [Vercel + Turborepo](https://vercel.com/docs/monorepos/turborepo)).

| Setting | Value |
|--------|--------|
| **Root Directory** | **`apps/web`** (recommended) |
| **Framework Preset** | Next.js |
| **Install Command** | **`cd ../.. && pnpm install`** (already in **`apps/web/vercel.json`**) |
| **Build Command** | **`cd ../.. && pnpm exec turbo run build --filter=@acme/web`** (same file) |
| **Output Directory** | *(empty — framework default)* |

If the Vercel project **Root Directory** is the **repository root** (default for many imports), the root **`vercel.json`** must include **`"outputDirectory": "apps/web/.next"`** so Vercel finds the Next build output (otherwise deploy fails: *Next.js output directory ".next" was not found*). Middleware skips **`/_next`** so static CSS/JS are not redirected. Prefer **Root Directory = `apps/web`** long-term: then clear **Output Directory** in the dashboard and rely on **`apps/web/vercel.json`** only.

**Prisma:** `@acme/database` runs **`postinstall`: `prisma generate`** — no DB connection required for generate.

**Environment variables:** **`DATABASE_URL`**, **`SESSION_SECRET`** (≥16 chars), **`NEXT_PUBLIC_*`** as needed. Never commit secrets.

**Registry errors (`ERR_INVALID_THIS` / `URLSearchParams`):** remove env **`ENABLE_EXPERIMENTAL_COREPACK`** from the Vercel project; keep **`engines.node`** as **`20.x`** in root `package.json`.
🎯 Roadmap
Phase 1 (Core Stabilization)
Fix typecheck
Complete job detail page
Middleware coverage
Phase 2 (User Experience)
Messaging
Notifications
Saved items
Reviews
Phase 3 (SaaS Features)
Subscription billing
Boosted listings
Analytics dashboard
Phase 4 (Advanced)
Smart matching (AI-based)
Realtime messaging
Escrow & payments
Admin moderation panel
🤝 Contributing

Internal project.
Follow rules:

keep logic in service layer
do not mix UI with business logic
use policy layer for rules
📄 License

Private / Internal use.


---

# 🔥 Tips biar README ini makin “kelas SaaS”

Kalau kamu mau naik level:

Tambahin nanti:
- 📸 screenshot UI
- 🎥 demo GIF
- 🌐 live demo link
- 🧾 API docs (Swagger/Postman)

---

Kalau kamu mau next step:
👉 aku bisa bantu bikin **README versi “startup-ready” (buat investor / landing repo)**  
👉 atau **docs folder lengkap (PRD, architecture, API spec, business rules)**
