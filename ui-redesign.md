# NearWork UI Redesign Audit + Design Language

> **Doc revision:** v91  
> Last synchronized: 2026-05-09 (global marketplace design system: shared tokens di `globals.css` + Tailwind; `Button`/`Card`/`EmptyStateCard`; client dashboard surfaces + EN/ID status copy; jobs board chip utilities; `DashboardShell` header).

## Goal

Build a grounded, practical, product-first UI across public and authenticated surfaces without changing core business logic.

## Progress update (April 2026)

### 2026-05-09 — Global design system pass (tokens + primitives + client dashboard)

- **`app/globals.css`:** `--primary` / `--ring` diselaraskan ke indigo NearWork; `--radius` sedikit lebih besar; utilitas baru **`nw-card`**, **`nw-card-elevated`**, **`nw-card-trust`**, **`nw-card-inset`**, **`nw-type-*`**, **`nw-stack*`**, **`nw-chip` / `nw-chip-brand` / `nw-chip-muted`**, **`nw-chip-quiet`**, **`nw-cta-secondary`**, **`nw-link-action`**, **`nw-app-header`**; `nw-surface` + `nw-empty-state` disempurnakan.
- **`tailwind.config.ts`:** `fontSize` (`nw-lead`, `nw-body`, `nw-caption`), `boxShadow` (`nw-card`, `nw-card-hover`, `nw-elevated`), `transitionDuration.nw`.
- **Komponen:** `Button` (tinggi default 40px, `rounded-lg`, secondary border); `Card` (`rounded-xl`, `shadow-nw-card`); `EmptyStateCard` memakai rail `nw-empty-state`; `DashboardStatCard` / `DashboardEmptyState` mengikuti kartu/stack baru.
- **Client dashboard:** hero + panel memakai utilitas NW; quick actions + hero CTA + badge proposal + meta job + status kontrak/bid memakai **kamus** (`dashboard.client.*` termasuk `jobStatus` / `bidStatus` / `contractStatus`); link Settings locale-aware (`withWorkspaceLocale`).
- **Jobs browse:** filter work mode + trending chips memakai **`nw-chip`** / **`nw-chip-quiet`**.
- **`DashboardShell`:** header mobile memakai **`nw-app-header`**.

### 2026-05-09 — Public freelancer profile marketplace pass (`/freelancers/[username]`)

- **Layout:** breadcrumb ke direktori publik; grid desktop **konten utama + sidebar sticky** (rating, ulasan, kontrak selesai, member since, update profil relatif, tarif, completeness hint, mode, ketersediaan, lokasi); CTA pesan + simpan profil + kembali.
- **Hero:** `NW_HERO_WRAP`, avatar URL atau inisial, verifikasi/pending, headline, chip mode + ketersediaan + hire count, lokasi, skill chips, **Great fit for** (heuristik nyata seperti sebelumnya), CTA primer `AuthAwareCtaLink` ke `withWorkspaceLocale(…, /messages)`.
- **Konten:** section About / Services / Work preferences / Languages (placeholder jujur—belum ada kolom bahasa di schema) / Portofolio grid atau **owner-only** empty CTA ke `/freelancer/profile` / Reviews premium + konteks job dari relasi review.
- **Mobile:** strip ringkas rating+tarif di hero; sticky bawah **kontak + save** tanpa blur.
- **Tombol simpan:** `SaveFreelancerButton` memakai kamus `public.freelancerProfile.saveFreelancerCta*` (EN/ID).

### 2026-05-09 — Public job detail marketplace pass (`/jobs/[jobId]`)

- **Hero:** `NW_HERO_WRAP` + gradient hairline, status/proposal/posted/competition chips, budget indigo besar, mode+lokasi+kategori, skills di fold, sinyal heuristik (tanpa metrik palsu).
- **Trust panel:** inisial klien, `verificationStatus`, ulasan agregat (`reviewCount` / `averageReviewRating`), `createdAt`/`updatedAt` profil, hitungan kontrak `COMPLETED` per `clientUserId`, jumlah lowongan `OPEN` publik per klien—**tanpa** respons palsu.
- **Freelancer:** overlap skill dari `FreelancerSkill` vs tag job; sidebar sticky (`nw-proposal-section`) berisi pulse mini + `JobProposalForm` atau `AuthAwareCtaLink` + CTA diskusi ke anchor; footer mobile solid (tanpa `backdrop-blur`).
- **Klien:** kartu `Card` review proposal tetap; snapshot 3-kolom lama dihapus agar tidak redundan.
- **Related jobs:** query Prisma kategori sama, judul dilokalisasi seperti board.
- **Repo:** `findByIdPublic` memperluas `clientProfile` dengan field verifikasi/ulasan/timestamp (tanpa `userId` di payload publik—tetap lewat query `owner` internal untuk form).

### 2026-05-09 — Public jobs listing realism (`JobsPublicList` + mobile filters)

