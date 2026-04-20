# Documentation maintenance (NearWork)

> **Doc revision:** v6  
> Last synchronized: 2026-04-20

## AUTO — wajib untuk AI & kontributor

**Ingat:** pada setiap PR / perubahan yang relevan, **secara otomatis**:

1. **Identifikasi semua `.md` yang terdampak** (lihat tabel di bawah + isi file yang sama domainnya).
2. **Perbarui isi** setiap file itu agar selaras dengan kode.
3. Di **setiap file `.md` yang Anda sentuh**, naikkan **`Doc revision`** (+1) dan sesuaikan **`Last synchronized`**.

**Sweep minimum (AI):** untuk satu perubahan produk, jangan berhenti di satu file. **Ikuti tabel “What to update”** baris per baris: jika baris itu relevan dengan diff, buka file yang tercantum dan sinkronkan (bukan hanya `features.md`). Contoh: UI publik + auth chrome → setidaknya `features.md`, `ui-redesign.md`, `docs/application-overview.md`, `audit.md`, `README.md`, `docs/auth-session-persistence.md`, `docs/apa-itu-nearwork.md` bila copy pengguna terdampak; perubahan Prisma/pool → tambahkan `packages/database/README.md` + `audit.md` jika risiko operasional.

> “Semua MD” = **semua file Markdown yang relevan dengan perubahan itu**, bukan seluruh repo kecuali memang ada instruksi audit dokumen penuh.

## Versi dokumen (`Doc revision` v1, v2, …)

**Ke depan:** setiap file `.md` punya **revisi dokumen** sendiri-sendiri (bukan satu versi global repo).

- Di bawah judul file, simpan **dua baris metadata** (urutan tetap seperti ini):

```markdown
> **Doc revision:** v2
> Last synchronized: 2026-04-18 …
```

- **Naikkan angka** (`v1` → `v2` → `v3` …) **hanya untuk file yang berubah isinya** pada commit/PR itu.
- **Kapan naik:** isi bermakna berubah (fitur, perilaku, risiko, langkah setup). Typo/format kecil boleh **tetap** di rev yang sama atau naik satu — pilih satu kebiasaan tim; yang aman: **naik jika pembaca perlu tahu ada pembaruan**.
- **Format:** huruf **`v` kecil** + bilangan bulat (`v1`, bukan `V1` atau `ver1`), supaya mudah di-`grep`.

## Rule of thumb

When you change **product behavior**, **security**, **UI patterns**, **env/deploy**, or **API contracts**, update the relevant Markdown in the same change (or immediately after)—**dan naikkan `Doc revision` di file yang Anda sentuh.**

## What to update

| Change type | Typical files |
|-------------|----------------|
| Security (auth, CSRF, limits, headers, secrets) | `README.md`, `audit.md`, `docs/auth-session-persistence.md` |
| Public discovery / anti-scraping / rate limits | `README.md`, `audit.md`, `features.md`, `docs/application-overview.md` |
| UI / design tokens / landing / footer / locale | `ui-redesign.md`, `features.md`, `docs/application-overview.md`, `README.md` |
| Database / Prisma / migrations | `packages/database/README.md`, `audit.md` if risk-related |
| Roles / billing / taxonomy | Matching file under `docs/*.md` |
| **Positioning / “produk apa ini?”** (bahasa non-teknis) | `docs/apa-itu-nearwork.md` (+ tautan di `README.md` bagian Documentation) |

## Repo map

- **Root:** `README.md`, `audit.md`, `features.md`, `ui-redesign.md`, `credential.md` (dev seed notes only — **never** put production secrets here; file is gitignored from commits when using local-only copies).
- **`docs/`:** product and engineering references — termasuk **`docs/apa-itu-nearwork.md`** untuk penjelasan produk singkat.
- **`packages/*/README.md`:** package-specific setup.

## Metadata baris kedua

- **`Doc revision`:** nomor urut per file (lihat atas).
- **`Last synchronized`:** tanggal atau catatan singkat sinkron dengan kode terakhir.
