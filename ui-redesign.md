# NearWork UI Redesign Audit + Design Language

> **Doc revision:** v14  
> Last synchronized: 2026-04-20 (UGC translation indicators + original/translated toggle on job detail).

## Goal

Build a grounded, practical, product-first UI across public and authenticated surfaces without changing core business logic.

## Progress update (April 2026)

### 2026-04-20 — Locale switcher (EN / ID)

- **Kontrol:** segmen teks **EN \| ID** dengan lebar minimum per segmen (mengurangi layout shift); transisi halus saat refresh RSC (`useTransition` + `router.refresh()` setelah `POST /api/locale`).
- **Route-aware switch:** pada URL SEO ber-prefix locale, toggle berpindah lintas halaman ekuivalen (`/id/jobs` ↔ `/en/jobs`) agar URL crawlable tetap konsisten per bahasa.
- **Active state:** status aktif tombol EN/ID sekarang diturunkan dari prefix route aktual (bukan state lokal toggle), sehingga UI dan konten server selalu sinkron setelah navigasi.
- **Cakupan awal:** marketing navbar, `DashboardShell`, `PublicSiteHeader`, hero landing + footer marketing, beberapa string auth (login/register), label nav workspace, menu akun, `MarketplacePulse` pada landing + discovery.
- **Tanpa bendera**; teks natural per locale (bukan string inline di komponen).

### 2026-04-20 — Navbar resilience (EN/ID content length)

- **Single-row desktop stability:** `MarketingNavBar` menghentikan wrapping di center nav (`flex-wrap` dihapus) dan memindahkan breakpoint desktop utama ke `lg` agar tablet tidak dipaksa menampilkan navbar padat.
- **Hierarchy dipertegas:** kiri = logo (tetap dominan), tengah = primary+secondary nav (secondary ukuran font lebih kecil), kanan = utility/auth + locale switcher + CTA.
- **Anti-fragile spacing:** padding horizontal dan gap dituning ulang; utility rendah prioritas (`Browse jobs`, secondary action signed-in) ditampilkan hanya saat lebar cukup (`xl`) agar label Indonesia tidak merusak ritme.

### 2026-04-20 — Public discovery language consistency

- Halaman `/jobs` dan `/freelancers` (beserta filter/list/empty states) kini memakai key i18n untuk seluruh teks user-facing yang sebelumnya masih hardcoded Inggris.
- Prompt geolokasi pada filter freelancer juga dilokalisasi via error code (`unsupported`, `permission_denied`, `lookup_failed`) agar pesan tidak campur bahasa.

### 2026-04-20 — Marketing language consistency

- Copy halaman marketing utama (`How it works`, `Pricing`, `Early access`, `Help`) sekarang diambil dari kamus locale, bukan literal string dalam komponen.

### 2026-04-20 — Remaining public/fallback localization

- Halaman detail lowongan `/jobs/[jobId]` dipindah ke key i18n untuk string operasional (decision hints, table headings, conversation cues, CTA), agar mode `/id/*` tidak mixed-language saat client/freelancer review proposal.
- Halaman legal `/terms` dan `/privacy`, plus fallback `/forbidden`, `/forgot-password`, dan `/search/nearby` kini menggunakan translator server (`getServerTranslator`) dan dictionary EN/ID.

### 2026-04-20 — User-generated job translation UX

- Konten job user-generated (judul/deskripsi) kini ditampilkan per-locale berdasarkan cache translasi server-side, sehingga copy job bisa otomatis lintas bahasa tanpa menerjemahkan UI komponen.
- Listing job menampilkan indikator sumber bahasa saat konten ditampilkan dalam mode terjemahan.
- Detail job menambahkan kontrol ringan **Show original / Show translated** untuk transparansi ketika pengguna ingin melihat teks sumber.

### 2026-04-18 — Marketing navbar (product chrome, not template)

- **`MarketingNavBar`:** layout eksplisit **brand (kiri) · primary links (tengah) · auth/utilitas (kanan)**; tengah sekarang memprioritaskan entry marketplace (**Jobs**, **Freelancers**) lalu secondary nav ringan (**How it works**, **Pricing**, **Help**) dengan divider vertikal halus.
- **Brand:** `BrandLogo` + `logo_EN.png`, **tanpa** kotak/border dekoratif; ukuran gambar naik per breakpoint; hover disederhanakan (opacity).
- **Nav items:** berat font tidak seragam (discovery lebih tegas, link produk lain `font-medium` + warna sekunder); aktif = **underline / border-b brand** (`#3525cd`), bukan chip background penuh.
- **Kanan:** tautan guest + CTA sekarang lebih actionable (`Start hiring`), sesi login menampilkan state ringkas (`Signed in`) + ikon utilitas dengan unread badge (notifikasi + thread pesan menunggu balasan) + CTA role-aware (`Post a job` / `Find jobs`); **pemisah vertikal** `border-slate-100` memisahkan dari nav utama.
- Header: **tanpa `shadow-sm`** pada bar atas—hanya border bawah + putih, tetap dalam garis “no glass / no gradient”.

### 2026-04-18 — Trust & activity (no new chrome)

- Satu baris stat agregat (`MarketplacePulse`) di hero landing + header discovery jobs/freelancers—teks muted, bukan banner.
- Navbar marketing: indikator notifikasi mengikuti **jumlah unread** dari database (bukan indikator tetap).
- Filter publik: saran keyword via `datalist` + baris “Popular” (tautan pencarian, bukan hasil live).
- Saluran hiring: istilah **proposal / hire** menggantikan copy generik “bid / open job” di permukaan utama.

### 2026-04-18 — Marketplace landing + footer

