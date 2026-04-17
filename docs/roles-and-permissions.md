# Roles and Permissions

> Last synchronized: 2026-04-15 (post-accept handoff update applied across product and docs).

System roles:
- `ADMIN`
- `CLIENT`
- `FREELANCER`

Future-ready roles:
- `AGENCY_OWNER`
- `AGENCY_MANAGER`
- `AGENCY_MEMBER`
- `SUPPORT_ADMIN`
- `FINANCE_ADMIN`
- `MODERATOR`

Policy examples:
- only `CLIENT` can create jobs
- only `FREELANCER` can submit bids
- only job owner can shortlist/accept bids
- only contract participants can access contract threads
- only admins/moderators process verification requests

## Update status (April 2026)

- Staff role matrix (`ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`) sudah aktif pada workspace `/admin` dengan pembatasan per halaman.
- Auth-aware UI juga sudah membedakan perilaku public/client/freelancer/staff agar aksi utama sesuai role context.
