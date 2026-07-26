# NextWork — Payment Runbook (v2.1)

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Spec: [prd/NEXTWORK_PRD_V3.md](./prd/NEXTWORK_PRD_V3.md) §13 · [prd/NEXTWORK_SDD_V1.md](./prd/NEXTWORK_SDD_V1.md) §4.2

Checklist operasional sebelum menerima uang nyata (LIVE PSP). Tanpa langkah ini, biarkan MOCK.

## Architecture note

Payments live in **Next.js Route Handlers** (`apps/web/app/api/payments/*`), not a separate NestJS service. Worker (`apps/worker`) handles escrow auto-release / payouts.

## Environment

| Variable | Required for LIVE | Notes |
|----------|-------------------|--------|
| `STRIPE_SECRET_KEY` | Stripe | Create PaymentIntent |
| `STRIPE_WEBHOOK_SECRET` | Stripe | HMAC verify (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe UI | `confirmPayment` in checkout |
| `MIDTRANS_SERVER_KEY` | Midtrans | Snap + SHA512 notification |
| `MIDTRANS_CLIENT_KEY` / `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans UI | Snap.js |
| `MIDTRANS_IS_PRODUCTION` | Midtrans | `true` for prod host |
| `NEXT_PUBLIC_APP_URL` | Yes | Checkout / redirects; **required at prod boot** |
| `DATABASE_URL` | Yes | Shared with worker |
| `FEATURE_ESCROW_MANUAL_REVIEW_THRESHOLD_IDR` | Optional | Default 5_000_000 — high escrow manual review |

Without PSP keys: create-intent / create-snap fall back to **MOCK** checkout at `/checkout/mock`.

## Webhook endpoints

| PSP | URL | Signature |
|-----|-----|-----------|
| Stripe | `POST /api/payments/stripe/webhook` | Header `Stripe-Signature` → HMAC-SHA256(`t.payload`, secret) |
| Midtrans | `POST /api/payments/midtrans/notification` | Body `signature_key` = SHA512(`order_id + status_code + gross_amount + serverKey`) |

Idempotency: `WebhookEvent` unique on `(provider, externalId)`.

## Register webhooks (staging first)

1. Deploy staging with secrets set.
2. **Stripe Dashboard** → Developers → Webhooks → add endpoint → events `payment_intent.succeeded`, `payment_intent.payment_failed` → copy signing secret to `STRIPE_WEBHOOK_SECRET`.
3. **Midtrans** → Settings → Configuration → Payment Notification URL → `https://<host>/api/payments/midtrans/notification`.
4. Confirm worker process is running (escrow holdback / auto-release).

## Negative tests (must pass)

```bash
# Stripe: missing / bad signature → 400
curl -sS -X POST "$BASE/api/payments/stripe/webhook" \
  -H 'Content-Type: application/json' \
  -H 'Stripe-Signature: t=1,v1=deadbeef' \
  -d '{"id":"evt_fake","type":"payment_intent.succeeded","data":{"object":{"id":"pi_x"}}}'

# Midtrans: missing signature_key → 400 (when MIDTRANS_SERVER_KEY set)
curl -sS -X POST "$BASE/api/payments/midtrans/notification" \
  -H 'Content-Type: application/json' \
  -d '{"order_id":"x","transaction_status":"settlement","status_code":"200","gross_amount":"10000.00","transaction_id":"txn_x"}'
```

Unit tests (no network):

```bash
pnpm exec vitest run apps/web/server/security/payment-webhook-crypto.unit.test.ts
```

## Positive path (staging)

1. Client accepts bid → contract `PAYMENT_PENDING`.
2. `POST /api/payments/stripe/create-intent` or Midtrans create-snap (CSRF + session).
3. Complete payment in PSP test mode.
4. Webhook arrives → `PaymentIntent` SUCCEEDED, escrow `LOCKED`, contract `IN_PROGRESS`.
5. Freelancer submit work → client approve → partial release to wallet (see billing-architecture).

## Sign-off (PRD v2.1)

- [ ] Stripe HMAC verified + negative tests pass
- [ ] Midtrans signature required + negative tests pass
- [ ] Reconciliation spot-check: PSP dashboard vs `PaymentTransaction` / `WebhookEvent`
- [ ] Ops trained on this runbook
- [ ] 3 pilot transactions end-to-end on staging
- [ ] Paid feature flags reviewed before flipping LIVE
- [ ] ToS / support dispute playbook updated (legal/ops)

## Rollback

Unset PSP keys (or remove webhook endpoints) → flows return to MOCK. Existing locked escrow rows remain; do not delete production payment rows without finance review.
