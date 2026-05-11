# Fitur — seluruh proyek (Freelance-web)

> **Doc revision:** v102  
> Last synchronized: 2026-05-09 (freelancer dashboard/proposals/messages/notifications nw-* + i18n proposals page).

Dokumen ini merangkum fitur aktif dan struktur teknis terbaru di monorepo NearWork. Fokus: apa yang sudah dipakai user/staff saat ini, serta placeholder internal yang sudah disiapkan.

> Catatan: penjelasan **produk ini apa** (non-teknis) ada di `docs/apa-itu-nearwork.md`. Detail risiko, gap, dan technical debt tetap di `audit.md`.

## Update terbaru (April 2026)

- **2026-05-09 — Freelancer workspace UI:** dashboard freelancer memakai utilitas `nw-*` (kartu, chip, typografi, empty state percakapan/skill); data aktivitas menampilkan label status/kontrak dan mode kerja terjemahan; halaman **Proposal** freelancer memakai kamus `dashboard.freelancer.proposals*` + filter status memakai label `dashboard.client.bidStatus`; **Messages** dan **Notifications** diselaraskan ke shell/kartu NW, tanggal memakai locale, link job ke board publik memakai `withPublicLocale`.
- **2026-05-09 — Global UI system & client dashboard:** utilitas bersama `nw-*` di `globals.css` + bayangan/typography di `tailwind.config.ts`; `Button`/`Card`/`EmptyStateCard`/`DashboardStatCard`/`DashboardEmptyState` diselaraskan; dashboard klien memakai token tersebut, label status job/bid/kontrak + meta job + CTA pintasan sepenuhnya dari kamus `dashboard.client.*` (termasuk nested `jobStatus` / `bidStatus` / `contractStatus`), link Settings memakai `withWorkspaceLocale`; board `/jobs` memakai kelas chip NW untuk work mode & trending.
- **2026-05-09 — Public freelancer profile UX:** halaman profil publik freelancer (`/freelancers/[username]`) memakai hero storefront (avatar/inisial, verifikasi, skill, heuristik “great fit”), sidebar desktop berisi sinyal kepercayaan nyata (rating, jumlah ulasan, kontrak selesai, member since, aktivitas update profil, tarif, completeness), CTA Messages dengan path workspace ber-locale, simpan profil (`SaveFreelancerButton` + state awal dari `SavedFreelancer`), section layanan/preferensi/bahasa (placeholder jujur bila schema belum menyimpan bahasa), portofolio grid atau prompt owner-only jika kosong, ulasan dengan konteks job; mobile sticky contact + save tanpa backdrop blur. Label tombol simpan memakai i18n.
- **2026-05-09 — Public job detail UX & trust data:** halaman detail lowongan publik memuat hero opportunity, panel klien (verifikasi, ulasan agregat, member since, aktivitas update profil, kontrak selesai, jumlah lowongan terbuka publik), bagian brief terstruktur, lowongan terkait per kategori, serta kolom kanan sticky untuk form proposal / CTA `AuthAwareCtaLink` (tanpa duplikasi kartu sign-in). Query agregat paralel di server; tidak ada skor AI atau metrik respons palsu.
- **2026-05-09 — Public jobs card & mobile filter sheet:** komponen `JobsPublicList` menata ulang kartu lowongan publik agar lebih scanable (badge status dari data nyata, baris klien + verifikasi, anggaran + jumlah proposal + waktu posting, skill + sinyal heuristik dengan tooltip jujur); CTA ganda “kirim proposal” (auth-aware) vs “lihat brief”. `JobsMarketplaceMobileFilters`: overlay gelap opaque tanpa blur, opsi aktif solid indigo, kontrol lebih thumb-friendly.
- **2026-05-09 — Landing visual (non-glass):** permukaan hero/bawah-fold memakai **`bg-slate-50`**, **`bg-white`**, **`bg-slate-50`** pada sub-kartu; bayangan **`shadow-sm` / `shadow-md`**; menghapus **`backdrop-blur`** dan overlay **`bg-white/…`** agar tidak menyerupai template AI glassmorphism.
- **2026-05-09 — E2E smoke harness:** skrip root `pnpm test:e2e` memanggil `scripts/run-e2e-server.mjs` yang menjalankan `pnpm --filter @acme/web build`, menyalakan **`next start`** pada **`127.0.0.1:${E2E_PORT:-3041}`**, menunggu `GET /api/auth/csrf` merespons JSON, lalu menjalankan `scripts/e2e-marketplace-flow.mjs`. Ini menghindari kegagalan palsu (`Cannot find module './….js'`) ketika smoke diarahkan ke proses **`next dev`** dengan artefak `.next` inkremental yang tidak konsisten; pengembangan tetap bisa menjalankan tes mentah dengan **`BASE_URL`** manual.
- **2026-05-09 — Homepage marketplace positioning:** `LandingPage` memuat kategori nyata untuk `<select name="categoryId">`, menambah filter GET `workMode`, menyelaraskan CTA klien (“Pasang lowongan” / EN “Post a job”) vs freelancer (“Browse jobs”), mengganti sidebar/mobile strip persona dengan kartu alur `landing.hero.process.*`, dan menambah blok server `LandingHomeSections` (`landing.home.*`) untuk “How NearWork works”, benefit cards, trust tanpa metrik palsu, serta early-access gratis.
- **2026-05-09 — Locale-stable discovery links:** CTA dan tautan internal ke board (`/jobs`, `/freelancers`), halaman marketing berSEO (`how-it-works`, `pricing`, `early-access`, `help`), serta banyak jalur dashboard/workspace tidak lagi memakai path tanpa prefix mentah yang memicu redirect middleware berbasis cookie lawas—prefiks **`/en/`** atau **`/id/`** eksplisit memakai util **`apps/web/lib/i18n/locale-path.ts`** + **`workspace-path.ts`**; alur auth/register-return-to job menyimpan **`/<locale>/jobs/:id`**.
- **2026-05-10 — Locale-prefixed workspace URLs:** permukaan produk `/client`, `/freelancer`, `/messages`, `/notifications`, dan `/settings` memakai URL peramban `/<lang>/…` (sesuai cookie/route EN/ID). Middleware menulis ulang ke rute App Router internal yang sama, menyetel `x-nearwork-locale`, dan mengarahkan URL tanpa prefix ke preferensi bahasa. Shell dashboard + auth nav membangun link dengan `withWorkspaceLocale`; default home role (`homePathForSessionRole`) mengikuti locale aktif.
- **2026-05-10 — In-app notifications localized:** `NotificationService` menyimpan `_nwCopy` (bid diterima/disetujui, pesan baru, hasil verifikasi); `listForActor(actor, locale)` dan `GET /api/notifications` mem-format judul/bodi dengan kamus aktif. UI `/notifications` memakai `notifications.activity.*`, `notifications.time.*`, dan `notifications.openRelated`.
- **2026-05-10 — Marketing/localized-home EN-ID parity:** komponen `LandingHero` memakai `useI18n()` dan blok `landing.hero.*` (+ `landing.home.*` untuk section bawah); navbar pemasaran (guest/signed-in) memakai `nav.*`; footer newsletter `footer.newsletter*`; quick-search freelancer mengikuti `public.freelancers.quickTerm*`; cetakan landing lain (`LandingCategoryChips`, `LandingProductPreview`, `LandingFinalCta`) menyambung ke kunci kamus yang sudah ada.
- **2026-05-09 — Locale-aware & job-currency money display:** helper `apps/web/lib/format-money.ts` (unit test `format-money.unit.test.ts`) menjadi sumber utama `formatMoneyAmount` / `formatMoneyRange` / format IDR ringkas untuk UI `id`. Angka proposal/kontrak/budget mengikuti **mata uang tersimpan** (fallback model lama USD bila kosong); rate jam freelancer tanpa kolom mata uang tetap ditampilkan dengan default tampilan **IDR**. Permukaan tambahan: admin bids/contracts/donations, catalog subscription admin, blok job terbaru di `/freelancers`.
- **2026-05-09 — Public jobs filter chrome:** link filter di sidebar desktop `/jobs` memakai **`rounded-lg`** konsisten dengan bar pencarian dan lembar filter mobile (tanpa ubah query/param).
- **2026-05-09 — Public jobs discovery editorial:** `/jobs` mempertahankan data nyata (klien, verifikasi, skill, jumlah proposal, pulse) dengan UI yang lebih **marketplace/editorial**: hero lebih netral dan padat, kolom kanan **snapshot** dari job/proposal/freelancer terbaru, kartu listing lebih rata dan rapat, badge status (mis. sedikit pelamar / ramai) hanya saat didukung angka proposal; filter mobile sedikit lebih ringkas.
- **2026-05-09 — Public jobs discovery premium:** halaman `/jobs` memakai hero gradien lebar + kartu pencarian mengambang, kartu lowongan dengan identitas klien (nama perusahaan/display), badge verifikasi nyata, jumlah proposal dari database, skill pada job, bookmark/simpan untuk user login, serta sidebar “Marketplace pulse” berbasis job/bid terbaru (bukan placeholder waktu). Filter desktop + lembar filter mobile; wawasan pasar hanya agregat nyata (open jobs, apply 24h, freelancer available)—tanpa metrik respons palsu.
- **2026-05-09 — Freelancer workspace premium UX:** navigasi freelancer memakai shell mengambang dengan pencarian job desktop, badge pesan/notifikasi nyata, dan kartu komunitas (help center). Dasbor freelancer memakai hero gradien, playbook proposal + checklist aktivitas journey, serta panel pulse/skill/percakapan yang hanya memakai agregasi Prisma/MessageService tanpa KPI sintetis.
- **2026-05-09 — Dashboard readability & backlog visibility:** `/client` menampilkan ringkasan lima kartu dari data nyata (termasuk utas pesan yang perlu dibalas klien); `/freelancer` menyelaraskan hierarki visual, menambah kolom stat yang sama untuk backlog balasan freelancer, serta banner aksi cepat menuju Messages saat ada utas tertunda—semua label/hint utama memakai kamus EN/ID.
- **2026-05-08 — Marketplace conversion & trust polish (loop job → proposal → review → diskusi):** form proposal publik memandu ringkas (intro, pengalaman relevan, pendekatan, timeline/ketersediaan, quote, CTA) dengan kamus EN/ID; owner melihat kedalaman/compare ringkas + CTA diskusi utama; workspace pesan menegaskan konteks job + status proposal + saran langkah berikutnya; checklist aktivasi & laporan moderasi lebih ramah mobile; `id.json` diselaraskan dengan struktur kamus EN untuk status bid/job; skrip `scripts/e2e-marketplace-flow.mjs` menambahkan jalur smoke pre-hire (`POST /api/messages` JOB + pesan pertama dengan CSRF).
- **2026-05-08 — Early-launch activation & empty-state i18n:** checklist onboarding klien/freelancer (state nyata DB) + petunjuk likuiditas brief/proposal; empty state publik `/jobs` & `/freelancers` memakai blok What/Why/Next; halaman `/messages` & `/notifications` serta workspace pesan memakai kamus EN/ID; subtitle notifikasi tanpa menekankan billing. Checklist deploy produksi: `docs/deploy-checklist.md`.
- **2026-05-08 — Trust & safety (moderation MVP):** ditambahkan model `ModerationReport` + `ModerationReportNote`, status `OPEN` / `IN_REVIEW` / `RESOLVED` / `DISMISSED`, dukungan subjek `USER` / `JOB` / `BID` / `REVIEW` / `MESSAGE_THREAD` / `MESSAGE`, intake `POST /api/reports`, antrean `/admin/reports` dengan triage (assign, catatan internal, resolve/dismiss). Job dapat disembunyikan dari discovery publik lewat `moderationHiddenAt`; staff `ADMIN`/`SUPPORT_ADMIN` dapat suspend/reactivate akun `CLIENT`/`FREELANCER` dari `/admin/users`.
- **2026-05-08 — Moderation intake UX + CI hygiene:** UI laporan memakai satu komponen konsisten (`ModerationReportButton`): profil publik freelancer (user + ulasan), kolom trust pada tabel proposal owner job, daftar proposal freelancer, serta thread/pesan di Messages. Tipe Prisma moderasi diekspor dari `@acme/database` supaya `pnpm typecheck` aplikasi tidak bergantung langsung ke `@prisma/client`. `eslint.config.mjs` + `outputFileTracingRoot` menstabilkan `next lint`/tracing di monorepo; skrip `scripts/e2e-marketplace-flow.mjs` memverifikasi laporan BID + kemunculan di `/api/admin/reports` (butuh user admin hasil seed).
- **2026-05-01 — Homepage composition parity pass:** section hero dipoles lagi (headline scale/spacing, search card density, CTA sizing) dan footer landing diganti ke struktur yang lebih lengkap (brand+social, navigasi kolom, form newsletter, locale marker) untuk mendekati referensi visual final secara menyeluruh.
- **2026-05-01 — Homepage intent + topbar alignment fix:** landing `/[locale]` kini default ke mode `hire` saat first load, dengan hero headline recruiter-first (termasuk emphasis visual) dan top navbar versi logged-out yang lebih clean (`Masuk`, `Daftar`, locale) agar hasil render lebih dekat ke komposisi referensi final.
- **2026-05-01 — Register redirect copy refinement:** helper text setelah akun dibuat kini menampilkan tujuan yang ramah pengguna (mis. `halaman profil Anda`) berdasarkan route intent, menggantikan tampilan path mentah seperti `/freelancer/profile`.
- **2026-05-01 — Homepage final dual-user landing pass:** homepage dipertahankan sebagai landing clean yang tetap “alive”: hero dengan toggle mode recruiter/freelancer, headline+CTA+search dinamis, visual cards kanan sebagai konteks non-data, search row lengkap (input/lokasi/kategori/chips), value 3 poin, dan CTA bawah; seluruh section list/preview/activity marketplace tidak ditampilkan agar tidak jadi dashboard/data-heavy.
- **2026-05-01 — Homepage exact-match polish pass:** komposisi hero disetel ulang agar lebih dekat ke referensi final (proporsi left/right, kartu freelancer visual, chips/search rhythm, dan CTA band). Scope tetap UI-only tanpa menambah section data marketplace.
- **2026-05-01 — Global page transition system:** seluruh aplikasi sekarang memakai transisi navigasi global berbasis App Router: top loading bar tipis saat route berubah, state fade/dim konten selama perpindahan, dan fallback skeleton level-app melalui `app/loading.tsx` agar transisi antar menu terasa smooth tanpa flash/blank mendadak.
- **2026-05-01 — Jobs board tool redesign:** halaman `/jobs` direfactor ke pola marketplace board 3 kolom (filter kiri, listing tengah, live insight kanan) dengan search bar dominan + quick tags di atas fold. Listing kini menonjolkan hierarchy scan cepat (judul, client/lokasi, budget, waktu posting, badge `Baru/Urgent/Sedikit pelamar`) dan CTA dual-action (`Apply` utama, `Lihat detail` sekunder). Ditambahkan juga section trend kategori + panel tips/CTA agar alur “temukan job -> apply” lebih cepat dan jelas.
- **2026-05-01 — Freelancers page hiring-tool redesign:** `/freelancers` kini ditata ulang menjadi surface utilitarian 3 kolom (filter kiri, list kandidat tengah, panel live/insight kanan) dengan search bar dominan dan quick tags di atas fold. Row kandidat dipoles untuk decision speed (avatar + verified, name/role/lokasi, rating, starting rate, response hint, status online/available) serta CTA diprioritaskan ke `Chat` dengan `Lihat profil` sebagai aksi sekunder. Di bawah list ditambahkan blok `Job terbaru dari klien` agar user bisa berpindah cepat antara discovery talent dan peluang job tanpa kehilangan konteks.
- **2026-04-30 — Homepage visual redesign (mockup-aligned):** landing `/id` dipoles ke layout marketplace modern (white + soft purple accent) dengan hero split dua kolom, card search premium, sidebar kanan berisi `Marketplace aktif` + `Aktivitas live` + `Pola kerja`, grid kategori yang lebih clean, preview list compact, CTA lavender di bawah, dan navbar/footer yang lebih rapi—tanpa perubahan logic backend atau alur data inti.
- **2026-04-27 — Repository structure cleanup (`apps/web`):** runtime source dari `apps/web/src` dipindahkan/disatukan ke root-level tree (`app`, `components`, `features`, `lib`, `server`, `locales`, `public`) dan shim re-export lama di `middleware`, `server/http`, serta `server/services` diganti implementasi langsung. Alias `@src/*` sementara diarahkan ke root untuk kompatibilitas import existing tanpa break.
- **2026-04-27 — Credential doc hardening:** `credential.md` disanitasi menjadi template placeholder (tanpa nilai email/password nyata), ditambah `credential.example.md` sebagai contoh aman; `.gitignore` tetap memblokir `credential.md` lokal.
- **2026-04-26 — Freelancers listing confidence pass:** row freelancer kini lebih decision-first (name + role, value statement 1 baris, rating/review, lokasi + mode kerja, starting price, serta signal relevan seperti available this week/responds fast/top rated) dengan CTA tunggal `View profile`; username emphasis dan badge dekoratif dikurangi agar scan lebih cepat.
- **2026-04-26 — Freelancers preview mode + activity strip:** saat hasil kosong, list menampilkan blok `Example freelancers` berisi 3 row struktur realistis (tanpa metrik palsu) agar tidak terasa dead space; ditambah top activity strip kecil (`Freelancers available now`, `Updated daily`) di atas list.
- **2026-04-26 — Freelancers empty-state vitality pass:** halaman `/freelancers` kini memakai copy header yang lebih outcome-driven (find + hire), quick chips di atas hasil (`Nearby`, `Remote`, `Budget fit`, `Available now`), trust-benefit bullets ringkas, skeleton rows saat hasil kosong, serta empty-state card yang lebih kecil dan action-oriented agar tidak terasa “dead marketplace”.
- **2026-04-26 — Live panel trust hardening:** panel hero tidak lagi merender contoh nama/row fiktif saat data kosong; panel kini menampilkan 1–2 row dari data nyata (freelancer + job) dengan field real (title/specialty, location/work mode, availability/status) atau fallback copy aman jika belum ada data.
- **2026-04-26 — Live panel safety refinement:** panel hero kanan sekarang memprioritaskan baris aktivitas dari data nyata (freelancer aktif + brief terbaru) jika tersedia; saat data kosong, UI menampilkan label **“Example activity / Contoh aktivitas”** + fallback copy aman tanpa nama pengguna palsu.
- **2026-04-26 — Hero focus cleanup (slider removal):** `HeroScenarioSlider` dihapus penuh dari landing hero (termasuk aset `hero-scenes`) dan diganti panel kanan ringan “live marketplace” berisi 3 sinyal inti (`freelancers active`, `new briefs daily`, `proposals tied to job`) + sample rows sederhana. Struktur hero, CTA, search, intent mode, dan i18n behavior tetap dipertahankan; styling dijaga utilitarian (border + spacing, tanpa elemen dekoratif berat).
- **2026-04-26 — Hero micro-polish pass:** tanpa mengubah struktur hero baru, ritme visual diperhalus melalui spacing desktop/mobile yang lebih seimbang, hierarki tipografi yang lebih tenang (headline tetap kuat, subtext/trust lebih ringan), search block dibuat lebih nyaman dan kurang “form-like”, serta slider dipoles agar crop konsisten dan kontrol navigasi lebih subtil.
- **2026-04-25 — Hero marketplace-energy redesign:** hero homepage kini memakai split layout (copy + CTA + search di kiri, visual scenario slider di kanan) untuk memberi first impression yang lebih “live marketplace” namun tetap clean. Copy ID/EN diperbarui ke tone action-oriented (headline, trust line, CTA), search dipoles agar lebih premium, activity line dibuat human-readable dengan fallback aman saat data rendah, kategori diarahkan ke use-case nyata, preview rows memakai sinyal aktivitas kualitatif yang lebih manusiawi, dan final CTA diperkuat ke alur “brief -> discuss -> hire” tanpa mengubah routing/intent/i18n behavior.
- **2026-04-25 — Brand voice & positioning pass (structured marketplace):** copy homepage dan surface publik kunci diselaraskan ke positioning “Structured freelance marketplace — everything stays tied to the job”; hero menekankan alur kerja terstruktur, trust line diseragamkan (`All proposals and chats stay tied to the job`), CTA dibuat lebih konkret (`Find freelancers`, `Post a job`, `Start discussion`), serta microcopy empty/apply state dipoles agar lebih praktis dan non-hype.
- **2026-04-25 — Homepage copywriting & micro-UX polish:** hero placeholder diperjelas dengan contoh layanan nyata, proof lines ditambahkan tepat di bawah search (`active freelancers`, `new briefs`) memakai data real pulse, serta wording headline/CTA dipertegas agar kesan marketplace aktif lebih cepat terasa.
- **2026-04-25 — Marketplace energy refinement pass:** headline hero dipertajam ke tone outcome/action, activity bar dibuat lebih conversational, preview rows mengganti angka sintetis menjadi urgency signal generik non-fake (response speed, hiring activity, low competition), dan final CTA copy dibuat lebih tegas untuk mendorong aksi.
- **2026-04-25 — Homepage conversion refinement pass:** copy hero digeser ke outcome-driven tone, strip aktivitas/trending/filter digabung jadi satu bar ringkas, kartu kategori kini menampilkan contoh use case nyata per lane, preview freelancer/job menambahkan sinyal urgency halus, dan final CTA dipertegas ke aksi hiring yang lebih langsung.
- **2026-04-25 — Hero micro-tuning pass:** first screen homepage dipadatkan agar lebih conversion-oriented: switch intent `hire/work` dipindah ke posisi atas dan langsung berdampingan dengan CTA utama, search box diperkuat sebagai visual anchor, secondary CTA diperingan, serta label kecil non-kritis dikurangi agar keputusan klik pertama lebih cepat.
- **2026-04-25 — Homepage live-marketplace refresh:** hero kini dipusatkan ke search sebagai aksi utama dengan indikator aktivitas ringan berbasis data nyata (`freelancers available`, `open jobs`), panel kanan berat dihapus agar layout lebih terbuka, hierarki CTA dipadatkan ke satu primary action yang jelas, kategori diubah menjadi grid card klik-besar, dan preview listing dipisah jadi dua rail sederhana (`Active freelancers`, `Recent jobs`) dalam row-style ringan.
- **2026-04-24 — Jobs empty-state action pass:** saat board `/jobs` benar-benar kosong, empty state kini berfokus pada aksi awal (`Start by posting your first job`) dengan CTA utama post job, CTA sekunder browse freelancers, section contoh use case posting, dan hint berbasis role (client vs freelancer); panel filter juga diturunkan prioritasnya dengan dipindah ke bawah konten utama pada kondisi kosong baseline.
- **2026-04-24 — Redirect pacing polish:** setelah aksi sukses utama, redirect kini diberi jeda ringan (~400ms) agar transisi terasa lebih intentional: publish job menunggu singkat sebelum pindah ke detail job, dan submit proposal menunggu singkat sebelum pindah ke thread messages (jika thread tersedia).
- **2026-04-24 — Pre-launch UX continuity pass:** flow client `post job -> review proposal -> open conversation` kini memiliki feedback konteks yang lebih jelas lewat handoff query (`from=job-posted`, `from=job-conversation`) dan banner ringan di Messages; owner view job detail juga menambahkan arahan langkah berikutnya saat proposal belum masuk agar tidak dead-end.
- **2026-04-24 — Notifications quick category chips:** halaman `/notifications` kini punya filter ringan berbasis client-side (`All`, `Proposals`, `Messages`, `Contracts`) untuk triage cepat tanpa perubahan backend/API; unread/read emphasis tetap dipertahankan, dan kategori kosong menampilkan empty state khusus.
- **2026-04-24 — Notifications category counts:** chip kategori notifikasi kini menampilkan jumlah item yang diturunkan langsung dari data notifikasi yang sudah dimuat (`All (n)`, `Proposals (n)`, `Messages (n)`, `Contracts (n)`) tanpa API call tambahan.
- **2026-04-24 — Notification UX refinement:** badge counts di navbar tetap memakai data unread/awaiting reply real; halaman notifications kini lebih scanable lewat label aktivitas per item (`Proposal received`, `Bid accepted`, `New message`, `Contract update`) dengan penekanan unread vs read yang jelas; destination link juga diperluas agar event kontrak bisa membuka detail kontrak jika `contractId` tersedia.
- **2026-04-24 — Dashboard activity cues refinement:** dashboard client kini menampilkan konteks message thread yang menunggu balasan pada hint incoming bids, dan dashboard freelancer menambahkan panel ringkas “Attention now” (bid accepted, message thread awaiting reply, proposal status updates) supaya tindak lanjut berikutnya lebih jelas.
- **2026-04-24 — Client jobs quick filter (`Needs review`):** halaman `/client/jobs` kini menambahkan quick chips (`All jobs`, `Needs review`, `Open`, `Closed`) untuk memfokuskan pekerjaan yang butuh tindakan; mode `Needs review` menampilkan job dengan proposal pending/shortlisted atau proposal baru, dan memiliki empty state khusus saat tidak ada item yang perlu ditinjau.
- **2026-04-24 — Client proposal-activity clarity pass:** area client (`/client`, `/client/jobs`, owner view di `/jobs/[jobId]`) kini mempertegas sinyal proposal masuk (`New proposal`, `X proposals received`) dan menonjolkan listing dengan activity terbaru agar client cepat tahu job mana yang harus direview; owner job detail juga menambahkan panel “action needed” yang langsung mengarahkan ke review proposals, conversation, shortlist, atau accept.
- **2026-04-24 — Proposal-to-messages handoff tag:** link lanjutan percakapan setelah submit proposal kini membawa query `from=proposal` (`/messages?thread=<id>&from=proposal`); halaman Messages menampilkan banner konteks singkat saat flag ini ada, lalu bisa di-dismiss dengan pembersihan query ringan tanpa reload penuh.
- **2026-04-24 — Post-proposal messaging flow:** setelah freelancer submit proposal, UI kini menegaskan next step dan menampilkan jalur lanjut diskusi (`Open conversation`) jika thread job tersedia; halaman `Messages` juga menambahkan context strip ringan pada thread terkait job (judul job, counterpart, status proposal jika ada, dan link balik ke job) agar transisi dari proposal ke chat terasa natural.
- **2026-04-24 — Proposal draft local autosave:** form proposal di `/jobs/[jobId]` kini autosave ke `localStorage` secara senyap untuk field inti (intro, pendekatan, timeline, quote, estimasi hari) dengan scope key per `jobId` + `userId`; draft dipulihkan saat form dibuka (`Draft restored`), bisa dihapus manual, dan otomatis dibersihkan setelah submit sukses.
- **2026-04-24 — API resilience for DB pool exhaustion:** wrapper API global (`withApiHandler`) kini mengenali error Prisma saat koneksi pool session penuh (`EMAXCONNSESSION` / `max clients reached`) dan mengembalikan respons `503` dengan kode terstruktur + `Retry-After`, sehingga tidak lagi muncul sebagai unhandled internal error generik.
- **2026-04-24 — Proposal submission UX guidance (job detail):** panel apply freelancer di `/jobs/[jobId]` sekarang menyediakan form proposal terstruktur (intro singkat, pendekatan kerja, timeline/ketersediaan, harga, estimasi hari) alih-alih hanya CTA login/blank input; ditambah placeholder guidance, reassurance non-commitment, dan loading overlay saat submit agar alur apply terasa jelas, aman, dan cepat dimulai.
- **2026-04-24 — Stabilization: jobs raw search compatibility + pool pressure reduction:** service search jobs sekarang kompatibel untuk environment DB yang belum punya kolom translasi (`titleEn/titleId/descriptionEn/descriptionId`) dengan fallback query aman sehingga tidak lagi gagal `column ... does not exist`; eksekusi query list/count juga dibuat berurutan (bukan paralel) untuk menurunkan beban koneksi simultan pada mode pool session kecil.
- **2026-04-22 — Homepage marketplace density pass:** section kategori horizontal ditingkatkan menjadi browse lanes yang lebih scanable (icon-first chips, target klik lebih jelas); hero menambahkan trust cues + quick browse entry ke active briefs; preview listing diperkuat sebagai row-style board dengan atribut operasional (harga, lokasi, tag kerja, action links) agar halaman terasa seperti marketplace aktif, bukan landing statis.
- **2026-04-22 — Homepage activity refinement pass:** listing preview menambahkan sinyal aktivitas ringan (`New`/`Active now` + konteks update), kolom kanan dirapikan agar price/location/actions lebih mudah dibandingkan lintas baris, kategori diperkuat sebagai lane navigasi (hierarki label + hover state lebih tegas), serta hero menambahkan satu baris urgensi produk tentang listing live yang rutin diperbarui.
- **2026-04-22 — Homepage decision-confidence pass:** setiap row preview kini menampilkan alasan memilih listing (`responds fast`, `popular choice`, `top rated local`) sebagai sinyal sekunder; beberapa row diberi penekanan ringan sebagai item unggulan tanpa memecah konsistensi list; CTA per-row diprioritaskan ke satu aksi utama (job/freelancer specific) dengan aksi sekunder ber-bobot lebih rendah; harga dilengkapi konteks value agar keputusan lebih cepat.
- **2026-04-22 — Homepage layout hierarchy upgrade:** area hero dipecah dari satu kontainer datar menjadi komposisi asimetris (headline/search kiri + visual board kanan), blok pencarian dipertegas sebagai tool strip mandiri, kategori diubah ke grid entry points berbasis ikon (lebih navigational), dan baris preview ditingkatkan dengan thumbnail-style visual anchors agar rasa marketplace lebih aktif dan tidak text-heavy.
- **2026-04-22 — Marketplace activity strip:** ditambahkan strip ringkas tepat di bawah hero untuk memperkuat rasa board aktif + eksplorasi cepat: status live (`open jobs`, proposal 24 jam), trending lanes, quick filters (`nearby`/`remote`), dan shortcut ke active briefs. Strip sengaja kompak (satu glance) agar actionable tanpa menambah noise section.
- **2026-04-22 — Public homepage metrics removal:** panel `Live board snapshot` dihapus dari hero dan counter numerik di activity strip dihilangkan agar homepage tidak menampilkan statistik sistem mentah; area tersebut diganti jalur aksi user-facing (browse/filter/active briefs) supaya tiap blok langsung membantu search, browse, dan keputusan.
- **2026-04-22 — Homepage action-clarity iteration:** ditambahkan mode switch `I want to hire` / `I want to work` di bawah area search untuk mengubah prioritas aksi; search kini punya quick filters (`Nearby`, `Remote`, `Budget`) + budget selector sederhana; hierarki CTA dipadatkan menjadi satu primary action per mode dengan secondary actions yang lebih ringan.
- **2026-04-22 — Intent persistence (`?intent=hire|work`):** mode homepage sekarang dibaca dari URL query saat load (default aman: `hire`), switch mode mengubah query sebagai single source of truth, dan CTA/shortcut relevan menjaga intent agar pengalaman tetap konsisten saat refresh/navigasi tanpa state client ganda.
- **2026-04-22 — Default bahasa publik ke Indonesia:** resolver locale kini fallback ke `id` untuk pengunjung baru tanpa preferensi; preferensi pengguna yang sudah memilih bahasa tetap dihormati via cookie `lang`; route root tetap redirect server-side ke locale prefix (`/id` default) sehingga tidak ada flicker EN -> ID.
- **2026-04-22 — Deterministic public locale default:** urutan resolusi kini dipertegas menjadi route locale eksplisit -> cookie preferensi -> fallback `id`; `Accept-Language` tidak lagi menentukan routing default agar first-time visitor selalu konsisten ke Indonesia.
- **2026-04-22 — Login loading UX improvement:** form login sekarang menampilkan overlay semitransparan + indikator proses saat submit, mengunci interaksi sementara request berjalan, dan mencegah double-submit agar user mendapat feedback jelas “sedang diproses”.
- **2026-04-22 — Reusable auth loading overlay:** pola overlay submit auth diekstrak menjadi komponen reusable (`AuthSubmitOverlay`) dan dipakai login; teks loading dipisah (`Signing you in...` / `Sedang masuk...`) untuk feedback pusat layar, sementara label tombol tetap `Processing...` / `Memproses…`.
- **2026-04-22 — Auth submit consistency rollout:** `AuthSubmitOverlay` kini diterapkan juga di register dan forgot-password; kedua form menambahkan guard anti-submit ganda, state disabled yang konsisten saat request berjalan, inline spinner tombol, serta teks loading terlokalisasi per flow.
- **2026-04-22 — Auth localization cleanup:** string hardcoded Inggris yang tersisa di register dihapus (label input, role picker copy, outcome bullets, helper/error messages, divider/login links), forgot-password memakai key locale sendiri untuk label email, dan login/register/forgot-password kini konsisten dictionary-based end-to-end.
- **2026-04-22 — Freelancers directory choose/compare pass:** tampilan hasil `/freelancers` beralih ke row-style directory agar perbandingan lintas kandidat lebih cepat (nama/specialty/lokasi/rate/sinyal kepercayaan pada ritme yang konsisten), CTA utama per item dipusatkan ke `View profile`, dan panel filter diberi petunjuk praktis (mode kerja nearby/remote + guide rate) supaya flow browse terasa lebih product-directory daripada form wall.
- **2026-04-22 — Freelancers decision-confidence pass:** setiap hasil freelancer kini menampilkan `why choose this` micro-copy berbasis konteks data (kekuatan review kategori, indikasi sering dipilih, nearby fit, budget-friendly fit) alih-alih tag generik; 1–2 hasil teratas diberi hierarchy halus (`Best match` / `Recommended`) agar ranking terasa lebih bermakna; metrik trust (rating + review count) dipindahkan ke area scan awal agar proses memilih lebih cepat dan yakin.
- **2026-04-22 — Freelancer profile conversion pass:** halaman publik `/freelancers/[username]` tidak lagi minimal bio; kini memiliki top decision summary (headline, mode/lokasi, rate context, rating/review, availability, profile quality), panel alasan memilih berbasis data nyata, section trust snapshot, skills, dan review terbaru, serta CTA primer `Contact freelancer` dengan hierarki sekunder yang lebih ringan.
- **2026-04-22 — Non-social profile tone pass:** elemen yang terasa seperti identitas sosial diturunkan/dihapus (mis. penonjolan handle dan save action pada panel utama), sehingga halaman lebih menyerupai lembar evaluasi hiring dengan fokus ke fit, trust, dan next hiring action.
- **2026-04-22 — Hiring-focused wording pass:** label generik profile diganti ke terminologi evaluasi kerja (`About` -> `Work summary`, `Skills` -> `Service scope`, `Experience` -> `Relevant experience`; versi ID disesuaikan ke `Ringkasan kerja`, `Layanan yang ditawarkan`, `Pengalaman relevan`) agar seluruh bahasa UI konsisten dengan konteks keputusan hiring.
- **2026-04-22 — Freelancer profile CTA confidence pass:** CTA utama di halaman detail freelancer dipertegas ke bahasa aksi percakapan (`Start discussion` / `Mulai diskusi`), ditambah reassurance line bahwa user belum berkomitmen sebelum terms disepakati, dan panel CTA dibuat sticky di desktop agar selalu mudah diakses selama evaluasi.
- **2026-04-22 — Jobs discovery job-board pass:** `/jobs` kini menampilkan list row yang lebih operasional (title, category, work mode, city, budget, posted time, apply-signal), menambah filter praktis untuk budget-fit + recency, memperjelas CTA utama `View job`, dan menambahkan apply-confidence microcopy bahwa proposal dimulai dari review brief + thread konteks (bukan komitmen instan).
- **2026-04-22 — Jobs apply-conversion pass (detail page):** `/jobs/[jobId]` kini menonjolkan top summary untuk keputusan apply (title, budget, mode/lokasi, posting recency, quick summary), menampilkan sinyal “why apply” berbasis data nyata (`active hiring`, `new`, `budget fit`, `quick brief`, `low competition` bila tersedia), serta panel CTA `Send proposal` di area atas (sticky desktop) dengan reassurance “diskusi dulu, tanpa komitmen instan”.
- **2026-04-22 — SEO multilingual tuning:** `x-default` untuk alternates kini diarahkan langsung ke `/id` canonical (bukan `/` redirect) agar sinyal canonical/hreflang lebih bersih untuk crawler.
- **2026-04-20 — Multilingual SEO (production-safe):** ditambahkan route prefix locale `app/[locale]` untuk halaman SEO (`/en/*`, `/id/*`) mencakup home, jobs (+detail), freelancers (+detail), how-it-works, pricing, early-access, help; tiap halaman pakai metadata lokal + `alternates.languages` (`en`, `id`, `x-default`) dan canonical per-locale; sitemap sekarang mempublikasikan URL dua bahasa. Locale switcher kini **route-aware** sebagai source-of-truth (aktif mengikuti prefix URL), sehingga perpindahan EN/ID langsung memuat konten SSR sesuai route target.
- **2026-04-20 — Konsistensi locale publik (`/jobs`, `/freelancers`):** string UI yang masih hardcoded Inggris dipindah ke kamus `en.json` / `id.json` (header, toolbar hasil, paginasi, panel samping, filter, list labels, empty states, nearby/location prompts). Komponen publik sekarang membaca `t()` secara konsisten agar halaman Indonesia tidak lagi bercampur bahasa.
- **2026-04-20 — Lokalisasi halaman marketing:** konten user-facing di `/how-it-works`, `/pricing`, `/early-access`, `/help` dipindah ke kamus locale agar halaman `/id/*` tidak menampilkan copy Inggris; fallback teks pada profil publik freelancer juga dilokalisasi.
- **2026-04-20 — Lokalisasi halaman tersisa publik:** `/jobs/[jobId]` kini memakai key i18n untuk seluruh teks UI utama (breadcrumb, summary, tabel proposal, CTA, hint), legal pages `/terms` dan `/privacy` dipindah ke kamus locale, serta fallback page `/forbidden`, `/forgot-password`, dan `/search/nearby` ikut diselaraskan EN/ID.
- **2026-04-20 — Terjemahan konten user-generated job (server-side):** saat create job, sistem mendeteksi bahasa source (`id`/`en`) lalu menerjemahkan silang via Google Translate API dan menyimpan cache di DB (`language`, `titleId`, `titleEn`, `descriptionId`, `descriptionEn`). Listing/detail job sekarang merender field sesuai locale aktif dengan fallback ke teks asli bila terjemahan belum tersedia; halaman detail menambahkan opsi *Show original / Show translated*.
- **2026-04-20 — Homepage depth & hierarchy pass:** hero landing diperkuat tanpa gradient/glass (headline lebih dominan, spacing lebih rapat, search block dijadikan product interaction utama dengan border/elevation halus, panel “how hiring runs” diberi struktur langkah yang lebih jelas, dan urutan CTA disetel ulang agar primary action lebih tegas daripada secondary actions).
- **2026-04-20 — Homepage SEO & copy upgrade:** metadata `title`/`description` route `/[locale]` diperjelas dengan intent keyword (hire/cari freelancer nearby + remote) dan copy landing direvisi agar lebih product-first: H1 tegas, alur hiring operasional, CTA berbasis aksi nyata, serta section categories/preview/use-cases/final strip kini konsisten EN/ID via dictionary keys.
- **2026-04-20 — Hero/search restructure:** landing top area kini memakai komposisi dua-lapis (top: headline + flow panel, bottom: search tool block) dengan bobot visual search sebagai interaksi utama; panel flow dipadatkan dan CTA diurutkan primary (`Post a job`) lalu secondary (`Browse freelancers`, `Open job board`).
- **2026-04-20 — Navbar hierarchy redesign:** navbar publik diperjelas sebagai product navigation (logo lebih dominan, center nav primary vs secondary, right rail fokus EN/ID + auth + `Start hiring`) untuk mengurangi rasa template dan memperkuat action-first UX.
- **2026-04-20 — Navbar multilingual hardening:** layout marketing navbar disetel ulang agar label Indonesia yang lebih panjang tetap rapi: center nav tidak wrapping, breakpoint desktop dinaikkan ke `lg`, spacing antar-zona dipadatkan, bobot tipografi dibedakan (primary > secondary > utility), dan utility berprioritas rendah muncul saat ruang memadai.
- **2026-04-20 — Dukungan bahasa (i18n):** kamus di `apps/web/locales/en.json` dan `id.json`; helper `t(key)` lewat `I18nProvider` (client) dan `getServerTranslator()` (server); preferensi disimpan di **cookie `lang`** (`en` \| `id`, 1 tahun, `SameSite=Lax`) + sinkron UI instan; default dari **Accept-Language** lalu fallback `id`; `<html lang>` mengikuti locale; switcher **EN \| ID** (tanpa bendera) di navbar marketing, header workspace, header discovery ringkas, halaman login/register, dan rail akun; label navigasi dashboard memakai `labelKey` / `sectionKey` pada konfigurasi nav.
- **2026-04-20 — Navbar marketing (`MarketingNavBar`) jadi product navigation:** struktur kiri–tengah–kanan (brand / primary nav / utilitas-auth); logo **`/logo/logo_EN.png`** tetap anchor terkuat; tengah difokuskan ke **Jobs + Freelancers** (dengan intent hint “Find work” / “Hire talent”), lalu secondary nav ringan (How it works, Pricing, Help) dipisah divider halus; state aktif garis bawah brand; area kanan guest berisi Browse jobs, Log in, Register + CTA **Start hiring**; sesi login menampilkan **state “Signed in”**, unread notifications + unread message threads, serta CTA kontekstual (**Client: Post a job**, **Freelancer: Find jobs**).
- **2026-04-18 — Engagement tanpa dekorasi:** agregat ringan `PublicStatsService` + komponen `MarketplacePulse` (board terbuka, proposal 24 jam, freelancer berstatus available) di landing, `/jobs`, `/freelancers`; badge notifikasi **nyata** di `MarketingNavBar` (count dari DB, tanpa dot palsu); filter discovery punya `datalist` + tautan “Popular”; microcopy **proposal / hire** di job detail, client jobs, dan how-it-works; kartu freelancer menampilkan sinyal kepercayaan dari data yang ada (availability + ulasan berulang).
- **2026-04-18 — Landing & chrome publik:** hero “marketplace stage” (split layout, headline dominan tanpa label `nw-section-title` generik—mikro-label “Live freelancer directory”); blok search besar, *popular searches*, kategori ikon horizontal; preview ilustratif + zebra; section bands; footer **kompak** (Product / Company / Legal / Support + strip bawah).
- **2026-04-18 — API discovery:** perlindungan anti-scraping ringan + pagination/query hardening (detail di `audit.md` addendum).
- Sistem UI sudah bergerak ke arah **grounded product UI** (tanpa glassmorphism/gradient dekoratif) di public + app surfaces.
- Public discovery (`/freelancers`, `/jobs`) sekarang berorientasi **scanability dan decision flow**: filter lebih operasional, density list lebih rapat, dan nearby cues lebih nyata.
- Workflow client hiring ditingkatkan:
  - `/client/jobs` jadi control center dengan attention metrics (needs attention, new bid activity, stale jobs),
  - job detail menampilkan tabel perbandingan bid untuk client owner (harga, profile strength, lokasi/mode, status, next action),
  - aksi keputusan langsung (**Hire** pada proposal) tersedia lewat API existing.
