# NearWork UI/UX Design Brief

> **Doc revision:** v1  
> Last synchronized: 2026-05-01 (initial design brief for AI/human UI/UX designers).

Dokumen ini adalah acuan desain untuk designer UI/UX (baik human maupun AI) agar output konsisten dengan karakter produk NearWork.

---

## 1) Product Context (Wajib Dipahami)

NearWork adalah marketplace freelance terstruktur:

- Fokus utama: **job -> proposal -> chat -> keputusan hiring** tetap dalam satu alur.
- Posisi produk: **tool kerja harian**, bukan landing promo.
- Priority UX: cepat dipakai untuk:
  - cari freelancer,
  - bandingkan opsi,
  - mulai diskusi,
  - rekrut.

Target rasa produk:

- Credible
- Praktis
- Terstruktur
- Bisa dipakai tiap hari

---

## 2) Design Direction (Do / Don’t)

### Do

- Clean, solid, grounded UI (arah Notion/Linear/Stripe dashboard feel).
- White / very light gray background.
- Card solid dengan border tipis (`#E5E7EB`).
- Typography tegas, hierarchy jelas.
- Konten padat secukupnya (tidak kosong, tidak sesak).
- CTA jelas: satu primary action per konteks.

### Don’t

- Jangan glassmorphism / frosted / blur berlebihan.
- Jangan gradient ramai atau color noise.
- Jangan shadow dramatis.
- Jangan layout “template AI” yang terlalu simetris dan marketing-heavy.
- Jangan ilustrasi 3D startup cliché.

---

## 3) Visual Tokens (Baseline)

- Primary: `#4F35E8` (boleh varian dekat: `#4326D9`)
- Text main: `#071027`
- Border: `#E5E7EB`
- Base background: putih / `#F8FAFC`
- Radius:
  - cards: `rounded-2xl`
  - controls: `rounded-lg` / `rounded-xl`
- Shadow: minimal (`shadow-sm`) atau none

---

## 4) Core UX Principles

1. **Action first**: user tahu klik apa dalam 3 detik.
2. **Decision confidence**: user bisa membandingkan opsi dengan cepat.
3. **No dead-end**: empty state selalu kasih next action.
4. **Continuity**: konteks job/proposal/chat tidak putus.
5. **Honest UI**: tidak memalsukan metrics/sinyal aktivitas.

---

## 5) Homepage Structure (Reference)

Homepage publik (`/id`) idealnya mengikuti struktur:

1. **Navbar**
   - kiri: brand
   - tengah: Lowongan, Freelancer, Cara kerja, Harga, Bantuan
   - kanan: status masuk/pesan/notifikasi + CTA utama + language switch
   - sticky, clean, border-bottom subtle

2. **Hero split**
   - kiri: intent toggle + headline + CTA
   - kanan: panel signal marketplace (aktivitas nyata)

3. **Search card**
   - keyword + city + tombol `Cari`
   - quick chips (Nearby, Remote, Sesuai budget)
   - badge kecil signal ketersediaan

4. **Main content**
   - kategori services (grid)
   - preview marketplace live (list compact)

5. **Final CTA**
   - mendorong aksi nyata (post job / cari freelancer)

6. **Footer**
   - minimal, utilitarian, bukan dekoratif

---

## 6) Copywriting Guidelines (Bahasa Indonesia)

Tone:

- langsung, practical, non-hype
- hindari buzzword marketing
- utamakan kata kerja aksi

Contoh gaya yang benar:

- "Cari freelancer"
- "Pasang lowongan sekarang"
- "Bandingkan profil sebelum diskusi"
- "Proposal tetap terhubung ke pekerjaan"

Contoh yang perlu dihindari:

- "Revolutionary talent ecosystem"
- "Boost your freelance journey"
- copy terlalu promosi / abstrak

---

## 7) Empty / Low-Data Behavior

Saat data tipis atau kosong:

- tetap tampilkan struktur list/card (preview mode/skeleton boleh, tanpa fake identity)
- gunakan copy netral + actionable:
  - ubah filter
  - jelajahi kategori
  - buka lowongan/freelancer
- jangan framing “platform sepi” secara merusak trust

---

## 8) Component Rules

- Satu komponen = satu tujuan utama.
- Hindari ornamental badges yang tidak membantu keputusan.
- Icon harus fungsional (bukan dekorasi random).
- Prioritaskan scannability:
  - judul jelas
  - metadata ringkas
  - CTA terlihat

---

## 9) Accessibility & Usability Checklist

Wajib untuk setiap desain:

- Kontras teks aman (terutama teks kecil).
- Focus state jelas untuk keyboard users.
- Hit area tombol/link cukup besar.
- Jangan hanya mengandalkan warna untuk status.
- Label form jelas (bukan placeholder-only).

---

## 10) Responsive Rules

- Desktop: layout multi-column terstruktur.
- Tablet: kolom kanan turun rapi di bawah hero/search.
- Mobile:
  - prioritas: headline -> CTA -> search -> list
  - hindari card terlalu kecil/rapat
  - pastikan CTA utama tetap terlihat cepat

---

## 11) Constraints Teknis untuk Designer

Designer **tidak perlu** mengubah:

- business logic
- API contract
- route behavior
- backend service flow

Fokus pada:

- layout
- visual hierarchy
- spacing
- component composition
- microcopy UX

---

## 12) Handoff Output (Yang Diharapkan)

Setiap usulan desain sebaiknya menyertakan:

1. **Screen list** (halaman apa saja)
2. **Component map** (komponen baru/ubah)
3. **State map**:
   - normal
   - loading
   - empty
   - error
4. **CTA hierarchy** per screen
5. **Copy list** (ID/EN jika relevan)
6. **Notes implementasi** (kelas utilitas/spacing/token)

---

## 13) Definition of Done (Design)

Desain dianggap siap jika:

- terasa seperti produk kerja harian, bukan landing promo,
- hierarchy tindakan jelas,
- tidak ada visual gimmick AI-template,
- bisa diimplementasikan tanpa mengubah logic backend,
- konsisten dengan style sistem NearWork.

