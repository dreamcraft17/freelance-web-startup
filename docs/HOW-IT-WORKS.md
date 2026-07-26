# NearWork — How It Works

> **Doc revision:** v1  
> Last synchronized: 2026-07-26

Penjelasan alur produk end-to-end. Arsitektur teknis: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Positioning

NearWork = **marketplace hiring**, bukan direktori kontak:

**Job → Proposal → Chat terikat job → Hire → Kontrak (± escrow) → Review**

Siapa pun bisa **browse** job/freelancer tanpa login. Login wajib untuk aksi: post job, bid, message, save, report.

---

## 2. Dua jalur utama

### Klien (hire)

1. Register sebagai `CLIENT` → dashboard `/client`
2. Lengkapi profil klien (opsional tapi disarankan)
3. Post job (`/client/jobs/new`) — kategori, budget (`IDR`/`USD`), work mode, lokasi
4. Terima proposal → compare → shortlist / chat → **accept bid**
5. Kontrak aktif; (V2) bayar escrow → freelancer kerja → review → release
6. Opsional: review / laporan jika ada masalah

### Freelancer (work)

1. Register sebagai `FREELANCER` → `/freelancer`
2. Lengkapi profil publik + skills + preferensi
3. Browse `/jobs` (filter kategori, budget, nearby, remote)
4. Kirim proposal terstruktur (intro, pendekatan, harga, estimasi)
5. Diskusi di Messages (thread terikat job)
6. Jika diterima → kontrak → submit work → terima payout ke wallet (V2)

---

## 3. Messaging & notifikasi

- Thread dibuat dalam konteks **job** (bukan DM bebas generik sebagai model utama).
- Notifikasi in-app: proposal, pesan, verifikasi, moderasi; copy EN/ID via `_nwCopy`.
- Unread / awaiting-reply muncul di navbar & dashboard.

---

## 4. Discovery & hyperlocal

| Surface | Fungsi |
|---------|--------|
| `/jobs` | Board lowongan + filter + pulse aktivitas |
| `/freelancers` | Direktori talent hiring-oriented |
| `/search/nearby` | Radius geo |
| Landing `/[locale]` | Intent hire/work + search |

Filter: keyword, kategori, kota, work mode (`REMOTE`/`ONSITE`/`HYBRID`), budget, recency.

Listing sintetis E2E disembunyikan di Vercel agar board publik bersih.

---

## 5. Kuota & plan

| Plan | Active bids | Active contracts |
|------|-------------|------------------|
| FREE | 5 | 2 |
| PRO | 30 | 10 |
| AGENCY | 200 | 75 |

Early-access: flag `FEATURE_FREE_UNLIMITED_QUOTAS` / paid toggles di `@acme/config` bisa melonggarkan kuota. Detail: [pricing-and-plans.md](./pricing-and-plans.md), [billing-architecture.md](./billing-architecture.md).

---

## 6. Escrow (V2)

```
Accept bid → PAYMENT_PENDING
    → Payment (Stripe / Midtrans / MOCK)
    → escrow LOCKED, contract IN_PROGRESS
    → Freelancer submit work → IN_REVIEW (5 hari)
    → Client approve → ~80% ke wallet, 20% holdback
    → Worker auto-release holdback setelah chargeback window
```

Dispute: `ContractDispute` + mediasi staff.

Tanpa `STRIPE_*` / `MIDTRANS_*` → checkout MOCK (`/checkout/mock`).

---

## 7. Trust & safety

1. User laporkan subjek (user/job/bid/review/thread/message) → `POST /api/reports`
2. Dedupe tiket aktif; priority + SLA per kategori
3. Staff antrean `/admin/reports` (assign, note, resolve/dismiss)
4. Aksi: sembunyikan job (`moderationHiddenAt`), suspend/reactivate user
5. Worker escalate overdue → notifikasi staff
6. User suspended dapat **appeal** → `/admin/appeals`

---

## 8. Background worker

Tanpa worker, SLA escalation + escrow auto-release + boost expiry + rekomendasi batch + payout batch **tidak jalan**. Lihat [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 9. Locale

- Default publik: **Indonesia** (`/id`)
- Switch bahasa → cookie `lang` + navigasi ke path ekuivalen
- UGC job: terjemahan cache opsional lewat Google Translate saat create
