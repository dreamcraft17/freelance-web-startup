import { SubscriptionStatus } from "@acme/types";

const STATUS_OPTIONS = Object.values(SubscriptionStatus).sort((a, b) => a.localeCompare(b));

type PlanOption = { code: string; name: string };

type Props = {
  status?: SubscriptionStatus;
  planCode?: string;
  plans: PlanOption[];
};

export function UserSubscriptionsFilters({ status, planCode, plans }: Props) {
  return (
    <form
      method="get"
      action="/admin/subscriptions"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[12rem] flex-[1.1] flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plan</span>
        <select
          name="plan"
          defaultValue={planCode ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All plans</option>
          {plans.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
        <a
          href="/admin/subscriptions"
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
