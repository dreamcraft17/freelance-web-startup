import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Compass,
  FileText,
  Inbox,
  MessageCircle,
  Sparkles,
  Target,
  UserRound,
  Waves,
  Zap
} from "lucide-react";
import type { FreelancerProposalPlaybookSection } from "@/components/onboarding/FreelancerProposalPlaybook";
import { FreelancerProposalPlaybook } from "@/components/onboarding/FreelancerProposalPlaybook";
import { ActivationChecklistCard, type ActivationChecklistStepVm } from "@/components/onboarding/ActivationChecklistCard";
import { formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import type { AppLocale } from "@/lib/i18n/types";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
import { cn } from "@/lib/utils";
import { jobsBrowseQueryString } from "@/features/public/lib/jobs-browse-query";
import { MarketplaceLiquidityHints } from "@/components/onboarding/MarketplaceLiquidityHints";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { FreelancerDashboardHero, type FreelancerHeroStatVm } from "./FreelancerDashboardHero";

export type FreelancerDashboardCopy = {
  browseJobsCta: string;
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
  pulseStripTitle: string;
  playbookTitle: string;
  playbookIntro: string;
  playbookFooter: string;
  pulseQuotaLabel: string;
  pulseProfileLabel: string;
  pulseAwaitingLabel: string;
  snapshotTitle: string;
  snapshotSubtitle: string;
  snapshotBidUpdatesLabel: string;
  snapshotAcceptedLabel: string;
  snapshotAwaitingLabel: string;
  snapshotSavedLabel: string;
  conversationsTitle: string;
  conversationsSubtitle: string;
  conversationsSeeAll: string;
  conversationsEmptyTitle: string;
  conversationsEmptyBody: string;
  skillsTitle: string;
  skillsSubtitle: string;
  skillsEmptyBody: string;
  skillsYearsShort: string;
  heroMotivation: string;
  heroTrustCaption: string;
  activityBidEta: string;
  marketplacePulseTitle: string;
  marketplacePulseSubtitle: string;
  marketplacePulseFootnote: string;
  marketplacePulseOpenRoles: string;
  marketplacePulseBids24h: string;
  marketplacePulseFreelancers: string;
  marketplacePulseFresh24h: string;
  marketplacePulseHires7d: string;
  marketplacePulseCategoriesMicro: string;
  activityEmptyMomentumTitle: string;
  activityEmptyMomentumBody: string;
  openJobShortlistedOne: string;
  openJobShortlistedMany: string;
};

export type FreelancerDashboardBid = {
  id: string;
  statusLabel: string;
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
  statusLabel: string;
  createdAt: Date;
  updatedAt: Date;
  bid: {
    job: { id: string; title: string };
  };
};

export type FreelancerOpenJob = {
  id: string;
  title: string;
  workModeLabel: string;
  city: string | null;
  shortlistedCount: number;
};

export type FreelancerSkillChipVm = {
  name: string;
  years: number | null;
};

export type FreelancerConversationVm = {
  threadId: string;
  title: string;
  updatedAt: Date;
};

type ActivityItem =
  | { kind: "bid"; at: Date; bid: FreelancerDashboardBid }
  | { kind: "contract"; at: Date; contract: FreelancerDashboardContract };

type FreelancerDashboardProps = {
  locale: AppLocale;
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
  heroStats: FreelancerHeroStatVm[];
  heroTrustPills: string[];
  proposalPlaybook: {
    title: string;
    intro: string;
    footer: string;
    sections: FreelancerProposalPlaybookSection[];
  };
  snapshot: {
    bidUpdates7d: string;
    acceptedBids: string;
    awaitingReplyThreads: string;
    savedByClients: string;
  };
  skills: FreelancerSkillChipVm[];
  conversations: FreelancerConversationVm[];
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
  marketplacePulse: {
    openPublicJobs: number;
    bidsLast24h: number;
    freelancersAvailable: number;
    jobsPostedLast24h: number;
    contractsCompletedLast7d: number;
    hotCategories: Array<{ id: string; name: string; openJobCount: number }>;
  };
};

function formatShortDate(d: Date, locale: AppLocale): string {
  const tag = locale === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric" }).format(d);
}

function buildActivity(bids: FreelancerDashboardBid[], contracts: FreelancerDashboardContract[]): ActivityItem[] {
  const items: ActivityItem[] = [
    ...bids.map((bid) => ({ kind: "bid" as const, at: bid.updatedAt, bid })),
    ...contracts.map((contract) => ({ kind: "contract" as const, at: contract.updatedAt, contract }))
  ];
  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items.slice(0, 8);
}

const linkClass = "nw-link-action text-sm";

const surfaceCard = "nw-card-elevated p-4 md:p-5";

export function FreelancerDashboard({
  locale,
  welcomeTitle,
  subtitle,
  hasProfile,
  profileCompleteness,
  showStrongProfileCard,
  stats,
  heroStats,
  heroTrustPills,
  proposalPlaybook,
  snapshot,
  skills,
  conversations,
  recentBids,
  recentContracts,
  openJobs,
  openTotal,
  attention,
  copy,
  activationChecklist,
  liquidityTips,
  marketplacePulse
}: FreelancerDashboardProps) {
  const activity = buildActivity(recentBids, recentContracts);
  const jobsBrowseRoot = withPublicLocale(locale, "/jobs");
  const wp = (path: string) => withWorkspaceLocale(locale, path) as Route;

  const quickLinks = [
    { label: copy.quickCompleteProfile, href: wp("/freelancer/profile"), icon: UserRound, primary: true as const },
    { label: copy.quickFindJobs, href: jobsBrowseRoot as Route, icon: Compass, primary: true as const },
    { label: copy.quickTrackProposals, href: wp("/freelancer/proposals"), icon: FileText, primary: false as const },
    { label: copy.quickAvailability, href: wp("/freelancer/profile"), icon: CalendarClock, primary: false as const }
  ];

  return (
    <div className="mx-auto max-w-6xl nw-page-stack">
      <FreelancerDashboardHero
        welcomeTitle={welcomeTitle}
        subtitle={subtitle}
        motivation={copy.heroMotivation}
        browseJobsCta={copy.browseJobsCta}
        browseJobsHref={jobsBrowseRoot as Route}
        stats={heroStats}
        trustLine={copy.heroTrustCaption}
        trustPills={heroTrustPills}
      />

      <section
        aria-label={copy.marketplacePulseTitle}
        className="nw-card-trust border-[#3525cd]/14 bg-gradient-to-r from-[#3525cd]/[0.05] to-white px-5 py-4 md:px-6"
      >
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3525cd] shadow-sm ring-1 ring-slate-200/80">
            <Waves className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="nw-type-micro">{copy.marketplacePulseTitle}</p>
            <p className="nw-type-body mt-1 text-slate-700">{copy.marketplacePulseSubtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="nw-chip nw-chip-muted px-3 py-1.5 text-[11px] normal-case tracking-normal md:text-xs">
                {copy.marketplacePulseOpenRoles.split("{{count}}").join(String(marketplacePulse.openPublicJobs))}
              </span>
              <span className="nw-chip nw-chip-muted px-3 py-1.5 text-[11px] normal-case tracking-normal md:text-xs">
                {copy.marketplacePulseBids24h.split("{{count}}").join(String(marketplacePulse.bidsLast24h))}
              </span>
              <span className="nw-chip nw-chip-muted px-3 py-1.5 text-[11px] normal-case tracking-normal md:text-xs">
                {copy.marketplacePulseFreelancers.split("{{count}}").join(String(marketplacePulse.freelancersAvailable))}
              </span>
              {marketplacePulse.jobsPostedLast24h > 0 ? (
                <span className="nw-chip nw-chip-success px-3 py-1.5 text-[11px] normal-case tracking-normal md:text-xs">
                  {copy.marketplacePulseFresh24h.split("{{count}}").join(String(marketplacePulse.jobsPostedLast24h))}
                </span>
              ) : null}
              {marketplacePulse.contractsCompletedLast7d > 0 ? (
                <span className="nw-chip nw-chip-brand px-3 py-1.5 text-[11px] normal-case tracking-normal md:text-xs">
                  {copy.marketplacePulseHires7d.split("{{count}}").join(String(marketplacePulse.contractsCompletedLast7d))}
                </span>
              ) : null}
            </div>
            {marketplacePulse.hotCategories.filter((c) => c.name.trim().length > 0).length > 0 ? (
              <div className="mt-4 border-t border-slate-200/80 pt-3">
                <p className="nw-type-micro">{copy.marketplacePulseCategoriesMicro}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {marketplacePulse.hotCategories
                    .filter((c) => c.name.trim().length > 0 && c.openJobCount > 0)
                    .slice(0, 5)
                    .map((c) => (
                      <Link
                        key={c.id}
                        href={
                          `${jobsBrowseRoot}${jobsBrowseQueryString({
                            keyword: "",
                            city: "",
                            workMode: "",
                            categoryId: c.id,
                            minBudget: "",
                            postedWithinDays: "",
                            page: 1
                          })}` as Route
                        }
                        className="nw-chip-quiet text-[11px]"
                      >
                        {c.name}
                        <span className="ml-1 tabular-nums text-slate-500">({c.openJobCount})</span>
                      </Link>
                    ))}
                </div>
              </div>
            ) : null}
            <p className="nw-type-meta mt-3 font-medium normal-case tracking-normal text-slate-500">
              {copy.marketplacePulseFootnote}
            </p>
          </div>
        </div>
      </section>

      {hasProfile && attention.awaitingReplyThreads > 0 ? (
        <div className="nw-card-trust flex flex-col gap-3 border-amber-200/75 bg-gradient-to-r from-amber-50/95 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-900 ring-1 ring-amber-200/70">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <p className="nw-type-body text-amber-950/90">{copy.nextActionAwaitingBanner}</p>
          </div>
          <Link
            href={wp("/messages")}
            className="nw-cta-primary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm"
          >
            {copy.openMessagesCta}
            <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-7">
          <ActivationChecklistCard
            title={activationChecklist.title}
            intro={activationChecklist.intro}
            steps={activationChecklist.steps}
            allCompleteBanner={activationChecklist.allCompleteBanner}
            variant="journey"
          />
          {showStrongProfileCard ? (
            <div className="nw-card-trust flex flex-col gap-4 border-[#3525cd]/18 bg-gradient-to-br from-[#3525cd]/[0.06] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 md:p-6">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3525cd] shadow-sm ring-1 ring-slate-200/85">
                  <Sparkles className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="nw-type-section">
                    {hasProfile ? copy.profileCardTitleBoost : copy.profileCardTitleNew}
                  </h3>
                  <p className="nw-type-body mt-1">
                    {hasProfile
                      ? copy.profileCardBodyBoost.split("{{percent}}").join(String(profileCompleteness ?? 0))
                      : copy.profileCardBodyNew}
                  </p>
                </div>
              </div>
              <Link
                href={wp("/freelancer/profile")}
                className="nw-cta-primary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                {copy.profileCardCta}
                <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          ) : null}

          <div className={cn(surfaceCard)}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <h2 className="nw-type-micro">{copy.pulseStripTitle}</h2>
                <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
                  <span className="nw-chip nw-chip-muted inline-flex items-center gap-2 px-3 py-2 text-xs normal-case tracking-normal md:text-[13px]">
                    <Target className="h-4 w-4 text-[#3525cd]" aria-hidden />
                    <span className="font-medium text-slate-700">{copy.statActiveBids}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{stats.activeBids}</span>
                  </span>
                  <span className="nw-chip nw-chip-muted inline-flex items-center gap-2 px-3 py-2 text-xs normal-case tracking-normal md:text-[13px]">
                    <Zap className="h-4 w-4 text-amber-600" aria-hidden />
                    <span className="font-medium text-slate-700">{copy.pulseQuotaLabel}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{stats.bidQuotaRemaining}</span>
                  </span>
                  <span className="nw-chip nw-chip-muted inline-flex items-center gap-2 px-3 py-2 text-xs normal-case tracking-normal md:text-[13px]">
                    <UserRound className="h-4 w-4 text-[#3525cd]" aria-hidden />
                    <span className="font-medium text-slate-700">{copy.pulseProfileLabel}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{stats.profileReadiness}</span>
                  </span>
                  <span className="nw-chip nw-chip-muted inline-flex items-center gap-2 px-3 py-2 text-xs normal-case tracking-normal md:text-[13px]">
                    <MessageCircle className="h-4 w-4 text-sky-600" aria-hidden />
                    <span className="font-medium text-slate-700">{copy.pulseAwaitingLabel}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{stats.threadsAwaiting}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="nw-card-inset mt-4 rounded-xl px-4 py-4 md:flex md:flex-wrap md:items-center md:justify-between md:gap-6">
              <div>
                <p className="nw-type-micro">{copy.attentionKicker}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-700">
                  <span>{copy.attentionAccepted.split("{{count}}").join(snapshot.acceptedBids)}</span>
                  <span>{copy.attentionAwaiting.split("{{count}}").join(snapshot.awaitingReplyThreads)}</span>
                  <span>{copy.attentionProposalUpdates.split("{{count}}").join(snapshot.bidUpdates7d)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="nw-type-micro">{copy.quickActionsHeading}</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "nw-card-inset nw-card-inset-hover flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200",
                        item.primary ? "border-[#3525cd]/20 bg-[#3525cd]/[0.06] text-[#3525cd]" : "text-slate-700"
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
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <FreelancerProposalPlaybook
            title={proposalPlaybook.title}
            intro={proposalPlaybook.intro}
            sections={proposalPlaybook.sections}
            footerHint={proposalPlaybook.footer}
          />
          <MarketplaceLiquidityHints
            title={liquidityTips.title}
            intro={liquidityTips.intro}
            bullets={liquidityTips.bullets}
            footer={liquidityTips.footer}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 lg:items-start">
        <section className="lg:col-span-5" aria-label={copy.activityTitle}>
          <div className={surfaceCard}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="nw-type-title">{copy.activityTitle}</h2>
                <p className="nw-type-body mt-1">{copy.activitySubtitle}</p>
              </div>
              <Link href={wp("/freelancer/proposals")} className={linkClass}>
                {copy.activityViewAll}
              </Link>
            </div>

            {!hasProfile && activity.length === 0 ? (
              <div className="mt-6">
                <DashboardEmptyState
                  tone="elevated"
                  kicker={copy.activityEmptyKickerProfile}
                  icon={FileText}
                  title={copy.activityEmptyNoProfileTitle}
                  description={copy.activityEmptyNoProfileBody}
                  action={{ label: copy.profileCardCta, href: wp("/freelancer/profile") }}
                />
              </div>
            ) : hasProfile && activity.length === 0 ? (
              <div className="mt-6 space-y-4">
                <DashboardEmptyState
                  tone="elevated"
                  kicker={copy.activityEmptyKickerTimeline}
                  icon={Inbox}
                  title={copy.activityEmptyNoActivityTitle}
                  description={copy.activityEmptyNoActivityBody}
                  action={{ label: copy.activityEmptyPrimary, href: jobsBrowseRoot as Route }}
                  secondaryAction={{ label: copy.activityEmptySecondary, href: wp("/freelancer/proposals") as Route }}
                />
                {marketplacePulse.hotCategories.filter((c) => c.name.trim().length > 0 && c.openJobCount > 0).length >
                0 ? (
                  <div className="nw-card-inset rounded-xl border-[#3525cd]/12 px-4 py-3">
                    <p className="nw-type-micro">{copy.activityEmptyMomentumTitle}</p>
                    <p className="nw-type-body mt-1 text-slate-600">{copy.activityEmptyMomentumBody}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {marketplacePulse.hotCategories
                        .filter((c) => c.name.trim().length > 0 && c.openJobCount > 0)
                        .slice(0, 5)
                        .map((c) => (
                          <Link
                            key={c.id}
                            href={
                              `${jobsBrowseRoot}${jobsBrowseQueryString({
                                keyword: "",
                                city: "",
                                workMode: "",
                                categoryId: c.id,
                                minBudget: "",
                                postedWithinDays: "",
                                page: 1
                              })}` as Route
                            }
                            className="nw-chip-quiet text-[11px]"
                          >
                            {c.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-slate-100">
                {!hasProfile ? (
                  <li className="pb-4">
                    <div className="nw-card-inset rounded-xl border-amber-200/80 bg-amber-50/60 px-4 py-3 text-xs leading-relaxed text-amber-950">
                      <span className="font-semibold">{copy.profileRequiredBanner}</span>{" "}
                      <span className="text-amber-900/90">{copy.profileRequiredSub}</span>
                    </div>
                  </li>
                ) : null}
                {activity.map((item) =>
                  item.kind === "bid" ? (
                    <li key={`bid-${item.bid.id}`} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                      <div className="min-w-0">
                        <p className="nw-type-micro">{copy.activityKindProposal}</p>
                        <Link
                          href={`${jobsBrowseRoot}/${item.bid.job.id}` as Route}
                          className="mt-0.5 block text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.bid.job.title}
                        </Link>
                        <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal text-slate-600">
                          {item.bid.statusLabel} ·{" "}
                          {formatMoneyAmount(item.bid.bidAmount, item.bid.job.currency, {
                            locale,
                            maximumFractionDigits: normalizeCurrencyCode(item.bid.job.currency) === "IDR" ? 0 : 2
                          })}
                          {item.bid.estimatedDays != null
                            ? ` · ${copy.activityBidEta.replace("{{days}}", String(item.bid.estimatedDays))}`
                            : null}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs tabular-nums text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at, locale)}
                      </time>
                    </li>
                  ) : (
                    <li
                      key={`contract-${item.contract.id}`}
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="nw-type-micro">{copy.activityKindContract}</p>
                        <Link
                          href={`${jobsBrowseRoot}/${item.contract.bid.job.id}` as Route}
                          className="mt-0.5 block text-sm font-semibold text-slate-900 hover:text-[#3525cd]"
                        >
                          {item.contract.bid.job.title}
                        </Link>
                        <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal text-slate-600">
                          {item.contract.statusLabel}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs tabular-nums text-slate-400" dateTime={item.at.toISOString()}>
                        {formatShortDate(item.at, locale)}
                      </time>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-5 sm:space-y-6 lg:col-span-4" aria-label={copy.snapshotTitle}>
          <div className={surfaceCard}>
            <div>
              <h2 className="nw-type-title">{copy.snapshotTitle}</h2>
              <p className="nw-type-body mt-1">{copy.snapshotSubtitle}</p>
            </div>
            <ul className="mt-5 space-y-4">
              <li className="nw-card-inset flex items-start gap-3 rounded-xl p-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/65">
                  <FileText className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="nw-type-micro">{copy.snapshotBidUpdatesLabel}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{snapshot.bidUpdates7d}</p>
                </div>
              </li>
              <li className="nw-card-inset flex items-start gap-3 rounded-xl p-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3525cd]/12 text-[#3525cd] ring-1 ring-[#3525cd]/20">
                  <BadgeCheck className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="nw-type-micro">{copy.snapshotAcceptedLabel}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{snapshot.acceptedBids}</p>
                </div>
              </li>
              <li className="nw-card-inset flex items-start gap-3 rounded-xl p-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-800 ring-1 ring-sky-200/70">
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="nw-type-micro">{copy.snapshotAwaitingLabel}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{snapshot.awaitingReplyThreads}</p>
                </div>
              </li>
              <li className="nw-card-inset flex items-start gap-3 rounded-xl p-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-800 ring-1 ring-rose-200/70">
                  <Briefcase className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="nw-type-micro">{copy.snapshotSavedLabel}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{snapshot.savedByClients}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className={surfaceCard}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="nw-type-title">{copy.conversationsTitle}</h2>
                <p className="nw-type-body mt-0.5">{copy.conversationsSubtitle}</p>
              </div>
              <Link href={wp("/messages")} className={linkClass}>
                {copy.conversationsSeeAll}
              </Link>
            </div>
            {conversations.length === 0 ? (
              <div className="nw-empty-state mt-5 text-center">
                <p className="text-sm font-semibold text-slate-800">{copy.conversationsEmptyTitle}</p>
                <p className="nw-type-body mt-2">{copy.conversationsEmptyBody}</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {conversations.map((c) => (
                  <li key={c.threadId}>
                    <Link
                      href={wp(`/messages?thread=${encodeURIComponent(c.threadId)}`)}
                      className="nw-card-inset nw-card-inset-hover block rounded-xl px-3.5 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                      <p className="nw-type-meta mt-1">{formatShortDate(c.updatedAt, locale)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-5 sm:space-y-6 lg:col-span-3" aria-label={copy.skillsTitle}>
          <div className={surfaceCard}>
            <div>
              <h2 className="nw-type-title">{copy.skillsTitle}</h2>
              <p className="nw-type-body mt-1">{copy.skillsSubtitle}</p>
            </div>
            {skills.length === 0 ? (
              <div className="nw-empty-state mt-5">
                <p className="nw-type-body">{copy.skillsEmptyBody}</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-4">
                {skills.map((s) => {
                  const y = Math.min(10, Math.max(1, s.years ?? 1));
                  const pct = Math.min(100, Math.max(12, Math.round((y / 10) * 100)));
                  const yearsSuffix = copy.skillsYearsShort.replace("{{years}}", String(s.years ?? "—"));
                  return (
                    <li key={s.name}>
                      <div className="flex items-center justify-between gap-2 text-sm font-medium text-slate-900">
                        <span className="truncate">{s.name}</span>
                        <span className="shrink-0 text-xs tabular-nums text-slate-500">{yearsSuffix}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#3525cd] to-indigo-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={surfaceCard}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="nw-type-title">{copy.openJobsTitle}</h2>
                <p className="nw-type-body mt-1">{copy.openJobsSubtitle.split("{{count}}").join(String(openTotal))}</p>
              </div>
              <Link href={jobsBrowseRoot as Route} className={linkClass}>
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
                  action={{ label: copy.openJobsEmptyCta, href: jobsBrowseRoot as Route }}
                />
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {openJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`${jobsBrowseRoot}/${job.id}` as Route}
                      className="nw-card-inset nw-card-inset-hover block rounded-xl px-3.5 py-3"
                    >
                      <p className="text-sm font-semibold leading-snug text-slate-900">{job.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="nw-type-meta font-medium normal-case tracking-normal">
                          {job.workModeLabel}
                          {job.city ? ` · ${job.city}` : ""}
                        </p>
                        {job.shortlistedCount > 0 ? (
                          <span className="nw-chip nw-chip-brand px-2 py-0.5 text-[10px] normal-case tracking-normal">
                            {job.shortlistedCount === 1
                              ? copy.openJobShortlistedOne
                              : copy.openJobShortlistedMany.split("{{count}}").join(String(job.shortlistedCount))}
                          </span>
                        ) : null}
                      </div>
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
