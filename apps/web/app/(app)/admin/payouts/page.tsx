import { PayoutAdminService } from "@/server/services/admin-finance.service";
import { AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminPayoutsClient } from "@/features/admin/components/finance/AdminPayoutsClient";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminPayoutsPage() {
  await requireAdminAccess("payouts");
  const service = new PayoutAdminService();
  const payouts = await service.listPendingPayouts();

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Payout approvals"
        description="Approve pending freelancer payout requests. Approved payouts move to PROCESSING and are sent by the worker batch job."
      />
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5">
        <AdminPayoutsClient initialPayouts={JSON.parse(JSON.stringify(payouts))} />
      </section>
    </div>
  );
}
