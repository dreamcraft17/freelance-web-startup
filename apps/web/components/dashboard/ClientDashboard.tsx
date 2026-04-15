import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CircleCheck,
  ClipboardList,
  FileSignature,
  FolderOpen,
  Inbox,
  Plus,
  Search,
  Sparkles,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardStatCard } from "./DashboardStatCard";

export type ClientDashboardJob = {
  id: string;
  title: string;
  status: string;
  workMode: string;
  city: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string | null;
  bidCount: number;
};

export type ClientDashboardBid = {
  id: string;
  status: string;
  createdAt: Date;
  bidAmount: unknown;
  job: { id: string; title: string; currency: string };
  freelancer: { fullName: string; username: string };
};

export type ClientDashboardContract = {
  id: string;
  status: string;
  updatedAt: Date;
  amount: unknown;
  currency: string | null;
  bid: {
    job: { id: string; title: string };
    freelancer: { fullName: string; username: string };
  };
};

type ClientDashboardProps = {
  greetingName: string | null;
  displayName: string;
  hasProfile: boolean;
  stats: {
    openJobs: string;
    openJobsHint: string;
    incomingBids: string;
    incomingBidsHint: string;
    activeContracts: string;
    activeContractsHint: string;
    hiresCompleted: string;
    hiresCompletedHint: string;
  };
  recentJobs: ClientDashboardJob[];
  recentBids: ClientDashboardBid[];
  recentContracts: ClientDashboardContract[];
};

const linkClass =
  "inline-flex items-center gap-1 text-sm font-medium text-[#433C93] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#433C93]/25 focus-visible:ring-offset-2 rounded-sm";

const primaryCtaClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#433C93] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#4d45a5] sm:w-auto";

const panelSurface =
  "rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function money(amount: unknown, currency: string): string {
  const n =
    amount != null && typeof (amount as { toString?: () => string }).toString === "function"
      ? Number(amount)
      : NaN;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

function humanizeStatus(s: string): string {
  return s.replace(/_/g, " ").toLowerCase();
}

type QuickAction = {
  label: string;
  hint: string;
  href: Route;
  icon: typeof Plus;
  emphasize?: boolean;
};

