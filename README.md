# 🚀 Freelance-Web — Hyperlocal Freelance SaaS Platform

> **Doc revision:** v64  
> Last synchronized: 2026-05-01 — `/jobs` redesigned into 3-column job board tool (sticky search, filter/list/insight layout, urgency cues, apply-first actions).

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

### 🔹 Locale / i18n (apps/web)

- Kamus JSON: `apps/web/locales/en.json`, `apps/web/locales/id.json`.
- Preferensi: cookie **`lang`** (`en` \| `id`); API: `POST /api/locale` dengan body JSON `{ "locale": "en" | "id" }`.
- Provider: `I18nProvider` di root layout; server helpers: `getAppLocale()`, `getServerTranslator()`.
- SEO routes: `app/[locale]` untuk halaman publik (`/en/*`, `/id/*`) dengan metadata per-locale + `alternates.languages` (`en`, `id`, `x-default`).
- Cakupan terbaru: halaman detail job (`/jobs/[jobId]`), legal (`/terms`, `/privacy`), forbidden, dan nearby search sudah membaca kamus EN/ID.
- **UGC translation (jobs only):** saat job dibuat, server mendeteksi bahasa (`id`/`en`) lalu menyimpan teks asli + terjemahan cache (`titleId`, `titleEn`, `descriptionId`, `descriptionEn`, `language`) agar render per-locale tidak memanggil API setiap request.
- Integrasi translate berjalan **server-side only** via `GOOGLE_TRANSLATE_API_KEY` (jangan expose ke frontend).
- Homepage publik (`/[locale]`) sekarang memakai metadata SEO yang lebih kuat per bahasa (title + description keyword-intent), serta copy produk yang lebih operasional untuk angle local freelancer + remote freelancer.
- Homepage publik menambahkan lapisan marketplace yang lebih aktif: category browse lane horizontal di bawah search, hero trust cues + quick browse link, dan listing preview row-style dengan atribut operasional (harga, lokasi, tags, action links) agar entry ke discovery lebih terasa seperti produk live.
- Refinement terbaru menambah activity signals ringan di row preview, merapikan alignment data untuk compare cepat, mempertegas category lane sebagai navigasi, dan menambah cue urgensi operasional di hero tanpa elemen dekoratif berlebih.
- Pass lanjutan memperkuat confidence memilih: tiap row punya alasan pemilihan singkat, top rows diberi penekanan ringan, CTA utama per-row dibuat lebih tegas daripada aksi sekunder, dan harga dilengkapi konteks value.
- Upgrade struktur terbaru memecah layout hero menjadi komposisi asimetris, menambahkan mini visual board fungsional, mengubah kategori ke grid entry points berbasis ikon, dan menambah thumbnail-style anchors di listing agar eksplorasi terasa lebih aktif.
- Ditambahkan juga activity strip kompak di bawah hero untuk menampilkan sinyal live + shortcut eksplorasi (trending lanes, nearby/remote filters, active briefs) agar user langsung punya langkah berikutnya.
- Panel metrik publik di hero dan angka sistem mentah di strip aktivitas kini dihapus agar landing tetap fokus pada aksi pengguna (search, browse, choose, open listings), bukan analytics internal.
- Iterasi terbaru menambah mode switch `hire/work`, quick filters search (nearby/remote/budget), dan CTA hierarchy yang lebih tegas (satu primary action per mode) agar user lebih cepat masuk ke aksi.
- Mode `hire/work` kini juga persist di URL (`?intent=hire|work`) agar state tetap konsisten saat refresh/share link, sekaligus menjaga sinkronisasi mode switch dan CTA tanpa flicker client-state.
- Perilaku bahasa publik kini default ke Indonesia (`id`) untuk pengunjung baru; preferensi yang sudah dipilih user tetap dihormati melalui cookie `lang`, dan redirect locale dilakukan server-side untuk menghindari flicker.
- Refinement terbaru: routing locale publik sekarang memakai urutan URL locale -> cookie preferensi -> fallback `id`; `Accept-Language` tidak lagi dipakai untuk override default first-visit behavior.
- Form login kini punya feedback loading yang lebih jelas (overlay + indikator proses + lock interaksi) agar user tahu sistem sedang memproses saat klik masuk.
- Pola overlay loading auth juga diekstrak ke komponen reusable agar mudah diterapkan ke register/forgot-password tanpa duplikasi.
- Flow register dan forgot-password kini memakai pola submit overlay yang sama (fullscreen dim + centered status + disabled controls + anti double-submit) dengan copy loading terlokalisasi per halaman.
- Konsistensi i18n auth diperketat: seluruh teks user-facing pada login/register/forgot-password kini dibaca dari kamus locale (`en`/`id`), termasuk label form, helper copy, role descriptions, dan pesan error register.
- Halaman publik `/freelancers` kini dipoles sebagai directory yang lebih decision-oriented: hasil ditata dalam row comparison layout, rate context (`starting at`) lebih tegas, sinyal pilih cepat (nearby/available/popular/top-rated) ditampilkan ringkas, dan CTA utama per hasil dipusatkan ke `View profile`.
- Refinement lanjutan menekankan alasan pemilihan nyata per freelancer (`why choose this`) berbasis data (review strength, volume hire proxy, nearby fit, budget fit), menambah hierarchy subtle untuk top matches (`Best match` / `Recommended`), serta menaikkan visibilitas rating agar keputusan user lebih percaya diri.
- Halaman publik detail freelancer (`/freelancers/[username]`) kini ditata ulang menjadi conversion surface: top summary menonjolkan trust + pricing + availability, section `why choose this` berbasis data nyata, skills/reviews dipindah ke struktur keputusan, dan CTA utama difokuskan ke aksi kontak.
- Penyesuaian lanjutan mengurangi nuansa “social profile”: handle/identity visual sekunder dihapus dari hero, label sumber review dibuat netral untuk konteks proyek terverifikasi, dan aksi “save” tidak lagi mengganggu jalur keputusan utama client.
- Final language pass memperkuat tone evaluasi hiring: label section di profile detail kini berfokus ke kerja (`Work summary`, `Service scope`, `Relevant experience`), bukan terminologi profile personal.
- Refinement CTA final: aksi utama profile freelancer diperjelas menjadi `Start discussion`, ditopang reassurance copy (“diskusi dulu sebelum komitmen”) dan panel aksi sticky di desktop agar jalur konversi tetap terlihat tanpa scroll panjang.
- Halaman publik `/jobs` kini dipoles sebagai job board yang lebih decision-first: filter budget + recency ditambahkan, row hasil menampilkan signal `why apply`, waktu posting, kategori kerja, confidence line proposal-context, dan CTA utama `View job` yang lebih tegas untuk alur scan -> compare -> apply.
- Halaman detail job (`/jobs/[jobId]`) kini menampilkan top decision section yang lebih konversi-oriented untuk freelancer: budget/lokasi/mode/posting time + sinyal “worth applying”, panel CTA `Send proposal` yang terlihat di atas (sticky desktop), dan reassurance bahwa proposal memulai diskusi tanpa komitmen instan.
- Panel `Send proposal` untuk freelancer login sekarang ditingkatkan dari CTA-only menjadi form terstruktur ringan (intro, pendekatan, timeline/ketersediaan, harga, estimasi hari) dengan placeholder guidance dan loading overlay saat submit agar proses apply lebih jelas dan minim ragu.
- Form proposal tersebut kini punya autosave draft lokal berbasis `jobId + userId` (tanpa perubahan backend/API), memulihkan teks saat user kembali ke halaman, dan menghapus draft otomatis setelah submit sukses.
- Setelah proposal terkirim, UX sekarang memberi next-step yang jelas ke percakapan kerja; bila thread job tersedia, user bisa langsung membuka `Open conversation` dan melihat konteks job/proposal di halaman `Messages`.
- Jalur handoff tersebut kini menyertakan query `from=proposal`; halaman `Messages` menampilkan banner konteks singkat saat dibuka lewat jalur ini, lalu query dapat dibersihkan saat banner ditutup.
- Untuk sisi client, dashboard + jobs list kini mempertegas sinyal proposal masuk per job dan owner job detail menambahkan ringkasan tindakan agar alur “ada proposal baru -> review -> chat -> shortlist/accept” lebih langsung.
- Halaman `/client/jobs` sekarang punya quick filter `Needs review` agar client bisa langsung fokus ke job yang butuh tindakan hari ini, lengkap dengan empty state khusus saat belum ada item review.
- UX notifikasi dipoles agar aktivitas penting (proposal masuk, pesan baru, bid accepted, update kontrak) lebih mudah dipindai dan selalu punya tujuan aksi yang jelas; dashboard role juga menampilkan cue perhatian yang lebih eksplisit.
- Halaman notifikasi kini menyediakan filter kategori ringan (`All`, `Proposals`, `Messages`, `Contracts`) di sisi client untuk membantu triage cepat tanpa perubahan API/backend.
- Setiap chip kategori notifikasi sekarang menampilkan jumlah item berdasarkan data yang sudah dimuat (tanpa request tambahan) untuk membantu scanning volume aktivitas lebih cepat.
- Alur inti kini punya feedback langkah-lanjut lebih jelas: setelah posting job owner melihat konfirmasi + next action, dan saat membuka conversation dari review proposal, Messages menampilkan banner konteks agar transisi job -> chat tidak terasa putus.
- Redirect pasca-sukses utama kini dipacing singkat (~400ms) agar transisi terasa lebih halus: publish job dan submit proposal tidak lagi terasa “langsung lompat”.
- Empty state `/jobs` kini lebih actionable saat belum ada lowongan: headline aksi jelas, CTA prioritas, contoh use case posting, dan arahan berbasis role agar user tahu langkah berikutnya.
- Homepage publik diperbarui agar lebih “live”: search jadi fokus utama, indikator aktivitas marketplace tampil ringkas, kategori menjadi grid card klik-besar, dan preview listing dipisah menjadi rail `Active freelancers` + `Recent jobs` yang ringan.
- Micro-pass hero menajamkan keputusan 3 detik pertama: mode `hire/work` lebih langsung terbaca, CTA utama lebih menonjol, dan elemen teks kecil yang tidak kritikal dikurangi.
- Refinement lanjutan memperkuat conversion cues: satu activity bar yang lebih bersih, kategori dengan contoh use-case nyata, sinyal urgency halus di preview rows, serta final CTA yang lebih action-oriented.
- Pass energi marketplace terbaru menajamkan wording outcome-driven dan menjaga bukti aktivitas tetap jujur (tanpa angka palsu), sehingga halaman terasa aktif namun tetap product-first.
- Refinement copywriting terbaru menambahkan proof lines langsung di bawah search + placeholder contoh layanan yang lebih konkret untuk mempercepat orientasi user.
- Brand voice terbaru menyelaraskan copy homepage + surface publik kunci ke positioning NearWork sebagai **structured freelance marketplace**: alur job -> proposal -> discussion dibuat lebih eksplisit, trust line dipertegas (`All proposals and chats stay tied to the job`), CTA publik dipraktiskan (`Find freelancers`, `Post a job`, `Start discussion`), dan microcopy empty/reassurance dipangkas agar langsung actionable.
- Hero homepage kini didesain ulang ke split layout yang lebih “live marketplace”: copy + CTA + search premium di kiri dan visual scenario slider di kanan (scene kerja nyata berbasis aset lokal ringan), plus activity line human-readable dengan fallback aman saat metrik rendah agar tidak memberi kesan platform sepi.
- Micro-pass terbaru menjaga struktur hero tetap sama namun memoles ritme visual: spacing lebih lapang di desktop, stack mobile lebih rapi, trust/activity line lebih sekunder, input search lebih nyaman dipakai, dan slider controls/overlay dibuat lebih halus agar tidak terasa dekoratif.
- Iterasi final hero menghapus komponen slider sepenuhnya untuk fokus produk yang lebih cepat: area kanan sekarang menjadi panel marketplace ringan berisi sinyal aktivitas nyata/fallback aman + sample rows struktural, tanpa menambah fitur dekoratif.
- Safety pass lanjutan: panel marketplace kini menampilkan baris aktivitas dari data nyata saat tersedia; jika tidak ada data, panel menandai **Example activity** dan menampilkan copy fallback netral (tanpa identitas pengguna fiktif).
- Trust pass final: panel tidak lagi menampilkan sample people/rows saat data kosong; hanya row real berbasis data listing yang dirender, atau fallback copy aman jika data belum tersedia.
- Refinement `/freelancers` terbaru mengurangi kesan “dead empty marketplace”: headline dibuat lebih outcome-driven, quick chips ditambahkan di atas list, empty state diperkecil dan diarahkan ke aksi, skeleton rows ditampilkan saat hasil kosong, serta panel CTA sidebar disederhanakan fokus ke `Complete profile`.
- Pass lanjutan `/freelancers` memoles kualitas marketplace list: setiap row menonjolkan role + 1-line value statement + trust/rating + location/work mode + starting price + signals keputusan, CTA tetap satu (`View profile`), dan mode kosong kini menampilkan `Example freelancers` agar user tetap memahami struktur perbandingan sebelum data masuk.
- Redesign terbaru `/freelancers` menggeser halaman menjadi tool hiring cepat: search bar dominan + quick tags, filter kiri yang ringkas/collapsible, list kandidat tengah dengan hierarchy keputusan (`Nama > Harga > Status > Rating`), panel kanan live insights, CTA utama `Chat`, serta section `Job terbaru dari klien` di bawah listing untuk menjaga continuity aksi.
- Redesign terbaru `/jobs` mengubah halaman lowongan menjadi board operasional: search bar dominan + quick tags, struktur 3 kolom (filter kiri, list tengah, insight kanan), row lowongan berorientasi scan cepat (judul/client/lokasi/budget/waktu + badge urgensi), dan CTA utama `Apply` dengan `Lihat detail` sebagai aksi sekunder.
- Audit struktur repository terbaru menstandarkan `apps/web` ke pola root-level (`app`, `components`, `features`, `lib`, `server`, `locales`, `public`) tanpa source runtime di `apps/web/src`; alias `@src/*` dipertahankan sementara sebagai compatibility alias ke root path agar import lama tidak memecah build.
- Landing homepage publik terbaru kini mengikuti pendekatan visual mockup SaaS modern: hero dua kolom dengan lavender accent halus, search card penuh, sidebar right-signal cards, kategori + live preview lebih compact, CTA bawah premium, serta navbar/footer yang lebih bersih.

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

### `apps/web` convention

- Root-level Next.js App Router structure is the standard for this repo.
- Keep runtime code in:
  - `apps/web/app`
  - `apps/web/components`
  - `apps/web/features`
  - `apps/web/lib`
  - `apps/web/server`
- Do not add a parallel `apps/web/src` runtime tree.


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

- **Apa produk ini (non-teknis)?** → [`docs/apa-itu-nearwork.md`](docs/apa-itu-nearwork.md)

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
