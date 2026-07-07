# Billing Architecture

> **Doc revision:** v2  
> Last synchronized: 2026-07-07 (NearWork V2: Stripe/Midtrans escrow, payouts, boosts).

## V2 payment stack

| Layer | Implementation |
|-------|----------------|
| **Contract escrow** | `PaymentIntent` (per contract) + `EscrowTransaction` audit |
| **Stripe** | `POST /api/payments/stripe/create-intent`, webhook `/api/payments/stripe/webhook` |
| **Midtrans** | `POST /api/payments/midtrans/create-snap`, callback `/api/payments/midtrans/notification` |
| **Payouts** | `FreelancerWallet` + `PayoutRequest`; worker batch (`processBatchPayouts`) |
| **Boosts** | `BoostProduct` catalog + `Boost` records; ranking via existing `isFeatured` / `isBoosted` |
| **Subscriptions** | Existing `UserSubscription` + `POST /api/subscriptions/upgrade` |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side PaymentIntent creation |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `MIDTRANS_SERVER_KEY` | Snap token + notification signature |
| `MIDTRANS_IS_PRODUCTION` | `true` for production Midtrans host |

Without PSP keys, flows fall back to **MOCK** checkout (same as V1 early-access).

## Escrow lifecycle

1. Client accepts bid → contract `PAYMENT_PENDING`
2. Payment succeeds → `escrowStatus=LOCKED`, contract `IN_PROGRESS`
3. Freelancer submits work → `IN_REVIEW` (5-day review window)
4. Client approves → 80% released to wallet; 20% holdback
5. Holdback released after chargeback window (worker auto-release)

Disputes: `ContractDispute` + admin mediation via existing staff tools.

## Idempotency

- `WebhookEvent` dedupes Stripe/Midtrans callbacks
- `PaymentIntent.idempotencyKey` optional header on create-intent

## Related docs

- `docs/NEARWORK_V2_PRD.md` — product scope
- `docs/NEARWORK_V2_SRS.md` — API & schema specs
- `docs/NEARWORK_V2_SDD.md` — service architecture

## Legacy notes

- `SubscriptionPlan` defines canonical commercial plan.
- Quota logic and feature flags remain in `@acme/config` (`monetizationFlags`).
- Production PSP hardening (invoice PDF, real bank API) remains incremental on top of V2 foundation.