- **Cards:** dense scan row (work mode + category + translation + status badges from real `bidCount` / `createdAt` / featured), client row with initials chip + verified badge, title/description clamp, budget + proposal count + relative post time, skill tags + heuristic “signal” line with honest tooltip keys (`matchForYouHint`, `signalHint`).
- **CTAs:** primary `AuthAwareCtaLink` with `intent="submit-bid"` (`Kirim proposal` / `Send proposal`); secondary plain `Link` for brief (`Lihat brief` / `View brief`); save affordance unchanged (real `SaveJobButton`).
- **Mobile sheet:** `JobsMarketplaceMobileFilters` overlay `bg-slate-900/60` (no `backdrop-blur`), taller sheet `rounded-t-2xl`, section headers `font-bold` tracking, list selections use solid **`#3525cd`** active fills, thumb-friendly pill heights for work mode.

### 2026-05-09 — Homepage tanpa glass (anti-template)

- **Solid surfaces:** hero dan section bawah memakai **`bg-slate-50` / `bg-white`** + border `slate-200`; kartu proses **`bg-slate-50`**; tidak ada **`backdrop-blur`** atau **`bg-white/80`** pada landing.

### 2026-05-09 — Homepage marketplace-first hero

- **Process rail:** panel kanan hero (dan blok ringkas di mobile) menampilkan empat langkah alur produk nyata (`post → proposals → chat → hire`) dari kamus `landing.hero.process.*`, bukan kartu freelancer contoh.
- **Search affordances:** bar pencarian memuat keyword + kota + `categoryId` dari data kategori + `workMode` (REMOTE/HYBRID/ONSITE) selaras dengan direktori publik.

### 2026-05-10 — Workspace URLs mirror marketing locale

- **Canonical bars:** bilah alamat untuk shell klien/freelancer/inbox mengikuti pola `/en/…` atau `/id/…`, selaras dengan halaman pemasaran berbahasa tunggal.

### 2026-05-09 — Locale + currency presentation (marketplace-wide)

- **Principle:** job/bid/contract amounts use **stored ISO currency**; UI locale chooses grouping/symbol conventions (`id-ID` grouping for Indonesian app locale; IDR-specific compact helpers where used).
- **Implementation:** consolidate on `apps/web/lib/format-money.ts` for cards, dashboards, proposals, admin financial tables, and subscription catalog tiles—avoid raw `Intl.NumberFormat(undefined, …)` in product surfaces.
- **Profile hourly rates:** no per-profile currency column yet; display defaults to **IDR** until schema extends.

### 2026-05-09 — Public jobs marketplace editorial pass (`/jobs`)

- **Desktop filters** (sticky aside): category / budget / posted / work-mode links aligned to **`rounded-lg`** (same rhythm as search row + mobile filter sheet).
- **Hero**: neutral editorial shell, activity strip from **pulse** aggregates, category browse chips, **live snapshot** column (featured first job + real proposal/job/freelancer rows from `PublicStatsService`)—no decorative placeholder card.
- **Search**: compact **h-10** controls, `rounded-lg`, work-mode pills—less “giant AI search” footprint.
- **Job list**: flatter **`rounded-lg`** cards, **no gradient orb**, tighter padding; **client initials** avatar; budget / proposals / posted time in one scan line; badges **grounded in data** (“Few applicants” only when `bidCount ≤ 2`, “High activity” when `bidCount ≥ 10`).
- **Mobile**: filter trigger + sheet use **tighter radii/spacing** (`rounded-lg` / `rounded-t-xl`).

### 2026-05-09 — Public jobs marketplace premium pass (`/jobs`)

- Full-width **hero**: soft violet gradient, trust row, abstract “opportunity density” panel (non-data illustrative), elevated **search card** (keyword, location, category, primary CTA), popular chips + **work-mode chips** including “any mode”.
- **Three-column** layout retained with **floating** filter column (accordion, category/budget/posted/work mode — posted windows are real query params), **mobile filter sheet** (drawer-style, touch-friendly).
- **Job cards**: NearWork indigo CTAs, bookmark/save (**real** saved state when logged in via server-resolved ids), **verified client** badge from `ClientProfile.verificationStatus`, **exact proposal count** from `_count.bids`, skill chips from `JobSkill`, heuristic “great match” chip with honest tooltip (freshness/budget/featured—not ML).
- **Marketplace pulse**: recent **open jobs** with per-row `createdAt`, recent **bids** with freelancer name + timestamp; **insights** strip drops fabricated “avg response” in favor of three **live aggregates** (open public jobs, bids 24h, freelancers available) + footnote.
- i18n: new `public.jobs.*` strings (EN/ID) for hero, pulse, notifications CTA, chips; listing data paths extended in `SearchService`/`JobService` (SSR-friendly; no new client-only data layers).

### 2026-05-09 — Freelancer dashboard “career workspace” pass

- `/freelancer` layout adopts **premium DashboardShell**: frosted floating sidebar (`rounded-3xl`), clearer icon rail navigation, localized **jobs keyword search**, inbox/notification badges (real unread + awaiting reply), and community help card (**no billing checkout** beyond existing early-access copy).
- Freelancer dashboard view: dark **hero** surface with translucent stat tiles (**proposals submitted, active contracts, review signal, saves**), onboarding **journey** checklist (progress meter + elevated step cards), **proposal playbook + liquidity hints**, workspace pulse ribbons, authentic **7-day pulse** pane, threaded **conversation shortcuts**, skill bars keyed to profile years, and refreshed job sampler.