- Workflow freelancer earning diperjelas:
  - `/freelancers` punya rail terarah untuk profile/job/proposals,
  - proposal workspace lebih padat dan lebih fokus pada prioritas status.

---

## 1) Ringkasan produk

NearWork adalah marketplace freelance SaaS dengan area publik + workspace per role:

- Publik: discovery jobs/freelancers, marketing pages, auth.
- User app: workspace `CLIENT`, `FREELANCER`, shared tools (`messages`, `notifications`, `settings`).
- Internal app: workspace `/admin` untuk staff (`ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`) dengan RBAC per halaman.
- Auth berbasis cookie session tunggal (`acme_session`), tanpa auth system duplikat.

---

## 2) Struktur repo & tooling

| Bagian | Peran |
|---|---|
| `turbo.json` | Orkestrasi `build`, `dev`, `lint`, `typecheck`, `clean` |
| `pnpm-workspace.yaml` | Workspace linking (`workspace:*`) |
| Root `package.json` | script lint/build/typecheck + `db:*` + `test:e2e` |
| `scripts/e2e-marketplace-flow.mjs` | Uji end-to-end alur utama marketplace via HTTP |
| `tsconfig.base.json` | konfigurasi TS dasar lintas package |

---

## 3) `apps/web` (Next.js App Router) — fitur utama

