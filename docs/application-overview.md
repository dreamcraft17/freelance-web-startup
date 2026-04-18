# NearWork Application Overview

> **Doc revision:** v1  
> Last synchronized: 2026-04-18 (post-accept handoff update applied across product and docs).

Dokumen ini menjelaskan gambaran umum aplikasi NearWork: tujuan produk, area fitur, arsitektur singkat, dan peta route utama.

## Update status (April 2026)

- **Landing `/` (2026-04-18):** alur marketplace — hero stage putih, search sentral, *popular searches*, strip kategori ikon, preview baris ilustratif, use cases di band brand sangat ringan; footer kompak berkolom.
- Public browse/discovery sekarang lebih kuat sebagai product tool (bukan landing template):
  - `/freelancers` dan `/jobs` menekankan scanability + actionable filters.
- Workspace client/freelancer sudah lebih simetris secara tujuan:
  - freelancer: profile, job search, proposal tracking,
  - client: post job, review bids, hire decisions.
- Internal `/admin` tetap diposisikan sebagai workspace operasional (compact dan practical), dengan RBAC yang konsisten.

## Product Summary

NearWork adalah platform marketplace kerja freelance yang menghubungkan:

- **Client**: membuat job, menerima bid, memilih freelancer, mengelola kontrak.
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