export function ClientDashboard({
  greetingName,
  displayName,
  hasProfile,
  stats,
  recentJobs,
  recentBids,
  recentContracts
}: ClientDashboardProps) {
  const welcomeLine = greetingName ? `Welcome back, ${greetingName}` : "Welcome back";
  const subline = hasProfile
    ? `${displayName} — track listings, proposals, and hires in one place.`
    : "Create a client profile to post roles and receive proposals from freelancers.";

  const listJobs = recentJobs.slice(0, 10);
  const hasJobs = recentJobs.length > 0;

  const quickActions: QuickAction[] = [
    {
      label: "Post a job",
      hint: "Publish a new role",
      href: "/client/jobs/new" as Route,
      icon: Plus,
      emphasize: true
    },
    {
      label: "Manage jobs",
      hint: "Edit listings & status",
      href: "/client/jobs" as Route,
      icon: Briefcase
    },
    {
      label: "Review bids",
      hint: "Open proposals inbox",
      href: "/client/jobs" as Route,
      icon: ClipboardList
    },
    {
      label: "Hire from directory",
      hint: "Discover freelancers",
      href: "/freelancers" as Route,
      icon: Search
    }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-10">
      {/* Hero */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">NearWork · Client</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.75rem] md:leading-tight">
              {welcomeLine}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 md:text-[15px]">{subline}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link href={"/client/jobs/new" as Route} className={primaryCtaClass}>
              <Plus className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
              Post a job
            </Link>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section aria-labelledby="client-summary-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="client-summary-heading" className="text-base font-semibold text-slate-900">
              At a glance
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Live counts from your workspace</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            variant="emphasized"
            label="Open jobs"
            value={stats.openJobs}
            hint={stats.openJobsHint}
            icon={FolderOpen}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Incoming bids"
            value={stats.incomingBids}
            hint={stats.incomingBidsHint}
            icon={Inbox}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Active contracts"
            value={stats.activeContracts}
            hint={stats.activeContractsHint}
            icon={FileSignature}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Completed hires"
            value={stats.hiresCompleted}
            hint={stats.hiresCompletedHint}
            icon={CircleCheck}
          />
        </div>
      </section>

      {!hasProfile ? (
        <div className="rounded-xl border border-slate-200 border-l-[3px] border-l-[#433C93] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:flex md:items-center md:justify-between md:gap-6 md:p-6">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#433C93] ring-1 ring-slate-200/80">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Finish your client profile</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                A few details unlock job posting and help freelancers trust your briefs.
              </p>
            </div>
          </div>
          <Link
            href={"/settings" as Route}
            className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#433C93] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d45a5] md:mt-0 md:w-auto"
          >
            Complete setup
            <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
          </Link>
        </div>
      ) : null}

      {/* Quick actions */}
      <section aria-labelledby="client-quick-actions-heading">
        <div className="mb-4">
          <h2 id="client-quick-actions-heading" className="text-base font-semibold text-slate-900">
            Quick actions
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Shortcuts to the workflows you use most</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex flex-col gap-3 rounded-lg border p-4 transition md:p-5",
                item.emphasize
                  ? "border-[#433C93]/25 bg-[#433C93]/[0.05] hover:border-[#433C93]/45"
                  : "border-slate-200 bg-white hover:border-slate-300/90"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                    item.emphasize
                      ? "bg-[#433C93] text-white ring-[#433C93]/20"
                      : "bg-slate-50 text-slate-700 ring-slate-200/80 group-hover:bg-white"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <ArrowUpRight
                  className={cn(
                    "h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100",
                    item.emphasize ? "text-[#433C93]" : "text-slate-400"
                  )}
                  aria-hidden
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs leading-snug text-slate-500">{item.hint}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent jobs + Incoming bids */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className={cn(panelSurface, "p-5 md:p-6")} aria-labelledby="recent-jobs-heading">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 id="recent-jobs-heading" className="text-base font-semibold text-slate-900">
                Recent jobs
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">Newest updates across your listings</p>
            </div>
            {hasProfile && hasJobs ? (
              <Link href={"/client/jobs" as Route} className={linkClass}>
                View all
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>

          <div className="mt-5">
            {!hasProfile ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Profile"
                icon={FolderOpen}
                title="No jobs to show yet"
                description="Create your client profile in settings, then post a role to see it listed here with bid counts and status."
                action={{ label: "Complete setup", href: "/settings" }}
              />
            ) : listJobs.length === 0 ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Hiring"
                icon={Briefcase}
                title="Post your first job"
                description="Share a clear brief to receive proposals. Set budget, work mode, and timing before you go live—you can keep a draft until you are ready."
                action={{ label: "Post a job", href: "/client/jobs/new" }}
                secondaryAction={{ label: "Browse freelancers", href: "/freelancers" }}
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {listJobs.map((job) => (
                  <li key={job.id} className="flex flex-wrap items-start justify-between gap-2 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${job.id}` as Route}
                        className="text-sm font-semibold text-slate-900 transition hover:text-[#3525cd]"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        <span className="capitalize">{humanizeStatus(job.status)}</span>
                        {" · "}
                        {job.workMode}
                        {job.categoryName ? ` · ${job.categoryName}` : null}
                        {job.city ? ` · ${job.city}` : null}
                        {" · "}
                        {job.bidCount} bid{job.bidCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-[11px] tabular-nums text-slate-400"
                      dateTime={job.updatedAt.toISOString()}
                    >
                      {formatShortDate(job.updatedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={cn(panelSurface, "p-5 md:p-6")} aria-labelledby="incoming-bids-heading">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 id="incoming-bids-heading" className="text-base font-semibold text-slate-900">
                Incoming bids
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">Latest proposals on your jobs</p>
            </div>
            {hasProfile ? (
              <Link href={"/client/jobs" as Route} className={linkClass}>
                Manage jobs
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>

          <div className="mt-5">
            {!hasProfile ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Proposals"
                icon={Inbox}
                title="Bids will appear after you post"
                description="Finish your client profile and publish a job to receive proposals from freelancers."
                action={{ label: "Complete setup", href: "/settings" }}
              />
            ) : recentBids.length === 0 ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Inbox"
                icon={Users}
                title="No bids yet"
                description="When freelancers respond to your listings, their proposals and rates show up here for easy review."
                action={{ label: "Post a job", href: "/client/jobs/new" }}
                secondaryAction={{ label: "View my jobs", href: "/client/jobs" }}
              />
            ) : (
              <ul className="space-y-3">
                {recentBids.map((bid) => (
                  <li
                    key={bid.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/40 p-3.5 transition hover:border-slate-200 hover:bg-slate-50/80"
                  >
                    <Link
                      href={`/jobs/${bid.job.id}` as Route}
                      className="text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                    >
                      {bid.job.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-600">
                      {bid.freelancer.fullName}{" "}
                      <span className="text-slate-400">(@{bid.freelancer.username})</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="rounded-md bg-white px-1.5 py-0.5 font-medium capitalize text-slate-700 ring-1 ring-slate-200/80">
                        {humanizeStatus(bid.status)}
                      </span>
                      <span className="font-medium text-slate-700">{money(bid.bidAmount, bid.job.currency)}</span>
                      <span className="text-slate-400">· {formatShortDate(bid.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className={cn(panelSurface, "p-5 md:p-6")} aria-labelledby="contracts-heading">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 id="contracts-heading" className="text-base font-semibold text-slate-900">
              Active contracts
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">From kickoff through wrap-up</p>
          </div>
          <Link href={"/messages" as Route} className={linkClass}>
            Messages
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-5">
          {recentContracts.length === 0 ? (
            <DashboardEmptyState
              tone="elevated"
              kicker="Hires"
              icon={FileSignature}
              title="No contracts yet"
              description="When you accept a bid, the engagement appears here with status and value so you can track delivery alongside messages."
              action={{ label: "Review open jobs", href: "/client/jobs" }}
              secondaryAction={{ label: "Browse freelancers", href: "/freelancers" }}
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {recentContracts.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:shadow-sm">
                  <Link
                    href={`/jobs/${c.bid.job.id}` as Route}
                    className="text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                  >
                    {c.bid.job.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-600">
                    {c.bid.freelancer.fullName}{" "}
                    <span className="text-slate-400">(@{c.bid.freelancer.username})</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="capitalize">{humanizeStatus(c.status)}</span>
                    {c.currency && c.amount != null ? (
                      <>
                        {" · "}
                        {money(c.amount, c.currency)}
                      </>
                    ) : null}
                    {" · "}
                    Updated {formatShortDate(c.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