### 2026-05-09 — Role dashboards liquidity read

- Client `/client`: hero card + expanded **At a glance** grid (five stats: jobs, proposals, discussions awaiting reply, active contracts, completed hires); section chrome + summaries pull from localized copy; hints no longer ship hardcoded English in the loader.
- Freelancer `/freelancer`: matching premium shell (brand kicker header card, softer panel shadow), fifth stat column for **threads awaiting reply**, localized quota/profile hints, amber **next action** strip with Messages CTA when reply backlog is non-zero, localized activity/open-job empty kickers.
- Principle unchanged: counts and flags are **live service data only** (`MessageService` thread backlog, quotas, bids, contracts), not invented funnel KPIs.

### 2026-05-08 — Proposal & review trust surfaces

- Detail job (freelancer): panel proposal terstruktur + petunjuk ringan per field; assemble cover letter konsisten dengan heading yang diparse untuk skor kelengkapan.
- Owner review: kolom/kartu “proposal depth”, bandingkan cepat (harga/hari/profil), CTA diskusi primer, laporan sekunder; empty state proposal memakai blok What/Why/Next.
- `/messages`: strip konteks hiring (judul + status job + status proposal + langkah disarankan); tone workplace, bukan obrolan sosial; target sentuh checklist aktivasi diperbesar.

### 2026-05-08 — Early-launch onboarding & empty surfaces

- Dasbor client/freelancer: kartu checklist aktivasi + blok petunjuk likuiditas (brief/proposal) dengan EN/ID; empty states utama memakai hierarki produk konsisten dengan `DashboardEmptyState`.
- `/messages` workspace + `/notifications` center menggunakan string kamus untuk empty, filter kosong, label kategori utas/thread, serta handoff banner dari proposal/job review—tanpa menyentuh billing.

### 2026-05-01 — Homepage full composition refinement

- Hero rhythm dipadatkan agar lebih mirip referensi: heading size/leading, CTA height, search row, dan kartu benefit dibuat lebih seimbang.
- Footer marketing dinaikkan ke pola informasi lengkap (brand + social icons, 3 kolom link, newsletter slot, dan locale marker) untuk menutup halaman seperti target desain.

### 2026-05-01 — Landing first-screen alignment fix

- Default state homepage sekarang recruiter-first (`hire`) agar headline/CTA awal langsung match visual target.
- Navbar logged-out dipangkas ke aksi utama (`Masuk`, `Daftar`, locale switcher) untuk menjaga hierarchy seperti referensi dan menghindari elemen chrome yang terasa "mock".

### 2026-05-01 — Register helper microcopy polish

- Context line setelah signup sukses kini memakai label tujuan yang natural (`halaman profil Anda`, `your profile page`) alih-alih menampilkan URL teknis.
- Mapping tujuan dibuat berbasis route intent agar copy tetap relevan untuk profile/messages/notifications/settings/dashboard.

### 2026-05-01 — Homepage final dual-user landing alignment

- Layout tetap landing (bukan dashboard): hero utama + visual cards kanan + search block + value strip + CTA band.
- Toggle intent (`Saya ingin rekrut` / `Saya ingin kerja`) dipertahankan sebagai pusat kontrol mode dengan active state tegas.
- Headline, CTA, dan search intent tetap dinamis per mode untuk memastikan kedua tipe user langsung merasa relevan.
- Visual cards kanan dipertahankan sebagai konteks produk (non-data real), agar halaman tidak terasa kosong.
- Section data-heavy (freelancer list, job list, live activity, marketplace preview) tidak ditampilkan di homepage final.

### 2026-05-01 — Homepage final-reference micro alignment

- Komposisi hero disetel lebih dekat ke referensi visual final: balance area headline dengan visual kanan, skala heading, dan jarak vertikal antar blok utama.
- Search row dipertahankan lengkap (keyword + lokasi + kategori + cari) dengan quick chips populer agar tidak terasa kosong.
- Value strip (`Cepat`, `Aman`, `Fleksibel`) dan CTA band bawah diperhalus spacing/shape-nya agar ritme landing lebih presisi.

### 2026-05-01 — Global navigation transition polish

- Ditambahkan wrapper transisi global di root layout (`GlobalPageTransition`) agar perpindahan route internal memiliki feedback visual konsisten di seluruh produk.
- Saat user pindah menu internal, kini muncul top loading bar tipis (warna brand ungu) dengan animasi progres halus.
- Konten utama diberi dim/fade state singkat selama route transition untuk mengurangi rasa abrupt/kedip.
- Ditambahkan `app/loading.tsx` sebagai skeleton fallback global (struktur board/list + sidebar placeholders) agar loading route tidak terasa kosong.
- Prinsip visual tetap subtle dan utilitarian: tanpa spinner besar, tanpa animasi berlebihan, fokus pada perceived performance.

### 2026-05-01 — Jobs board redesign (Upwork/Fastwork-style utility)