- **Hero `/`:** label generik “Marketplace” / `nw-section-title` di hero diganti **mikro-label produk** ringan (“Live freelancer directory”) supaya **headline** jadi fokus pertama—nuansa marketplace nyata, bukan startup template.
- **Hero `/`:** stage putih penuh lebar (`nw-hero-stage`), grid headline + panel alur singkat, blok search besar dengan *popular search* pills, CTA primer/sekunder jelas (tanpa glass/gradient/blob).
- **Kategori:** strip `nw-section-slab`, ikon per jalur, horizontal scan (scroll di mobile) — link ke directory dengan keyword.
- **Preview / use cases:** variasi latar (`nw-section-mist` + kartu putih); baris preview lebih “feed-like” (inisial, meta chip, zebra).
- **Footer `MarketingSiteFooter`:** utilitarian — kolom berlabel, tipografi sekunder, padding vertikal kecil; bukan section marketing tinggi.
- Prinsip tetap: struktur & hierarki, bukan dekorasi.

- Shared design language sudah diterapkan ke shell utama (public, dashboard, admin) dan komponen header/panel/inputs/action.
- Batch public pages selesai dengan fokus realistis: landing lebih product-oriented, discovery pages lebih seperti tools browse.
- Increment berikutnya sudah berjalan:
  - freelancer-side flow: profile -> find jobs -> proposals,
  - client-side hiring flow: jobs control center + bid decision clarity.
- Prinsip tetap dijaga: tidak ada glass/gradient dekoratif, tidak ada fake data, tidak ada backend rewrite yang tidak perlu.

## 1) Audit: Template-Like Patterns To Remove

### Public marketing layer
- Hero sections still rely on decorative visual effects (radial overlays, map-like ornaments, glow-style containers) that feel promotional rather than operational.
- Several sections share a centered, symmetric composition that reads like a generic landing template instead of a product homepage.
- CTA and chip treatments are visually over-emphasized in places where search/discovery flow should be primary.

### Shared product shells
- Some translucent backgrounds, blur, and gradient accents appear in navigation/shell containers and can weaken a grounded product feel.
- Surface hierarchy is not fully consistent between public, dashboard, and admin layouts.
- Card treatments vary too much (radius, borders, shadows), which can feel "component-library demo" instead of a coherent product system.

### Forms and lists
- Inputs, buttons, and list/table containers use mixed visual patterns depending on page context.
- Some empty states are good, but there is still inconsistency in action-oriented guidance and structure.

## 2) Shared Design Language

### Foundations
- **Backgrounds**: neutral light canvas (`#f4f6f8`) for app surfaces.
- **Primary surfaces**: solid white with subtle border and restrained shadow.
- **Soft surfaces**: muted neutral (`slate-50`) for grouped secondary content.
- **Borders**: visible but soft (`slate-200` range), used to define structure rather than decoration.
- **Radius**: moderate (`rounded-xl` for panels, `rounded-md` for controls).
- **Shadows**: low depth only (`0 1px 2px` style) except very intentional CTA emphasis.

### Typography
- Titles: clear, compact hierarchy (`text-2xl` / `text-3xl` with semibold).
- Section labels: small uppercase utility labels for operational grouping.
- Body/supporting copy: `text-sm` / `text-base` muted tones for readability.

### Interaction
- Primary action uses brand color intentionally; secondary actions rely on text/border contrast.
- Inputs prioritize legibility and clear focus states over decorative wrappers.
- Navigation states should be obvious and compact (active state, hover state, low noise).

### Layout behavior
- Prefer asymmetric but intentional structure based on workflow.
- Use cards only to separate meaningful content groups.
- Avoid wrapping every block in a card or forcing centered hero compositions everywhere.

## 3) Initial Shared Implementation (Completed)

Applied across shared styles/shells:
- Added global reusable UI primitives in `apps/web/app/globals.css`:
  - `.nw-page`
  - `.nw-surface`
  - `.nw-surface-soft`
  - `.nw-hero-stage` · `.nw-discovery-panel` · `.nw-section-mist` · `.nw-section-slab` (landing rhythm)
  - `.nw-page-header`
  - `.nw-page-title`
  - `.nw-page-description`
  - `.nw-cta-primary`
  - `.nw-input`
- Updated shared layout wrappers:
  - `apps/web/components/marketing/MarketingShell.tsx`
  - `apps/web/features/dashboard/components/DashboardShell.tsx`
  - `apps/web/features/admin/components/AdminShell.tsx`
- Updated shared navigational/pattern components:
  - `apps/web/components/marketing/MarketingNavBar.tsx`
  - `apps/web/components/marketing/MarketingSiteFooter.tsx`
  - `apps/web/features/shared/components/PageHeader.tsx`

## 4) Next Increment Plan (Page-by-Page)

1. **Public pages**
   - Refactor hero and section compositions to emphasize search/discovery workflows over decorative storytelling.
   - Simplify section wrappers and reduce symmetric card-grid patterns.
2. **Discovery pages (`/jobs`, `/freelancers`)**
   - Strengthen filter/search hierarchy, tighten result card density, improve location/nearby cues.
3. **Auth pages**
   - Keep transactional and compact; remove any non-essential decorative framing.
4. **Client/Freelancer workspace**
   - Standardize summary/action/list structure with reusable section templates.
5. **Messaging + Notifications + Settings**
   - Prioritize list readability, actionable states, and calm operational layout.
6. **Admin pages**
   - Keep internal-tool density and table clarity; align spacing and panel hierarchy with shared system.

## 5) Safety Rules

- No backend query/auth changes unless strictly required.
- Keep route contracts and existing interactions intact.
- Preserve real-data behavior and honest empty states.
- Roll out by shared components first, then page modules incrementally.
