import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminDonationsPage() {
  await requireStaffSession("donations");
  const donations = await db.donation.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      amount: true,
      currency: true,
      provider: true,
      message: true,
      createdAt: true,
      user: { select: { email: true } }
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Donations" description="Finance visibility for support donations and records." />
      <AdminPanel title={`Recent donations (${donations.length})`}>
        {donations.length === 0 ? (
          <AdminEmptyState title="No donations yet" copy="Donation records will appear once support payments are received." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Donor</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Provider</th>
                <th className="px-2 py-2">Message</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{d.user?.email ?? "Anonymous"}</td>
                  <td className="px-2 py-2">
                    {Number(d.amount).toLocaleString()} {d.currency}
                  </td>
                  <td className="px-2 py-2">{d.provider}</td>
                  <td className="px-2 py-2">{d.message ?? "—"}</td>
                  <td className="px-2 py-2">{d.createdAt.toLocaleDateString()}</td>
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

