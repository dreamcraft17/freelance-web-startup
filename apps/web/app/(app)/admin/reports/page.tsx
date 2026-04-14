import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminReportsPage() {
  await requireStaffSession("reports");

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Reports"
        description="Moderation reports queue scaffold. Ready for abuse/report pipeline integration."
      />
      <AdminPanel title="Queue status">
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Reports moderation is not fully wired yet. This page is prepared for:
          incoming abuse reports, triage status, and resolution workflow.
        </div>
      </AdminPanel>
    </div>
  );
}

