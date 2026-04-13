import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Compass,
  FileText,
  Inbox,
  Sparkles,
  Target,
  UserRound,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardStatCard } from "./DashboardStatCard";

export type FreelancerDashboardBid = {
  id: string;
  status: string;
  bidAmount: unknown;
  estimatedDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    slug: string;
    status: string;
    workMode: string;
    currency: string;
  };
};

export type FreelancerDashboardContract = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  bid: {
    job: { id: string; title: string };
  };
};

export type FreelancerOpenJob = {
  id: string;
  title: string;
  workMode: string;
  city: string | null;
};

type ActivityItem =
  | { kind: "bid"; at: Date; bid: FreelancerDashboardBid }
  | { kind: "contract"; at: Date; contract: FreelancerDashboardContract };

type FreelancerDashboardProps = {
  displayName: string;
  greetingName: string | null;
  hasProfile: boolean;
  username: string | null;
  profileCompleteness: number | null;
  showStrongProfileCard: boolean;
  stats: {
    activeBids: string;
    activeContracts: string;
    bidQuotaRemaining: string;
    bidQuotaHint: string;
    profileReadiness: string;
    profileHint: string;
  };
  recentBids: FreelancerDashboardBid[];
  recentContracts: FreelancerDashboardContract[];
  openJobs: FreelancerOpenJob[];
  openTotal: number;
};

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

function buildActivity(bids: FreelancerDashboardBid[], contracts: FreelancerDashboardContract[]): ActivityItem[] {
  const items: ActivityItem[] = [
    ...bids.map((bid) => ({ kind: "bid" as const, at: bid.updatedAt, bid })),
    ...contracts.map((contract) => ({ kind: "contract" as const, at: contract.updatedAt, contract }))
  ];
  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items.slice(0, 8);
}

