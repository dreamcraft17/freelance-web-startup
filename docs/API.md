# NearWork — API Reference

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Base: `apps/web/app/api` · Auth: cookie `acme_session` · Mutasi: CSRF `X-CSRF-Token`

## Konvensi

| Item | Nilai |
|------|--------|
| Prefix | `/api/*` (canonical) |
| Legacy | `/api/v1/*` — compat/deprecation |
| Session | Cookie HttpOnly JWT |
| CSRF | `GET /api/auth/csrf` lalu header `X-CSRF-Token` (+ cookie) pada POST/PATCH/PUT/DELETE |
| Errors | JSON terstruktur; pool exhaustion → `503` `DB_POOL_EXHAUSTED` |
| Validation | Zod (`@acme/validators`) |

Staff endpoints: role `ADMIN` | `SUPPORT_ADMIN` | `MODERATOR` | `FINANCE_ADMIN` (scoped per route).

---

## Auth & locale

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/api/auth/csrf` | Issue CSRF token |
| POST | `/api/auth/register` | Register CLIENT/FREELANCER |
| POST | `/api/auth/login` | Login → set session cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/session` | Current session |
| POST | `/api/locale` | Set cookie `lang` (`en`\|`id`) |

---

## Marketplace core

| Method | Path | Keterangan |
|--------|------|------------|
| GET, POST | `/api/jobs` | List / create |
| GET, PATCH | `/api/jobs/[jobId]` | Detail / update |
| POST | `/api/bids` | Submit proposal |
| POST | `/api/bids/[bidId]/accept` | Accept → contract |
| POST | `/api/bids/[bidId]/shortlist` | Shortlist |
| GET | `/api/contracts/[contractId]` | Contract detail |
| POST | `/api/contracts/[contractId]/complete` | Complete |
| GET, POST, PATCH | `/api/escrow/[contractId]` | Escrow lifecycle V2 |

---

## Messaging & notifications

| Method | Path | Keterangan |
|--------|------|------------|
| GET, POST | `/api/messages` | Threads / create |
| GET, POST | `/api/messages/[threadId]` | Messages in thread |
| GET | `/api/notifications` | List (locale-aware) |
| PATCH | `/api/notifications/[notificationId]` | Mark read |

---

## Profiles, taxonomy, search

| Method | Path | Keterangan |
|--------|------|------------|
| GET, POST, PATCH | `/api/freelancer-profiles` | Freelancer profiles |
| GET | `/api/freelancer-profiles/me` | Current freelancer |
| GET, POST | `/api/client-profiles` | Client profiles |
| GET | `/api/categories` | Categories |
| GET | `/api/categories/[slug]` | Category by slug |
| GET | `/api/skills` | Skills |
| GET | `/api/skills/[skillId]` | Skill detail |
| GET | `/api/search/jobs` | Public job search |
| GET | `/api/search/freelancers` | Public freelancer search |

Discovery endpoints memakai rate limit + anti-scrape ringan.

---

## Social / engagement

| Method | Path | Keterangan |
|--------|------|------------|
| GET, POST | `/api/reviews` | Reviews |
| GET, POST, DELETE | `/api/saved-items/jobs` | Saved jobs |
| GET, POST, DELETE | `/api/saved-items/freelancers` | Saved freelancers |
| GET | `/api/recommendations` | AI/batch recommendations |
| GET | `/api/quota/me` | Current plan quota |

---

## Monetization

| Method | Path | Keterangan |
|--------|------|------------|
| GET, POST | `/api/subscriptions` | Plans / subscribe |
| GET, POST | `/api/subscriptions/upgrade` | Upgrade flow |
| POST | `/api/donations` | Donation (MOCK-heavy) |
| GET, POST | `/api/boosts` | Boost catalog / activate |
| GET, POST, PUT | `/api/payouts/wallet` | Wallet + bank account |
| POST | `/api/payments/stripe/create-intent` | Stripe PI |
| POST | `/api/payments/stripe/webhook` | Stripe webhook |
| POST | `/api/payments/midtrans/create-snap` | Midtrans Snap |
| POST | `/api/payments/midtrans/notification` | Midtrans callback |

Tanpa PSP keys → MOCK. **Webhook verification masih perlu harden** sebelum production — [SECURITY.md](./SECURITY.md).

---

## Trust & verification

| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/api/reports` | User report intake |
| GET, POST | `/api/verification` | Verification requests |
| GET, PATCH | `/api/verification/[requestId]` | Staff process |
| GET, POST | `/api/moderation/appeals` | Suspension appeals |
| PATCH | `/api/moderation/appeals/[appealId]` | Staff decide |

---

## Admin

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/api/admin/analytics/overview` | Analytics overview |
| GET | `/api/admin/reports` | Moderation queue |
| PATCH | `/api/admin/reports/[reportId]` | Assign / resolve |
| PATCH | `/api/admin/jobs/[jobId]/moderation` | Hide/show job |
| PATCH | `/api/admin/users/[userId]/moderation` | Suspend/reactivate |

---

## Catatan integrasi

- Semua fetch browser yang butuh sesi: `credentials: "include"`.
- E2E harness: `scripts/e2e-marketplace-flow.mjs` (csrf → register → job → bid → messages → report).
- Idempotency: `WebhookEvent` + optional `PaymentIntent.idempotencyKey`.
