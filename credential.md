# Internal Dev Credentials

> **Doc revision:** v2  
> Last synchronized: 2026-04-27 (sanitized: no concrete credential values stored in-repo).

> Repo policy: `credential.md` is listed in root `.gitignore` for local copies — **do not commit production secrets** here. Rotate any credential that was ever exposed in git history.

## Seeded Admin Account (Development Template)

- Email: `<set via SEED_ADMIN_EMAIL>`
- Password: `<set via SEED_ADMIN_PASSWORD>`
- Role: `ADMIN` (template only)

## Notes

- Source: `packages/database/prisma/seed.ts` env overrides (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).
- Use for local/internal development only.
- Never store real tokens/passwords in this file.
- Set real values through local `.env` and rotate any credential exposed outside local machines.
