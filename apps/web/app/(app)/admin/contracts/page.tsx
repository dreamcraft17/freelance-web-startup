import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminContractsPage() {
  await requireStaffSession("contracts");
  const contracts = await db.contract.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 120,
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      updatedAt: true,
      freelancerUserId: true,
      clientUserId: true
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Contracts" description="Monitor active and completed contracts across the marketplace." />
      <AdminPanel title={`Latest contracts (${contracts.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Contract</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Client user</th>
                <th className="px-2 py-2">Freelancer user</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{c.id.slice(0, 8)}</td>
                  <td className="px-2 py-2">{c.status}</td>
                  <td className="px-2 py-2">{c.clientUserId.slice(0, 8)}</td>
                  <td className="px-2 py-2">{c.freelancerUserId.slice(0, 8)}</td>
                  <td className="px-2 py-2">
                    {c.amount != null ? `${Number(c.amount).toLocaleString()} ${c.currency ?? ""}` : "—"}
                  </td>
                  <td className="px-2 py-2">{c.updatedAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}

