# NearWork Security Audit

Tanggal audit: 2026-07-08  
Scope: audit statis source/config lokal pada folder `nextwork`  
Auditor: Codex

## Ringkasan Eksekutif

Secara umum, fondasi keamanan aplikasi sudah cukup baik pada area auth dan akses internal:

- Password user memakai `bcrypt` cost 12.
- Session memakai signed JWT di cookie `HttpOnly`, `SameSite=Lax`.
- Mutasi API mayoritas sudah memakai CSRF double-submit.
- Admin page dan API memiliki guard role/staff.
- Validasi input terpusat memakai Zod pada banyak endpoint.
- Tidak ditemukan penggunaan `dangerouslySetInnerHTML`, `eval`, `new Function`, atau raw SQL unsafe pada source yang dicek.

Namun ada beberapa risiko serius yang perlu segera ditangani, terutama file credential di folder publik, validasi webhook pembayaran, dan seed credential default.

## Temuan Critical

### 1. File credential/recovery berada di folder publik Next.js

Lokasi:

- `apps/web/public/logo/ford_credentials.csv`
- `apps/web/public/logo/ford_credentials (1).csv`
- `apps/web/public/logo/ford_credentials (2).csv`
- `apps/web/public/logo/titan_credentials.csv`
- `apps/web/public/logo/github-recovery-codes.txt`

Referensi:

- `apps/web/public/logo`
- `.gitignore:27`

Status git:

- File-file tersebut tidak terlacak git karena pola `.gitignore` sudah memblokir `*credentials*.csv` dan `github-recovery-codes.txt`.

Dampak:

- Walaupun tidak terlacak git, file yang berada di `apps/web/public/` tetap dapat tersaji oleh Next.js jika ikut masuk artifact deploy.
- Potensi URL publik: `/logo/ford_credentials.csv`, `/logo/titan_credentials.csv`, dan `/logo/github-recovery-codes.txt`.
- Jika isinya credential/recovery code nyata, akun terkait harus dianggap kompromi.

Rekomendasi:

- Hapus file credential/recovery dari `apps/web/public/`.
- Pastikan pipeline deploy tidak mengemas file ignored/local sensitive.
- Rotate semua credential/recovery code yang pernah berada di folder publik.
- Tambahkan pemeriksaan CI/predeploy untuk menolak file dengan pola credential di `public/`.

Prioritas: segera.

### 2. Midtrans webhook menerima payload tanpa signature

Lokasi:

- `apps/web/server/services/midtrans-payment.service.ts:152`
- `apps/web/server/services/midtrans-payment.service.ts:170`

Masalah:

Kode hanya memverifikasi `signature_key` jika field tersebut ada:

```ts
if (body.signature_key) {
  // verify signature
}
```

Jika attacker mengirim payload tanpa `signature_key`, flow tetap lanjut ke pencarian `paymentIntent` dan dapat memproses status `settlement` atau `capture`.

Dampak:

- Payment/escrow contract dapat ditandai berhasil tanpa notifikasi valid dari Midtrans, selama attacker mengetahui atau menebak `order_id` aktif.
- Risiko manipulasi status kontrak dan escrow.

Rekomendasi:

- Wajibkan `MIDTRANS_SERVER_KEY` tersedia saat menerima notification.
- Wajibkan `body.signature_key` ada.
- Gunakan `timingSafeEqual` untuk membandingkan signature.
- Validasi juga `gross_amount`, `order_id`, dan status terhadap data `PaymentIntent` lokal.
- Pertimbangkan allow-list status Midtrans eksplisit dan audit log untuk semua webhook rejected.

Prioritas: segera.

## Temuan High

### 3. Verifikasi Stripe webhook memakai algoritma yang salah

Lokasi:

- `apps/web/server/services/stripe-payment.service.ts:218`

Masalah:

Stripe signature seharusnya diverifikasi dengan HMAC-SHA256 atas `timestamp.payload`. Kode saat ini memakai plain hash:

```ts
createHash("sha256").update(`${signed}${secret}`).digest("hex")
```

Dampak:

