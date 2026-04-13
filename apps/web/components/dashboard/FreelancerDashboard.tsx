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
      {subtitle ? <p className="mt-1 text-sm leading-snug text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

const linkClass =
  "text-sm font-medium text-[#3525cd] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/25 focus-visible:ring-offset-2 rounded-sm";

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
    ? `${displayName}${username ? ` · @${username}` : ""}`
    : "Finish setup to bid on jobs and track work in one place.";

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Freelancer</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.75rem] md:leading-tight">
          {welcomeLine}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-600">{subline}</p>
      </header>

      <section aria-label="Overview" className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
        {sectionLabel("Overview", "Live counts from your plan and profile.")}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard label="Active bids" value={stats.activeBids} icon={Target} />
          <DashboardStatCard label="Active contracts" value={stats.activeContracts} icon={Briefcase} />
          <DashboardStatCard
            label="Bid quota left"
            value={stats.bidQuotaRemaining}
            hint={stats.bidQuotaHint}
            icon={Zap}
          />
          <DashboardStatCard
            label="Profile readiness"
            value={stats.profileReadiness}
            hint={stats.profileHint}
            icon={UserRound}
          />
        </div>

        {showStrongProfileCard ? (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 border-l-[3px] border-l-[#3525cd] bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#3525cd] ring-1 ring-slate-200/80">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {hasProfile ? "Strengthen your profile" : "Complete your freelancer profile"}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {hasProfile
                      ? `${profileCompleteness ?? 0}% complete—clients see a fuller story when you add headline, bio, and rates.`
                      : "Add skills, work mode, and a short bio to unlock proposals and quota details."}
                  </p>
                </div>
              </div>
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#3525cd] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d1fb0]"
              >
                Complete profile
                <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Quick actions</h3>
          <ul className="mt-4 flex flex-col gap-1 sm:flex-row sm:flex-wrap">
            {[
              { label: "Complete profile", href: "/freelancer/profile" as Route, icon: UserRound },
              { label: "Browse jobs", href: "/jobs" as Route, icon: Compass },
              { label: "View proposals", href: "/freelancer/proposals" as Route, icon: FileText },
              { label: "Update availability", href: "/freelancer/profile" as Route, icon: CalendarClock }
            ].map((item) => (
              <li key={item.label} className="sm:mr-1">
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:px-3"
                >
                  <item.icon className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <section className="lg:col-span-7" aria-label="Recent activity">
          <div className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              {sectionLabel("Recent activity", "Proposals and contract updates")}
              <Link href={"/freelancer/proposals" as Route} className={linkClass}>
                View all
              </Link>
            </div>

            {!hasProfile && activity.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  kicker="Profile"
                  icon={ClipboardList}
                  title="Your workspace timeline starts after setup"
                  description="Create your freelancer profile to send proposals and see every update in one place—no more hunting through email."
                  action={{ label: "Complete profile", href: "/freelancer/profile" }}
                />
              </div>
            ) : hasProfile && activity.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  kicker="Timeline"
                  icon={Inbox}
                  title="Nothing new here yet"
                  description="When you bid or a contract moves, it lands here automatically so you always know what changed."
                  action={{ label: "Browse open jobs", href: "/jobs" }}
                  secondaryAction={{ label: "View proposals", href: "/freelancer/proposals" }}
                />
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-slate-100">
                {!hasProfile ? (
                  <li className="pb-4">
                    <div className="rounded-md border border-amber-200/80 bg-amber-50/50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                      <span className="font-medium">Profile required for new bids.</span>{" "}
                      <span className="text-amber-900/90">Contract updates still appear below.</span>
                    </div>
                  </li>
                ) : null}
                {activity.map((item) =>
                  item.kind === "bid" ? (
                    <li
                      key={`bid-${item.bid.id}`}
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">Proposal</p>
                        <Link
                          href={`/jobs/${item.bid.job.id}` as Route}
                          className="mt-1 block text-sm font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.bid.job.title}
                        </Link>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
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
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">Contract</p>
                        <Link
                          href={`/jobs/${item.contract.bid.job.id}` as Route}
                          className="mt-1 block text-sm font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.contract.bid.job.title}
                        </Link>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
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
          <div className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              {sectionLabel("Open jobs", `${openTotal} role${openTotal === 1 ? "" : "s"} on the board`)}
              <Link href={"/jobs" as Route} className={linkClass}>
                See all
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  kicker="Job board"
                  icon={Briefcase}
                  title="No listings in this snapshot"
                  description="The public board refreshes as clients post work. Open the full board to search and filter roles that fit you."
                  action={{ label: "Open job board", href: "/jobs" }}
                />
              </div>
            ) : (
              <ul className="mt-6 space-y-0.5">
                {openJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}` as Route}
                      className="-mx-2 block rounded-md px-2 py-2.5 transition hover:bg-slate-50"
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
