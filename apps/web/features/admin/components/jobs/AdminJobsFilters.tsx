import { JobStatus, JobVisibility } from "@acme/types";

const STATUS_OPTIONS = Object.values(JobStatus).sort((a, b) => a.localeCompare(b));
const VIS_OPTIONS = Object.values(JobVisibility).sort((a, b) => a.localeCompare(b));

type AdminJobsFiltersProps = {
  status?: JobStatus;
  visibility?: JobVisibility;
  q?: string;
};

/** GET form — no client JS required. */
export function AdminJobsFilters({ status, visibility, q }: AdminJobsFiltersProps) {
  return (
    <form
      method="get"
      action="/admin/jobs"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visibility</span>
        <select
          name="visibility"
          defaultValue={visibility ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          <option value="">All</option>
          {VIS_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[12rem] flex-[1.2] flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Title contains</span>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search job title…"
          autoComplete="off"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        />
      </label>

      <div className="flex flex-wrap gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
        <a
          href="/admin/jobs"
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
