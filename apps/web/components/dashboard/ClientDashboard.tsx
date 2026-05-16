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
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
  Waves
} from "lucide-react";
import { formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import type { AppLocale } from "@/lib/i18n/types";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
import { cn } from "@/lib/utils";
import { ActivationChecklistCard, type ActivationChecklistStepVm } from "@/components/onboarding/ActivationChecklistCard";
import { MarketplaceLiquidityHints } from "@/components/onboarding/MarketplaceLiquidityHints";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardStatCard } from "./DashboardStatCard";

export type ClientDashboardCopy = {
  nearworkKicker: string;
  summaryHeading: string;
  summarySub: string;
  statOpenJobs: string;
  statIncomingProposals: string;
  statUnreadThreads: string;
  statActiveContracts: string;
  statCompletedHires: string;
  quickActionsHeading: string;
  quickActionsSub: string;
  recentJobsHeading: string;
  recentJobsSub: string;
  incomingBidsHeading: string;
  incomingBidsSub: string;
  contractsHeading: string;
  contractsSub: string;
  contractsMessagesLink: string;
  incomingBidsManageLink: string;
  proposalNewBadge: string;
  viewAllJobs: string;
  finishProfileCardTitle: string;
  finishProfileCardBody: string;
  finishProfileCta: string;
  jobsEmptyNoProfileTitle: string;
  jobsEmptyNoProfileBody: string;
  jobsEmptyFirstTitle: string;
  jobsEmptyFirstBody: string;
  jobsEmptyFirstPrimary: string;
  jobsEmptyFirstSecondary: string;
  bidsEmptyNoProfileTitle: string;
  bidsEmptyNoProfileBody: string;
  bidsEmptyNoBidsTitle: string;
  bidsEmptyNoBidsBody: string;
  bidsEmptyNoBidsPrimary: string;
  bidsEmptyNoBidsSecondary: string;
  contractsEmptyTitle: string;
  contractsEmptyBody: string;
  contractsEmptyPrimary: string;
  contractsEmptySecondary: string;
  heroPostJobCta: string;
  quickActionPostJobLabel: string;
  quickActionPostJobHint: string;
  quickActionManageJobsLabel: string;
  quickActionManageJobsHint: string;
  quickActionReviewBidsLabel: string;
  quickActionReviewBidsHint: string;
  quickActionHireDirectoryLabel: string;
  quickActionHireDirectoryHint: string;
  proposalsReceivedBadgeOne: string;
  proposalsReceivedBadgeMany: string;
  contractRowUpdated: string;
  marketplacePulseTitle: string;
  marketplacePulseSubtitle: string;
  marketplacePulseFootnote: string;
  marketplacePulseOpenRoles: string;
  marketplacePulseBids24h: string;
  marketplacePulseFreelancers: string;
  marketplacePulseFresh24h: string;
  marketplacePulseHires7d: string;
};

export type ClientDashboardJob = {
  id: string;
  title: string;
  updatedAt: Date;
  metaLine: string;
  bidCount: number;
  latestBidAt: Date | null;
};

export type ClientDashboardBid = {
  id: string;
  statusLabel: string;
  createdAt: Date;
  bidAmount: unknown;
  job: { id: string; title: string; currency: string };
  freelancer: { fullName: string; username: string };
};

export type ClientDashboardContract = {
  id: string;
  statusLabel: string;
  updatedAt: Date;
  amount: unknown;
  currency: string | null;
  bid: {
    job: { id: string; title: string };
    freelancer: { fullName: string; username: string };
  };
};

type ClientDashboardProps = {
  locale: AppLocale;
  welcomeLine: string;
  subline: string;
  hasProfile: boolean;
  stats: {
    openJobs: string;
    openJobsHint: string;
    incomingBids: string;
    incomingBidsHint: string;
    threadsAwaiting: string;
    threadsAwaitingHint: string;
    activeContracts: string;
    activeContractsHint: string;
    hiresCompleted: string;
    hiresCompletedHint: string;
  };
  recentJobs: ClientDashboardJob[];
  recentBids: ClientDashboardBid[];
  recentContracts: ClientDashboardContract[];
  copy: ClientDashboardCopy;
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
  marketplacePulse: {
    openPublicJobs: number;
    bidsLast24h: number;
    freelancersAvailable: number;
    jobsPostedLast24h: number;
    contractsCompletedLast7d: number;
  };
};

const linkClass = "nw-link-action inline-flex items-center gap-1";

const primaryCtaClass =
  "nw-cta-primary inline-flex w-full min-h-11 items-center justify-center gap-2 px-6 py-3 text-base sm:w-auto";

