# NearWork — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 26 Juli 2026 |
| **Baseline kode** | MVP marketplace + **V2 Foundation** (escrow, PSP APIs, boosts, appeals, recommendations, wallet) |
| **Spec terakhir** | `NEARWORK_V2_PRD/SRS/SDD` |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Path** | `NearWorks/` |
| **Ganti dokumen ini?** | Setelah PRD berikutnya di-sign-off atau baseline berubah |

> **Cara pakai:** Baca atas → bawah. Jangan janjikan ulang §3 sebagai fitur baru. Tulis PRD hanya untuk §5–§6. Setiap story wajib memenuhi §7.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

Pilih **satu** jalur:

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Production payments** | Harden webhook Stripe/Midtrans, reconciliation, invoice dasar, runbook go-live berbayar | Sebelum menerima uang nyata |
| **B — Trust ops 2** | Outbound alert (email/Slack), forgot-password, CSP + shared rate limit | Jika volume laporan / abuse naik |
| **C — Engagement product** | Realtime messaging ATAU agency multi-seat UX | Jika diferensiasi produk > billing |

**Rekomendasi P0:** **Jalur A** sebagai **PRD v2.1 — Production PSP Hardening**.

Alasan: V2 foundation sudah punya escrow & payment routes, tapi audit 2026-07-08 menunjukkan **verifikasi webhook belum aman**. Tanpa itu, fitur escrow tidak boleh dijual sebagai production.

Nomor versi wajar: **v2.1** (payments harden) atau **v3.0** (realtime / agency).

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | Marketplace freelance hiring (remote + hyperlocal) |
| App | Next.js 15 · `apps/web` (UI + `/api` + `/admin`) |
| Worker | `apps/worker` (SLA, escrow, boost, recommendations, payouts) |
| Data | PostgreSQL · Prisma · **42** models |
| Auth | Cookie JWT `acme_session` + CSRF + RBAC |
| i18n | EN / ID · default `id` |
| Plans | FREE / PRO / AGENCY (+ FEATURE_* flags) |
| Payments | Stripe + Midtrans APIs · **MOCK** tanpa key |
| Tests | Vitest + HTTP E2E + GitHub Actions |
| Deploy | Vercel web + worker terpisah |

---

## 3. Yang sudah Done (jangan ulangi di PRD sebagai “baru”)

- Auth register/login/session, CSRF, rate limits, middleware gates
- Jobs, bids (quota), contracts, messages, notifications, reviews, saved items
- Public discovery + geo nearby + marketplace pulse
- Profiles, taxonomy, verification queue
- Admin RBAC workspace (reports SLA/escalation/dedupe/audit, appeals, analytics, …)
- i18n EN/ID + SEO locale + workspace locale URLs
- V2: escrow domain, boosts, recommendations batch, wallet/payout APIs, PSP create endpoints, MOCK checkout
- CI + E2E smoke marketplace

Detail: [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG.md](./FEATURE-CATALOG.md).

---

## 4. Conditional (bukan “belum dikode”)

- Stripe/Midtrans live: env keys **dan** webhook verify yang benar
- Google Translate UGC: `GOOGLE_TRANSLATE_API_KEY`
- Paid entitlements: `FEATURE_*`
- Worker harus di-deploy untuk SLA/escrow
- HSTS: `NEARWORK_ENABLE_HSTS=1`
- Seed admin: hanya non-prod

---

## 5. Greenfield / fokus valid untuk PRD berikutnya

### Jalur A — Production PSP (disarankan)

- Stripe webhook: HMAC `t.v1` sesuai dokumentasi Stripe
- Midtrans: **wajib** signature; reject jika hilang/salah
- Staging webhook test harness + idempotency bukti `WebhookEvent`
- Runbook: enable paid flags, fee V2, chargeback hold, support playbook
- Optional in-scope: invoice PDF minimal, donation abuse controls

### Jalur B — Trust & account recovery

- Forgot-password email end-to-end
- Slack/email pada laporan P0 / SLA breach
- CSP baseline + rate-limit store (Redis/Upstash)
- Credential/public FS CI check

### Jalur C — Product engagement

- WebSocket atau SSE untuk messages
- Agency seats (AGENCY_* roles sudah di enum)
- Ranking premium / boost UX polish berbayar

**Out of scope default:** rebuild admin di `apps/admin`, ganti stack, mobile native, fake metrics.

---

## 6. Non-goals

- Menulis ulang App Router / Prisma schema dari nol
- Menjanjikan “AI matching enterprise” tanpa metrik sukses baru
- Menganggap MOCK checkout = production ready

---

## 7. Definition of Done (wajib di setiap story PRD)

1. Acceptance criteria testable (API + UI).
2. Update living docs: `FEATURE-CATALOG`, `IMPLEMENTATION-STATUS`, `CURRENT-IMPLEMENTATION`, `CHANGELOG`, naikkan `Doc revision`.
3. Tests: unit untuk crypto/verify; E2E smoke tidak regresi; jika PSP — tes negatif webhook.
4. Security note: tidak ada secret di client; seed tidak ke prod.
5. Worker impact didokumentasikan di [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 8. Referensi cepat

| Dokumen | Fungsi |
|---------|--------|
| [00_INDEX.md](./00_INDEX.md) | Index |
| [SECURITY.md](./SECURITY.md) | Temuan webhook |
| [billing-architecture.md](./billing-architecture.md) | Escrow & PSP |
| [NEARWORK_V2_PRD.md](./NEARWORK_V2_PRD.md) | Spek V2 |
| [`../SECURITY_AUDIT_2026-07-08.md`](../SECURITY_AUDIT_2026-07-08.md) | Audit mentah |
