# Full monorepo directory tree (SaaS freelance marketplace)

Target layout: TypeScript-first, API and domain layers first. UI packages and app pages are omitted or stubbed until a dedicated UI phase.

> Update (April 2026): konteks di atas bersifat rencana awal. UI phase kini sudah aktif dan luas di `apps/web` (public discovery, auth, client/freelancer dashboards, admin workspace).

```txt
.
├── apps/
│   ├── web/                          # Public marketplace API + future SSR (no UI phase yet)
│   │   ├── app/
│   │   │   └── api/
│   │   │       └── v1/               # Versioned route handlers
│   │   ├── server/
│   │   │   ├── errors/
│   │   │   ├── http/
│   │   │   ├── policies/
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── next.config.ts            # Next.js config (API-first)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── admin/                        # Internal ops API + future admin UI
│   │   ├── app/
│   │   │   └── api/
│   │   │       └── v1/
│   │   ├── server/
│   │   │   ├── policies/
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── worker/                       # Background jobs (queues, cron, webhooks)
│       ├── src/
│       │   ├── jobs/
│       │   │   ├── billing/
│       │   │   ├── notifications/
│       │   │   ├── quota/
│       │   │   ├── search/
│       │   │   └── cleanup/
│       │   ├── queues/
│       │   └── main.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma schema, migrations, DB client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                        # Shared enums, domain types, API contracts
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                        # Pure helpers (dates, ids, pagination, errors)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/                   # Zod schemas + inferred DTOs
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                       # Env-safe config, plan limits, feature flags source
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── emails/                       # (Future) transactional email templates & mappers
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── sdk/                          # (Future) typed internal/partner API client
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ui/                           # (Future) shared design system — not generated in UI-off phase
│       ├── src/
│       └── package.json
│
├── docs/                             # Product & engineering docs
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

Notes:

- **Business logic** stays in `server/services` and `server/policies`; route handlers stay thin.
- **Persistence** is isolated in `packages/database` and app `repositories`.
- **Shared contracts** flow: `@acme/types` → `@acme/validators` → apps.
