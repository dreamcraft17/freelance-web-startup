# Engineering Conventions (Production SaaS)

> **Doc revision:** v1  
> Last synchronized: 2026-04-18 (post-accept handoff update applied across product and docs).

## Update status (April 2026)

- **Dokumentasi:** saat mengubah perilaku produk/keamanan/UI, update file Markdown terkait — lihat `docs/DOCUMENTATION-MAINTENANCE.md`.
- Konvensi layering (handler -> service -> policy -> repository) tetap dipertahankan pada fitur baru.
- Perubahan terbaru berfokus pada UI/workflow tanpa mengubah kontrak backend inti.
- Praktik yang ditegaskan:
  - no decorative UI gimmicks untuk product surfaces,
  - no fake data di empty state/discovery,
  - incremental modular updates dan type-safe verification (`tsc`, lint).

## Naming
- Services use explicit domain names: `FreelancerProfileService`, `SubscriptionService`.
- Policies use capability-oriented methods: `assertCanCreateJob`, `assertParticipantOrAdmin`.
- DTO names are explicit and operation-specific: `CreateJobDto`, `SearchJobsQueryDto`.
- Route handlers are resource-first and versioned: `/api/v1/jobs`, `/api/v1/search/freelancers`.

## Layering
- Route handlers: auth context, input validation, service invocation, response mapping only.
- Services: business orchestration, transaction boundaries, cross-domain coordination.
- Policies: role + ownership + state-based authorization checks.
- Repositories: persistence access and optimized query composition.

## Extensibility
- Enums live in shared `@acme/types` and stay append-only where possible.
- Plan limits and quota status sets live in shared config constants.
- Prisma schema prefers normalized relations for taxonomy and core operations.
- JSON fields are reserved for controlled extensibility (`metadata`, snapshots, event payloads).