- `/jobs` diubah menjadi data-driven board, bukan landing section: search block dominan (keyword + lokasi + kategori + quick tags) dibuat sticky agar flow cari job selalu mudah dijangkau.
- Desktop menggunakan layout 3 kolom: filter kiri yang ringkas (kategori, budget, tipe kerja, experience), list lowongan tengah, dan panel kanan untuk live activity + insight + quick tips.
- Row job dipoles agar cepat dibandingkan: judul besar, client/lokasi, budget jelas, waktu posting, tag context, badge urgensi (`Baru`, `Urgent`, `Sedikit pelamar`), serta CTA primer `Apply` dengan `Lihat detail` sebagai sekunder.
- Ditambahkan blok “kategori paling banyak dicari” dan CTA ringan (`Set alert job`, `Upload CV`) untuk menjaga momentum action saat user belum menemukan fit.
- Visual tetap grounded (solid surface, border tipis, shadow minim) tanpa glassmorphism, gradient berat, atau feel marketing template.

### 2026-05-01 — Freelancers hiring-tool redesign (real-time utility layout)

- Halaman `/freelancers` diubah dari feel “landing/listing biasa” menjadi interface tool: search bar dominan (keyword + lokasi + kategori + quick tags) ditempatkan sebagai blok utama sticky di atas fold.
- Layout desktop sekarang eksplisit 3 kolom: filter kiri yang ringan/collapsible, list vertikal kandidat di tengah untuk compare cepat, dan panel kanan untuk `Aktivitas live`, `Insight hari ini`, serta `Mode kerja`.
- Listing row dipoles agar hierarchy keputusan lebih jelas: **Nama > Harga > Status > Rating**, plus avatar, badge verified, response-time hint, tags skill/signal, dan CTA utama `Chat` (sekunder `Lihat profil`).
- Ditambahkan section `Job terbaru dari klien` di bawah daftar freelancer untuk menjaga alur eksplorasi lintas supply (talent) dan demand (job) tanpa pindah konteks jauh.
- Gaya visual tetap grounded: solid white/light surfaces, border tipis `#E5E7EB`, shadow sangat ringan, tanpa glassmorphism/gradient berat/dekorasi hero.

### 2026-04-30 — Homepage mockup alignment pass (SaaS marketplace look)

- Landing homepage dipoles ke visual ritme yang lebih premium: white base, soft purple accent, border halus, rounded cards, dan spacing lebih lapang.
- Hero ditata sebagai split layout: kiri untuk intent + CTA + headline + search card, kanan untuk panel sinyal marketplace (aktif/live/work mode).
- Search block diperkuat sebagai action center dengan chips cepat, live badges, dan tombol `Filter lanjutan`.
- Sidebar kanan kini meniru struktur mockup dengan card `Marketplace aktif`, `Aktivitas live`, dan `Pola kerja`.
- Navbar + footer dirapikan untuk kesan produk modern (sticky clean top bar, CTA primer jelas, footer kolom minimal).
- Scope tetap UI-only: route, backend/service logic, dan event handler utama tidak diubah.

### 2026-04-26 — Freelancers listing marketplace-grade refinement

- Struktur row `/freelancers` disederhanakan ke data keputusan inti: name + role, value statement singkat, rating/review, lokasi + work mode, harga mulai, dan CTA primer tunggal `View profile`.
- Signal perbandingan dipilih yang bermakna untuk keputusan (`available this week`, `responds fast`, `top rated`) tanpa menambah metrik palsu.
- Elemen non-esensial seperti emphasis username dan badge yang terlalu dekoratif dikurangi agar scanning antar-row lebih cepat.
- Saat data kosong, list menampilkan mode `Example freelancers` (3 row contoh struktur, bukan data user palsu) supaya halaman tetap terasa hidup dan user paham format perbandingan.
- Ditambahkan activity strip kecil di atas list (`Freelancers available now`, `Updated daily`) untuk menjaga sense aktivitas marketplace.

### 2026-04-26 — Freelancers page vitality refinement

- Header copy `/freelancers` dipoles menjadi lebih action-oriented untuk keputusan hiring yang cepat.
- Empty state dibuat lebih ringan (card lebih kecil, tone tidak “platform kosong”), lalu diarahkan ke tindakan konkret (ubah filter / eksplorasi kategori).
- Ditambahkan quick chips (`Nearby`, `Remote`, `Budget fit`, `Available now`) tepat di atas hasil agar user punya jalur eksplorasi cepat.
- Saat hasil kosong, list kini menampilkan 2-3 skeleton rows agar ruang tidak terasa blank.
- Sidebar CTA freelancer disederhanakan jadi satu aksi inti: `Complete profile`.

### 2026-04-26 — Live panel anti-fake refinement

- Sample people/rows pada panel hero dihapus dari fallback agar tidak terlihat seperti simulasi user aktif.
- Saat data ada, panel menampilkan row real dari freelancer/job terbaru dengan konteks kerja (specialty/location/work mode/availability).
- Saat data kosong, panel hanya menampilkan fallback copy netral (tanpa data palsu).

### 2026-04-26 — Live panel trust/safety pass

- Panel kanan hero kini **real-data-first**: baris aktivitas memakai data listing freelancer aktif dan brief terbaru jika tersedia.
- Saat data belum ada, panel menampilkan label **Example activity / Contoh aktivitas** dan fallback copy netral tanpa nama pengguna.
- Tujuan pass ini: menjaga panel terasa jujur dan operasional, bukan simulasi aktivitas palsu.

