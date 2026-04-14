import { db } from "@acme/database";
import { AccountStatus, UserRole } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminUsersFilters } from "@/features/admin/components/users/AdminUsersFilters";
import { AdminUsersTable } from "@/features/admin/components/users/AdminUsersTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { role?: string; status?: string; q?: string };

const PAGE_LIMIT = 120;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("users");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const role = Object.values(UserRole).includes(sp.role as UserRole) ? (sp.role as UserRole) : undefined;
  const status = Object.values(AccountStatus).includes(sp.status as AccountStatus)
    ? (sp.status as AccountStatus)
    : undefined;

  const hasActiveFilters = Boolean(role || status || q);

  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(status ? { accountStatus: status } : {}),
      ...(q ? { email: { contains: q, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: { id: true, email: true, role: true, accountStatus: true, createdAt: true }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Users"
        description="Directory of accounts (email, role, status). Filters apply on this page only; no edits from this view."
        badge="Read-only"
      />

      <AdminUsersFilters role={role} status={status} q={q} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Accounts
            <span className="ml-2 font-normal text-slate-500">({users.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Showing up to {PAGE_LIMIT} rows, newest first. Full user id available on hover for support tickets.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching users" : "No user accounts yet"}
              copy={
                hasActiveFilters
                  ? "Try clearing filters or broadening the email search."
                  : "There are no rows in the users table (excluding soft-deleted). Seed or register accounts to see data here."
              }
            />
          </div>
        ) : (
          <AdminUsersTable users={users} />
        )}
      </section>
    </div>
  );
}