Arsitektur backend in-app:

- Route handlers (`app/api/*`)
- Services (`server/services/*`)
- Policies (`server/policies/*`)
- Guard auth/role (`src/server/http/protect.ts`)
- Prisma via `@acme/database`

Session source tunggal:

- Cookie JWT `acme_session`
- helper: `src/lib/session.ts`, `src/lib/auth.ts`

### 3.1 Middleware & keamanan route

Middleware aktif untuk:

- `/login/*`, `/register/*`, `/forgot-password/*`
- `/admin`, `/admin/*`
- `/client/*`, `/freelancer/*`, `/messages/*`, `/notifications/*`, `/settings/*`

Perilaku penting:

- Unauthenticated ke protected route → `/login` dengan `returnUrl` aman.
- Auth pages (`/login`, `/register`) jika sudah login → redirect ke target aman berbasis role (`resolvePostLoginRedirect`).
- `/admin`:
  - wajib session aktif
  - non-staff diarahkan ke home role mereka (bukan masuk admin)
  - staff tanpa izin halaman diarahkan ke `/forbidden`

### 3.2 Public & auth UI

Rute publik utama:

- `/` landing (marketing shell)
- `/jobs`, `/jobs/[jobId]`
- `/freelancers`, `/freelancers/[username]`
- `/search/nearby`
- `/pricing`, `/how-it-works`, `/help`, `/early-access`
- `/login`, `/register`, `/forgot-password`

