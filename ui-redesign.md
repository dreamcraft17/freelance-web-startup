# NearWork UI Redesign Audit + Design Language

> **Doc revision:** v23  
> Last synchronized: 2026-04-22 (homepage compact activity strip for fast marketplace entry).

## Goal

Build a grounded, practical, product-first UI across public and authenticated surfaces without changing core business logic.

## Progress update (April 2026)

### 2026-04-22 — Marketplace energy (without gimmicks)

- Hero tetap mempertahankan struktur dua kolom, namun diperkaya dengan trust cues kecil dan entry point browse cepat ke brief aktif agar fokus user bergeser ke interaksi, bukan sekadar membaca copy.
- Strip kategori di bawah search diperkuat sebagai horizontal browse lane yang benar-benar clickable dan mudah dipindai (ikon + label kategori, target area lebih tegas, ritme mobile scroll tetap nyaman).
- Section preview ditata ulang menjadi board row-style yang lebih operasional: tiap baris menampilkan atribut inti (lokasi, harga, meta status, tags) plus CTA aksi langsung (`View` / `Open`), bukan hanya kartu simetris.
- Kedalaman visual ditingkatkan lewat separasi section berbasis border/surface/spacing (bukan gradient atau glow), sehingga halaman terasa seperti produk aktif.

### 2026-04-22 — Activity/decision refinement

- Tiap baris preview sekarang memiliki activity indicator sekunder (`New`/`Active now`) + status update ringkas agar halaman terasa hidup tanpa menambah noise visual.
- Susunan kolom kanan disejajarkan (location -> price -> primary actions -> micro links) untuk mempercepat perbandingan antar row.
- Kategori diubah dari rasa “chip” menjadi rasa “navigation lane”: label utilitas kecil + label utama + underline hover sehingga entry point terasa seperti bagian sistem browse.
- Hero mendapat satu baris urgensi ringan terkait ritme update listing agar user menangkap bahwa board aktif, bukan konten statis.

### 2026-04-22 — Decision confidence pass

- Preview rows menambahkan alasan “why choose this” dalam bentuk inline signal sekunder (mis. respon cepat, populer, rating lokal kuat) agar pengguna punya dasar memilih tanpa membuka detail dulu.
- Satu-dua row diberi emphasis ringan (`featured`) lewat surface + rail halus untuk menunjukkan prioritas, tetap menjaga ritme list board.
- Hirarki aksi per-row dipertegas: satu tombol utama per context (`Open job` / `View profile`) dengan aksi sekunder diturunkan bobot visualnya.
- Harga tidak berdiri sendiri: ditambah konteks value singkat (`starting at...` / budget context) supaya scan harga langsung bermakna untuk keputusan.

### 2026-04-22 — Structural hierarchy redesign

- Hero tidak lagi dibungkus satu “soft card” besar; layout dibuat lebih terbuka dan asimetris untuk mengurangi rasa template linear.
- Kolom kanan hero diganti menjadi visual block berbentuk mini board (stat tiles + quick browse links + process panel) agar ada anchor visual fungsional.
- Search diposisikan sebagai strip tool mandiri dengan pemisah section yang lebih tegas, bukan sekadar card lain di dalam card.
- Kategori beralih dari lane chip ke grid entry points berbasis ikon + label aksi agar terasa seperti navigasi marketplace.
- Preview listing menambah thumbnail-style media anchors agar hasil browse tidak didominasi teks polos.

### 2026-04-22 — Compact activity strip

- Di bawah hero ditambahkan strip aktivitas ringan yang langsung mendorong aksi: live counters (`open jobs`, proposal 24h), trending lanes, quick filters nearby/remote, dan shortcut `active briefs`.
- Komponen ini didesain sebagai **strip kompak**, bukan section baru yang berat, agar terbaca dalam satu glance dan langsung bisa diklik.
- Gaya visual tetap utilitarian (border + neutral surfaces), tanpa gradient/glow/glass atau elemen dekoratif non-fungsional.

### 2026-04-20 — Homepage depth without gimmicks

- Hero typography dan spacing disetel ulang: headline diperbesar/ditajamkan, subtitle tetap tenang namun lebih terpisah dari body hint agar focal point langsung terbaca.
- Search area ditingkatkan jadi **product block** utama: border lebih tegas, elevasi lembut, padding lebih lapang, serta input rows dengan permukaan konsisten.
- Panel kanan “How hiring runs” diperlakukan sebagai guide panel: kontras permukaan naik tipis, numbering steps diberi penanda visual yang lebih jelas, dan footnote dipisah dengan garis struktur.
- Hierarki CTA diperjelas dengan urutan visual: `Post a job` sebagai primary, discovery actions sebagai secondary, tanpa efek dekoratif berlebih.
- Rhythm section tetap minimal: hero stage diberi border atas/bawah agar transisi antar-bagian terasa intentional, bukan flat.

### 2026-04-20 — SEO + product copy pass

- H1 homepage disetel ke bahasa yang lebih operasional dan keyword-aware (nearby + remote freelancer intent) tanpa stuffing.
- Copy section publik (`categories`, `result preview`, `use cases`, `final CTA`) dipindahkan ke dictionary agar EN/ID konsisten, dengan tone praktis (bukan startup fluff).
- CTA label disejajarkan ke aksi marketplace nyata: menemukan freelancer, membuka job board, memasang lowongan.

### 2026-04-20 — Hero/search structural pass

- Hero dibagi eksplisit jadi dua layer: **top layer** (headline + hiring system panel) dan **bottom layer** (search tool block) agar terasa seperti interface kerja, bukan banner.
- Search block diperbesar dan dipertegas sebagai interaksi utama (input lebih tinggi, border lebih kuat, tombol submit lebih dominant dan sejajar dengan input).
- Panel kanan “How hiring runs” dipadatkan menjadi system panel (spacing lebih rapat, step list lebih kompak, aksen border kiri brand).
- CTA strip ditata primary-first (`Post a job`) lalu secondary discovery actions agar hierarchy keputusan lebih jelas.

### 2026-04-20 — Navbar non-template pass

- `MarketingNavBar` disusun ulang menurut prioritas produk: logo lebih dominan di kiri, center nav dibagi primary (`Jobs`, `Freelancers`) vs secondary (`How it works`, `Pricing`, `Help`), area kanan fokus language switch + auth + CTA.
- Link utilitas guest yang kurang prioritas dihapus dari desktop right rail agar tidak mengganggu action hierarchy.
- State visual nav dipertegas dengan underline halus dan perbedaan bobot tipografi discovery vs product links, bukan pola tombol dekoratif.

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