function sectionLabel(title: string, subtitle?: string) {
  return (
    <div className="min-w-0">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-sm leading-snug text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

const linkClass =
  "text-sm font-medium text-[#3525cd] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/25 focus-visible:ring-offset-2 rounded-sm";

const panelClass =
  "rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/[0.04] md:p-6";

const browseJobsCtaClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#3525cd] bg-white px-5 py-3 text-base font-semibold text-[#3525cd] shadow-sm transition hover:bg-[#3525cd]/[0.06] sm:w-auto sm:min-w-[11rem] sm:px-6";

export function FreelancerDashboard({
  displayName,
  greetingName,
  hasProfile,
  username,
  profileCompleteness,
  showStrongProfileCard,
  stats,
  recentBids,
  recentContracts,
  openJobs,
  openTotal
}: FreelancerDashboardProps) {
  const activity = buildActivity(recentBids, recentContracts);
  const welcomeLine = greetingName ? `Welcome back, ${greetingName}` : "Welcome back";
  const subline = hasProfile
    ? `${displayName}${username ? ` · @${username}` : ""} · Bids, quota, and open roles in one view.`
    : "Finish setup to bid on jobs and track proposals and contracts here.";

  const quickLinks = [
    { label: "Complete profile", href: "/freelancer/profile" as Route, icon: UserRound, primary: true as const },
    { label: "Browse jobs", href: "/jobs" as Route, icon: Compass, primary: true as const },
    { label: "View proposals", href: "/freelancer/proposals" as Route, icon: FileText, primary: false as const },
    { label: "Update availability", href: "/freelancer/profile" as Route, icon: CalendarClock, primary: false as const }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-slate-500">Freelancer dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem] md:leading-snug">
            {welcomeLine}
          </h1>
          <p className="max-w-lg text-sm leading-snug text-slate-600">{subline}</p>
        </div>
        <Link href={"/jobs" as Route} className={browseJobsCtaClass}>
          <Compass className="h-5 w-5 shrink-0" aria-hidden />
          Browse jobs
        </Link>
      </header>

      <section aria-label="Overview and actions" className={panelClass}>
        {sectionLabel("Overview", "Live counts from your plan and profile.")}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            variant="emphasized"
            label="Active bids"
            value={stats.activeBids}
            icon={Target}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Active contracts"
            value={stats.activeContracts}
            icon={Briefcase}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Remaining quota"
            value={stats.bidQuotaRemaining}
            hint={stats.bidQuotaHint}
            icon={Zap}
          />
          <DashboardStatCard
            variant="emphasized"
            label="Profile completion"
            value={stats.profileReadiness}
            hint={stats.profileHint}
            icon={UserRound}
          />
        </div>

        {showStrongProfileCard ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 border-l-[3px] border-l-[#3525cd] bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#3525cd] ring-1 ring-slate-200/80">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {hasProfile ? "Strengthen your profile" : "Complete your freelancer profile"}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {hasProfile
                      ? `${profileCompleteness ?? 0}% complete—headline, bio, and rates help you win work.`
                      : "Skills, work mode, and a short bio unlock proposals and full quota visibility."}
                  </p>
                </div>
              </div>
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0]"
              >
                Complete profile
                <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Quick actions</h3>
          <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    item.primary
                      ? "bg-[#3525cd]/10 text-[#3525cd] ring-1 ring-[#3525cd]/15 hover:bg-[#3525cd]/14"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4 shrink-0", item.primary ? "text-[#3525cd]" : "text-slate-400")}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section className="lg:col-span-7" aria-label="Recent activity">
          <div className={panelClass}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              {sectionLabel("Recent activity", "Proposals and contract updates")}
              <Link href={"/freelancer/proposals" as Route} className={linkClass}>
                View all
              </Link>
            </div>

            {!hasProfile && activity.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker="Profile"
                  icon={ClipboardList}
                  title="Your timeline starts after setup"
                  description="Create your freelancer profile to send proposals and see every update in one place."
                  action={{ label: "Complete profile", href: "/freelancer/profile" }}
                />
              </div>
            ) : hasProfile && activity.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker="Timeline"
                  icon={Inbox}
                  title="Nothing new here yet"
                  description="When you bid or a contract moves, it shows up here so you always know what changed."
                  action={{ label: "Browse open jobs", href: "/jobs" }}
                  secondaryAction={{ label: "View proposals", href: "/freelancer/proposals" }}
                />
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-slate-100">
                {!hasProfile ? (
                  <li className="pb-3">
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                      <span className="font-medium">Profile required for new bids.</span>{" "}
                      <span className="text-amber-900/90">Contract updates still appear below.</span>
                    </div>
                  </li>
                ) : null}
                {activity.map((item) =>
                  item.kind === "bid" ? (
                    <li
                      key={`bid-${item.bid.id}`}
                      className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Proposal</p>
                        <Link
                          href={`/jobs/${item.bid.job.id}` as Route}
                          className="mt-0.5 block text-sm font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.bid.job.title}
                        </Link>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                          {item.bid.status.replace(/_/g, " ")} · {money(item.bid.bidAmount, item.bid.job.currency)}
                          {item.bid.estimatedDays != null ? ` · ~${item.bid.estimatedDays}d` : null}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs tabular-nums text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at)}
                      </time>
                    </li>
                  ) : (
                    <li
                      key={`contract-${item.contract.id}`}
                      className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Contract</p>
                        <Link
                          href={`/jobs/${item.contract.bid.job.id}` as Route}
                          className="mt-0.5 block text-sm font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.contract.bid.job.title}
                        </Link>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                          {item.contract.status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs tabular-nums text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at)}
                      </time>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </section>

        <section className="lg:col-span-5" aria-label="Open jobs">
          <div className={panelClass}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              {sectionLabel("Open & recommended jobs", `${openTotal} role${openTotal === 1 ? "" : "s"} on the board`)}
              <Link href={"/jobs" as Route} className={linkClass}>
                See all
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker="Opportunities"
                  icon={Briefcase}
                  title="No listings in this snapshot"
                  description="The job board updates as clients post work. Open the full board to search and filter roles that fit you."
                  action={{ label: "Browse job board", href: "/jobs" }}
                />
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {openJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}` as Route}
                      className="block rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium leading-snug text-slate-900">{job.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {job.workMode}
                        {job.city ? ` · ${job.city}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
