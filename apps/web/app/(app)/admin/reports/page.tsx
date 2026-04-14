import { AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminReportsHub } from "@/features/admin/components/reports/AdminReportsHub";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminReportsPage() {
  await requireAdminAccess("reports");

  return (
    <div className="space-y-6">
      <AdminPageIntro
        title="Reports & moderation"
        description="Central place for trust, safety, and content moderation when your reporting pipeline is live. Structured for triage and audit—not product analytics."
        badge="Trust & safety"
      />
      <AdminReportsHub />
    </div>
  );
}