const panelSurface = "nw-card";

function formatShortDate(d: Date, locale: AppLocale): string {
  const tag = locale === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric" }).format(d);
}

function hasNewProposal(d: Date | null): boolean {
  return Boolean(d && Date.now() - d.getTime() <= 1000 * 60 * 60 * 48);
}

type QuickAction = {
  label: string;
  hint: string;
  href: Route;
  icon: typeof Plus;
  emphasize?: boolean;
};

export function ClientDashboard({
  locale,
  welcomeLine,
  subline,
  hasProfile,
  stats,
  recentJobs,
  recentBids,
  recentContracts,
  copy,
  activationChecklist,
  liquidityTips,
  marketplacePulse
}: ClientDashboardProps) {
  const listJobs = recentJobs.slice(0, 10);
  const hasJobs = recentJobs.length > 0;
  const jobsBrowseRoot = withPublicLocale(locale, "/jobs");
  const freelancersBrowseRoot = withPublicLocale(locale, "/freelancers");
  const wp = (path: string) => withWorkspaceLocale(locale, path) as Route;

  const quickActions: QuickAction[] = [
    {
      label: copy.quickActionPostJobLabel,
      hint: copy.quickActionPostJobHint,
      href: wp("/client/jobs/new"),
      icon: Plus,
      emphasize: true
    },
    {
      label: copy.quickActionManageJobsLabel,
      hint: copy.quickActionManageJobsHint,
      href: wp("/client/jobs"),
      icon: Briefcase
    },
    {
      label: copy.quickActionReviewBidsLabel,
      hint: copy.quickActionReviewBidsHint,
      href: wp("/client/jobs"),
      icon: ClipboardList
    },
    {
      label: copy.quickActionHireDirectoryLabel,
      hint: copy.quickActionHireDirectoryHint,
      href: freelancersBrowseRoot as Route,
      icon: Search
    }
  ];

  return (
    <div className="mx-auto max-w-6xl nw-page-stack">
      {/* Hero */}
      <section className="nw-card-elevated p-5 md:p-7">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl space-y-2">
            <p className="nw-section-title opacity-90">{copy.nearworkKicker}</p>
            <h1 className="nw-type-display text-slate-900">{welcomeLine}</h1>
            <p className="nw-type-body text-[15px] text-slate-600">{subline}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link href={wp("/client/jobs/new")} className={primaryCtaClass}>
              <Plus className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
              {copy.heroPostJobCta}
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label={copy.marketplacePulseTitle}
        className="nw-card-trust border-[#3525cd]/14 bg-gradient-to-r from-[#3525cd]/[0.05] to-white px-4 py-3 md:px-5 md:py-3.5"
      >
        <div className="flex flex-wrap items-start gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3525cd] shadow-sm ring-1 ring-slate-200/80">
            <Waves className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="nw-type-micro">{copy.marketplacePulseTitle}</p>
            <p className="nw-type-body mt-1 text-slate-700">{copy.marketplacePulseSubtitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="nw-chip-quiet tabular-nums">
                {copy.marketplacePulseOpenRoles.split("{{count}}").join(String(marketplacePulse.openPublicJobs))}
              </span>
              <span className="nw-chip-quiet tabular-nums">
                {copy.marketplacePulseBids24h.split("{{count}}").join(String(marketplacePulse.bidsLast24h))}
              </span>
              <span className="nw-chip-quiet tabular-nums">
                {copy.marketplacePulseFreelancers.split("{{count}}").join(String(marketplacePulse.freelancersAvailable))}
              </span>
              {marketplacePulse.jobsPostedLast24h > 0 ? (
                <span className="nw-chip nw-chip-success normal-case tracking-normal">
                  {copy.marketplacePulseFresh24h.split("{{count}}").join(String(marketplacePulse.jobsPostedLast24h))}
                </span>
              ) : null}
              {marketplacePulse.contractsCompletedLast7d > 0 ? (
                <span className="nw-chip nw-chip-brand normal-case tracking-normal">
                  {copy.marketplacePulseHires7d.split("{{count}}").join(String(marketplacePulse.contractsCompletedLast7d))}
                </span>
              ) : null}
            </div>
            <p className="nw-type-meta mt-2 font-medium normal-case tracking-normal text-slate-500">
              {copy.marketplacePulseFootnote}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
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

      {/* Summary */}
      <section aria-labelledby="client-summary-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="client-summary-heading" className="nw-type-section">
              {copy.summaryHeading}
            </h2>
            <p className="nw-type-meta mt-0.5 font-medium normal-case tracking-normal">{copy.summarySub}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardStatCard
            variant="emphasized"
            label={copy.statOpenJobs}
            value={stats.openJobs}
            hint={stats.openJobsHint}
            icon={FolderOpen}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statIncomingProposals}
            value={stats.incomingBids}
            hint={stats.incomingBidsHint}
            icon={Inbox}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statUnreadThreads}
            value={stats.threadsAwaiting}
            hint={stats.threadsAwaitingHint}
            icon={MessageCircle}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statActiveContracts}
            value={stats.activeContracts}
            hint={stats.activeContractsHint}
            icon={FileSignature}
          />
          <DashboardStatCard
            variant="emphasized"
            label={copy.statCompletedHires}
            value={stats.hiresCompleted}
            hint={stats.hiresCompletedHint}
            icon={CircleCheck}
          />
        </div>
      </section>

      {!hasProfile ? (
        <div className="nw-card-trust p-5 md:flex md:items-center md:justify-between md:gap-6 md:p-6">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#3525cd]/[0.08] text-[#3525cd] ring-1 ring-[#3525cd]/12">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="nw-type-section">{copy.finishProfileCardTitle}</h3>
              <p className="nw-type-body mt-1">{copy.finishProfileCardBody}</p>
            </div>
          </div>
          <Link
            href={wp("/settings") as Route}
            className="nw-cta-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm md:mt-0 md:w-auto"
          >
            {copy.finishProfileCta}
            <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
          </Link>
        </div>
      ) : null}

      {/* Quick actions */}
      <section aria-labelledby="client-quick-actions-heading">
        <div className="mb-4">
          <h2 id="client-quick-actions-heading" className="nw-type-section">
            {copy.quickActionsHeading}
          </h2>
          <p className="nw-type-meta mt-0.5 font-medium normal-case tracking-normal">{copy.quickActionsSub}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border p-4 transition-[border-color,box-shadow,background-color] duration-200 md:p-5",
                item.emphasize
                  ? "border-[#3525cd]/20 bg-[#3525cd]/[0.04] hover:border-[#3525cd]/40 hover:shadow-nw-card"
                  : "border border-slate-200/90 bg-white shadow-nw-card transition-[border-color,box-shadow] duration-200 hover:border-slate-300/85 hover:shadow-nw-card-hover"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-colors duration-200",
                    item.emphasize
                      ? "bg-[#3525cd] text-white ring-[#3525cd]/25"
                      : "bg-slate-50 text-slate-700 ring-slate-200/80 group-hover:bg-white"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <ArrowUpRight
                  className={cn(
                    "h-4 w-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                    item.emphasize ? "text-[#3525cd]" : "text-slate-400"
                  )}
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal">{item.hint}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent jobs + Incoming bids */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start">
        <section className={cn(panelSurface, "p-5 md:p-6")} aria-labelledby="recent-jobs-heading">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 id="recent-jobs-heading" className="nw-type-section">
                {copy.recentJobsHeading}
              </h2>
              <p className="nw-type-meta mt-0.5 font-medium normal-case tracking-normal">{copy.recentJobsSub}</p>
            </div>
            {hasProfile && hasJobs ? (
              <Link href={wp("/client/jobs")} className={linkClass}>
                {copy.viewAllJobs}
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
                title={copy.jobsEmptyNoProfileTitle}
                description={copy.jobsEmptyNoProfileBody}
                action={{ label: copy.finishProfileCta, href: wp("/settings") }}
              />
            ) : listJobs.length === 0 ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Hiring"
                icon={Briefcase}
                title={copy.jobsEmptyFirstTitle}
                description={copy.jobsEmptyFirstBody}
                action={{ label: copy.jobsEmptyFirstPrimary, href: wp("/client/jobs/new") }}
                secondaryAction={{ label: copy.jobsEmptyFirstSecondary, href: freelancersBrowseRoot as Route }}
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {listJobs.map((job) => (
                  <li key={job.id} className="flex flex-wrap items-start justify-between gap-2 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`${jobsBrowseRoot}/${job.id}` as Route}
                        className="text-sm font-semibold text-slate-900 transition hover:text-[#3525cd]"
                      >
                        {job.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {hasNewProposal(job.latestBidAt) ? (
                          <span className="nw-chip nw-chip-brand px-1.5 py-0.5 text-[10px] normal-case tracking-normal">
                            {copy.proposalNewBadge}
                          </span>
                        ) : null}
                        {job.bidCount > 0 ? (
                          <span className="nw-chip nw-chip-muted px-1.5 py-0.5 text-[10px] normal-case tracking-normal">
                            {(job.bidCount === 1 ? copy.proposalsReceivedBadgeOne : copy.proposalsReceivedBadgeMany).replace(
                              "{{count}}",
                              String(job.bidCount)
                            )}
                          </span>
                        ) : null}
                      </div>
                      <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal text-slate-600">
                        {job.metaLine}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-[11px] tabular-nums text-slate-400"
                      dateTime={job.updatedAt.toISOString()}
                    >
                      {formatShortDate(job.updatedAt, locale)}
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
              <h2 id="incoming-bids-heading" className="nw-type-section">
                {copy.incomingBidsHeading}
              </h2>
              <p className="nw-type-meta mt-0.5 font-medium normal-case tracking-normal">{copy.incomingBidsSub}</p>
            </div>
            {hasProfile ? (
              <Link href={wp("/client/jobs")} className={linkClass}>
                {copy.incomingBidsManageLink}
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
                title={copy.bidsEmptyNoProfileTitle}
                description={copy.bidsEmptyNoProfileBody}
                action={{ label: copy.finishProfileCta, href: wp("/settings") }}
              />
            ) : recentBids.length === 0 ? (
              <DashboardEmptyState
                tone="elevated"
                kicker="Inbox"
                icon={Users}
                title={copy.bidsEmptyNoBidsTitle}
                description={copy.bidsEmptyNoBidsBody}
                action={{ label: copy.bidsEmptyNoBidsPrimary, href: wp("/client/jobs/new") }}
                secondaryAction={{ label: copy.bidsEmptyNoBidsSecondary, href: wp("/client/jobs") }}
              />
            ) : (
              <ul className="space-y-3">
                {recentBids.map((bid) => (
                  <li
                    key={bid.id}
                    className="nw-card-inset nw-card-inset-hover rounded-lg p-3.5"
                  >
                    <Link
                      href={`${jobsBrowseRoot}/${bid.job.id}` as Route}
                      className="text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                    >
                      {bid.job.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-600">
                      {bid.freelancer.fullName}{" "}
                      <span className="text-slate-400">(@{bid.freelancer.username})</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="nw-chip nw-chip-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-slate-700">
                        {bid.statusLabel}
                      </span>
                      <span className="font-medium text-slate-700">
                        {formatMoneyAmount(bid.bidAmount, bid.job.currency, {
                          locale,
                          maximumFractionDigits: normalizeCurrencyCode(bid.job.currency) === "IDR" ? 0 : 2
                        })}
                      </span>
                      <span className="text-slate-400">· {formatShortDate(bid.createdAt, locale)}</span>
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
            <h2 id="contracts-heading" className="nw-type-section">
              {copy.contractsHeading}
            </h2>
            <p className="nw-type-meta mt-0.5 font-medium normal-case tracking-normal">{copy.contractsSub}</p>
          </div>
          <Link href={wp("/messages")} className={linkClass}>
            {copy.contractsMessagesLink}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-5">
          {recentContracts.length === 0 ? (
            <DashboardEmptyState
              tone="elevated"
              kicker="Hires"
              icon={FileSignature}
              title={copy.contractsEmptyTitle}
              description={copy.contractsEmptyBody}
              action={{ label: copy.contractsEmptyPrimary, href: wp("/client/jobs") }}
              secondaryAction={{ label: copy.contractsEmptySecondary, href: freelancersBrowseRoot as Route }}
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {recentContracts.map((c) => (
                <li key={c.id} className="nw-card-inset nw-card-inset-hover rounded-lg p-4">
                  <Link
                    href={`${jobsBrowseRoot}/${c.bid.job.id}` as Route}
                    className="text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                  >
                    {c.bid.job.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-600">
                    {c.bid.freelancer.fullName}{" "}
                    <span className="text-slate-400">(@{c.bid.freelancer.username})</span>
                  </p>
                  <p className="nw-type-meta mt-2 font-medium text-slate-500">
                    <span>{c.statusLabel}</span>
                    {c.currency && c.amount != null ? (
                      <>
                        {" · "}
                        {formatMoneyAmount(c.amount, c.currency ?? "USD", {
                          locale,
                          maximumFractionDigits: normalizeCurrencyCode(c.currency) === "IDR" ? 0 : 2
                        })}
                      </>
                    ) : null}
                    {" · "}
                    {copy.contractRowUpdated.replace("{{date}}", formatShortDate(c.updatedAt, locale))}
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
