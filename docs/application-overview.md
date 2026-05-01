# NearWork Application Overview

> **Doc revision:** v78  
> Last synchronized: 2026-05-01 (homepage visual parity pass expanded hero tuning and public marketing footer structure).

Dokumen ini menjelaskan gambaran umum aplikasi NearWork: tujuan produk, area fitur, arsitektur singkat, dan peta route utama.

> Ringkasan “**produk ini apa**” untuk non-engineer: **`docs/apa-itu-nearwork.md`**.

## Update status (April 2026)

- **Homepage composition parity refinement (2026-05-01):** selain default intent dan topbar, landing page kini menambah tuning proporsi hero (title/CTA/search) serta footer marketing yang lebih lengkap agar output visual lebih konsisten terhadap referensi target.
- **Homepage first-screen alignment fix (2026-05-01):** default intent landing publik digeser ke `hire` agar first impression konsisten dengan recruiter flow; top marketing navbar untuk guest disederhanakan ke pola `Masuk/Daftar/Locale` agar visual hierarchy lebih bersih dan sesuai arah desain final.
- **Register redirect microcopy refinement (2026-05-01):** context message setelah pembuatan akun kini menyebut tujuan dalam bahasa pengguna (contoh: `halaman profil Anda`) berdasarkan route target, bukan menampilkan path internal seperti `/freelancer/profile`.
- **Homepage final dual-user landing (2026-05-01):** surface homepage kini menyeimbangkan clarity + visual context: toggle intent recruiter/freelancer, headline/CTA/search dinamis, right-side visual cards (non-data), full search row, value strip, dan CTA band; bagian data-heavy (preview list/job/freelancer activity) tidak dimunculkan agar halaman tetap landing-focused.
- **Homepage final-reference alignment (2026-05-01):** dilakukan pass visual lanjutan untuk mendekatkan proporsi/layout ke referensi final tanpa mengubah scope fitur: menjaga komponen inti (hero visual, search lengkap, value strip, CTA) sambil merapikan hierarchy dan spacing.
- **Global page transition system (2026-05-01):** root app layout kini membungkus seluruh konten dengan transition wrapper client-side untuk memberi feedback perpindahan route: progress bar top-level, fade/dim state saat navigasi, dan skeleton fallback global via `app/loading.tsx`; tujuan utamanya menghilangkan kesan flash/kedip saat berpindah menu.
- **Jobs board tool redesign (2026-05-01):** halaman publik `/jobs` kini menggunakan layout 3 kolom utilitarian (filter/list/insight), sticky primary search, job rows dengan urgency badges, budget-first readability, dan CTA utama `Apply`; halaman diposisikan sebagai tool operasional untuk cepat menemukan dan melamar lowongan.
- **Freelancers hiring-tool redesign (2026-05-01):** halaman publik `/freelancers` sekarang berfungsi sebagai workspace pencarian kandidat cepat, bukan landing-style list: sticky primary search di atas, struktur 3 kolom (filters/list/live insights), row kandidat chat-first dengan hierarchy keputusan tegas, dan section `job terbaru` di bawah list untuk continuity eksplorasi.
- **Homepage mockup redesign pass (2026-04-30):** surface publik `/id` kini menampilkan layout marketplace modern yang lebih jelas untuk aksi cepat (navbar bersih sticky, hero split dua kolom, search card menonjol, sidebar signal cards, grid kategori + preview compact, dan CTA/final footer lebih premium) sambil mempertahankan logic data/route existing.
- **Web source-structure normalization (2026-04-27):** `apps/web` kini menggunakan konvensi root-level App Router secara penuh (`app`, `components`, `features`, `lib`, `server`, `locales`, `public`) dan runtime tree `apps/web/src` dihapus untuk menghindari pola ganda yang membingungkan.
- **Compatibility import bridge (2026-04-27):** alias `@src/*` sementara tetap tersedia namun dipetakan ke root path agar import lama tetap bekerja selama masa transisi tanpa memecah route/build/runtime.
- **Freelancers listing decision pass (2026-04-26):** row hasil pada `/freelancers` dipoles agar lebih mudah dibandingkan dan ditindaklanjuti: name+role, value statement singkat, rating/review, lokasi+mode kerja, harga mulai, sinyal keputusan, dan CTA tunggal `View profile`.
- **Freelancers low-data preview pass (2026-04-26):** ketika hasil kosong, halaman kini menampilkan blok `Example freelancers` (3 row struktur realistis tanpa data palsu) serta activity strip ringan di atas list untuk menjaga kesan marketplace aktif.
- **Freelancers directory vitality pass (2026-04-26):** halaman `/freelancers` kini menampilkan copy header yang lebih outcome-driven, quick filter chips di atas hasil (`Nearby`, `Remote`, `Budget fit`, `Available now`), trust-benefit bullets ringkas, dan skeleton rows saat hasil kosong; empty state dibuat lebih kecil dan action-oriented agar user tetap terdorong mengeksplorasi.
- **Hero live panel anti-fake pass (2026-04-26):** fallback panel tidak lagi menampilkan contoh row/persona; render kini terbatas ke row data nyata bila tersedia, atau copy aman netral bila data belum ada.
- **Hero live panel safety pass (2026-04-26):** panel kanan homepage sekarang memprioritaskan baris aktivitas dari data nyata; saat data belum tersedia, sistem menampilkan fallback copy netral + label aktivitas contoh agar tidak memberi kesan fake live users.
- **Hero simplification pass (2026-04-26):** panel visual slider pada sisi kanan hero dihapus untuk menjaga fokus produk; diganti panel ringan berisi cue marketplace aktif dan sample rows singkat. Fokus utama tetap pada copy + CTA + search, dengan struktur responsif dan behavior intent/i18n tidak berubah.
- **Hero micro-polish refinement (2026-04-26):** struktur split hero tetap dipertahankan, namun ritme visual dipoles untuk kualitas premium: spacing desktop/mobile lebih seimbang, headline/subtext/trust hierarchy lebih jelas, search block lebih nyaman sebagai aksi utama, dan panel slider dibuat lebih tenang (crop konsisten + controls subtler) agar tidak terasa dekoratif.
- **Hero marketplace-energy redesign (2026-04-25):** first screen homepage kini memakai split layout (copy/search/CTA kiri + scenario slider kanan) untuk memperkuat kesan marketplace aktif dan human, bukan form internal. Copy hero ID/EN diperbarui ke outcome yang lebih langsung, trust line dipertegas, quick filters tetap tersedia, dan activity line memakai wording manusiawi dengan fallback aman saat data rendah.
- **Brand voice + positioning pass (2026-04-25):** wording homepage dan surface publik kunci kini konsisten dengan positioning NearWork sebagai marketplace freelance terstruktur; alur `job -> proposal -> discussion` dibuat lebih eksplisit, trust line diseragamkan (`All proposals and chats stay tied to the job`), CTA dibuat lebih konkret (`Find freelancers`, `Post a job`, `Start discussion`), dan microcopy empty/reassurance disederhanakan agar lebih action-oriented.
- **Homepage copywriting micro-pass (2026-04-25):** area hero kini menampilkan proof marketplace lebih dekat ke aksi utama (tepat di bawah search) dan placeholder pencarian yang lebih konkret, sehingga user lebih cepat menangkap “aktivitas sedang terjadi” tanpa perubahan layout.
- **Marketplace energy refinement (2026-04-25):** copy dan sinyal aktivitas homepage diperhalus agar terasa lebih hidup tanpa gimmick: headline lebih action-oriented, activity strip lebih conversational, kategori tetap kontekstual via use-case, dan preview rows menekankan urgency signals non-fake.
- **Homepage conversion refinement (2026-04-25):** halaman depan kini lebih tegas sebagai marketplace aktif: hero copy berorientasi outcome, bar activity/trending/filter disederhanakan menjadi satu strip, kartu kategori memuat contoh use-case, preview rows menampilkan urgency signal ringan, dan final CTA diarahkan ke aksi yang lebih langsung.
- **Homepage hero micro-tuning (2026-04-25):** tanpa redesign ulang halaman, area hero dipadatkan agar tujuan user terbaca lebih cepat: mode hire/work diposisikan dekat CTA utama, visual anchor search diperkuat, dan noise copy sekunder dikurangi sehingga langkah klik pertama menjadi lebih jelas.
- **Homepage live-marketplace pass (2026-04-25):** landing publik kini lebih cepat mengarahkan aksi: fokus hero dipindah ke search, indikator activity kecil ditampilkan dari data marketplace nyata, kategori divisualkan sebagai grid card yang lebih eksploratif, dan preview konten dipisah menjadi rail freelancer aktif + lowongan terbaru untuk mengurangi rasa landing statis.
- **Jobs empty-state action clarity (2026-04-24):** saat feed `/jobs` kosong tanpa filter, user kini mendapat empty state yang mengarahkan aksi pertama secara eksplisit (post job / browse freelancers), dilengkapi contoh use case posting dan arahan berbasis role agar halaman tetap terasa hidup meski belum ada listing.
- **Success redirect timing polish (2026-04-24):** redirect setelah aksi sukses pada flow inti kini diberi delay ringan (~400ms), khususnya setelah publish job dan setelah proposal submit (saat thread tersedia), supaya transisi terasa lebih intentional tanpa menambah kompleksitas flow.
- **Pre-launch UX friction pass (2026-04-24):** pengalaman lintas flow disempurnakan dengan feedback pasca-aksi + next-step cues: setelah posting job owner menerima konfirmasi kontekstual di detail job, state “no proposals yet” kini memberi tindakan lanjutan, dan handoff ke Messages dari review proposal membawa marker konteks agar user tidak kehilangan alur.
- **Notifications quick triage chips (2026-04-24):** pengguna kini bisa memfilter daftar notifikasi secara instan di sisi client (`All`, `Proposals`, `Messages`, `Contracts`) untuk memfokuskan kategori aktivitas tanpa request API tambahan.
- **Notifications category volume cues (2026-04-24):** chip filter notifikasi kini menampilkan count kategori yang dihitung dari daftar notifikasi yang sudah dimuat, sehingga user bisa melihat volume aktivitas per kategori secara cepat tanpa menambah kompleksitas backend.
- **Notification visibility pass (2026-04-24):** halaman notifications sekarang mempermudah pemindaian aktivitas penting lewat badge tipe event per item + emphasis unread/read yang lebih konsisten, dengan destination action lebih tepat (thread/job/contract sesuai payload).
- **Role dashboards cue pass (2026-04-24):** dashboard client dan freelancer menambahkan cue aktivitas yang lebih langsung ke tindakan (proposal review, message reply, accepted bid/proposal status updates) tanpa menambah sistem notifikasi baru.
- **Quick triage filter for client jobs (2026-04-24):** `/client/jobs` menambahkan filter ringkas `Needs review` yang menyaring listing dengan proposal pending/shortlisted atau proposal baru, sehingga client bisa langsung menjawab “mana yang perlu ditinjau hari ini?” tanpa memindai seluruh daftar.
- **Client intake visibility (2026-04-24):** dashboard/client-jobs kini memperjelas proposal activity per listing (badge proposal baru + jumlah proposal masuk) dan memberi hierarchy lebih tegas pada row yang perlu tindakan; owner view di detail job menambahkan ringkasan “action needed” agar langkah review -> conversation -> shortlist/accept lebih eksplisit.
- **Proposal-origin context banner (2026-04-24):** saat user membuka thread dari hasil submit proposal, URL handoff kini menyertakan `from=proposal`; halaman `/messages` membaca flag ini untuk menampilkan banner konteks singkat (EN/ID) agar user tahu percakapan dibuka dari proposal terbaru.
- **Post-proposal messaging continuity (2026-04-24):** setelah proposal berhasil dikirim dari detail job, user mendapat next-step copy yang jelas dan link ke percakapan (`Open conversation`) bila thread job siap; area thread di `/messages` menampilkan context ringkas job + status proposal agar orientasi diskusi tetap jelas.
- **Proposal local draft autosave (2026-04-24):** proposal form freelancer di `/jobs/[jobId]` sekarang menyimpan draft secara lokal (tanpa backend/API baru) untuk mencegah kehilangan teks saat refresh/close tab; draft dipisah per kombinasi `jobId` + `userId`, dipulihkan saat form load, dan dihapus otomatis setelah proposal sukses terkirim.
- **Proposal submit UX guidance (2026-04-24):** panel apply di `/jobs/[jobId]` kini menyediakan form terstruktur (intro, pendekatan kerja, timeline/ketersediaan, harga, estimasi hari) dengan placeholder panduan + reassurance non-komitmen, sehingga freelancer tidak lagi menghadapi permukaan apply yang terasa kosong.
- **Proposal submit loading feedback (2026-04-24):** saat freelancer mengirim proposal, sistem menampilkan overlay proses yang konsisten dengan pola submit auth (dim + loader + status text) untuk mengurangi ketidakpastian saat request berjalan.
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

