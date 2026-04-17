# Phase 2 - Detailed App Structures

> Last synchronized: 2026-04-15 (post-accept handoff update applied across product and docs).

> Update (April 2026): struktur ini bersifat historis perencanaan fase. Implementasi aktual saat ini berpusat di `apps/web` dengan route groups App Router seperti `(public)`, `(marketing)`, `(auth)`, `(app)` dan workspace `client/freelancer/admin` yang sudah aktif.

## apps/web

```txt
apps/web/
  app/
    (public)/
    (auth)/
    (client)/
    (freelancer)/
    api/
      v1/
        jobs/
        bids/
        contracts/
        subscriptions/
        quota/
        search/
          freelancers/
          jobs/
        freelancer-profiles/
        client-profiles/
        verification/
        reviews/
  components/
  features/
  hooks/
  lib/
  server/
    services/
    repositories/
    policies/
    errors/
```

## apps/admin

```txt
apps/admin/
  app/
    dashboard/
    users/
    freelancers/
    clients/
    jobs/
    contracts/
    subscriptions/
    verifications/
    disputes/
    reports/
    risk/
    audit-logs/
  features/
    moderation/
    verification/
    subscriptions/
    analytics/
    fraud-risk/
```

## apps/worker

```txt
apps/worker/
  src/
    jobs/
      billing/
      notifications/
      quota/
      ranking/
      search/
      cleanup/
    workers/
    queues/
    services/
```
