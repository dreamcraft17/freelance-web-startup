# Audit teknis — Freelance-web (monorepo)

> **Doc revision:** v4  
> Last synchronized: 2026-04-20 (UGC translation API + server-side key handling).

**Lingkup:** `apps/web`, `packages/*`, dan jalur operasional yang mempengaruhi produksi.  
**Tanggal referensi:** April 2026 (sinkron dengan update terakhir implementasi).

## Addendum update (April 2026)

- **Cookie preferensi bahasa:** `lang` disetel oleh `POST /api/locale` (nilai `en` \| `id`, path `/`, `SameSite=Lax`, `Secure` di produksi). Bukan secret; tetap jaga agar respons API tidak mem-cache konten sensitif lintas locale tanpa `Vary: Cookie` bila menambahkan cache edge di masa depan.
- **Google Translate untuk UGC job:** kunci API (`GOOGLE_TRANSLATE_API_KEY`) dipakai hanya di server saat create job; terjemahan disimpan ke DB untuk mencegah panggilan API per-request. Risiko biaya dibatasi oleh rate limit create job yang sudah ada; jangan pernah mengekspos key ke client bundle.
- UI telah bergeser dari “template-like” ke pendekatan **product-first** dengan hierarchy yang lebih operasional.
- Area discovery publik sekarang lebih kuat untuk pemindaian cepat dan keputusan:
  - struktur filter/list lebih jelas,
  - location/nearby cues lebih praktis,
  - empty states lebih actionable.
- Client hiring workflow menunjukkan peningkatan nyata:
  - `/client/jobs` memunculkan indikator attention (pending decision/new bids/stale open jobs),
  - job detail menyediakan compact bid comparison untuk owner,
  - next action (**Hire** pada proposal) tidak tersembunyi di layer yang dalam.
- Risiko tersisa tetap sama: integrasi billing produksi, trust & safety report backend penuh, dan hardening operasional.

### Addendum 2026-04-18

- **Produksi / edge:** baseline security headers + optional HSTS (`NEARWORK_ENABLE_HSTS`) di `apps/web/next.config.ts`; `instrumentation.ts` memvalidasi `SESSION_SECRET` saat `NODE_ENV=production`.
- **Discovery publik:** limiter khusus + fingerprint query + skor UA ringan pada `GET /api/search/*` dan `GET /api/jobs` (`public-discovery-guard.ts`); validator discovery (`MAX_PUBLIC_DISCOVERY_PAGE`, panjang string query).
- **UI publik:** landing hero marketplace (stage putih, kategori horizontal ikon, preview baris); footer marketing **kompak** berkolom (Product / Company / Legal / Support) + strip copyright.
- **Dokumentasi:** panduan sinkronisasi file `.md` di `docs/DOCUMENTATION-MAINTENANCE.md`.

---

## 1) Ringkasan eksekutif

NearWork sudah berada di fase **MVP+ operasional**:

- core marketplace aktif (jobs, bids, contracts, messages, notifications, reviews, saved items, taxonomy, search),
- auth cookie-based stabil (`acme_session`),
- internal staff workspace `/admin` sudah real (bukan scaffold lagi) dengan RBAC dan banyak halaman operasional.

Perubahan besar sejak audit sebelumnya:

- `/admin` sekarang fully integrated di `apps/web` (overview + users/jobs/bids/contracts/verification/reviews/reports/donations/subscriptions/feature-flags/settings),
- guard staff sudah konsisten antara middleware, server guard, dan API (`protectStaff`),
- navbar public sudah auth-aware (tidak lagi selalu menampilkan login/register saat sesi valid),
- redirect post-login dipusatkan (`resolvePostLoginRedirect`) dan staff default ke `/admin`.

Status umum:

- **Typecheck `apps/web` bersih** pada perubahan terbaru.
- Arsitektur service/policy/repository tetap rapi.
- Risiko utama tersisa: billing provider nyata, ekspansi trust/safety reports backend, dan hardening operasional lanjutan.

---

## 2) Arsitektur & konsistensi

| Area | Status |
|---|---|
| Domain layering | Konsisten: route handler → service → policy → repository/prisma |
| Session source | Satu sumber (`acme_session` cookie JWT, `jose`) |
| API canonical | `/api/*` aktif, legacy `/api/v1/*` tetap redirect/deprecation |
| Shared config | `@acme/config` dipakai lintas service (flags, plans, entitlement) |
| DTO validation | Zod validators tetap jadi kontrak input API |

Catatan:

- Ada dual-path impor `@/` dan `@src/` yang masih valid, tapi tetap perlu disiplin agar tidak membingungkan contributor baru.

---

## 3) Auth, redirect, dan otorisasi

### 3.1 Session & login redirect

- Session payload: `userId`, `role`, `accountStatus`.
- Redirect sesudah login/register sekarang dipusatkan di:
  - `homePathForSessionRole`
  - `resolvePostLoginRedirect`
- Perilaku:
  - `ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN` → fallback `/admin`
  - `CLIENT` → `/client`
  - `FREELANCER` → `/freelancer`
  - `returnUrl` valid tetap diprioritaskan.

### 3.2 Proteksi `/admin`

Sudah benar-benar staff-only:

