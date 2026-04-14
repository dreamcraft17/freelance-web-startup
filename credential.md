# Internal Dev Credentials

## Seeded Admin Account (Development)

- Email: `admin@nearwork.local`
- Password: `NearWorkAdminDev123!`
- Role: `ADMIN`

## Notes

- Source: `packages/database/prisma/seed.ts` defaults (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).
- Use for local/internal development only.
- Change these values via env variables before seeding shared environments.
