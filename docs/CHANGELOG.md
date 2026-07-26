# NextWork — Changelog (living docs / produk)

> **Doc revision:** v2  
> Last synchronized: 2026-07-26 (v2.1 payment harden done; next = v2.2)

Changelog ini merangkum milestone produk & dokumentasi. Detail UI pass: [`../features.md`](../features.md). Audit: [`../audit.md`](../audit.md).

---

## 2026-07-26 — Current-scope 100% (code-as-truth)

- Money safety: escrow complete bypass blocked; worker delegates to `@acme/database` money-jobs (holdback); boost/sub require payment; webhook amount/currency + fee from base; seed FREE/PRO/AGENCY.
- Checkout: `@stripe/stripe-js` confirmPayment + Midtrans Snap; server-priced totals (no fake PPN); mock simulate dev-only.
- Ops/finance: admin disputes/refunds, payout approval before SENT, money notifications, AuditLog, reconciliation view; optional high-value escrow manual review threshold.
- Residual: `POST /api/auth/refresh`, message/job attachment URLs, job `viewCount`, subscription cancel, FEATURE_* route guards, webhook rate limits, prod `NEXT_PUBLIC_APP_URL` assert.
- Living docs + PRD/SRS/SDD synced. **LIVE PSP keys remain Conditional** — [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md).

## 2026-07-26 — Brand NextWork + v2.1 payment harden

- Brand rename user-facing **NearWork → NextWork**; env `NEXTWORK_*` (fallback `NEARWORK_*`); locale header `x-nextwork-locale`.
- Stripe webhook: HMAC-SHA256 + timestamp tolerance; Midtrans: signature wajib (`status_code`).
- Unit tests: `payment-webhook-crypto.unit.test.ts`.
- Spek PRD/SRS/SDD v3/v1 di `docs/prd/NEXTWORK_*.md`; runbook [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md).

## 2026-07-26 — Docs suite kanonik

- Ditambahkan living docs setara pola dnPeople/auto: `00_INDEX`, `PROJECT-OVERVIEW`, `ARCHITECTURE`, `HOW-IT-WORKS`, `API`, `FEATURE-CATALOG`, `IMPLEMENTATION-STATUS`, `CURRENT-IMPLEMENTATION`, `USER-GUIDE`, `ADMIN-GUIDE`, `DEPLOYMENT`, `SECURITY`, `CHANGELOG`, `NEXT-PRD-BRIEF`.
- Audit menyeluruh codebase: 42 models, ~52 pages/API routes, V2 foundation + residual security pada webhook PSP.

## 2026-07-08 — Security audit

- Audit statis: fondasi auth/CSRF/RBAC baik; temuan critical pada Midtrans/Stripe webhook verify + seed hygiene + CSP/rate-limit.
- Dokumen: `SECURITY_AUDIT_2026-07-08.md`.

## 2026-07-07 — NextWork V2 Foundation

- Schema/migration V2: escrow, boosts, recommendations, appeals, wallet/payout, webhook events.
- Stripe + Midtrans APIs dengan MOCK fallback.
- Escrow lifecycle + worker auto-release.
- AI matching MVP (daily batch).
- Boost catalog; suspension appeals; admin analytics.
- Spek: `docs/NEARWORK_V2_{PRD,SRS,SDD,DESIGN_SYSTEM}.md`.
- Billing doc diperbarui.

## 2026-06-19 — Moderation operations

- Priority + SLA per kategori laporan, dedupe atomik, notifikasi staff, AuditLog, worker escalation idempotent.
- `/admin/reports` metrics + attention filters.

## 2026-05 — Marketplace UX + i18n + CI

- Trust & safety MVP (reports, hide job, suspend).
- Workspace locale URLs; notification i18n; money formatting by `Job.currency`.
- Public jobs/freelancers decision-first redesign; loading skeletons.
- GitHub Actions CI (typecheck, lint, unit, Postgres E2E).
- E2E harness `run-e2e-server.mjs` + `DATABASE_URL_TEST`.
- Synthetic listings hidden on Vercel.
- Pool pressure mitigations (serialize queries, pulse transaction).

## 2026-04 — Auth hardening & product-first UI

- CSRF, rate limits, discovery guards, security headers, `SESSION_SECRET` prod check.
- Admin fully integrated in `apps/web`.
- i18n EN/ID + SEO locale routes + UGC job translation cache.
- Documentation maintenance rules.

---

## Versi spek

| Spek | Status |
|------|--------|
| MVP marketplace | Implemented |
| NextWork V2 Foundation | Implemented (PSP Conditional) |
| V2 GA / production billing | Open — [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) |
