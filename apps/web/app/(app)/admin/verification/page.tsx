import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminVerificationPage() {
  await requireStaffSession("verification");
  const requests = await db.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      user: { select: { email: true, role: true } }
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Verification queue" description="Review incoming verification requests and status flow." />
      <AdminPanel title={`Latest requests (${requests.length})`}>
        {requests.length === 0 ? (
          <AdminEmptyState
            title="Verification queue is empty"
            copy="No pending or historical verification requests found."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Request</th>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{r.id.slice(0, 8)}</td>
                  <td className="px-2 py-2">{r.user.email}</td>
                  <td className="px-2 py-2">{r.user.role}</td>
                  <td className="px-2 py-2">{r.type}</td>
                  <td className="px-2 py-2">{r.status}</td>
                  <td className="px-2 py-2">{r.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}

