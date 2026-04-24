# NearWork Application Overview

> **Doc revision:** v42  
> Last synchronized: 2026-04-22 (jobs detail flow now optimized for confident proposal conversion).

Dokumen ini menjelaskan gambaran umum aplikasi NearWork: tujuan produk, area fitur, arsitektur singkat, dan peta route utama.

> Ringkasan “**produk ini apa**” untuk non-engineer: **`docs/apa-itu-nearwork.md`**.

## Update status (April 2026)

- **Homepage marketplace pass (2026-04-22):** landing publik sekarang menonjolkan browsing entry points yang lebih nyata: browse lane kategori horizontal di bawah search, hero dengan trust cues dan quick link ke brief aktif, serta preview row-style yang menampilkan atribut kerja (harga, lokasi, tag) + aksi langsung.
- **Homepage activity refinement (2026-04-22):** section preview kini menambahkan sinyal aktivitas ringan dan alignment data untuk scan/compare lebih cepat; kategori dipertegas sebagai lane navigasi; hero menambahkan satu cue urgensi operasional tentang update listing yang rutin.
- **Homepage decision-confidence pass (2026-04-22):** row preview kini menampilkan alasan pemilihan listing, penekanan halus untuk item unggulan, konteks value pada harga, dan hirarki aksi utama/sekunder yang lebih jelas agar pengguna bisa memilih lebih yakin.
- **Homepage structural redesign (2026-04-22):** komposisi hero kini asimetris dan lebih terbuka (headline/tool kiri, visual board kanan), kategori dipresentasikan sebagai grid entry points, dan preview listing memakai thumbnail-style anchors untuk meningkatkan rasa produk marketplace aktif.
- **Homepage activity strip (2026-04-22):** area tepat setelah hero kini memiliki strip ringkas berisi sinyal aktivitas + jalur eksplorasi cepat (trending lanes, quick filters nearby/remote, active briefs) untuk mempercepat langkah browse pengguna.
- **Homepage analytics removal (2026-04-22):** panel statistik publik dan angka sistem mentah tidak lagi ditampilkan di landing; diganti fokus ke shortcut eksplorasi agar user langsung bisa mencari, membandingkan, dan membuka listing.
- **Homepage action clarity (2026-04-22):** mode switch hire/work ditambahkan tepat setelah search untuk memprioritaskan jalur aksi berbeda; quick filters dan budget selector di search mempermudah langkah awal user dari browse ke action.
- **Homepage intent persistence (2026-04-22):** intent mode (`hire`/`work`) kini dibaca dari query URL dan dipakai sebagai source of truth untuk state switch + CTA, sehingga pengalaman tetap stabil saat reload dan share URL.
- **Default locale publik (2026-04-22):** pengunjung baru tanpa preferensi bahasa sekarang diarahkan ke konten Indonesia (`/id`) secara server-side; cookie `lang` tetap menjadi prioritas jika user sudah memilih `EN`/`ID`.
- **Locale priority enforcement (2026-04-22):** jika URL locale tidak ada dan cookie preferensi kosong, sistem langsung fallback ke `id`; `Accept-Language` tidak dipakai untuk override default routing publik.
- **Login UX feedback (2026-04-22):** halaman login menampilkan overlay proses saat submit agar user mendapat sinyal jelas ketika autentikasi berjalan; interaksi form dikunci sementara request berlangsung untuk mencegah multiple submit.
- **Auth overlay reuse baseline (2026-04-22):** pola overlay loading auth diekstrak menjadi komponen reusable agar flow register/forgot-password bisa mengadopsi UX submit konsisten di iterasi berikutnya.
- **Auth submit consistency rollout (2026-04-22):** flow register dan forgot-password kini sudah memakai pola overlay reusable yang sama dengan login (overlay tenang, spinner status, kontrol disabled, anti double-submit, teks loading terlokalisasi per flow).
- **Auth i18n consistency pass (2026-04-22):** copy user-facing pada login/register/forgot-password kini sepenuhnya berbasis kamus EN/ID (termasuk label form, role copy, helper, dan error register), tanpa perubahan logic autentikasi.
- **Freelancers directory UX pass (2026-04-22):** halaman `/freelancers` direstruktur sebagai directory comparison surface: result hierarchy dipadatkan untuk scan cepat lintas kandidat, confidence signals ditampilkan sebagai cue sekunder yang actionable, dan CTA utama per kandidat disederhanakan ke satu aksi jelas (`View profile`) agar pengguna lebih cepat memilih dan bertindak.
- **Freelancers decision-confidence pass (2026-04-22):** surface hasil kini memberi alasan pemilihan eksplisit per kandidat (`why choose this`) dari data yang tersedia, ranking top matches dibuat lebih terbaca secara halus, dan trust metrics dinaikkan prioritas visualnya untuk mempercepat keputusan tanpa menambah elemen dekoratif.
- **Freelancer profile conversion pass (2026-04-22):** halaman publik detail freelancer kini menyusun informasi dalam urutan keputusan (summary trust/rate/location/availability -> alasan memilih -> about/skills/review -> CTA kontak) sehingga klien dapat menilai kecocokan dan melanjutkan aksi tanpa harus menafsirkan profil bio yang tersebar.
- **Freelancer profile non-social refinement (2026-04-22):** orientasi halaman ditegaskan sebagai evaluasi hiring: elemen persona sosial diturunkan, sumber review dipresentasikan sebagai bukti proyek, dan panel aksi dipadatkan ke jalur keputusan yang lebih langsung.
- **Freelancer profile hiring-language pass (2026-04-22):** label/terminologi section kini konsisten menggambarkan evaluasi jasa kerja (summary kerja, scope layanan, pengalaman relevan), sehingga seluruh halaman memperkuat konteks “menilai kandidat untuk direkrut”.
- **Freelancer profile CTA confidence pass (2026-04-22):** jalur aksi utama kini menekankan percakapan awal yang aman (diskusi dulu sebelum komitmen), dengan CTA yang tetap terlihat di panel sticky desktop untuk mengurangi drop-off setelah user selesai mengevaluasi profile.
- **Jobs discovery decision-flow pass (2026-04-22):** halaman `/jobs` kini mengurutkan informasi untuk keputusan freelancer (relevansi peran, budget context, lokasi/mode kerja, recency, apply signal) dan menyediakan filter budget+recency agar proses memilih lowongan yang layak dilamar lebih cepat serta lebih yakin.
- **Jobs apply-conversion detail pass (2026-04-22):** halaman `/jobs/[jobId]` kini menempatkan CTA proposal pada top conversion area dengan konteks keputusan lengkap + reassurance non-commitment, sehingga user bergerak lebih cepat dari “membaca brief” ke “mulai kirim proposal”.
- **SEO alternates refinement (2026-04-22):** `hreflang` tetap EN/ID + `x-default`, dengan `x-default` langsung ke URL canonical default locale untuk mencegah duplicate/redirect ambiguity.
- **SEO multilingual (2026-04-20):** halaman publik inti tersedia di URL terpisah per bahasa (`/en/*`, `/id/*`) via `app/[locale]`; metadata Next.js per locale memuat canonical lokal + hreflang `en`, `id`, `x-default`.
- **Switch bahasa (2026-04-20):** EN/ID switcher mengikuti locale di route sebagai sumber kebenaran; saat ganti bahasa, aplikasi menavigasi ke route locale ekuivalen dan konten SSR langsung ikut locale baru.
- **Navbar multilingual (2026-04-20):** tata letak `MarketingNavBar` diperkuat untuk panjang teks EN/ID (khususnya Bahasa Indonesia): desktop tetap satu baris stabil, center nav tidak wrapping, dan item utilitas diprioritaskan menurut lebar viewport.
- **Public discovery i18n (2026-04-20):** surface publik `/jobs` dan `/freelancers` sekarang mengandalkan kamus locale untuk heading, filter labels, result toolbar, paginasi, CTA panel, list labels, dan empty states sehingga tampilan Indonesia tidak lagi bercampur bahasa Inggris.
- **Marketing i18n (2026-04-20):** halaman `/how-it-works`, `/pricing`, `/early-access`, `/help` memakai key i18n yang sama untuk EN/ID, sehingga route locale menampilkan bahasa yang konsisten pada konten utama.
- **Public detail/legal i18n (2026-04-20):** detail lowongan `/jobs/[jobId]` dan halaman legal `/terms`, `/privacy` sekarang dictionary-backed EN/ID; fallback pages (`/forbidden`, `/forgot-password`, `/search/nearby`) juga mengikuti locale aktif.
- **UGC translation jobs (2026-04-20):** judul/deskripsi lowongan diterjemahkan server-side saat pembuatan job (Google Translate API), lalu hasil disimpan di kolom cache DB agar rendering `/jobs` dan `/jobs/[jobId]` bisa langsung memilih bahasa sesuai locale tanpa panggilan API berulang.
- **Homepage visual hierarchy (2026-04-20):** landing hero, search block, dan panel guidance diperkuat dengan kontras permukaan + elevasi tipis berbasis border/shadow halus (tanpa gradient/glass), sehingga interaksi utama lebih menonjol dan struktur halaman terasa lebih product-like.
- **Homepage SEO + copy (2026-04-20):** route `/[locale]` memakai metadata keyword-intent per bahasa (EN/ID) dan copy publik direvisi ke gaya product-first (hiring flow, nearby vs remote framing, CTA operasional) agar positioning marketplace lebih jelas.
- **Homepage interface composition (2026-04-20):** struktur hero disusun ulang menjadi dua layer kerja (context panel + tool panel) agar pengalaman awal terasa seperti alat hiring aktif, bukan section marketing datar.
- **Navbar product hierarchy (2026-04-20):** struktur nav publik menekankan prioritas alur hiring (logo kuat, primary discovery links, secondary product links, CTA `Start hiring`) agar orientasi pengguna lebih cepat ke aksi inti.
- **Bahasa pengguna (2026-04-20):** aplikasi mendukung **English** dan **Bahasa Indonesia**; locale aktif dibaca di server dari cookie `lang` + header `Accept-Language`; pengalihan bahasa memperbarui cookie dan mem-refresh tree RSC agar konten server ikut locale.
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

