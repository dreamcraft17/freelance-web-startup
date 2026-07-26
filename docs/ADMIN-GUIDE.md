# NearWork — Admin Guide

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> RBAC detail: [roles-and-permissions.md](./roles-and-permissions.md)

Workspace staff hidup di **`/admin`** di dalam `apps/web` (bukan app `apps/admin` stub).

---

## Akses

| Role | Akses tipikal |
|------|----------------|
| `ADMIN` | Penuh |
| `SUPPORT_ADMIN` | Users (suspend), reports, banyak read ops |
| `MODERATOR` | Reports, verification, hide jobs |
| `FINANCE_ADMIN` | Donations / subscriptions read surfaces (scoped) |

Login dengan akun staff → redirect default `/admin`. Non-staff yang membuka `/admin` ditolak / diarahkan.

---

## Halaman utama

| Path | Fungsi |
|------|--------|
| `/admin` | Overview metrik nyata + aktivitas |
| `/admin/users` | Users; suspend/reactivate (ADMIN/SUPPORT) |
| `/admin/jobs` | Jobs; moderasi hide/show |
| `/admin/bids` | Bids |
| `/admin/contracts` | Contracts |
| `/admin/verification` | Approve/reject verifikasi |
| `/admin/reviews` | Reviews |
| `/admin/reports` | Antrean moderasi (SLA, assign, notes) |
| `/admin/appeals` | Suspension appeals |
| `/admin/analytics` | Analytics overview |
| `/admin/donations` | Donations |
| `/admin/subscriptions` | Subscriptions |
| `/admin/feature-flags` | Flags (read-only) |
| `/admin/settings` | Settings admin |

---

## Moderasi (workflow)

1. User kirim laporan → muncul di `/admin/reports`.
2. Filter priority / attention / deadline.
3. Assign ke diri sendiri → catat note internal → resolve atau dismiss.
4. Bila perlu: sembunyikan job dari discovery, atau suspend akun.
5. Tiket overdue dieskalasi otomatis oleh **worker** (pastikan worker jalan).
6. Audit trail ditulis ke `AuditLog`.

---

## Verifikasi & appeals

- Verification: proses request di `/admin/verification` (approve/reject via API).
- Appeals: user suspended submit appeal → review di `/admin/appeals`.

---

## Ops checklist staff

- [ ] Worker process aktif (escalation 5m default)
- [ ] Jangan seed password default ke staging publik / production
- [ ] Review laporan OPEN setiap shift
- [ ] Feature flags: ubah via env/`@acme/config`, bukan mengira UI flags bisa write

---

## Batasan saat ini

- Banyak halaman admin **read-first** (sengaja).
- Feature flags page read-only.
- Alert outbound email/Slack untuk SLA belum ada — andalkan in-app + worker escalate.
- PSP/finance mutasi produksi masih Conditional.
