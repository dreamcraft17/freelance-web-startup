import Link from "next/link";
import type { Route } from "next";
import { JobStatus } from "@acme/types";
import { cn } from "@/lib/utils";
import { Briefcase, Plus } from "lucide-react";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";

export type ClientJobListRow = {
  submitted: number;
  shortlisted: number;
  accepted: number;
  latestBidAt: Date | null;
  id: string;
  title: string;
  status: string;
  workMode: string;
  categoryName: string | null;
  subcategoryName: string | null;
  city: string | null;
  bidCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_ORDER = [
  JobStatus.DRAFT,
  JobStatus.OPEN,
  JobStatus.IN_REVIEW,
  JobStatus.PAUSED,
  JobStatus.CLOSED,
  JobStatus.CANCELLED,
  JobStatus.ARCHIVED
] as const;

const FILTER_ALL = "all" as const;

type StatusFilter = typeof FILTER_ALL | JobStatus;

function parseStatusFilter(raw: string | undefined): StatusFilter {
  if (!raw || raw === FILTER_ALL) return FILTER_ALL;
  if ((Object.values(JobStatus) as string[]).includes(raw)) return raw as JobStatus;
  return FILTER_ALL;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case JobStatus.OPEN:
      return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
    case JobStatus.DRAFT:
      return "bg-slate-100 text-slate-700 ring-slate-200/90";
    case JobStatus.IN_REVIEW:
      return "bg-sky-50 text-sky-800 ring-sky-200/80";
    case JobStatus.PAUSED:
      return "bg-amber-50 text-amber-900 ring-amber-200/80";
    case JobStatus.CLOSED:
      return "bg-slate-100 text-slate-600 ring-slate-200/80";
    case JobStatus.CANCELLED:
      return "bg-rose-50 text-rose-800 ring-rose-200/70";
    case JobStatus.ARCHIVED:
      return "bg-violet-50 text-violet-800 ring-violet-200/70";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200/80";
  }
}

function humanizeStatus(s: string): string {
  return s.replace(/_/g, " ").toLowerCase();
}

function humanizeWorkMode(s: string): string {
  return s.replace(/_/g, " ");
}

function formatCreated(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(d);
}

