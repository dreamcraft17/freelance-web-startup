import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminBidsPage() {
  await requireStaffSession("bids");
  const bids = await db.bid.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      status: true,
      bidAmount: true,
      createdAt: true,
      freelancer: { select: { fullName: true, username: true } },
      job: { select: { title: true, currency: true } }
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Bids" description="Inspect incoming bids across jobs for support and operations." />
      <AdminPanel title={`Latest bids (${bids.length})`}>
        {bids.length === 0 ? (
          <AdminEmptyState title="No bids available" copy="No bids have been submitted yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Job</th>
                <th className="px-2 py-2">Freelancer</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((b) => (
                <tr key={b.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{b.job.title}</td>
                  <td className="px-2 py-2">{b.freelancer.fullName || `@${b.freelancer.username}`}</td>
                  <td className="px-2 py-2">{b.status}</td>
                  <td className="px-2 py-2">
                    {Number(b.bidAmount).toLocaleString()} {b.job.currency}
                  </td>
                  <td className="px-2 py-2">{b.createdAt.toLocaleDateString()}</td>
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

