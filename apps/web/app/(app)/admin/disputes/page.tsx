import { DisputeAdminService } from "@/server/services/admin-finance.service";
import { AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminDisputesClient } from "@/features/admin/components/finance/AdminDisputesClient";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminDisputesPage() {
  await requireAdminAccess("disputes");
  const service = new DisputeAdminService();
  const disputes = await service.listOpenDisputes();

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Contract disputes"
        description="Resolve open escrow disputes. Favor client issues a refund; favor freelancer releases locked funds; split divides 50/50."
      />
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5">
        <AdminDisputesClient initialDisputes={JSON.parse(JSON.stringify(disputes))} />
      </section>
    </div>
  );
}
