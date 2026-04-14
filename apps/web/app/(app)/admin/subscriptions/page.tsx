import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminSubscriptionsPage() {
  await requireStaffSession("subscriptions");
  const subscriptions = await db.userSubscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 120,
    select: {
      id: true,
      status: true,
      currentPeriodEnd: true,
      user: { select: { email: true } },
      plan: { select: { name: true, code: true, billingCycle: true } }
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Subscriptions"
        description="Plan adoption and subscription lifecycle monitoring for monetization operations."
      />
      <AdminPanel title={`Recent subscriptions (${subscriptions.length})`}>
        {subscriptions.length === 0 ? (
          <AdminEmptyState title="No subscriptions found" copy="Plan subscription data will appear once billing is active." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Cycle</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Period end</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{s.user.email}</td>
                  <td className="px-2 py-2">
                    {s.plan.name} ({s.plan.code})
                  </td>
                  <td className="px-2 py-2">{s.plan.billingCycle}</td>
                  <td className="px-2 py-2">{s.status}</td>
                  <td className="px-2 py-2">{s.currentPeriodEnd.toLocaleDateString()}</td>
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

