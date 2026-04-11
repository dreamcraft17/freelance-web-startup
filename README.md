# 🚀 Freelance-Web — Hyperlocal Freelance SaaS Platform

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
- Cookie-based JWT session (`acme_session`)
- Middleware protection untuk route sensitif
- Role-based access:
  - CLIENT
  - FREELANCER
  - ADMIN

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

docs/ # Product & architecture docs


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
2. Setup environment variables

Copy example:

cp packages/database/env.example.txt .env

Isi:

DATABASE_URL=postgresql://...
SESSION_SECRET=your_super_secret_key
3. Generate Prisma client
pnpm db:generate
4. Run migrations
pnpm db:migrate:deploy

Untuk development:

pnpm db:migrate
5. Run development server
pnpm dev
🧪 Type Checking
pnpm exec tsc --noEmit
🔄 Available Scripts
pnpm dev                  # run app
pnpm build                # build
pnpm start                # production start

pnpm db:generate          # prisma generate
pnpm db:migrate           # dev migration
pnpm db:migrate:deploy    # prod migration
pnpm db:studio            # prisma studio
```

🚧 Current Status
✅ Implemented
Auth (JWT cookie)
Job creation & listing
Bid submission + quota enforcement
Subscription plan resolution
Profile CRUD
Search (basic filters)
UI connected to real data
⚠️ In Progress / TODO
Messaging system
Notifications
Review & rating
Verification system
Saved jobs / freelancers
Category & skill API
Payment / billing integration
Job detail page refinement
Full typecheck cleanup
⚠️ Production Checklist

Before deploying:

 Set SESSION_SECRET
 Set DATABASE_URL
 Run pnpm db:migrate:deploy
 Ensure HTTPS (cookie security)
 Remove any dev-only fallbacks
 Fix TypeScript errors
 Test end-to-end flow:
register → login → create job → submit bid

### Vercel (monorepo)

The app lives in **`apps/web`**. The repo root **`vercel.json`** tells Vercel to use **Next.js**, install with **pnpm** from the monorepo root, run **`turbo run build --filter=@acme/web`**, and take output from **`apps/web/.next`**. Root **`package.json`** includes **`next`** in `devDependencies` so Vercel’s framework detector sees a Next version while the real app stays in `apps/web`.

**Project env (Vercel → Settings → Environment Variables):** set at least **`DATABASE_URL`** (for serverless/runtime if used), **`SESSION_SECRET`** (≥16 characters), and any **`NEXT_PUBLIC_*`** you need. **`pnpm install`** runs **`prisma generate`** via `@acme/database` `postinstall` (no live DB required for generate).

**Alternative:** instead of the root `vercel.json` layout, you can set **Root Directory** to **`apps/web`** in the Vercel project and use an **Install Command** like `cd ../.. && corepack enable pnpm && pnpm install` so `workspace:*` resolves from the monorepo root.
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
