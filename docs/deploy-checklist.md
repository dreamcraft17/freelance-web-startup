# Production deploy checklist (web + database)

> **Doc revision:** v9  
> Last synchronized: 2026-05-16 (`lucide-react` **tidak** di `serverExternalPackages` — konflik `transpilePackages` Next 15; troubleshooting chunk `lucide` = `dev:fresh`).

Checklist singkat sebelum merilis NearWork ke lingkungan produksi. Sesuaikan penyedia hosting (mis. Vercel) dengan variabel yang sama di dashboard mereka.

## Secrets & connection

- [ ] **`DATABASE_URL`** — string koneksi Postgres produksi (SSL sesuai penyedia). **Jangan** menjalankan harness `pnpm test:e2e` atau skrip HTTP `scripts/e2e-marketplace-flow.mjs` dengan URL ini—gunakan DB sekali pakai / lokal.
- [ ] **`SESSION_SECRET`** — rahasia acak kuat untuk sesi; jangan reuse dari dev.
- [ ] **`NEARWORK_SUPPORT_EMAIL`** (disarankan) — alamat inbox dukungan untuk halaman `/help` (server-only). Tanpa ini, halaman menampilkan CTA ke Early access.
- [ ] **Listing otomatis / E2E di marketplace publik** — di Vercel (`VERCEL=1`), job & profil yang cocok pola automation (mis. judul berisi `E2E integration`, `Playwright`, username `pw_`) disembunyikan dari board publik dan agregat marketing. Untuk debug: `NEARWORK_SHOW_SYNTHETIC_PUBLIC_LISTINGS=1`. Paksa sembunyikan di lokal: `NEARWORK_HIDE_SYNTHETIC_PUBLIC_LISTINGS=1`.

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

Setelah mengganti dependensi atau jika beberapa route mengembalikan **500** dan log menunjukkan `Cannot find module './vendor-chunks/jose@…'` / **`vendor-chunks/lucide-react@…`** (atau chunk serupa), hapus cache lalu jalankan ulang dev: `pnpm --filter @acme/web clean && pnpm --filter @acme/web dev` (atau `dev:fresh`). **`jose`**, **`clsx`**, **`tailwind-merge`** ada di **`serverExternalPackages`** agar tidak di-bundle rapuh; **`lucide-react`** tidak bisa di-externalize di Next 15 (konflik transpile) — untuk error lucide, **bersihkan `.next`**; bila masih ganggu, restart dev setelah clean.

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

- [ ] Gunakan DB terpisah untuk pengujian otomatis: set **`DATABASE_URL_TEST`** (disarankan) — `pnpm test:e2e` memetakan nilai ini ke `DATABASE_URL` untuk build + server. Tanpa itu, pastikan `DATABASE_URL` eksplisit ke DB throwaway saat menjalankan harness; **jangan** menempatkan data tes HTTP E2E pada database staging publik yang dipakai pengunjung.
- [ ] Jalankan unit + e2e smoke sebelum release:
  - `pnpm test:unit`
  - `pnpm test:e2e` (app harus berjalan; skrip memanggil `GET /api/auth/csrf` + header `X-CSRF-Token` per mutasi; **`pnpm db:seed`** di DB test agar ada kategori untuk pembuatan job)

## Tambahan yang sering dilupakan

- Variabel aplikasi lain yang dipakai fitur aktual (mis. kunci translasi server-only) sesuai `README.md` / `audit.md`.
- Review `NEXT_PUBLIC_*` tidak membocorkan rahasia.