### 2026-04-26 — Hero focus pass (remove visual slider)

- Komponen `HeroScenarioSlider` dihapus dari landing hero untuk mengurangi distraksi visual dan memperkuat fokus ke aksi produk.
- Area kanan hero diganti panel “live marketplace” yang ringan: tiga sinyal status + dua sample rows berbentuk struktural (bukan dekoratif).
- Gaya panel dijaga netral (`border + spacing`, tanpa gradient/glow/shadow berlebih) agar tetap sejalan dengan identitas NearWork yang clean dan terstruktur.

### 2026-04-26 — Hero visual rhythm micro-polish

- Desktop rhythm disetel ulang supaya panel copy/search tidak terasa padat, sementara panel slider tetap hadir kuat tapi tidak menenggelamkan CTA utama.
- Hierarki teks dipoles: headline tetap dominan namun lebih terkontrol, subtext lebih nyaman dibaca, trust/activity line diturunkan sebagai informasi sekunder.
- Search panel dipoles sebagai action block utama (input height/radius/spacing/quick filters) agar terasa lebih premium dan kurang seperti form internal.
- Slider dirapikan secara visual: crop ratio lebih konsisten lintas breakpoint, overlay caption lebih terbaca tanpa efek berlebih, serta dots/arrows dibuat lebih subtil.

### 2026-04-25 — Hero split redesign (live marketplace energy)

- Hero homepage dipindah dari komposisi “form-forward” ke split layout yang lebih manusiawi: sisi kiri fokus outcome, CTA, trust, dan search; sisi kanan menampilkan visual carousel skenario kerja.
- Ditambahkan slider visual ringan (aset SVG lokal, autoplay lambat, dots/arrows, pause-on-hover) untuk menegaskan konteks kerja nyata: event photo, video remote, tutor, design, dan review proposal.
- Search tetap menjadi aksi utama, tapi dipoles sebagai tool premium ringkas (need + city + submit + quick filters) alih-alih tampilan form padat.
- Activity line diganti dari nada sistem internal ke nada marketplace human-readable dengan fallback aman jika data rendah agar tidak terkesan “dead board”.

### 2026-04-25 — Brand voice + positioning pass (structured marketplace)

- Copy homepage dan surface publik utama diselaraskan ke positioning NearWork: **structured freelance marketplace**, bukan marketplace generik.
- Hero line sekarang lebih menonjolkan alur kerja (`post job -> review proposals -> start discussion`) alih-alih wording marketplace umum.
- Signature trust line dipertegas konsisten: **“All proposals and chats stay tied to the job.”**
- CTA publik dibuat lebih konkret dan task-driven (`Find freelancers`, `Post a job`, `Start discussion`).
- Microcopy empty/reassurance dipoles jadi lebih direct, practical, dan non-hype tanpa perubahan struktur layout.

### 2026-04-25 — Copywriting + micro-UX polish

- Hero placeholder diganti dengan contoh layanan yang lebih konkret agar user cepat tahu apa yang bisa dicari.
- Proof lines aktivitas dipindah lebih dekat ke titik aksi (tepat di bawah search form) untuk memperkuat rasa marketplace live.
- Tone headline/CTA tetap action-oriented tanpa menambah ornamen atau mengubah struktur layout.

### 2026-04-25 — Marketplace energy refinement (honest signals)

- Outcome headline dipertajam lagi agar user langsung paham aksi utama dalam konteks hiring/work.
- Activity bar tetap satu strip namun copy dibuat lebih conversational untuk nuansa feed yang hidup.
- Urgency di preview rows dipoles agar terasa aktif tanpa memakai angka sintetis/fake.
- Final CTA urgency line diperkuat ke bahasa aksi yang lebih decisive.

### 2026-04-25 — Live-marketplace conversion refinement

- Copy hero diarahkan ke outcome (hasil yang user dapat) alih-alih deskripsi produk yang pasif.
- Activity/trending/quick filters digabung menjadi satu strip horizontal yang lebih bersih.
- Category cards menampilkan contoh use-case nyata agar entry point terasa lebih kontekstual.
- Preview rows menambahkan urgency signals ringan untuk memperkuat kesan aktivitas aktual.
- Final CTA diposisikan lebih action-driven untuk mendorong langkah berikutnya dengan jelas.

### 2026-04-25 — Hero micro-tuning for first 3 seconds

- Intent switch (`hire/work`) dipindah ke area atas hero dan digabungkan dengan CTA layer agar arah user langsung terbaca.
- Search container diperkuat sebagai visual anchor (spacing + weight) dan copy non-aksi dipangkas.
- Hierarki CTA dipertegas menjadi satu primary yang dominan, sementara secondary actions diturunkan bobot visualnya.

### 2026-04-25 — Homepage live-marketplace refresh