- Webhook Stripe valid kemungkinan ditolak.
- Payment state dapat tidak sinkron: pembayaran berhasil di Stripe tetapi contract/escrow tidak ter-update.
- Fallback compare `sig === expected` juga tidak ideal untuk secret-dependent comparison.

Rekomendasi:

- Pakai official Stripe SDK `stripe.webhooks.constructEvent`.
- Jika tidak memakai SDK, gunakan `createHmac("sha256", webhookSecret).update(signedPayload).digest("hex")`.
- Validasi timestamp tolerance untuk mencegah replay.
- Simpan event id untuk idempotency seperti sekarang, tetapi hanya setelah signature valid.

Prioritas: tinggi.

### 4. Seed membuat admin default dan mencetak password E2E

Lokasi:

- `packages/database/prisma/seed.ts:129`
- `packages/database/prisma/seed.ts:131`
- `packages/database/prisma/seed.ts:313`

Masalah:

Seed memakai default:

- Email admin: `admin@nearwork.local`
- Password admin: `NearWorkAdminDev123!`

Seed juga mencetak password fixture E2E ke stdout.

Dampak:

- Jika seed pernah dijalankan terhadap staging/prod, admin default menjadi credential yang mudah ditebak.
- Log CI atau deployment dapat menyimpan password fixture.

Rekomendasi:

- Untuk production/staging publik, wajibkan `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` eksplisit.
- Tambahkan guard agar seed admin default hanya boleh di local/test environment.
- Jangan cetak password ke log.
- Pisahkan seed taxonomy dan seed user fixture.
- Pastikan akun hasil seed default tidak ada di database staging/prod.

Prioritas: tinggi.

## Temuan Medium

### 5. Rate limiter masih in-memory dan bergantung pada header IP

Lokasi:

- `apps/web/server/security/sliding-window-limiter.ts:5`
- `apps/web/server/security/client-ip.ts:5`

Masalah:

Rate limiter memakai `Map` in-memory per proses. IP client diambil dari `x-forwarded-for`, `x-real-ip`, atau `cf-connecting-ip`.

Dampak:

- Pada serverless/multi-instance, limit tidak konsisten antar instance.
- Header IP dapat dipalsukan jika app tidak berada di balik trusted proxy yang membersihkan header.
- Login/register/search scraping throttling menjadi lebih mudah dibypass.

Rekomendasi:

- Pindahkan limiter ke Redis/KV/shared store.
- Hanya percaya proxy headers dari platform/trusted edge.
- Untuk auth, gabungkan limit per IP, per email, dan per account.
- Monitor rate-limit hit dan failed login.

Prioritas: menengah.

### 6. Security headers belum mencakup CSP, HSTS opsional

Lokasi:

- `apps/web/next.config.ts:16`

Kondisi saat ini:

