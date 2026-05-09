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
  MessageCircle,
  Sparkles,
  Target,
  UserRound,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivationChecklistCard, type ActivationChecklistStepVm } from "@/components/onboarding/ActivationChecklistCard";
import { MarketplaceLiquidityHints } from "@/components/onboarding/MarketplaceLiquidityHints";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardStatCard } from "./DashboardStatCard";

export type FreelancerDashboardCopy = {
  dashboardKicker: string;
  browseJobsCta: string;
  overviewTitle: string;
  overviewSubtitle: string;
  quickActionsHeading: string;
  statActiveBids: string;
  statActiveContracts: string;
  statRemainingQuota: string;
  statProfileCompletion: string;
  statAwaitingReplies: string;
  attentionKicker: string;
  attentionAccepted: string;
  attentionAwaiting: string;
  attentionProposalUpdates: string;
  profileCardTitleNew: string;
  profileCardTitleBoost: string;
  profileCardBodyNew: string;
  profileCardBodyBoost: string;
  profileCardCta: string;
  quickCompleteProfile: string;
  quickFindJobs: string;
  quickTrackProposals: string;
  quickAvailability: string;
  activityTitle: string;
  activitySubtitle: string;
  activityViewAll: string;
  openJobsTitle: string;
  openJobsSubtitle: string;
  openJobsSeeAll: string;
  activityEmptyNoProfileTitle: string;
  activityEmptyNoProfileBody: string;
  activityEmptyNoActivityTitle: string;
  activityEmptyNoActivityBody: string;
  activityEmptyPrimary: string;
  activityEmptySecondary: string;
  openJobsEmptyTitle: string;
  openJobsEmptyBody: string;
  openJobsEmptyCta: string;
  profileRequiredBanner: string;
  profileRequiredSub: string;
  activityKindProposal: string;
  activityKindContract: string;
  activityEmptyKickerProfile: string;
  activityEmptyKickerTimeline: string;
  openJobsEmptyKicker: string;
  nextActionAwaitingBanner: string;
  openMessagesCta: string;
};

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
  welcomeTitle: string;
  subtitle: string;
  hasProfile: boolean;
  profileCompleteness: number | null;
  showStrongProfileCard: boolean;
  stats: {
    activeBids: string;
    activeContracts: string;
    bidQuotaRemaining: string;
    bidQuotaHint: string;
    profileReadiness: string;
    profileHint: string;
    threadsAwaiting: string;
    threadsAwaitingHint: string;
  };
  recentBids: FreelancerDashboardBid[];
  recentContracts: FreelancerDashboardContract[];
  openJobs: FreelancerOpenJob[];
  openTotal: number;
  attention: {
    acceptedBids: number;
    awaitingReplyThreads: number;
    proposalUpdates: number;
  };
  copy: FreelancerDashboardCopy;
  activationChecklist: {
    title: string;
    intro: string;
    steps: ActivationChecklistStepVm[];
    allCompleteBanner: string | null;
  };
  liquidityTips: {
    title: string;
    intro: string;
    bullets: string[];
    footer: string;
  };
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
  "rounded-2xl border border-slate-200/85 bg-white p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] md:p-6";

const browseJobsCtaClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#3525cd] bg-white px-5 py-3 text-base font-semibold text-[#3525cd] shadow-sm transition hover:bg-[#3525cd]/[0.06] sm:w-auto sm:min-w-[11rem] sm:px-6";