- Struktur hero dibuat lebih terbuka dan terpusat ke search sebagai aksi pertama, sambil menurunkan teks pasif.
- Ditambahkan indikator aktivitas kecil berbasis data nyata marketplace (freelancers available + open jobs) agar halaman terasa hidup tanpa gimmick visual.
- Kategori dipresentasikan sebagai grid card yang lebih besar dan lebih jelas sebagai entry point eksplorasi.
- Preview listing dipecah menjadi dua rail ringan (`Active freelancers`, `Recent jobs`) dengan row-style sederhana agar scan cepat dan tidak terasa seperti card wall.

### 2026-04-24 — Jobs empty-state action-first pass

- Zero-state pada `/jobs` diganti dari gaya “informasi kosong” ke “mulai aksi”, dengan headline langsung, CTA utama post job, CTA sekunder browse freelancers.
- Ditambahkan section contoh use-case posting lowongan agar user cepat paham brief seperti apa yang bisa dipasang.
- Pada kondisi kosong baseline, panel filter diturunkan prioritasnya dengan diposisikan di bawah konten utama agar fokus user tetap ke langkah awal.

### 2026-04-24 — Redirect pacing polish

- Redirect setelah success action penting kini tidak instan, melainkan diberi jeda singkat (~400ms) agar feedback sukses sempat terbaca.
- Diterapkan pada publish job dan submit proposal (saat thread percakapan sudah siap), menjaga rasa transisi yang tenang tanpa menambah UI berat.

### 2026-04-24 — Pre-launch UX continuity pass

- Setelah client publish job, detail job kini menampilkan confirmation strip + arahan next action yang langsung mengarah ke review queue/list jobs.
- Saat owner membuka/buat conversation dari review proposal, URL handoff membawa context marker dan Messages menampilkan banner konteks ringan agar transisi tidak terasa “putus”.
- Empty state proposal pada owner view job detail kini punya CTA lanjut yang konkret (review queue / open jobs list), bukan hanya teks status.

### 2026-04-24 — Notifications category chips

- Notifications center kini menambahkan chips filter ringan (`All`, `Proposals`, `Messages`, `Contracts`) yang bekerja sepenuhnya di client-side.
- Tiap chip sekarang menampilkan count kecil (`(n)`) yang dihitung dari data notifikasi yang sudah dimuat agar triage volume lebih cepat tanpa noise visual.
- State unread/read tetap dipertahankan di dalam tiap kategori agar prioritas perhatian tidak hilang saat triage.
- Saat kategori aktif tidak memiliki item, ditampilkan empty state khusus kategori tersebut.

### 2026-04-24 — Notification scanability refinement

- List notifikasi kini menampilkan label tipe aktivitas yang lebih eksplisit per item (proposal, message, bid accepted, contract update) untuk mempercepat triage.
- Unread tetap menonjol secara halus; read diturunkan bobot visualnya untuk mengurangi noise.
- Empty state notifikasi disederhanakan ke copy yang fokus pada ekspektasi aktivitas marketplace berikutnya.

### 2026-04-24 — Needs-review quick filter

- `/client/jobs` kini menampilkan chip filter cepat (`All jobs`, `Needs review`, `Open`, `Closed`) di atas filter status.
- Mode `Needs review` memusatkan listing yang butuh aksi client (proposal pending/shortlisted atau proposal baru) tanpa menambah UI berat.
- Saat kosong, muncul empty state khusus yang menegaskan tidak ada job yang perlu review saat ini.

### 2026-04-24 — Client proposal intake cues

- Daftar job client kini memberi penekanan visual lebih jelas untuk aktivitas proposal baru (`New proposal`) + volume proposal yang sudah masuk per job.
- Baris/list item dengan proposal baru diberi hierarchy lebih tinggi agar owner cepat mengenali pekerjaan yang membutuhkan review.
- Owner section pada detail job menambahkan panel “action needed” yang menyederhanakan langkah berikutnya: review proposals, buka percakapan, lalu shortlist/accept.

### 2026-04-24 — Handoff query acknowledgement

- Link `Open conversation` dari success state proposal kini memakai query context `from=proposal`.
- Messages page menampilkan banner ringan saat query ini ada, sehingga transisi “baru kirim proposal -> lanjut chat” terasa eksplisit tanpa komponen alert berat.
- Banner dapat ditutup dan query dibersihkan dari URL secara aman lewat client-side replace.

### 2026-04-24 — Proposal-to-conversation UX

- Setelah submit proposal sukses, panel apply memberi arahan langkah lanjut yang spesifik ke diskusi (bukan sekadar sukses state statis).
- Bila thread job tersedia/berhasil dibuat, user langsung mendapat link `Open conversation` dari area submit.
- Header thread di halaman messages kini menampilkan context job ringan (judul job, counterpart, status proposal bila tersedia, link balik ke job) untuk mengurangi kehilangan konteks saat pindah dari apply ke chat.

### 2026-04-24 — Proposal local draft continuity

- Form proposal di detail job sekarang melakukan autosave lokal secara silent (tanpa toast berulang) saat user mengetik.
- Draft dipulihkan otomatis saat user kembali ke halaman yang sama, dengan indikator halus “Draft restored”.
- Scope draft dipisah per job + user untuk mencegah konten tercampur antar lowongan/akun.
- Setelah submit berhasil, draft dibersihkan otomatis; tersedia juga aksi ringan `Clear draft` untuk kontrol manual.

