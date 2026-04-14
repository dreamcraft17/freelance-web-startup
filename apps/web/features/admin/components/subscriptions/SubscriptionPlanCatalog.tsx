export type PlanRow = {
  id: string;
  code: string;
  name: string;
  billingCycle: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
  entitlements: unknown;
};

function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
}

function entitlementsPreview(raw: unknown): string {
  if (raw == null) return "—";
  try {
    const s = JSON.stringify(raw);
    return s.length > 160 ? `${s.slice(0, 157)}…` : s;
  } catch {
    return "—";
  }
}

/**
 * Published plan definitions (catalog). Shown even when subscriber count is low—helps finance/product align on structure.
 */
export function SubscriptionPlanCatalog({ plans }: { plans: PlanRow[] }) {
  if (plans.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-3.5 py-6 text-center">
        <p className="text-sm font-semibold text-slate-800">No subscription plans in database</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
          Seed <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px]">SubscriptionPlan</code> rows to define
          catalog pricing and entitlements. Until then, subscriber records may be empty or test-only.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-sm font-semibold text-slate-900">Plan catalog</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Source of truth for codes, billing cycles, and entitlements JSON. Active flag controls whether new purchases can
          target the plan (product rules may also apply).
        </p>
      </div>
      <div className="grid gap-3 p-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/80 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{p.code}</p>
              </div>
              <span
                className={
                  p.isActive
                    ? "shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-900"
                    : "shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700"
                }
              >
                {p.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">{formatPrice(p.priceCents, p.currency)}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{p.billingCycle}</p>
            <div className="mt-3 border-t border-slate-200/80 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Entitlements (JSON)</p>
              <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all rounded border border-slate-200 bg-white p-2 font-mono text-[10px] leading-snug text-slate-700">
                {entitlementsPreview(p.entitlements)}
              </pre>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
