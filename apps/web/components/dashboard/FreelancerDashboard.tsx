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
  /** First word of fullName for welcome, or null */
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
    ? `You are signed in as ${displayName}${username ? ` (@${username})` : ""}. Here is a snapshot of your NearWork activity.`
    : "Set up your freelancer profile to bid on jobs, track proposals, and manage contracts in one place.";

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#3525cd]">Freelancer dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{welcomeLine}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">{subline}</p>
      </header>

      <section aria-label="Summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

      {showStrongProfileCard ? (
        <section aria-label="Profile setup">
          <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-6 shadow-sm ring-1 ring-indigo-100 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3525cd] text-white shadow-md">
                  <Sparkles className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {hasProfile ? "Strengthen your profile" : "Complete your freelancer profile"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                    {hasProfile
                      ? `Your profile is about ${profileCompleteness ?? 0}% complete. A detailed profile helps clients trust you and improves how you show up in search.`
                      : "Add your skills, work preferences, and portfolio so you can submit proposals and unlock your full dashboard."}
                  </p>
                </div>
              </div>
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#4f46e5]"
              >
                Complete profile
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label="Quick actions">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Complete profile", href: "/freelancer/profile" as Route, icon: UserRound },
              { label: "Browse jobs", href: "/jobs" as Route, icon: Compass },
              { label: "View proposals", href: "/freelancer/proposals" as Route, icon: FileText },
              { label: "Update availability", href: "/freelancer/profile" as Route, icon: CalendarClock }
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-white hover:text-[#3525cd]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
                    <item.icon className="h-4 w-4 text-[#3525cd]" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-5 lg:gap-8">
        <section className="lg:col-span-3" aria-label="Recent activity">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest proposals and contract updates</p>
              </div>
              <Link
                href={"/freelancer/proposals" as Route}
                className="text-sm font-semibold text-[#3525cd] hover:underline"
              >
                View all
              </Link>
            </div>

            {!hasProfile && activity.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  icon={ClipboardList}
                  title="No activity yet"
                  description="Create your freelancer profile to submit proposals and see them listed here."
                  action={{ label: "Complete profile", href: "/freelancer/profile" }}
                />
              </div>
            ) : hasProfile && activity.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  icon={Inbox}
                  title="Nothing recent"
                  description="When you send proposals or your contracts change status, they will appear in this timeline."
                  action={{ label: "Browse open jobs", href: "/jobs" }}
                  secondaryAction={{ label: "View proposals", href: "/freelancer/proposals" }}
                />
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-slate-100">
                {!hasProfile ? (
                  <li className="pb-4">
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                      <span className="font-semibold">Finish your profile</span>
                      <span className="text-amber-900/90">
                        {" "}
                        to submit new proposals. Contract updates below will keep appearing here.
                      </span>
                    </div>
                  </li>
                ) : null}
                {activity.map((item) =>
                  item.kind === "bid" ? (
                    <li key={`bid-${item.bid.id}`} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposal</p>
                        <Link
                          href={`/jobs/${item.bid.job.id}` as Route}
                          className="mt-1 block font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.bid.job.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.bid.status.replace(/_/g, " ")} · {money(item.bid.bidAmount, item.bid.job.currency)}
                          {item.bid.estimatedDays != null ? ` · ~${item.bid.estimatedDays}d` : null}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at)}
                      </time>
                    </li>
                  ) : (
                    <li
                      key={`contract-${item.contract.id}`}
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contract</p>
                        <Link
                          href={`/jobs/${item.contract.bid.job.id}` as Route}
                          className="mt-1 block font-medium text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.contract.bid.job.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600">
                          Status: {item.contract.status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at)}
                      </time>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </section>

        <section className="lg:col-span-2" aria-label="Open jobs">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Open jobs</h2>
                <p className="mt-1 text-sm text-slate-500">{openTotal} role{openTotal === 1 ? "" : "s"} available</p>
              </div>
              <Link href={"/jobs" as Route} className="text-sm font-semibold text-[#3525cd] hover:underline">
                See all
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  icon={Briefcase}
                  title="No open listings"
                  description="Check back soon or widen your search on the jobs board."
                  action={{ label: "Browse jobs", href: "/jobs" }}
                />
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {openJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}` as Route}
                      className="block rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm"
                    >
                      <p className="font-medium leading-snug text-slate-900">{job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
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