### 2026-04-24 — Proposal submission guidance (jobs detail)

- Panel apply freelancer pada `/jobs/[jobId]` beralih dari CTA-only ke form proposal ringan namun terstruktur: `short intro`, `approach to the job`, `timeline/availability`, plus quote dan estimasi hari.
- Tiap bagian memakai placeholder guidance yang menjelaskan apa yang perlu ditulis agar user tidak menghadapi textarea kosong.
- Reassurance copy dipertahankan dekat CTA untuk menurunkan pressure (“ini langkah awal, detail bisa disempurnakan setelah diskusi”).
- Submit action tetap satu langkah (`Send proposal`) dan kini memberi loading overlay untuk feedback proses yang lebih menenangkan.

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

### 2026-04-22 — Remove non-actionable metrics

- Blok hero `Live board snapshot` dihapus karena bersifat analytics-style dan kurang membantu keputusan user publik.
- Counter numerik (`open jobs`, `proposals`) di activity strip diganti dengan shortcut aksi (active now, new today, trending lanes, nearby/remote filters).
- Prinsip diperketat: homepage publik hanya menampilkan elemen yang mendorong aksi langsung (search, browse, compare, open listings).

### 2026-04-22 — Mode-based action clarity

- Di bawah search ditambahkan mode switch `I want to hire` / `I want to work` untuk membantu pengguna memilih jalur tindakan sejak awal.
- CTA area sekarang mengikuti mode aktif: satu primary action dominan per mode, sementara secondary actions diturunkan bobot visualnya.
- Search block ditingkatkan dengan quick filters nearby/remote/budget + budget selector ringan agar eksplorasi lebih cepat tanpa menambah clutter.

### 2026-04-22 — URL-persisted intent

- Mode switch kini menggunakan query `?intent=hire|work` sebagai sumber kebenaran, sehingga state tetap konsisten saat refresh atau saat URL dibagikan.
- Render awal homepage membaca `searchParams` di server (tanpa local-state race), lalu menurunkan intent yang sama ke mode switch, CTA, dan shortcut links.
- Propagasi intent dilakukan selektif ke navigasi browse utama agar konteks tidak hilang, tanpa menambah query secara berlebihan ke semua rute.

### 2026-04-22 — Locale default behavior

- Resolver i18n publik sekarang fallback ke `id` ketika cookie preferensi tidak ada dan browser tidak mengirim sinyal `en`/`id` yang valid.
- Root route tetap diselesaikan di middleware (redirect server-side ke locale prefix) agar tidak terjadi flash konten bahasa yang salah.
- Pilihan bahasa user yang tersimpan (`lang`) tetap diprioritaskan sepenuhnya.

### 2026-04-22 — Global locale priority refinement

- Resolusi browser language kini memakai **primary language token** pada `Accept-Language`, sehingga perilaku lebih natural untuk user global (EN-first browser -> EN).
- Multilingual SEO alternates disetel agar `x-default` menunjuk canonical default locale (`/id`) untuk mengurangi redirect hop pada crawler.

### 2026-04-22 — Force first-visit Indonesian default

- Routing locale publik disederhanakan agar deterministik: URL locale eksplisit -> cookie preferensi -> `id`.
- `Accept-Language` tidak lagi dipakai untuk keputusan default routing, sehingga first-time visitor tanpa preferensi selalu masuk ke `/id`.

### 2026-04-22 — Login interaction feedback

- Saat submit login, UI kini menampilkan overlay gelap ringan di seluruh viewport dengan spinner + teks proses agar user paham request sedang berjalan.
- Tombol submit dan kontrol form tetap disabled selama loading, dengan guard tambahan untuk mencegah submit berulang.
- Overlay memakai transisi opacity singkat (200ms) supaya muncul/lenyap halus tanpa flicker kasar.
- Komponen overlay submit auth diekstrak agar bisa dipakai ulang pada flow auth lain tanpa duplikasi markup/transisi.

### 2026-04-22 — Auth submit consistency pass

- Pola `AuthSubmitOverlay` kini diterapkan ke register dan forgot-password agar perilaku submit auth seragam di seluruh flow.
- Kedua form menonaktifkan semua input/aksi saat loading, menampilkan spinner inline di tombol utama, dan mencegah duplicate submit dari klik berulang.
- Teks feedback loading dipisah per flow di kamus EN/ID (`creating account`, `sending reset link`) agar status proses tetap jelas dan kontekstual.

### 2026-04-22 — Auth copy localization pass

- Register form kini sepenuhnya dictionary-driven (labels, placeholder, role selection copy, outcome hints, password helpers, CTA pairing, dan validation/error texts).
- Forgot-password tidak lagi meminjam key login untuk label email; key locale khusus flow ini ditambahkan untuk menjaga struktur namespace auth tetap rapi.
- Login flow dipertahankan tanpa perubahan logic, dengan verifikasi bahwa semua user-facing copy sudah berasal dari kamus locale.

### 2026-04-22 — Freelancers directory refinement pass

