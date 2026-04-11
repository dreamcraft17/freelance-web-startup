# Billing Architecture

- `SubscriptionPlan` defines canonical commercial plan.
- `PlanEntitlement` stores feature and quota keys.
- `UserSubscription` stores lifecycle and plan snapshot at purchase time.
- `BillingEvent` stores immutable provider webhook/event payload for auditability.
- Billing provider integration should be isolated behind `BillingService` and webhook handlers.
