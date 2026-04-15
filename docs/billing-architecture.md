# Billing Architecture

- `SubscriptionPlan` defines canonical commercial plan.
- `PlanEntitlement` stores feature and quota keys.
- `UserSubscription` stores lifecycle and plan snapshot at purchase time.
- `BillingEvent` stores immutable provider webhook/event payload for auditability.
- Billing provider integration should be isolated behind `BillingService` and webhook handlers.

## Update status (April 2026)

- Struktur monetization tetap valid, namun NearWork masih berada pada fase early-access (pricing operasional belum fully enforced untuk pembayaran eksternal).
- Quota logic dan feature flags dipakai untuk readiness internal dan kontrol rollout.
- Fokus implementasi terbaru ada pada UX/workflow hiring & discovery; billing provider production hardening masih menjadi backlog prioritas.
