import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminSettingsPage() {
  await requireStaffSession("settings");

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Admin settings"
        description="Internal workspace settings and policy controls placeholder."
      />
      <AdminPanel title="Environment and policy">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Access policy</p>
            <p className="mt-1">Staff access is role-scoped across admin sections for support, moderation, and finance.</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Audit readiness</p>
            <p className="mt-1">Use this page as a home for internal ops toggles, escalation contacts, and runbooks.</p>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}

