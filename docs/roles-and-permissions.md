# Roles and Permissions

> **Doc revision:** v4
> Last synchronized: 2026-06-19 (moderation SLA, assignment notifications, escalation audit).

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
- **Moderation & trust (May 2026):** `SUPPORT_ADMIN` dapat mengakses `/admin/reports` (sama seperti `MODERATOR`). `ADMIN`/`SUPPORT_ADMIN` dapat **suspend/reactivate** akun marketplace `CLIENT`/`FREELANCER` dari `/admin/users`. `ADMIN`/`MODERATOR`/`SUPPORT_ADMIN` dapat **menyembunyikan/menampilkan** job publik dari discovery (flag `moderationHiddenAt` pada `Job`). Pada intake publik: **laporan BID** hanya boleh dari klien pemilik job atau freelancer pengirim proposal tersebut; **thread/message** dari peserta thread (atau staf untuk kasus escalation internal).
- **Moderation operations (June 2026):** `ADMIN`/`MODERATOR`/`SUPPORT_ADMIN` menerima notifikasi in-app untuk laporan baru dan SLA overdue. Assignment, note, status, resolution, create, dan auto-escalation ditulis ke `AuditLog`; worker melakukan eskalasi level 1 secara idempotent saat deadline lewat.
