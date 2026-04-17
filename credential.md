# Internal Dev Credentials

> Last synchronized: 2026-04-15 (post-accept handoff update applied across product and docs).

## Seeded Admin Account (Development)

- Email: `admin@nearwork.local`
- Password: `NearWorkAdminDev123!`
- Role: `ADMIN`

## Notes

- Source: `packages/database/prisma/seed.ts` defaults (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).
- Use for local/internal development only.
- Change these values via env variables before seeding shared environments.
- Keep this file out of public/shared deployments and rotate credentials for any non-local environment.
