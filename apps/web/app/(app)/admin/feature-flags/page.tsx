import { monetizationFlags, shouldBypassQuotaEnforcement } from "@acme/config";
import { AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminFeatureFlagsTable } from "@/features/admin/components/feature-flags/AdminFeatureFlagsTable";
import { MONETIZATION_FLAG_DEFS } from "@/features/admin/lib/monetization-flag-defs";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminFeatureFlagsPage() {
  await requireAdminAccess("feature-flags");

  const quotaBypass = shouldBypassQuotaEnforcement(monetizationFlags);

  const rows = MONETIZATION_FLAG_DEFS.map((def) => ({
    ...def,
    value: monetizationFlags[def.property],
    envRaw: process.env[def.envKey]
  }));

  return (
    <div className="space-y-6">
      <AdminPageIntro
        title="Feature flags"
        description="Resolved monetization toggles from @acme/config (environment-driven). Read-only; change values via deployment env vars and redeploy."
        badge="Read-only"
      />

      <section className="rounded-lg border border-slate-200 border-dashed bg-[#f8f9fb] px-3.5 py-3 text-xs leading-relaxed text-slate-600">
        <p className="font-semibold text-slate-800">Ops snapshot</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <span className="font-medium text-slate-700">Quota bypass (early access):</span>{" "}
            <code className="rounded bg-white px-1 font-mono text-[11px]">{quotaBypass ? "true" : "false"}</code> — when{" "}
            <code className="font-mono">allowFreeUnlimitedAccess</code> is on and paid master is off, plan caps are not
            enforced.
          </li>
          <li>
            Values below are booleans resolved at runtime (defaults apply when env is unset—see &quot;Env override&quot;
            column).
          </li>
        </ul>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Monetization flags</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Same keys as <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">packages/config/monetization.ts</code>
            . Use this page to verify staging/production before internal testing or launch checkpoints.
          </p>
        </div>
        <AdminFeatureFlagsTable rows={rows} />
      </section>
    </div>
  );
}
