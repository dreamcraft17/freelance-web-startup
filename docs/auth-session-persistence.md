# Auth Session Persistence (NearWork Web)

> Last synchronized: 2026-04-15 (post-accept handoff update applied across product and docs).

Dokumen ini menjelaskan bagaimana session login dipertahankan setelah user berhasil login, termasuk format cookie, validasi middleware, dan alur redirect.

## Update status (April 2026)

- Session persistence tetap berbasis cookie tunggal (`acme_session`) dan tidak berubah secara arsitektur.
- Redirect post-login untuk staff tetap terpusat dan mengarah default ke `/admin`.
- Public navbar/header sudah auth-aware secara server-side sehingga state login/logout terlihat konsisten di halaman publik.

## Tujuan

- User **tidak perlu login ulang** saat pindah halaman, refresh, atau membuka route protected.
- Satu sumber kebenaran untuk auth/session (tanpa sistem auth ganda).
- Perilaku login/logout konsisten di semua area app.

## Source of Truth

- **Cookie session name**: `acme_session`
- **Token format**: JWT HS256 (ditandatangani via `SESSION_SECRET`)
- **Session payload**: `userId`, `role`, `accountStatus`

Implementasi utama:

- `apps/web/src/lib/session.ts`
- `apps/web/src/middleware.ts`
- `apps/web/app/api/auth/login/route.ts`
- `apps/web/app/api/auth/register/route.ts`
- `apps/web/app/api/auth/logout/route.ts`

## Kontrak Cookie Session

Cookie dibuat dari `buildSessionSetCookieHeader()` dan dibersihkan dari `buildSessionClearCookieHeader()`.

### Atribut saat login/register

- `Name`: `acme_session`
- `Path`: `/`
- `HttpOnly`: `true`
- `SameSite`: `Lax`
- `Max-Age`: `604800` (7 hari)
- `Expires`: timestamp UTC (7 hari)
- `Secure`: dinamis berdasarkan request context:
  - production + HTTPS/proxy `x-forwarded-proto=https` -> `Secure` aktif
  - local/dev non-HTTPS -> `Secure` tidak dipaksa

### Atribut saat logout

- `Name`: `acme_session`
- `Path`: `/`
- `HttpOnly`: `true`
- `SameSite`: `Lax`
- `Max-Age`: `0`
- `Expires`: `Thu, 01 Jan 1970 00:00:00 GMT`
- `Secure`: aturan sama seperti set-cookie

## Alur Login yang Persisten

1. Client kirim `POST /api/auth/login` (credentials same-origin).
2. Route handler memvalidasi user dan membuat JWT session.
3. Response mengembalikan `Set-Cookie: acme_session=...`.
4. Setelah sukses, client redirect dengan **hard navigation**:
   - `window.location.assign(target)`
5. Request halaman berikutnya melewati middleware dengan cookie yang sudah committed.

Catatan: hard navigation dipakai untuk menghindari race condition yang kadang terjadi saat SPA redirect langsung setelah `fetch` login.

## Middleware & Validasi Session

Middleware membaca cookie melalui `getSessionFromRequest()` dari file session yang sama.

- Protected routes:
  - `/client/*`
  - `/freelancer/*`
  - `/messages/*`
  - `/notifications/*`
  - `/settings/*`
- Jika session valid -> lanjut.
- Jika tidak ada/invalid -> redirect ke `/login` dengan `returnUrl` aman + `intent=protected`.

Ini memastikan route protection membaca **cookie name + format** yang sama dengan login route.

## Redirect Setelah Login

Tujuan redirect:

- Jika ada `returnUrl` valid -> ke `returnUrl`
- Jika tidak ada:
  - `CLIENT` -> `/client`
  - `FREELANCER` -> `/freelancer`

Sanitasi URL menggunakan `sanitizeReturnUrl()` untuk mencegah open redirect.

## Checklist Verifikasi (Manual QA)

1. Login sebagai client -> harus masuk ke `/client` dan tetap login setelah refresh.
2. Login sebagai freelancer -> harus masuk ke `/freelancer` dan tetap login setelah refresh.
3. Akses `/messages` setelah login -> tidak diminta login ulang.
4. Buka homepage (`/`) setelah login -> auth-aware UI tetap mengenali session.
5. Logout -> cookie hilang dan route protected kembali redirect ke login.
6. Cek DevTools:
   - ada cookie `acme_session`
   - `Path=/`
   - `HttpOnly`
   - `SameSite=Lax`
   - `Secure` sesuai environment/protocol

## Troubleshooting Cepat

- **Session selalu null di middleware**
  - cek `SESSION_SECRET` tersedia dan panjang >= 16
  - cek cookie benar-benar tersimpan (`acme_session`)
  - cek protocol/proxy (`x-forwarded-proto`) agar `Secure` tidak mismatch
- **Login berhasil tapi redirect seolah logout**
  - pastikan redirect tetap hard navigation (`window.location.assign`)
  - pastikan domain/protocol request konsisten

## Ringkasan

Sistem sekarang sudah konsisten: login/register set cookie session yang benar, middleware membaca cookie yang sama, dan redirect setelah login dibuat aman terhadap race condition agar session tetap persisten.

