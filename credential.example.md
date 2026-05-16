# Internal Dev Credentials Example

> **Doc revision:** v1  
> Last synchronized: 2026-04-27 (placeholder-only credential template).

> This file is safe to commit because it contains placeholders only.

## Seed Template

- `SEED_ADMIN_EMAIL=<your-local-admin-email>`
- `SEED_ADMIN_PASSWORD=<your-local-admin-password>`

## E2E fixture accounts (manual QA + `pnpm test:e2e`)

Set in root `.env` / `.env.local`, then `pnpm db:seed`:

- `SEED_E2E_CLIENT_EMAIL=e2e.client@nearwork.local`
- `SEED_E2E_FREELANCER_EMAIL=e2e.freelancer@nearwork.local`
- `SEED_E2E_PASSWORD=NearWorkE2eDev123!`
- `SEED_E2E_FREELANCER_USERNAME=e2e_freelancer` (optional)

After `pnpm test:e2e`, open **`e2e-test-accounts.local.md`** at repo root for emails, passwords, job links, and message thread IDs.

## Notes

- Keep real values in local `.env` only.
- Do not commit production secrets, API keys, or real passwords.