function formatRelativeDays(d: Date): string {
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function isNeedsAttention(job: ClientJobListRow): boolean {
  return job.status === JobStatus.OPEN && (job.submitted > 0 || job.shortlisted > 0);
}

function isStale(job: ClientJobListRow): boolean {
  const days = Math.floor((Date.now() - job.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 14 && job.status === JobStatus.OPEN;
}

function filterHref(status: StatusFilter): Route {
  if (status === FILTER_ALL) return "/client/jobs" as Route;
  const q = new URLSearchParams({ status });
  return `/client/jobs?${q.toString()}` as Route;
}

type ClientJobsManagerProps = {
  jobs: ClientJobListRow[];
  statusParam: string | undefined;
  hasProfile: boolean;
};

export function ClientJobsManager({ jobs, statusParam, hasProfile }: ClientJobsManagerProps) {
  const activeFilter = parseStatusFilter(statusParam);
  const displayJobs = [...jobs].sort((a, b) => {
    const aAttention = isNeedsAttention(a) ? 0 : 1;
    const bAttention = isNeedsAttention(b) ? 0 : 1;
    if (aAttention !== bAttention) return aAttention - bAttention;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  const attentionCount = jobs.filter(isNeedsAttention).length;
  const newBidCount = jobs.filter((j) => j.latestBidAt && Date.now() - j.latestBidAt.getTime() <= 1000 * 60 * 60 * 48).length;
  const staleCount = jobs.filter(isStale).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <header className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">NearWork · Client</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">My jobs</h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">
            Manage listings, track proposals, and open roles when you are ready for freelancers.
          </p>
        </div>
        <Link
          href={"/client/jobs/new" as Route}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#433C93] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4d45a5] sm:px-6"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          Post a new job
        </Link>
      </header>

      {!hasProfile ? (
        <DashboardEmptyState
          tone="elevated"
          kicker="Profile"
          icon={Briefcase}
          title="Set up your client profile first"
          description="Once your workspace is configured, your jobs appear here with status, bids, and dates—ready to manage from one list."
          action={{ label: "Complete setup", href: "/settings" }}
          secondaryAction={{ label: "Back to overview", href: "/client" }}
        />
      ) : jobs.length === 0 && activeFilter === FILTER_ALL ? (
        <DashboardEmptyState
          tone="elevated"
          kicker="Jobs"
          icon={Briefcase}
          title="No jobs posted yet"
          description="Publish your first role to start receiving proposals. You can refine budget, work mode, and deadlines before you go live."
          action={{ label: "Post your first job", href: "/client/jobs/new" }}
          secondaryAction={{ label: "Browse freelancers", href: "/freelancers" }}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryTile label="Needs attention" value={attentionCount} hint="Open jobs with pending decisions" />
            <SummaryTile label="New bid activity" value={newBidCount} hint="Jobs with bids in last 48h" />
            <SummaryTile label="Stale open jobs" value={staleCount} hint="Open jobs with no updates in 14+ days" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-700">Filter by status</p>
            <nav className="flex flex-wrap gap-2" aria-label="Job status filters">
              <FilterPill href={filterHref(FILTER_ALL)} active={activeFilter === FILTER_ALL} label="All" />
              {STATUS_ORDER.map((s) => (
                <FilterPill key={s} href={filterHref(s)} active={activeFilter === s} label={humanizeStatus(s)} />
              ))}
            </nav>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-800">No jobs in this status</p>
              <p className="mt-1 text-sm text-slate-500">Try another filter or post a new listing.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link
                  href={filterHref(FILTER_ALL)}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Show all jobs
                </Link>
                <Link
                  href={"/client/jobs/new" as Route}
                  className="inline-flex items-center rounded-lg bg-[#433C93] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4d45a5]"
                >
                  Post a new job
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3.5 font-semibold">Job</th>
                      <th className="px-4 py-3.5 font-semibold">Status</th>
                      <th className="px-4 py-3.5 font-semibold tabular-nums">Bid signals</th>
                      <th className="px-4 py-3.5 font-semibold">Activity</th>
                      <th className="px-5 py-3.5 font-semibold">Details</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayJobs.map((job) => (
                      <tr
                        key={job.id}
                        className={cn("transition hover:bg-slate-50/60", isNeedsAttention(job) ? "bg-amber-50/30" : undefined)}
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/jobs/${job.id}` as Route}
                            className="font-semibold text-slate-900 hover:text-[#3525cd]"
                          >
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
                              statusBadgeClass(job.status)
                            )}
                          >
                            {humanizeStatus(job.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 tabular-nums text-slate-700">
                          <div className="flex flex-col">
                            <span>{job.bidCount} total</span>
                            <span className="text-xs text-slate-500">
                              {job.submitted} pending · {job.shortlisted} shortlisted
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          <div className="flex flex-col">
                            <span>{formatRelativeDays(job.updatedAt)}</span>
                            <span className="text-xs text-slate-500">
                              {job.latestBidAt ? `new bid ${formatRelativeDays(job.latestBidAt)}` : `posted ${formatCreated(job.createdAt)}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {detailLine(job)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/jobs/${job.id}` as Route}
                            className={cn(
                              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold",
                              isNeedsAttention(job)
                                ? "bg-[#433C93] text-white hover:bg-[#4d45a5]"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            )}
                          >
                            {isNeedsAttention(job) ? "Review bids" : "Open job"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {displayJobs.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link
                        href={`/jobs/${job.id}` as Route}
                        className="min-w-0 text-base font-semibold text-slate-900 hover:text-[#433C93]"
                      >
                        {job.title}
                      </Link>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
                          statusBadgeClass(job.status)
                        )}
                      >
                        {humanizeStatus(job.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{detailLine(job)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <span>
                        <span className="font-medium text-slate-500">Bids</span>{" "}
                        <span className="tabular-nums text-slate-800">{job.bidCount}</span>
                      </span>
                      <span>
                        <span className="font-medium text-slate-500">Pending</span>{" "}
                        <span className="tabular-nums text-slate-800">{job.submitted}</span>
                      </span>
                      <span>
                        <span className="font-medium text-slate-500">Updated</span> {formatRelativeDays(job.updatedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

function detailLine(job: ClientJobListRow): string {
  const parts: string[] = [humanizeWorkMode(job.workMode)];
  if (job.categoryName) parts.push(job.categoryName);
  if (job.subcategoryName) parts.push(job.subcategoryName);
  if (job.city) parts.push(job.city);
  return parts.join(" · ");
}

function FilterPill({ href, active, label }: { href: Route; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ring-1",
        active
          ? "bg-[#433C93] text-white ring-[#433C93] shadow-sm"
          : "bg-white text-slate-600 ring-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {label}
    </Link>
  );
}

function SummaryTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  );
}
