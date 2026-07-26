# NextWork — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 26 Juli 2026 |
| **Baseline kode** | MVP + V2 + **current-scope DoD** (money-safe, checkout UI, ops/finance, residual SRS) · brand **NextWork** |
| **Spec terakhir** | `prd/NEXTWORK_PRD_V3` + `NEARWORK_V2_*` historical |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Path** | `nextwork/` |
| **Ganti dokumen ini?** | Setelah PRD berikutnya di-sign-off atau baseline berubah |

> **Cara pakai:** Baca atas → bawah. Jangan janjikan ulang §3 sebagai fitur baru. Tulis PRD hanya untuk §5–§6.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Trust ops 2** | Outbound alert (email/Slack), forgot-password, CSP + shared rate limit | Volume laporan / abuse naik |
| **B — Engagement** | WebSocket realtime chat ATAU agency multi-seat UX | Diferensiasi produk |
| **C — Monetization depth** | Invoice PDF, real bank payout, commission 5–8%, reconciliation dashboard | Setelah LIVE PSP + GMV nyata |

**Rekomendasi P0:** **Jalur A atau B** sebagai **PRD v2.2** — engineering current-scope **Done**; LIVE PSP + legal masih **Conditional** ([PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md)).

---

## 2. Snapshot produk saat ini

| Item | Nilai |
|------|--------|
| Brand | **NextWork** |
| App | Next.js 15 · `apps/web` (UI + `/api` + `/admin`) — **bukan NestJS** |
| Worker | `apps/worker` |
| Payments | Stripe/Midtrans APIs · HMAC verify **done** · MOCK tanpa key |
| Docs | [00_INDEX.md](./00_INDEX.md) · [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) |

---

## 3. Yang sudah Done (jangan ulangi)

- Marketplace MVP + admin trust & safety + i18n EN/ID
- V2 escrow/boosts/recommendations/wallet/appeals
- **v2.1:** Stripe HMAC-SHA256, Midtrans signature required, unit tests, payment runbook
- Brand rename NextWork + `NEXTWORK_*` env

Detail: [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG.md](./FEATURE-CATALOG.md).

---

## 4. Conditional (bukan “belum dikode”)

- LIVE PSP: env keys + webhook registration + [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) sign-off
- Google Translate UGC, HSTS, FEATURE_* paid toggles, worker deploy

---

## 5. Greenfield valid untuk PRD berikutnya

Lihat §1. Out of scope: rebuild NestJS, ganti cookie session, rename massal CSS `nw-*`.

---

## 6. Definition of Done

1. Acceptance testable (API + UI).
2. Update FEATURE-CATALOG, IMPLEMENTATION-STATUS, CURRENT-IMPLEMENTATION, CHANGELOG.
3. Tests ditambah di suite yang ada.
4. Security: no secrets in client; no seed→prod.
5. Worker/deploy impact di DEPLOYMENT.md.
