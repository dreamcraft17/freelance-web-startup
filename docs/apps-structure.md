# Phase 2 - Detailed App Structures

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
