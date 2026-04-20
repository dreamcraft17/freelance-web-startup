# NearWork Application Overview

> **Doc revision:** v7  
> Last synchronized: 2026-04-20 (navbar user-state + message unread signal).

Dokumen ini menjelaskan gambaran umum aplikasi NearWork: tujuan produk, area fitur, arsitektur singkat, dan peta route utama.

> Ringkasan “**produk ini apa**” untuk non-engineer: **`docs/apa-itu-nearwork.md`**.

## Update status (April 2026)

- **Navbar marketing (2026-04-20):** `MarketingShell` memakai bar navigasi produk—brand kiri (logo EN), pusat dibagi primary marketplace (Jobs, Freelancers) + secondary nav (How it works, Pricing, Help), utilitas/auth di kanan; indikator halaman aktif garis bawah brand; tanpa kotak logo.
- **State pengguna di navbar (2026-04-20):** guest menampilkan mode guest + CTA `Start hiring`; sesi login menampilkan mode signed-in, unread notifications, unread message-thread count (awaiting reply), dan CTA kontekstual per role.
- **Sinyal aktivitas (2026-04-18):** baris agregat ringan di landing dan halaman discovery (`/jobs`, `/freelancers`) memperkuat nuansa board hidup; navbar marketing menampilkan jumlah notifikasi belum dibaca yang konsisten dengan data.
- **Landing `/` (2026-04-18):** hero tanpa label bagian generik—mikro-copy “Live freelancer directory” di atas headline; stage putih, search sentral, *popular searches*, strip kategori ikon, preview ilustratif, use cases di band brand ringan; footer kompak berkolom.
- Public browse/discovery sekarang lebih kuat sebagai product tool (bukan landing template):
  - `/freelancers` dan `/jobs` menekankan scanability + actionable filters.
- Workspace client/freelancer sudah lebih simetris secara tujuan:
  - freelancer: profile, job search, proposal tracking,
  - client: post job, review proposals, hire decisions.
- Internal `/admin` tetap diposisikan sebagai workspace operasional (compact dan practical), dengan RBAC yang konsisten.

## Product Summary

NearWork adalah platform marketplace kerja freelance yang menghubungkan:

- **Client**: membuat job, menerima proposal, memilih freelancer, mengelola kontrak.
- **Freelancer**: membangun profil, mencari job, kirim proposal, berkomunikasi dengan client.

## Main Experience Areas

### Public (Browse-first)

Route publik tetap bisa diakses tanpa login:

- `/` (landing / marketing)
- `/jobs` dan detail job publik
- `/freelancers` (browse talent + filter)
- `/pricing`

Prinsip UX:

- User bisa eksplor dulu.
- Login/register hanya diminta saat aksi protected (save, post, bid, message, dll).

### Auth Pages

- `/login`
- `/register`
- `/forgot-password`

Auth flow mendukung intent-aware redirect agar user kembali ke tujuan awal setelah login/register.

### Protected Workspace

Memerlukan session valid:

- `/client/*`
- `/freelancer/*`
- `/messages/*`
- `/notifications/*`
- `/settings/*`

## Core Feature Modules

- **Dashboard Shell**: layout bersama untuk area authenticated (sidebar, top area, account actions).
- **Client Workspace**: dashboard, jobs, new job posting, nearby talent.
- **Freelancer Workspace**: dashboard, profile, proposals, nearby jobs/talent.
- **Messaging**: dua panel (thread list + conversation).
- **Notifications**: pusat notifikasi dengan read/unread state.
- **Settings**: account, profile, saved lists, preferences, support.
- **Auth-aware CTA**: tombol publik yang tahu kapan harus lanjut langsung vs redirect ke login/register.

## Tech Stack (High Level)

- **Framework**: Next.js (App Router)
- **UI**: React + Tailwind CSS
- **Data Access**: Prisma
- **Validation**: Zod
- **Auth Session**: JWT session cookie (`acme_session`)
- **Route Protection**: Next.js middleware + session verification

## Request Flow (Simplified)

1. User mengakses route.
2. Middleware memeriksa apakah route protected.
3. Jika protected, middleware validasi session dari cookie.
4. Jika valid -> lanjut ke halaman.
5. Jika tidak valid -> redirect ke login dengan `returnUrl`.

## Role Default Home

- `CLIENT` -> `/client`
- `FREELANCER` -> `/freelancer`
- Admin-like roles -> `/settings`

## Important Docs

- Auth persistence: `docs/auth-session-persistence.md`
- Roles & permissions: `docs/roles-and-permissions.md`
- Geo matching: `docs/geo-matching.md`
- Apps structure: `docs/apps-structure.md`

## Notes for Development

- Gunakan pola komponen reusable untuk UI dashboard.
- Hindari membuat sistem auth kedua di sisi client.
- Pertahankan satu source of truth session melalui helper di `src/lib/session.ts`.
- Untuk fitur publik, utamakan browse-first UX.

