# Phase 2 - Detailed App Structures

> **Doc revision:** v4  
> Last synchronized: 2026-04-20 (locale-prefixed SEO routes).

> Update (April 2026): struktur ini bersifat historis perencanaan fase. Implementasi aktual saat ini berpusat di `apps/web` dengan route groups App Router seperti `(public)`, `(marketing)`, `(auth)`, `(app)` dan workspace `client/freelancer/admin` yang sudah aktif.
>
> **Chrome publik:** halaman discovery + marketing memakai `MarketingShell` → `MarketingNavBar` (navigasi produk, auth-aware, notifikasi unread dari server).

## apps/web

```txt
apps/web/
  app/
    [locale]/
      page.tsx
      jobs/
      freelancers/
      how-it-works/
      pricing/
      early-access/
      help/
    (public)/
    (auth)/
    (client)/
    (freelancer)/
    api/
      locale/
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
    i18n/
  hooks/
  lib/
    i18n/
  locales/
    en.json
    id.json
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