Navbar publik:

- Auth-aware (session real dari cookie, server-side)
- Logout state: `Log in`, `Register`, CTA `Early access`
- Login state role-aware:
  - freelancer → dashboard `/freelancer` (+ messages)
  - client → dashboard `/client` (+ post job)
  - staff/admin → `/admin`
- Includes `AuthUserMenu`, notifications/messages icon, mobile hamburger behavior

Branding:

- `BrandLogo` dipakai lintas app
- asset aktif logo: `/logo/logo_EN.png`
- metadata icon/favicons app mengarah ke logo terbaru

### 3.3 Internal admin workspace (`/admin`)

#### Staff roles didukung

- `ADMIN`
- `SUPPORT_ADMIN`
- `MODERATOR`
- `FINANCE_ADMIN`

#### RBAC terpusat

File kunci:

- `features/admin/lib/access.ts`
- `features/admin/lib/server-auth.ts`

Helper utama:

- `isStaffRole(...)`
- `parseAdminPathname(...)`
- `canAccessAdminPage(...)`
- `canAccessAdminPageKey(...)`
- `requireStaffSession()`
- `requireAdminAccess(page)`

Matriks akses:

- `ADMIN`: full `/admin/*`
- `SUPPORT_ADMIN`: overview, users, jobs, bids, contracts, verification, reviews, reports, settings
- `MODERATOR`: overview, jobs, verification, reviews, reports
- `FINANCE_ADMIN`: overview, donations, subscriptions, feature-flags, settings

