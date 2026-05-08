# Roles and Permissions

> **Doc revision:** v2  
> Last synchronized: 2026-05-08 (moderation reports queue + staff job hide + support user suspend matrix).

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
- **Moderation & trust (May 2026):** `SUPPORT_ADMIN` dapat mengakses `/admin/reports` (sama seperti `MODERATOR`). `ADMIN`/`SUPPORT_ADMIN` dapat **suspend/reactivate** akun marketplace `CLIENT`/`FREELANCER` dari `/admin/users`. `ADMIN`/`MODERATOR`/`SUPPORT_ADMIN` dapat **menyembunyikan/menampilkan** job publik dari discovery (flag `moderationHiddenAt` pada `Job`).
