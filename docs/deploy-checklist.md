# Production deploy checklist (web + database)

> **Doc revision:** v5  
> Last synchronized: 2026-05-09 (troubleshooting: bersihkan `apps/web/.next` + build ulang jika dev/API mengembalikan 500 dengan `Cannot find module './vendor-chunks/jose@…'`).

Checklist singkat sebelum merilis NearWork ke lingkungan produksi. Sesuaikan penyedia hosting (mis. Vercel) dengan variabel yang sama di dashboard mereka.

## Secrets & connection

- [ ] **`DATABASE_URL`** — string koneksi Postgres produksi (SSL sesuai penyedia).
- [ ] **`SESSION_SECRET`** — rahasia acak kuat untuk sesi; jangan reuse dari dev.

## Install & Prisma

- [ ] `pnpm install` (repo root).
- [ ] `pnpm db:migrate:deploy` — terapkan migrasi ke DB produksi.
- [ ] `pnpm db:generate` — pastikan client Prisma/generated types selaras (juga dipicu `postinstall` jika sudah dikonfigurasi).

## Web app quality gate

Dari root monorepo:

- [ ] `pnpm --filter @acme/web typecheck`
- [ ] `pnpm --filter @acme/web lint`
- [ ] `pnpm --filter @acme/web build`

> Skrip `build` web sudah menjalankan `prisma generate` lewat filter database; tetap jalankan `db:generate`/`migrate:deploy` di pipeline deploy Anda agar urutan konsisten dengan DB yang dipakai runtime.

### Dev / CI: artefak `.next` tidak selaras

Setelah mengganti dependensi atau jika beberapa route API mengembalikan **500 halaman HTML** (bukan JSON) dan log menunjukkan `Cannot find module './vendor-chunks/jose@…'`, hapus cache build lalu bangun ulang: `rm -rf apps/web/.next && pnpm --filter @acme/web build`. Untuk **`pnpm test:e2e`**, jalankan terhadap server yang memakai artefak segar (dev dimulai ulang setelah clean build, atau `next start` setelah `build`).

## Vercel monorepo settings (pilih salah satu)

### Option A (recommended)

- **Root Directory:** `apps/web`
- **Install Command:** `cd ../.. && pnpm install`
- **Build Command:** `cd ../.. && pnpm exec turbo run build --filter=@acme/web`
- **Output Directory:** kosong (default Next.js) atau `.next`

### Option B

- **Root Directory:** repository root
- **Install Command:** `pnpm install`
- **Build Command:** `pnpm exec turbo run build --filter=@acme/web`
- **Output Directory:** `apps/web/.next`

### Important

- Jangan campur **Root Directory = `apps/web`** dengan **Output Directory = `apps/web/.next`** karena bisa membuat artifact lookup salah path.

## Optional: seed untuk E2E atau admin dev di staging saja

- [ ] **`pnpm db:seed`** — hanya di lingkungan **non-produksi** yang memang membutuhkan akun admin hasil seed (lihat `packages/database/README.md`). **Jangan** menjalankan seed default ke produksi tanpa review keamanan.

## CI / test DB guidance

- [ ] Gunakan DB terpisah untuk pengujian otomatis:
  - `TEST_DATABASE_URL=<isolated_test_db>`
  - jalankan test dengan `DATABASE_URL=$TEST_DATABASE_URL`
- [ ] Jalankan unit + e2e smoke sebelum release:
  - `pnpm test:unit`
  - `pnpm test:e2e` (app harus berjalan; skrip memanggil `GET /api/auth/csrf` + header `X-CSRF-Token` per mutasi; **`pnpm db:seed`** di DB test agar ada kategori untuk pembuatan job)

## Tambahan yang sering dilupakan

- Variabel aplikasi lain yang dipakai fitur aktual (mis. kunci translasi server-only) sesuai `README.md` / `audit.md`.
- Review `NEXT_PUBLIC_*` tidak membocorkan rahasia.

