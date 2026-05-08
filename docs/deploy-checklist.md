# Production deploy checklist (web + database)

> **Doc revision:** v3  
> Last synchronized: 2026-05-09 (fallback `web/.next` + runtime fix `next` root dependency).

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

### Catatan Vercel monorepo (hindari ENOENT `web/.next/routes-manifest.json`)

- Repo ini menyimpan fallback di `vercel.json` root: setelah build `@acme/web`, artefak `.next` disalin ke `web/.next`.
- Tujuan fallback: deployment tetap lolos walau project setting Vercel masih menunjuk output lama `web/.next`.
- Dependency runtime `next` dipasang di `package.json` root (bukan hanya devDependency) agar launcher fungsi di `/var/task/web/___next_launcher.cjs` bisa resolve `next/dist/compiled/next-server/server.runtime.prod.js`.
- Tetap direkomendasikan merapikan setting dashboard nanti (Root Directory / Output Directory) saat memungkinkan.

## Optional: seed untuk E2E atau admin dev di staging saja

- [ ] **`pnpm db:seed`** — hanya di lingkungan **non-produksi** yang memang membutuhkan akun admin hasil seed (lihat `packages/database/README.md`). **Jangan** menjalankan seed default ke produksi tanpa review keamanan.

## Tambahan yang sering dilupakan

- Variabel aplikasi lain yang dipakai fitur aktual (mis. kunci translasi server-only) sesuai `README.md` / `audit.md`.
- Review `NEXT_PUBLIC_*` tidak membocorkan rahasia.