#### Halaman admin yang tersedia

- `/admin` (overview dashboard operasional)
- `/admin/users`
- `/admin/jobs`
- `/admin/bids`
- `/admin/contracts`
- `/admin/verification` (termasuk aksi approve/reject untuk pending requests)
- `/admin/reviews`
- `/admin/reports` (antrean moderasi: laporan user/job/proposal/review/message; triage + catatan internal)
- `/admin/donations`
- `/admin/subscriptions`
- `/admin/feature-flags` (read-only resolved flags)
- `/admin/settings`

#### Catatan UI admin

- Shell internal terpisah dari landing
- Sidebar grup: Core / Operations / Finance / Platform
- Topbar role badge + account menu
- Reusable admin table/filter/empty-state components

### 3.4 API ringkas (kanonik `/api/*`)

Auth/session:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Marketplace core:

- jobs (`/api/jobs`, `/api/jobs/[jobId]`)
- bids (`/api/bids`, `/api/bids/[bidId]/accept`)
- contracts (`/api/contracts/[contractId]`, `/complete`)
- messages (`/api/messages`, `/api/messages/[threadId]`)
- notifications (`/api/notifications`, `/api/notifications/[notificationId]`)
- reviews (`/api/reviews`)
- saved items jobs/freelancers
- taxonomy/search (`/api/categories`, `/api/skills`, `/api/search/*`)