- Result listing `/freelancers` kini bergeser dari grid cards ke row-style directory agar user lebih cepat scan dan membandingkan kandidat pada sumbu yang konsisten (nama, spesialisasi, lokasi/mode, rate, rating, availability).
- Sinyal pemilihan sekunder ditambahkan secara praktis (mis. `Responds fast`, `Available this week`, `Nearby`, `Popular choice`, `Top rated local`) berdasarkan data yang sudah ada (availability, jarak, review/rating, recency profile).
- Hirarki aksi dipertegas dengan satu CTA primer per row (`View profile`) sehingga keputusan berikutnya jelas, sementara elemen lain berfungsi sebagai konteks pembanding.
- Panel filter dipadatkan agar terasa sebagai alat navigasi (bukan form panjang): hint chips untuk orientasi filter + petunjuk mode kerja + guide rate context di dekat kontrol.

### 2026-04-22 — Freelancers decision-confidence refinement

- Tag generik dikurangi; diganti micro-copy alasan memilih yang lebih manusiawi dan berbasis konteks data (`strong reviews in category`, `frequently hired`, `nearby project fit`, `budget-friendly option`).
- Persepsi ranking diperkuat tanpa dekorasi berlebih: dua hasil teratas mendapat penanda hierarki ringan (`Best match`, `Recommended`) + border emphasis tipis.
- Trust signal dipromosikan ke bagian atas row (rating + review count) agar terbaca di scan pertama, bukan tertimbun di area footer kartu.
- CTA `View profile` tetap satu-satunya aksi utama, kini diposisikan sebagai next-step natural setelah membaca alasan pemilihan.

### 2026-04-22 — Freelancer public profile conversion pass

- Profil publik freelancer (`/freelancers/[username]`) diubah dari halaman ringkas berbasis bio menjadi halaman keputusan dengan hierarchy jelas: summary atas + trust facts + next action.
- Bagian atas kini menonjolkan jawaban inti untuk klien (apa jasa, cocok atau tidak, trust level, lokasi/mode, konteks harga, availability) dalam format scan cepat.
- Ditambahkan section `Why choose this freelancer` berbasis sinyal data nyata (review quality, nearby fit, availability, rate context, profile completeness) tanpa klaim palsu.
- CTA primer dipusatkan ke satu aksi (`Contact freelancer`), sedangkan aksi sekunder diturunkan bobot visual agar jalur konversi lebih jelas.

### 2026-04-22 — Freelancer profile de-socialization pass

- Penekanan visual identitas sosial (handle-style indicator) di hero dihapus agar fokus tetap pada evaluasi jasa.
- Label sumber review diganti menjadi konteks proyek terverifikasi, bukan identitas personal reviewer.
- Aksi sekunder yang tidak mendorong keputusan hiring langsung diturunkan dari panel utama supaya CTA kontak terasa sebagai langkah natural berikutnya.

### 2026-04-22 — Hiring language final pass

- Terminologi section profile diselaraskan ke bahasa evaluasi perekrutan: `Work summary`, `Service scope`, `Relevant experience` (dan padanan ID: `Ringkasan kerja`, `Layanan yang ditawarkan`, `Pengalaman relevan`).
- Copy fallback/bantu juga digeser ke orientasi kerja (work overview/service listing), bukan narasi persona.

### 2026-04-22 — Conversion CTA confidence pass

- Label CTA utama diperkuat menjadi aksi diskusi (`Start discussion`) agar user memahami langkah berikutnya adalah membuka percakapan hiring, bukan komit instan.
- Ditambahkan reassurance micro-copy di dekat CTA untuk menurunkan hesitation: user bisa membahas scope/timeline/terms sebelum commit.
- Panel aksi atas dibuat sticky pada desktop sehingga CTA tetap terlihat saat user menilai detail profile lebih bawah.

### 2026-04-22 — Jobs board decision-flow pass

- Listing `/jobs` dipindahkan dari list dasar ke row layout yang lebih mudah dibandingkan lintas lowongan: work mode + kategori + budget + lokasi + waktu posting terlihat dalam satu ritme scan.
- Ditambahkan sinyal `why apply` berbasis data tersedia (`Active hiring`, `New job`, `Good budget fit`, `Nearby project`, `Quick brief`) agar freelancer cepat memilah lowongan yang layak direview dulu.
- CTA per-row dipertegas ke satu aksi utama (`View job`) dan ditambah apply-confidence line bahwa proposal terikat konteks brief/job thread, bukan komitmen langsung.
- Filter panel ditingkatkan dengan budget-fit dan posted-recency controls plus hint chips, supaya narrowing jobs terasa seperti alat kerja, bukan form wall generik.

### 2026-04-22 — Job detail apply-conversion pass

- Top section `/jobs/[jobId]` diperkuat sebagai decision header (ringkasan title + summary + budget/location/work mode + posted recency) agar freelancer cepat menilai kelayakan apply.
- Ditambahkan sinyal `why apply` berbasis data yang tersedia (active hiring, new job, good budget fit, nearby project, quick brief, low competition bila proposal masih sedikit).
- Panel aksi apply dipindah ke area atas dengan CTA utama `Send proposal`, dibuat sticky di desktop, dan dilengkapi reassurance bahwa proposal hanya memulai diskusi, belum komitmen final.

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
