# NextWork — Current Implementation Baseline

| Metadata | Value |
|----------|-------|
| Snapshot date | 26 Juli 2026 |
| Purpose | Baseline untuk PRD berikutnya (jangan rebuild yang sudah ada) |
| Spec baseline | MVP marketplace + **V2 Foundation** (escrow/PSP APIs/boosts/appeals/recommendations) |
| Local path | `nextwork/` |
| Owner | Dozer · DN Tech |
| Runtime web | Next.js 15 on Vercel |
| Runtime worker | Node process terpisah |

> Panduan: [USER-GUIDE.md](./USER-GUIDE.md) · [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) · [ADMIN-GUIDE.md](./ADMIN-GUIDE.md).  
> **Cara baca:** **Available now** = behavior existing. **Conditional** = env/PSP/ops. **Roadmap** = butuh PRD baru.

---

## Available now

### Produk / UX
- Browse-first publik: landing `/[locale]`, `/jobs`, `/freelancers`, pricing, how-it-works, help, early-access, legal
- Auth: register/login/logout; role home CLIENT→`/client`, FREELANCER→`/freelancer`, staff→`/admin`
- Client: dashboard, jobs list + new, nearby talent
- Freelancer: dashboard, profile editor, proposals, nearby
- Messages (job-bound), notifications (EN/ID), settings + saved items
- Proposal form terstruktur + draft lokal; owner shortlist/accept
- Admin workspace penuh di **`apps/web/admin`**: users, jobs, bids, contracts, verification, reviews, reports, appeals, analytics, donations, subscriptions, feature-flags, settings
- i18n EN/ID + workspace locale-prefixed URLs
- Design tokens `nw-*` / V2 UI pass

### Backend / data
- API canonical `/api/*` (~52 route modules)
- Layering: route → service → policy → repository → Prisma
- **42** Prisma models (identity, taxonomy, marketplace, monetization V2, messaging, trust)
- CSRF + rate limits + public discovery guards
- Quota dari `@acme/config` + `SubscriptionPlan`
- Moderation: reports, SLA, dedupe, audit log, escalation worker
- Escrow / boosts / recommendations / wallet domain + APIs
- Worker: promotion sweep, moderation escalation, escrow release, boost expiry, recommendations, batch payouts

### Inventori

| Area | Isi |
|------|-----|
| Apps | web (produk), worker (jobs), admin (stub) |
| Packages | database, config, types, validators, utils |
| Pages | ~52 `page.tsx` |
| API | ~52 `route.ts` |
| Models | 42 |
| Spec docs | V2 PRD/SRS/SDD + design system |
| Tests | Vitest unit + HTTP E2E + CI |

---

## Conditional (env / ops)

| Item | Syarat |
|------|--------|
| Stripe real | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (+ **fix verify HMAC**) |
| Midtrans real | `MIDTRANS_SERVER_KEY` (+ harden signature required) |
| Job UGC translate | `GOOGLE_TRANSLATE_API_KEY` |
| HSTS | `NEXTWORK_ENABLE_HSTS=1` |
| Paid features early-access | `FEATURE_*` flags |
| Worker in prod | Deploy `@acme/worker` dengan `DATABASE_URL` |
| E2E isolated DB | `DATABASE_URL_TEST` |
| Support email on /help | `NEXTWORK_SUPPORT_EMAIL` |
| Production secrets | `SESSION_SECRET` kuat; **jangan seed default admin ke prod** |

Default lokal tanpa PSP keys: **MOCK checkout** — aman demo tanpa uang nyata.

---

## Not implemented / roadmap boundary

- Production-grade webhook crypto & PSP reconciliation
- Invoice PDF, real bank payout API
- Forgot-password email delivery
- WebSocket realtime messaging
- Agency multi-seat product UX
- Outbound email/SMS/Slack for moderation on-call
- CSP header, shared Redis rate-limit store
- `apps/admin` as separate production app (tidak direncanakan; pakai `/admin`)

---

## Requirements for the next PRD

1. Jangan ulangi MVP + V2 foundation sebagai “fitur baru”.
2. Pilih **satu** fokus — lihat [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md).
3. Acceptance wajib mencakup: MOCK vs live PSP, CSRF/session, worker jobs, dan keamanan webhook.
4. DoD testing: tambah di suite Vitest/E2E yang sudah ada.
5. Catat risiko UU PDP / pembayaran / escrow secara eksplisit.

## Suggested next (ringkas)

| Priority | Theme |
|----------|--------|
| **P0** | Harden payment webhooks + production PSP runbook |
| **P1** | Forgot-password + outbound staff alerts |
| **P1** | Realtime messaging ATAU agency seats |
| **P2** | Invoice/compliance + bank payout |
