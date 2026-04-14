import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

const flags = [
  { key: "nearby-browser-geolocation", status: "enabled", note: "Public nearby talent UX active" },
  { key: "freelancer-boost", status: "enabled", note: "Ranking boost respected in search sorting" },
  { key: "admin-reports-queue", status: "planned", note: "Reports workflow scaffolded, pending backend integration" },
  { key: "payments-live-provider", status: "planned", note: "Currently using mock provider flow" }
];

export default async function AdminFeatureFlagsPage() {
  await requireStaffSession("feature-flags");

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Feature flags" description="Internal feature visibility for rollout and operational checks." />
      <AdminPanel title="Current flags (read-only)">
        <div className="space-y-2">
          {flags.map((flag) => (
            <article key={flag.key} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-slate-800">{flag.key}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-700">
                  {flag.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{flag.note}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

