import { SuspensionAppealService } from "@/server/services/v2-commerce.service";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";
import { Card } from "@/components/ui/card";
import { AdminAppealsClient } from "@/features/admin/components/appeals/AdminAppealsClient";

export default async function AdminAppealsPage() {
  await requireAdminAccess("appeals");
  const service = new SuspensionAppealService();
  const appeals = await service.listAppealsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="nw-type-page-title text-slate-900">Suspension appeals</h1>
        <p className="nw-type-body mt-1 text-slate-600">Review freelancer appeals (NearWork V2 trust & safety).</p>
      </div>
      <Card className="nw-card p-4">
        <AdminAppealsClient initialAppeals={JSON.parse(JSON.stringify(appeals))} />
      </Card>
    </div>
  );
}
