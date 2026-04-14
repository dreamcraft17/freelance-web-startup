import { db } from "@acme/database";
import { AccountStatus, UserRole } from "@acme/types";
import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

type SearchParams = { role?: string; status?: string; q?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaffSession("users");
  const sp = await searchParams;
  const q = sp.q?.trim();
  const role = Object.values(UserRole).includes(sp.role as UserRole) ? (sp.role as UserRole) : undefined;
  const status = Object.values(AccountStatus).includes(sp.status as AccountStatus)
    ? (sp.status as AccountStatus)
    : undefined;

  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(status ? { accountStatus: status } : {}),
      ...(q ? { email: { contains: q, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 120,
    select: { id: true, email: true, role: true, accountStatus: true, createdAt: true }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Users" description="Inspect account roles, status, and onboarding footprint." />
      <AdminPanel title={`Latest users (${users.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{u.email}</td>
                  <td className="px-2 py-2">{u.role}</td>
                  <td className="px-2 py-2">{u.accountStatus}</td>
                  <td className="px-2 py-2">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}