- middleware memproteksi `/admin` dan nested routes,
- account inactive ditolak (`/forbidden`),
- non-staff diarahkan aman ke home role masing-masing,
- staff tanpa akses page-level diarahkan ke `/forbidden`.

### 3.3 Konsistensi guard

- `protectStaff()` di API sudah align dengan staff roles yang sama dengan admin access helpers.
- `requireStaffSession()` dan `requireAdminAccess()` di RSC juga align dengan middleware.

**Residual risk:** client-side fetch tanpa `credentials: "include"` tetap 401 (expected), perlu dijaga konsisten di seluruh UI baru.

---

## 4) Status internal `/admin` (yang kini sudah real)

### 4.1 Kekuatan saat ini

- UI shell internal terstruktur (sidebar grouped + topbar + role badge + account menu).
- Halaman operasional read-first sudah kaya data:
  - users, jobs, bids, contracts, reviews, donations, subscriptions, feature flags.
- Verification queue sudah punya aksi moderasi nyata (approve/reject) ke endpoint yang ada.
- Overview dashboard sudah memakai data real (bukan fake metrics) + panel aktivitas.

### 4.2 Gap yang masih ada

- `reports` masih placeholder readiness (struktur bagus, backend report entity belum ada).
- Feature flags page masih read-only (sudah tepat untuk tahap sekarang).
- Belum ada aksi destructive/admin mutation besar (suspend user, hard moderation workflows, dsb.) — by design read-first.

---

## 5) Database, migrasi, dan seed

### 5.1 Prisma

- Skema domain sudah luas: users/profiles/jobs/bids/contracts/messages/notifications/reviews/subscriptions/donations/verification, dll.
- Indeks dan model terbaru sudah dipakai oleh halaman admin.

### 5.2 Seed admin

- `packages/database/prisma/seed.ts` sudah menyiapkan akun admin dev via upsert.
- Root script `pnpm db:seed` sudah tersedia.
- Default seed credential didokumentasikan dan bisa di-override via env.

**Catatan keamanan:** credential default dev tidak boleh dipakai di shared/staging/prod.

---

## 6) UI/UX audit (public + auth pages)

### 6.1 Public navbar

Positif:

- auth-aware (session real), role-aware actions, mobile drawer, badge notifikasi unread nyata.
- iterasi **2026-04-18:** struktur produk kiri–tengah–kanan, brand `logo_EN.png` via `BrandLogo`, nav pusat lengkap dengan hierarki tipografi + indikator aktif garis bawah brand (kurangi rasa template SaaS).

Perlu perhatian:

- iterasi cepat → tetap rawan inkonsistensi spacing/brand tone antar halaman (dashboard vs marketing).
- **Aset:** freeze satu **source-of-truth** (`/public/logo/logo_EN.png` + varian ID jika dipakai) + token tinggi logo per permukaan (navbar / auth / dashboard) agar tidak regress.

### 6.2 Auth pages (login/register)

- logo sudah dibesarkan dan dipusatkan.
- brand visibility naik, namun aset PNG membuat kontrol warna/kontras lebih bergantung ke file desain final.

Rekomendasi: freeze satu brand source-of-truth (PNG atau SVG final) + token ukuran resmi untuk navbar/auth/dashboard.

---

## 7) Monetisasi & trust/safety readiness

### Monetisasi

Sudah ada:

- plan/entitlement resolution,
- subscription records & plan catalog,
- donation records,
- feature flags visibility.

Belum ada:

- payment provider real end-to-end (checkout, webhook, reconciliation),
- status transaksi finansial yang kaya (chargeback/dispute states).

### Trust/Safety

Sudah ada:

- verification workflow staff (approved/rejected),
- moderation-ready reports page scaffold.

Belum ada:

- report entity + triage lifecycle persisted,
- assignment/escalation workflow,
- policy engine yang lebih granular untuk abuse handling.

---

## 8) Kualitas build/test/ops

- `apps/web` typecheck: lulus di update terbaru.
- Lints file yang disentuh: bersih.
- E2E script tersedia (`pnpm test:e2e`) tapi tetap butuh environment + server hidup.

Ops checklist yang tetap wajib:

1. set `SESSION_SECRET` kuat,
2. set `DATABASE_URL` benar,
3. jalankan migrasi deploy sebelum startup app,
4. pastikan HTTPS prod untuk cookie security behavior,
5. hindari commit file kredensial/rahasia real.

---

## 9) Prioritas rekomendasi berikutnya

1. **Billing real integration** (provider + webhook + audit trail finansial).
2. **Reports backend** (model, API, status lifecycle, assignment).
3. **Admin action layer** bertahap (safe mutations + audit logs).
4. **Stabilisasi design system navbar/brand** (token final supaya iterasi tidak regress).
5. **CI hardening**: jalankan typecheck/lint/e2e smoke secara otomatis.

---

## 10) Kesimpulan

Freelance-web saat ini sudah lebih dari “backend MVP”: sekarang ada **internal admin workspace yang usable**, **RBAC yang terpusat**, **redirect/auth flow yang lebih benar**, dan **UI publik yang session-aware**. Fondasi teknisnya kuat untuk lanjut ke fase operasi awal.

Utang utama bukan lagi core CRUD, melainkan **operasional produksi**: billing nyata, trust/safety reports backend, dan standardisasi visual brand agar stabil lintas rilis.
