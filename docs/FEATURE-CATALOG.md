# NextWork — Feature Catalog

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Spec: NextWork V2 Foundation + MVP + **current-scope DoD**  
> Path: `nextwork/`

## Cara membaca

| Status | Arti |
|--------|------|
| **Available** | Ada di UI/API codebase |
| **Conditional** | Ada, tapi butuh env/PSP/ops |
| **Roadmap** | Belum produk; jangan dijual sebagai existing |

Inventaris changelog UI panjang: [`../features.md`](../features.md).

---

## 1. Identity & session

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Register / login / logout | JWT cookie `acme_session` | `/login`, `/register`, `/api/auth/*` | Available |
| Session API | Current user + role | `GET /api/auth/session` | Available |
| CSRF | Double-submit + header | Mutasi API | Available |
| Rate limit auth | Sliding window per IP | Login/register | Available |
| Forgot password | Form UI only | `/forgot-password` | Conditional (email backend belum) |
| RBAC roles | CLIENT, FREELANCER, staff, agency enums | Middleware + policies | Available (agency UX partial) |

---

## 2. Marketplace core

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Post job | Create + lifecycle OPEN… | `/client/jobs/new`, `POST /api/jobs` | Available |
| Job board publik | Filter, pulse, pagination | `/jobs`, `/api/search/jobs` | Available |
| Job detail | Brief, signals, apply panel | `/jobs/[jobId]` | Available |
| Proposal / bid | Structured form + draft lokal | Detail job, `POST /api/bids` | Available |
| Shortlist / accept | Owner actions | Bid APIs + owner UI | Available |
| Contracts | ACTIVE / IN_PROGRESS / complete | Contract APIs + admin | Available |
| Quota enforcement | Plan caps | `QuotaService` | Available |
| Saved jobs/freelancers | Bookmark | Settings + APIs | Available |
| Reviews | Post + public profile | `/api/reviews` | Available |

---

## 3. Messaging & notifications

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Job-bound threads | List + conversation | `/messages` | Available |
| Send message | CSRF + rate limit | `POST /api/messages/*` | Available |
| In-app notifications | Locale-aware copy | `/notifications` | Available |
| Unread / awaiting reply | Navbar badges | Marketing + dashboard | Available |
| Realtime WebSocket | — | — | Roadmap |

---

## 4. Discovery & hyperlocal

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Freelancer directory | Hiring-oriented list | `/freelancers` | Available |
| Public profiles | Storefront + CTA contact | `/freelancers/[username]` | Available |
| Nearby search | Lat/lng + radius | `/search/nearby`, geo service | Available |
| Work mode filters | REMOTE / ONSITE / HYBRID | Jobs & freelancers | Available |
| Marketplace pulse | Aggregates nyata | PublicStatsService | Available |
| UGC job translation | Google Translate cache | Create job | Conditional (`GOOGLE_TRANSLATE_API_KEY`) |

---

## 5. Monetization & V2 commerce

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Plans FREE/PRO/AGENCY | Seeded entitlements + quota | `/pricing`, subscriptions API | Available |
| Subscription upgrade / cancel | Paid gate + cancelAtPeriodEnd | `/api/subscriptions/*` | Conditional (MOCK tanpa PSP) |
| Checkout UI | Stripe.js confirm + Snap + mock simulate | `/checkout/mock` | Available (PSP keys Conditional) |
| Stripe PaymentIntent | Create + webhook amount check | `/api/payments/stripe/*` | Conditional (keys) — HMAC Available |
| Midtrans Snap | Create + notification amount check | `/api/payments/midtrans/*` | Conditional (keys) — signature Available |
| Escrow lifecycle | Lock → 5d review → 80/20 holdback | `/api/escrow/*` + money-jobs | Available |
| Boosts | Paid activation + FEATURE_* guards | `/api/boosts` | Available |
| Wallet / payouts | Request → admin approve → worker SENT | `/api/payouts/*`, `/admin/payouts` | Available (MOCK receipts) |
| Disputes / refunds | Admin resolve FAVOR_* / SPLIT | `/admin/disputes` | Available |
| Reconciliation | PSP vs PaymentTransaction flags | `/admin/reconciliation` | Available |
| Donations | Record donation | `/api/donations` | Available (MOCK; abuse risk) |
| Recommendations | Daily batch + dashboard | Worker + `/api/recommendations` | Available |

---

## 6. Trust & safety / admin

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Report intake | Dedupe + SLA priority | `POST /api/reports` | Available |
| Moderation queue | Assign, notes, resolve | `/admin/reports` | Available |
| Hide job / suspend user | Staff actions | Admin APIs | Available |
| Escalation worker | Overdue SLA | `apps/worker` | Available |
| Appeals | User submit + admin | `/admin/appeals` | Available |
| Verification queue | Approve/reject | `/admin/verification` | Available |
| Analytics overview | Real aggregates | `/admin/analytics` | Available |
| Feature flags page | Read-only | `/admin/feature-flags` | Available |
| Outbound email/push alerts | Staff realtime | — | Roadmap |
| Multi-level on-call | — | — | Roadmap |

---

## 7. i18n & marketing

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| EN / ID dictionaries | Full surfaces core | `locales/*.json` | Available |
| SEO locale routes | hreflang + canonical | `app/[locale]` | Available |
| Workspace locale URLs | Rewrite middleware | `/en|id/client…` | Available |
| Marketing pages | Pricing, how-it-works, help, early-access, contact, legal | `(marketing)/*` | Available |
| Newsletter footer | UI only | Footer | Roadmap (backend) |

---

## 8. Quality & ops

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Unit tests | Vitest | `pnpm test:unit` | Available |
| E2E HTTP smoke | Auth→job→bid→msg→report | `pnpm test:e2e` | Available |
| CI | typecheck, lint, unit, Postgres E2E | `.github/workflows/ci.yml` | Available |
| Deploy checklist | Vercel + migrate + worker | [deploy-checklist.md](./deploy-checklist.md) | Available |
| `apps/admin` separate app | Placeholder | Port 3001 | Stub (bukan produk) |

---

## 9. Roadmap (jangan dijual sebagai existing)

| Fitur | Catatan |
|-------|---------|
| Production PSP LIVE ops | Keys + webhook register + pilot txs — [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md) |
| Invoice PDF / reconciliation dashboard | |
| Real bank payout API | Ganti MOCK receipt |
| WebSocket / realtime messaging | Ganti polling |
| Forgot-password email | Backend + provider |
| Agency multi-seat UX | Enum sudah ada |
| Storybook / PWA / WCAG automation | Backlog UI |
| Official CSP + shared rate-limit store | Security hardening |

## Ringkasan produk

NextWork = **marketplace freelance** (browse-first) dengan **job-bound hiring flow**, **admin trust & safety**, dan **fondasi V2** (escrow/boost/recommendations). Billing production = Conditional.
