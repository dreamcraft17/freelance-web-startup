import Link from "next/link";
import type { Route } from "next";
import type { AdminReportsQueryDto } from "@acme/validators";

type Props = {
  query: AdminReportsQueryDto;
  total: number;
};

/** GET form filters — keeps operational triage URLs shareable across staff. */
export function AdminReportsFilterBar({ query, total }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  function hrefFor(next: Partial<AdminReportsQueryDto>): Route {
    const q = new URLSearchParams();
    const merged = { ...query, ...next };
    q.set("page", String(merged.page));
    q.set("limit", String(merged.limit));
    if (merged.status) q.set("status", merged.status);
    if (merged.subjectType) q.set("subjectType", merged.subjectType);
    if (merged.assignedToStaffUserId) q.set("assigned", merged.assignedToStaffUserId);
    if (merged.q) q.set("q", merged.q);
    const s = q.toString();
    return (s ? `/admin/reports?${s}` : "/admin/reports") as Route;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
      <form className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end" method="GET" action="/admin/reports">
        <label className="flex min-w-[8rem] flex-col gap-0.5 text-[11px] font-semibold text-slate-600">
          Status
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
          >
            <option value="">Any</option>
            {(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"] as const).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[8rem] flex-col gap-0.5 text-[11px] font-semibold text-slate-600">
          Subject
          <select
            name="subjectType"
            defaultValue={query.subjectType ?? ""}
            className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
          >
            <option value="">Any</option>
            {(
              ["USER", "JOB", "BID", "REVIEW", "MESSAGE_THREAD", "MESSAGE"] as const
            ).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[9rem] flex-col gap-0.5 text-[11px] font-semibold text-slate-600">
          Assigned
          <select
            name="assigned"
            defaultValue={query.assignedToStaffUserId ?? ""}
            className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
          >
            <option value="">Anyone</option>
            <option value="__unassigned">Unassigned</option>
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-0.5 text-[11px] font-semibold text-slate-600">
          Contains
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="ID, category, description…"
            className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
          />
        </label>
        <label className="flex w-20 flex-col gap-0.5 text-[11px] font-semibold text-slate-600">
          Page size
          <select
            name="limit"
            defaultValue={String(query.limit)}
            className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
          >
            {[20, 40, 60].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="page" value="1" />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Apply
        </button>
      </form>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
        <span>
          {total} total · page {query.page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            aria-disabled={query.page <= 1}
            href={hrefFor({ page: Math.max(1, query.page - 1) })}
            className={query.page <= 1 ? "pointer-events-none text-slate-300" : "font-semibold text-[#433C93]"}
          >
            Prev
          </Link>
          <Link
            aria-disabled={query.page >= totalPages}
            href={hrefFor({ page: Math.min(totalPages, query.page + 1) })}
            className={query.page >= totalPages ? "pointer-events-none text-slate-300" : "font-semibold text-[#433C93]"}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