export function FreelancerDashboard({
  welcomeTitle,
  subtitle,
  hasProfile,
  profileCompleteness,
  showStrongProfileCard,
  stats,
  recentBids,
  recentContracts,
  openJobs,
  openTotal,
  attention,
  copy,
  activationChecklist,
  liquidityTips
}: FreelancerDashboardProps) {
  const activity = buildActivity(recentBids, recentContracts);

  const quickLinks = [
    { label: copy.quickCompleteProfile, href: "/freelancer/profile" as Route, icon: UserRound, primary: true as const },
    { label: copy.quickFindJobs, href: "/jobs" as Route, icon: Compass, primary: true as const },
    { label: copy.quickTrackProposals, href: "/freelancer/proposals" as Route, icon: FileText, primary: false as const },
    { label: copy.quickAvailability, href: "/freelancer/profile" as Route, icon: CalendarClock, primary: false as const }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-slate-200/85 bg-white p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#3525cd]/85">{copy.dashboardKicker}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem] md:leading-snug">
              {welcomeTitle}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-[15px]">{subtitle}</p>
          </div>
          <Link href={"/jobs" as Route} className={browseJobsCtaClass}>
            <Compass className="h-5 w-5 shrink-0" aria-hidden />
            {copy.browseJobsCta}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <ActivationChecklistCard
          title={activationChecklist.title}
          intro={activationChecklist.intro}
          steps={activationChecklist.steps}
          allCompleteBanner={activationChecklist.allCompleteBanner}
        />
        <MarketplaceLiquidityHints
          title={liquidityTips.title}
          intro={liquidityTips.intro}
          bullets={liquidityTips.bullets}
          footer={liquidityTips.footer}
        />
      </div>

      <section aria-label="Overview and actions" className={panelClass}>
        {sectionLabel(copy.overviewTitle, copy.overviewSubtitle)}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardStatCard
            variant="emphasized"
            label={copy.statActiveBids}
            value={stats.activeBids}
            icon={Target}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statActiveContracts}
            value={stats.activeContracts}
            icon={Briefcase}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statAwaitingReplies}
            value={stats.threadsAwaiting}
            hint={stats.threadsAwaitingHint}
            icon={MessageCircle}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statRemainingQuota}
            value={stats.bidQuotaRemaining}
            hint={stats.bidQuotaHint}
            icon={Zap}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statProfileCompletion}
            value={stats.profileReadiness}
            hint={stats.profileHint}
            icon={UserRound}
          />
        </div>

        {hasProfile && attention.awaitingReplyThreads > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200/85 bg-gradient-to-br from-amber-50/90 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-950/90">{copy.nextActionAwaitingBanner}</p>
            <Link
              href={"/messages" as Route}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35 focus-visible:ring-offset-2"
            >
              {copy.openMessagesCta}
              <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
          </div>
        ) : null}

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{copy.attentionKicker}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
            <span>{copy.attentionAccepted.split("{{count}}").join(String(attention.acceptedBids))}</span>
            <span>{copy.attentionAwaiting.split("{{count}}").join(String(attention.awaitingReplyThreads))}</span>
            <span>{copy.attentionProposalUpdates.split("{{count}}").join(String(attention.proposalUpdates))}</span>
          </div>
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
                    {hasProfile ? copy.profileCardTitleBoost : copy.profileCardTitleNew}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {hasProfile
                      ? copy.profileCardBodyBoost.split("{{percent}}").join(String(profileCompleteness ?? 0))
                      : copy.profileCardBodyNew}
                  </p>
                </div>
              </div>
              <Link
                href={"/freelancer/profile" as Route}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0]"
              >
                {copy.profileCardCta}
                <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">{copy.quickActionsHeading}</h3>
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
              {sectionLabel(copy.activityTitle, copy.activitySubtitle)}
              <Link href={"/freelancer/proposals" as Route} className={linkClass}>
                {copy.activityViewAll}
              </Link>
            </div>

            {!hasProfile && activity.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker={copy.activityEmptyKickerProfile}
                  icon={ClipboardList}
                  title={copy.activityEmptyNoProfileTitle}
                  description={copy.activityEmptyNoProfileBody}
                  action={{ label: copy.profileCardCta, href: "/freelancer/profile" }}
                />
              </div>
            ) : hasProfile && activity.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker={copy.activityEmptyKickerTimeline}
                  icon={Inbox}
                  title={copy.activityEmptyNoActivityTitle}
                  description={copy.activityEmptyNoActivityBody}
                  action={{ label: copy.activityEmptyPrimary, href: "/jobs" }}
                  secondaryAction={{ label: copy.activityEmptySecondary, href: "/freelancer/proposals" }}
                />
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-slate-100">
                {!hasProfile ? (
                  <li className="pb-3">
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                      <span className="font-medium">{copy.profileRequiredBanner}</span>{" "}
                      <span className="text-amber-900/90">{copy.profileRequiredSub}</span>
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
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {copy.activityKindProposal}
                        </p>
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
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {copy.activityKindContract}
                        </p>
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
              {sectionLabel(
                copy.openJobsTitle,
                copy.openJobsSubtitle.split("{{count}}").join(String(openTotal))
              )}
              <Link href={"/jobs" as Route} className={linkClass}>
                {copy.openJobsSeeAll}
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="mt-5">
                <DashboardEmptyState
                  tone="elevated"
                  kicker={copy.openJobsEmptyKicker}
                  icon={Briefcase}
                  title={copy.openJobsEmptyTitle}
                  description={copy.openJobsEmptyBody}
                  action={{ label: copy.openJobsEmptyCta, href: "/jobs" }}
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
