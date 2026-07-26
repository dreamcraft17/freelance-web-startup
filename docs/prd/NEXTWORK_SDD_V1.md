# NextWork — System Design Document (v1)

| | |
|---|---|
| **Dokumen** | Technical architecture, data models, API design, payment flow, deployment |
| **Versi** | v1.0 |
| **Tanggal** | 26 Juli 2026 |
| **Owner** | Dozer (Tech Lead) · DN Tech |
| **Tech Stack** | Next.js 15 (App Router + Route Handlers), PostgreSQL 16, Prisma 5, Stripe + Midtrans |
| **Path** | `nextwork/` (monorepo) |

> **Implementasi aktual:** API = Next.js Route Handlers (`apps/web/app/api/*`); background jobs = Node worker (`apps/worker`). Sumber kebenaran: `packages/database/prisma/schema.prisma`, `packages/config/src/plans.ts`, `packages/config/src/v2-pricing.ts`.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│                   Next.js 15 (App Router)                   │
│         /app, /admin, /api, (marketing), (auth)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  API (Next.js Route Handlers)                 │
│  /api/jobs, /api/bids, /api/contracts, /api/messages, ...   │
│  auth (JWT + CSRF), middleware (RBAC, rate limit)           │
│  /api/payments/stripe|midtrans, /api/escrow                 │
│  webhooks: /api/payments/*/webhook|notification             │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL 16 (RLS-ready)                          │
│  users, jobs, bids, contracts, messages, reviews,            │
│  payments, escrow, subscriptions, boosts, ...                │
│  42 models total                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Worker (Node.js — apps/worker)                  │
│         Separate process; shares Prisma + @acme/config       │
│  - Escrow auto-release (5d review window → 80% release)     │
│  - Boost expiry sweep                                        │
│  - Recommendations batch                                     │
│  - Payout batch (MOCK receipts → real v2.2)                  │
│  - Moderation SLA escalation                                 │
│  Trigger: setInterval cron (6h default; env override)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         External Services (Third-party APIs)                 │
│  - Stripe (payments, webhooks)                               │
│  - Midtrans (payments, webhooks)                             │
│  - SendGrid or local email                                   │
│  - (Optional) Google Translate (UGC translation)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model (ERD)

### Core entities

```
User
├─ id (UUID)
├─ email (unique)
├─ password_hash
├─ role (CLIENT | FREELANCER | STAFF | AGENCY)
├─ profile_status (ACTIVE | SUSPENDED | DELETED)
├─ verification_status (UNVERIFIED | VERIFIED | REJECTED)
├─ workspace_id (FK) -- AGENCY multi-seat (v2.2 waitlist; schema stub)
├─ created_at, updated_at

Job
├─ id (UUID)
├─ user_id (FK, client)
├─ title
├─ description
├─ budget_min, budget_max (IDR)
├─ category (enum: design, dev, writing, ...)
├─ work_mode (REMOTE | ONSITE | HYBRID)
├─ location (city, lat/lng for hyperlocal)
├─ radius_km (for nearby search)
├─ status (OPEN | IN_PROGRESS | CLOSED | CANCELLED)
├─ attachments (file URLs)
├─ created_at, expires_at

Bid
├─ id (UUID)
├─ job_id (FK)
├─ freelancer_id (FK, user)
├─ proposal_text
├─ bid_amount (IDR)
├─ bid_timeline (days)
├─ status (PENDING | ACCEPTED | REJECTED)
├─ created_at

Contract
├─ id (UUID)
├─ bid_id (FK, unique)
├─ freelancer_user_id, client_user_id (FK)
├─ amount, currency
├─ status (PENDING | PAYMENT_PENDING | IN_PROGRESS | IN_REVIEW | COMPLETED | DISPUTED | …)
├─ payment_status (NONE | PENDING | CONFIRMED | …)
├─ escrow_status (NONE | LOCKED | PARTIAL_RELEASED | …)
├─ escrow_amount_cents, work_review_deadline, payment_due_at
├─ created_at, updated_at

PaymentIntent
├─ id, user_id, contract_id (optional unique)
├─ kind (CONTRACT_ESCROW | SUBSCRIPTION_PLAN | …)
├─ status (PENDING | SUCCEEDED | FAILED | …)
├─ provider (MOCK | STRIPE | MIDTRANS)
├─ amount_cents, currency
├─ stripe_intent_id | midtrans_order_id (provider ref)
├─ idempotency_key, metadata
├─ created_at, updated_at

PaymentTransaction
├─ id, contract_id (optional)
├─ type (CHARGE | REFUND | …), amount, fee, currency
├─ status, provider, provider_txn_id
├─ metadata, created_at

EscrowTransaction
├─ id, contract_id
├─ type (LOCK | PARTIAL_RELEASE | FULL_RELEASE | …)
├─ amount, reason, created_by
├─ created_at

WebhookEvent
├─ id, provider, external_id (unique per provider)
├─ event_type, processed_at

Message
├─ id (UUID)
├─ conversation_id (FK) -- job-bound
├─ sender_id (FK, user)
├─ text
├─ attachments (file URLs)
├─ read_at
├─ created_at

Report
├─ id (UUID)
├─ target_id (job or user)
├─ reporter_id (FK, user)
├─ reason (enum: scam, harassment, low-quality, ...)
├─ description
├─ status (OPEN | UNDER_REVIEW | RESOLVED | DISMISSED)
├─ assigned_to (FK, admin)
├─ resolved_at
├─ created_at

Review
├─ id (UUID)
├─ contract_id (FK)
├─ rater_id (FK, user)
├─ ratee_id (FK, user)
├─ score (1–5)
├─ text
├─ created_at

Subscription
├─ id (UUID)
├─ user_id (FK)
├─ plan (FREE | PRO | AGENCY)
├─ starts_at, expires_at
├─ auto_renew (bool)
├─ payment_method (CARD | BANK_TRANSFER)
├─ status (ACTIVE | EXPIRED | CANCELLED)
├─ created_at

Boost
├─ id (UUID)
├─ user_id (FK)
├─ boost_type (JOB_FEATURED | PROFILE_FEATURED)
├─ target_id (job or user)
├─ expires_at
├─ cost_idr (from BOOST_PRODUCT_DEFS — e.g. 50k–300k)
├─ created_at

Workspace (AGENCY)
├─ id (UUID)
├─ name
├─ slug
├─ owner_id (FK, user)
├─ members (many-to-many with User)
├─ created_at
```

### Relationships (simplified)

```
User (1) ──── (many) Job
User (1) ──── (many) Bid
User (1) ──── (many) Contract (as client/freelancer)
Job (1) ──── (many) Bid
Job (1) ──── (1) Contract (accepted bid)
Contract (1) ──── (0..1) PaymentIntent
Contract (1) ──── (many) PaymentTransaction, EscrowTransaction
Contract (1) ──── (many) Message
User (1) ──── (many) Review (as rater/ratee)
User (1) ──── (1) Subscription
```

---

## 3. API Design

### 3.1 Authentication & Authorization

**Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh (JWT refresh)
GET    /api/auth/session (current user + role)
POST   /api/auth/forgot-password (v2.2)
```

**Auth flow:**
1. User register/login → JWT cookie `acme_session` (HttpOnly, Secure in prod, SameSite=Lax, Max-Age=7d)
2. CSRF token in response; all mutations require X-CSRF-Token header
3. RBAC middleware checks `user.role` for protected routes

**Roles:**
```
CLIENT      → can post jobs, view bids, rate
FREELANCER  → can bid, submit proposals, view contracts, rate
STAFF       → admin; can moderate, view reports, escalate
AGENCY      → higher quotas (plans.ts); multi-seat workspace v2.2 waitlist
```

---

### 3.2 Job API

```
GET    /api/jobs
       query: { search, category, budget_min, budget_max,
                work_mode, location, radius_km, sort, limit, page }
       response: { jobs[], total, page, limit }

GET    /api/jobs/:jobId
       response: { job, bids[], reviews[] }

POST   /api/jobs
       body: { title, description, budget_min, budget_max,
               category, work_mode, location, radius_km, ... }
       auth: CLIENT
       response: { job }

PATCH  /api/jobs/:jobId
       body: { title?, description?, ... }
       auth: CLIENT (owner)

DELETE /api/jobs/:jobId
       auth: CLIENT (owner)
```

---

### 3.3 Bid API

```
GET    /api/jobs/:jobId/bids
       auth: CLIENT (owner of job) or STAFF
       response: { bids[] }

POST   /api/bids
       body: { job_id, bid_amount, bid_timeline, proposal_text }
       auth: FREELANCER
       quota check: FEATURE_BID_LIMIT
       response: { bid }

PATCH  /api/bids/:bidId
       body: { bid_amount?, proposal_text? }
       auth: FREELANCER (owner)

POST   /api/bids/:bidId/accept
       auth: CLIENT (owner of job)
       action: create Contract (status=PENDING); client pays separately
       response: { contract }

DELETE /api/bids/:bidId
       auth: FREELANCER (owner)
```

---

### 3.4 Contract API

```
GET    /api/contracts
       query: { status, sort }
       auth: any user
       response: { contracts[] } (filtered by ownership)

GET    /api/contracts/:contractId
       response: { contract, messages[], payment }

PATCH  /api/contracts/:contractId
       body: { status: IN_PROGRESS | COMPLETED | DISPUTED }
       auth: CLIENT or FREELANCER (owner)
       action: trigger escrow release logic if COMPLETED

POST   /api/contracts/:contractId/deliverables
       body: { attachment_url }
       auth: FREELANCER
```

---

### 3.5 Payment & Escrow API

```
POST   /api/payments/stripe/create-intent
       body: { contractId }
       auth: CLIENT (owner of contract)
       action: create Stripe PaymentIntent + PaymentIntent row
       response: { client_secret, payment_intent_id, amount, currency }
       → Frontend: Stripe.js confirmPayment()

POST   /api/payments/midtrans/create-snap
       body: { contractId }
       auth: CLIENT
       action: create Midtrans Snap token + PaymentIntent row
       response: { snap_token, order_id, … }
       → Frontend: window.snap.pay(snap_token)

POST   /api/payments/stripe/webhook
       header: Stripe-Signature (verify HMAC t.v1)
       body: raw Stripe webhook event
       action: idempotent via WebhookEvent; update PaymentIntent + Contract escrow

POST   /api/payments/midtrans/notification
       body: Midtrans notification JSON
       action: verify SHA512 signature; idempotent via WebhookEvent

GET    /api/escrow/:contractId
       response: { escrowStatus, escrowAmountCents, workReviewDeadline, transactions[] }

PATCH  /api/escrow/:contractId
       body: review action (approve / dispute)
       auth: CLIENT — triggers 80% release + 20% holdback (V2_PRICING)
```

---

### 3.6 Message API

```
GET    /api/contracts/:contractId/messages
       response: { messages[] }

POST   /api/contracts/:contractId/messages
       body: { text, attachments? }
       auth: CLIENT or FREELANCER (contract party)
       response: { message }
```

---

### 3.7 Review API

```
POST   /api/contracts/:contractId/reviews
       body: { score: 1–5, text }
       auth: CLIENT or FREELANCER (contract party, post-completion)
       response: { review }

GET    /api/users/:userId/reviews
       response: { reviews[], avg_score, total_ratings }
```

---

### 3.8 Report & Moderation API

```
POST   /api/reports
       body: { target_id, target_type: JOB | USER, reason, description }
       auth: any user
       response: { report }

GET    /api/admin/reports
       query: { status, sort, limit, page }
       auth: STAFF
       response: { reports[] }

PATCH  /api/admin/reports/:reportId
       body: { status, resolution_note, action: DISMISS | HIDE | SUSPEND }
       auth: STAFF

POST   /api/admin/reports/:reportId/escalate
       body: { escalation_reason }
       auth: STAFF
       action: trigger worker SLA check
```

---

### 3.9 Subscription & Boost API

```
POST   /api/subscriptions/upgrade
       body: { plan: PRO | AGENCY, payment_method }
       auth: any user
       action: charge + create Subscription record
       response: { subscription }

GET    /api/subscriptions/current
       auth: any user
       response: { subscription } or null

POST   /api/boosts
       body: { boost_type, target_id, duration_days }
       auth: any user
       charge: IDR 49k–149k
       response: { boost }
```

---

### 3.10 Admin Analytics API

```
GET    /api/admin/analytics
       auth: STAFF
       response: {
         contracts_total,
         gmv_total (IDR),
         active_users,
         revenue (commission + subscription),
         sla_metrics (avg resolution time),
         fraud_alerts
       }
```

---

## 4. Payment Flow (v2.1)

### 4.1 Workflow diagram

```
1. Client accepts Bid
   → POST /api/bids/:bidId/accept
   → Contract created: status = PENDING (no escrow yet)
   → Bid status = ACCEPTED; client redirected to pay

2. Client initiates payment
   → POST /api/payments/stripe/create-intent (or midtrans/create-snap)
   → Contract → PAYMENT_PENDING; PaymentIntent row (PENDING)
   → Frontend: Stripe.js or Snap.pay()

3. Client completes payment
   → PSP callback (e.g. payment_intent.succeeded)
   → Webhook: /api/payments/stripe/webhook or /api/payments/midtrans/notification

4. Webhook verification (v2.1 CRITICAL)
   ✓ Stripe: HMAC t.v1 via Stripe-Signature header
   ✓ Midtrans: SHA512(order_id + status_code + gross_amount + serverKey)
   ✓ Idempotency: WebhookEvent unique (provider, externalId)
   ✓ PaymentIntent → SUCCEEDED; PaymentTransaction CHARGE recorded
   ✓ Contract → IN_PROGRESS, escrowStatus = LOCKED; EscrowTransaction LOCK

5. Work delivery & review (V2_PRICING from packages/config/src/v2-pricing.ts)
   → Freelancer submits work → IN_REVIEW; workReviewDeadline = now + 5 days
   → Client approves OR auto-release after 5d review window
   → Partial release: 80% to freelancer wallet; 20% holdback for 7 days (chargeback protection)
   → After holdback period: remaining 20% released (worker sweep)

6. Payout (daily batch, MOCK → v2.2 real bank transfer)
   → apps/worker processBatchPayouts()
   → PayoutRequest status → SENT (MOCK receipt today)

Reconciliation (ops):
   → Compare PaymentTransaction vs PSP logs; flag mismatches
```

---

### 4.2 Webhook verification (Stripe)

**v2.1 requirement:**

```javascript
// apps/web — POST /api/payments/stripe/webhook (raw body)
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);

const isNew = await recordWebhookOnce('stripe', event.id, event.type);
if (!isNew) return { received: true };

if (event.type === 'payment_intent.succeeded') {
  await paymentIntent.update({ status: 'SUCCEEDED' });
  await contract.update({
    status: 'IN_PROGRESS',
    paymentStatus: 'CONFIRMED',
    escrowStatus: 'LOCKED'
  });
  await escrowTransaction.create({ type: 'LOCK', amount, … });
  await paymentTransaction.create({ type: 'CHARGE', providerTxnId: intent.id, … });
}
```

**Idempotency:** `WebhookEvent` unique index on `(provider, externalId)`. Duplicate webhook deliveries are no-ops.

**Midtrans:** `signature_key` must equal SHA512(`order_id + status_code + gross_amount + serverKey`) — see `payment-webhook-crypto.ts`.

---

### 4.3 Reconciliation query

```sql
-- Ops: compare PaymentTransaction vs PSP export (last 7 days)
SELECT
  pt.id, pt.provider_txn_id, pt.amount, pt.status,
  pt.provider, pt.contract_id
FROM "PaymentTransaction" pt
WHERE pt.created_at > NOW() - INTERVAL '7 days'
ORDER BY pt.status, pt.created_at DESC;
```

---

## 5. Database Schema (Prisma migration)

**Excerpted key tables (see `schema.prisma`):**

```prisma
model PaymentIntent {
  id              String @id @default(cuid())
  userId          String
  contractId      String? @unique
  kind            PaymentIntentKind
  status          PaymentIntentStatus @default(PENDING)
  provider        String @default("MOCK")
  currency        String
  amountCents     Int
  stripeIntentId  String? @unique
  midtransOrderId String? @unique
  idempotencyKey  String? @unique
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PaymentTransaction {
  id            String @id @default(cuid())
  contractId    String?
  type          PaymentTransactionType
  amount        Int
  fee           Int @default(0)
  status        PaymentTransactionStatus @default(PENDING)
  provider      String
  providerTxnId String
  @@index([provider, providerTxnId])
}

model EscrowTransaction {
  id         String @id @default(cuid())
  contractId String
  type       EscrowTransactionType
  amount     Int
  reason     String?
  createdBy  String?
  createdAt  DateTime @default(now())
}

model WebhookEvent {
  id          String @id @default(cuid())
  provider    String
  externalId  String
  eventType   String
  processedAt DateTime @default(now())
  @@unique([provider, externalId])
}
```

Full schema: `packages/database/prisma/schema.prisma` (~42 models).

---

## 6. Worker Tasks

### 6.1 Escrow auto-release (`apps/worker/src/v2Jobs.ts`)

Uses `V2_PRICING.workReviewDays` (5) and `V2_PRICING.partialReleaseRate` (0.8):

```javascript
// Every PROMOTION_SWEEP_INTERVAL_MS (default 6h)
async function processEscrowAutoReleases() {
  // IN_REVIEW past workReviewDeadline → 80% PARTIAL_RELEASE to wallet
  // PARTIAL_RELEASED past review+chargebackHoldDays → release remaining 20%
}
```

### 6.2 Recommendations batch (`processDailyRecommendations`)

Skill-overlap scoring; upserts `Recommendation` rows per freelancer/job pair.

### 6.3 Payout batch (`processBatchPayouts`)

Daily interval; marks `PayoutRequest` as SENT with MOCK receipt id (real transfer v2.2).

### 6.4 Moderation escalation (`moderationEscalationSweep.ts`)

Every 5 min (configurable): escalate overdue moderation reports.

---

## 7. Security Architecture

### 7.1 Authentication

- **JWT (cookie):** `acme_session` HttpOnly, Secure (prod), SameSite=Lax, Max-Age=7d (`apps/web/lib/session.ts`)
- **CSRF:** Double-submit token; all mutations require X-CSRF-Token header
- **Session invalidation:** Logout → revoke cookie
- **Rate limit:** 5 req/min per IP (auth), 100 req/min per user (API)

### 7.2 Payment security

- **Webhook HMAC:** Stripe t.v1; Midtrans SHA512 — both required when keys configured (v2.1)
- **PCI compliance:** No card data stored (PSP handles)
- **Idempotency:** `WebhookEvent` unique on `(provider, externalId)`; `PaymentIntent.idempotencyKey` for checkout retries
- **Chargeback hold:** Flag payments >30 days, manual review (v2.1 roadmap)

### 7.3 Data protection

- **SQL injection:** Prisma ORM (parameterized queries)
- **XSS:** React sanitization + CSP headers (v2.2)
- **CORS:** Allow only `https://nearwork.id`, `https://staging.nearwork.id`
- **Encryption:** Passwords bcrypt (cost 12); sensitive fields at-rest encrypted (e.g., bank account)

### 7.4 Audit & logging

- User actions logged: login, job create, payment, dispute
- Admin actions logged: moderation, suspension, payment release
- Retention: 2 years (compliance)

---

## 8. Deployment Architecture

### 8.1 Web app (Next.js — apps/web)

- **Deploy:** Vercel (or container) — API Route Handlers co-located with App Router
- **Environment:** staging → production branches
- **Database:** PostgreSQL 16 managed; Prisma migrations on deploy
- **Env vars:** `SESSION_SECRET`, Stripe/Midtrans keys, `DATABASE_URL`

### 8.2 Worker (Node.js — apps/worker)

- **Deploy:** Separate long-running process (same repo, `pnpm --filter @acme/worker start`)
- **Scheduler:** `setInterval` sweeps (promotion expiry, moderation SLA, v2 escrow/boost/recommendations, daily payouts)
- **Monitoring:** stdout logs; Sentry optional

### 8.3 CI/CD

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e (Postgres E2E)
      - run: npm run typecheck
      - run: npm run lint

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: deploy to staging environment

  deploy-prod:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: deploy to production
      - run: run migrations
      - run: smoke tests
```

---

## 9. Monitoring & Observability

### 9.1 Application metrics

- **Error rate:** <0.1% 4xx + 5xx
- **Latency:** p95 <500ms
- **Database:** connection pool, query time

### 9.2 Business metrics

- **Contracts per day:** trending
- **Payment success rate:** >95%
- **SLA breach rate:** <5%
- **Fraud detection:** false positive rate <2%

### 9.3 Tools

- **Logging:** Pino (Node.js) or Console logs → cloud provider (free tier)
- **Error tracking:** Sentry (free tier)
- **Uptime:** Pingdom or UptimeRobot (free)
- **Analytics:** Posthog or custom dashboard (optional)

---

## 10. API Rate Limiting

```
- Auth endpoints: 5 req/min per IP
- Read endpoints: 100 req/min per user
- Write endpoints: 30 req/min per user
- Webhook endpoints: 10 req/sec (PSP priority)
```

Exceeded → return `429 Too Many Requests` with `Retry-After` header.

---

## 11. Backup & Disaster Recovery

### 11.1 Database

- **Backup:** Daily snapshots (DigitalOcean or AWS RDS automatic)
- **Retention:** 30 days
- **PITR (Point-in-time Recovery):** 7 days

### 11.2 Recovery procedures

```
Scenario: Database corruption
  1. Alert: automated monitoring detects query errors
  2. Restore: PITR to 1 hour before corruption detected
  3. Validation: E2E smoke tests pass
  4. Communication: status page update

Scenario: Payment reconciliation error
  1. Alert: reconciliation job flags mismatch
  2. Investigation: manual PSP API check
  3. Correction: manual Payment record update (audit log)
  4. Prevention: improve idempotency checks
```

---

## 12. Dependencies & Tech Debt

### Critical for v2.1

- [ ] Stripe webhook HMAC verify
- [ ] Midtrans signature verify
- [ ] Reconciliation logic + manual playbook
- [ ] Chargeback hold procedures (documented)

### Technical debt

- `apps/admin` is stub; needs UX overhaul (v2.2)
- Messaging is polling; migrate to WebSocket (v2.2)
- No mobile app; needed for SE Asia market (v3.0)

---

## 13. Document control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| v1.0 | Jul 26 2026 | Dozer | Initial: architecture, data model, API, payment flow |
| v1.1 | Jul 26 2026 | Dozer | Code-as-truth: Route Handlers, payment models, escrow V2_PRICING, worker Node.js |

---

**Next:** Cross-reference with SRS (feature specs) for acceptance criteria details.