- Sudah ada `X-DNS-Prefetch-Control`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`.
- `Strict-Transport-Security` hanya aktif jika `NEARWORK_ENABLE_HSTS=1`.
- Belum ada Content-Security-Policy.

Dampak:

- Tanpa CSP, dampak XSS yang lolos dari React/validasi akan lebih besar.
- Jika HSTS tidak aktif di produksi, browser tidak dipaksa memakai HTTPS untuk kunjungan berikutnya.

Rekomendasi:

- Aktifkan HSTS untuk domain produksi setelah yakin HTTPS stabil.
- Tambahkan CSP bertahap, mulai dari `default-src 'self'`, lalu audit kebutuhan script/style/image/connect.
- Pertimbangkan `report-uri` atau `report-to` untuk mode report-only sebelum enforce.

Prioritas: menengah.

### 7. Endpoint donation publik dapat dipakai spam database

Lokasi:

- `apps/web/app/api/donations/route.ts:12`

Masalah:

Endpoint `POST /api/donations` menerima request publik dan langsung menyimpan data donation mock. Tidak terlihat CSRF, rate limit, atau explicit content-length check di route ini.

Dampak:

- Database dapat dipenuhi donation mock.
- Bisa menjadi abuse vector ringan untuk resource exhaustion.

Rekomendasi:

- Tambahkan IP-based rate limit.
- Tambahkan `isContentLengthWithinLimit`.
- Jika endpoint hanya dipakai authenticated user, tambahkan auth/CSRF.
- Jika tetap publik, tambahkan anti-abuse control seperti captcha atau server-side payment intent requirement.

Prioritas: menengah.

## Temuan Low / Hygiene

### 8. `credential.md` ada di working tree, tetapi isinya placeholder

Lokasi:

- `credential.md`
- `credential.example.md`
- `.gitignore:21`

Observasi:

- `credential.md` berisi placeholder, bukan nilai credential nyata.
- File ini sudah masuk `.gitignore`.

Rekomendasi:

- Tetap pertahankan placeholder saja.
- Hindari menyimpan credential lokal di repo tree, meskipun ignored.
- Gunakan password manager atau secret manager.

Prioritas: rendah.

### 9. CI memakai secret dummy yang hardcoded

Lokasi:

- `.github/workflows/ci.yml:16`
- `.github/workflows/ci.yml:20`

Observasi:

- `SESSION_SECRET` CI hardcoded sebagai dummy untuk test.
- `DATABASE_URL_TEST` mengarah ke Postgres service lokal CI.

Dampak:

- Aman selama hanya dipakai CI ephemeral.
- Jangan reuse pattern ini untuk staging/prod.

Rekomendasi:

- Dokumentasikan bahwa secret CI hanya dummy.
- Untuk preview deployment yang publik, gunakan secret manager GitHub/Vercel.

Prioritas: rendah.

## Area Yang Sudah Baik

- `apps/web/lib/session.ts`: session JWT dibatasi panjangnya sebelum verify.
- `apps/web/lib/session.ts`: cookie session `HttpOnly`, `SameSite=Lax`, dan `Secure` di produksi.
- `apps/web/server/security/csrf.ts`: CSRF double-submit dengan compare constant-time.
- `apps/web/server/http/protect.ts`: API guard terpusat untuk auth, active account, dan role.
- `apps/web/middleware.ts`: workspace protected route dan admin route punya session/staff checks.
- `apps/web/server/services/auth.service.ts`: password hash memakai `bcrypt.hash(..., 12)`.
- `apps/web/server/http/route-helpers.ts`: validasi Zod dan redaksi error untuk field sensitif.
- Mayoritas mutasi API memakai `assertMutationCsrf`.
- Tidak ditemukan penggunaan `dangerouslySetInnerHTML`, `eval`, `new Function`, atau raw SQL unsafe dalam source yang dicek.

## Rekomendasi Prioritas 7 Hari

1. Hapus semua file credential/recovery dari `apps/web/public/logo`.
2. Rotate credential/recovery code terkait.
3. Perbaiki Midtrans webhook agar signature wajib dan diverifikasi constant-time.
4. Perbaiki Stripe webhook signature memakai official SDK atau HMAC.
5. Tambahkan predeploy/CI check yang gagal jika ada file credential di `public/`.
6. Lock seed admin default agar tidak bisa berjalan di staging/prod.
7. Tambahkan rate limit dan body limit pada donation endpoint.

## Rekomendasi Prioritas 30 Hari

1. Migrasi rate limiter dari memory ke Redis/KV.
2. Tambahkan CSP report-only, lalu enforce bertahap.
3. Aktifkan HSTS di production.
4. Tambahkan dependency audit rutin di CI.
5. Tambahkan security test untuk webhook payment invalid/missing signature.
6. Tambahkan test yang memastikan semua mutasi cookie-authenticated memakai CSRF.
7. Audit artifact deploy agar ignored local files tidak ikut ter-upload.

## Catatan Batasan Audit

- Audit ini berbasis source/config lokal.
- Tidak dilakukan penetration test runtime.
- Tidak dilakukan dependency vulnerability audit online karena environment network restricted.
- Tidak memverifikasi isi credential file secara detail di laporan ini agar tidak membocorkan secret.
- File ignored tetap berisiko jika berada di folder `public/` dan ikut deploy dari filesystem lokal.