Monetization & trust:

- `GET /api/quota/me`
- `GET/POST /api/subscriptions`
- `POST /api/donations`
- `GET/POST /api/verification`
- `GET/PATCH /api/verification/[requestId]` (staff review approve/reject)

Compat:

- `/api/v1/*` → redirect/deprecation ke `/api/*`

---

## 4) `apps/admin` (terpisah) & `apps/worker`

### 4.1 `apps/admin`

- Masih skeleton/placeholder terpisah dari `apps/web`
- Internal UI real yang aktif saat ini ada di `/admin` dalam `apps/web`

### 4.2 `apps/worker`

- Worker background Node
- job utama: promotion sweep untuk menonaktifkan `featured/boost` yang expired

---

## 5) Package bersama

### 5.1 `packages/database`

- Prisma schema domain lengkap: users, profiles, jobs, bids, contracts, reviews, notifications, messages, subscriptions, donations, verification, search taxonomy, dsb.
- Script:
  - `db:generate`
  - `db:migrate`
  - `db:migrate:deploy`
  - `db:studio`
  - `db:seed`

Seed admin dev:

- Seed script: `packages/database/prisma/seed.ts`
- default (dev): `admin@nearwork.local` / `NearWorkAdminDev123!`
- override via env: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

### 5.2 `packages/config`

- Monetization plans + entitlements
- Feature flags env `FEATURE_*`
- `shouldBypassQuotaEnforcement`
- `getPublicMonetizationFlags`, `resolvePlanEntitlements`

### 5.3 `packages/validators`

- Zod schemas untuk request body/query seluruh API

### 5.4 `packages/types`

- Enum domain shared (`UserRole`, `JobStatus`, `BidStatus`, `ContractStatus`, `SubscriptionStatus`, dll.)

### 5.5 `packages/utils`

- Util umum (pagination, date helpers, safe JSON, dsb.)

---

## 6) Pengujian & operasional

- `pnpm typecheck`, `pnpm lint`, `pnpm build`
- E2E flow: `pnpm test:e2e`
- Kebutuhan env penting:
  - `DATABASE_URL`
  - `SESSION_SECRET` (min 16 chars)

---

## 7) Dependensi tinggi (ringkas)

```mermaid
flowchart LR
  subgraph Apps
    web[apps/web]
    admin[apps/admin]
    worker[apps/worker]
  end
  subgraph Packages
    db[@acme/database]
    cfg[@acme/config]
    val[@acme/validators]
    typ[@acme/types]
    utl[@acme/utils]
  end
  web --> db
  web --> cfg
  web --> val
  web --> typ
  web --> utl
  worker --> db
  worker --> typ
  worker --> utl
  val --> typ
  cfg --> typ
  admin --> db
```

---

*Dokumen ini sudah diselaraskan dengan implementasi terbaru (admin workspace, RBAC, auth-aware navbar, seed admin, feature flags page). Jika ada route/fitur baru, update bagian routing + API + admin workspace di dokumen ini.*
