import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { BidStatus, ContractStatus, JobStatus, JobVisibility, UserRole } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { isStaffRole } from "@/features/admin/lib/access";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { ReportJobButton } from "@/features/moderation/components/ReportJobButton";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { registerFreelancerReturnToJob } from "@/features/auth/lib/register-intents";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { JobProposalForm } from "@/features/public/components/JobProposalForm";
import { BidDecisionAction } from "@/components/client-jobs/BidDecisionAction";
import { BidConversationAction } from "@/components/client-jobs/BidConversationAction";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import type { AppLocale } from "@/lib/i18n/types";
import type { Translator } from "@/lib/i18n/create-translator";
import { localizedBidStatusLabel } from "@/lib/i18n/marketplace-status-labels";
import { analyzeCoverLetterCompleteness } from "@/lib/proposals/cover-letter-completeness";
import { OwnerBidMobileCards, type OwnerBidMobileVm } from "@/components/client-jobs/OwnerBidMobileCards";
import {
  NW_BADGE_NEUTRAL,
  NW_BADGE_PRIMARY,
  NW_CARD,
  NW_CARD_INSET,
  NW_HERO_WRAP,
  NW_PAGE_WRAP,
  NW_SECTION_KICKER,
  NW_SIDEBAR_STICKY
} from "@/lib/marketplace/nw-classes";

type PageProps = {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ view?: string; from?: string }>;
};

function budgetLine(
  job: {
    budgetMin: unknown;
    budgetMax: unknown;
    currency: string;
    budgetType: string;
  },
  t: Translator,
  locale: AppLocale
): string {
  const min = job.budgetMin;
  const max = job.budgetMax;
  const cur = normalizeCurrencyCode(job.currency);
  const opt = { locale, maximumFractionDigits: cur === "IDR" ? 0 : 2 } as const;
  if (min != null && max != null) {
    return `${formatMoneyAmount(min, job.currency, opt)} – ${formatMoneyAmount(max, job.currency, opt)}`;
  }
  if (min != null)
    return t("public.jobDetail.budgetFrom", { amount: formatMoneyAmount(min, job.currency, opt) });
  if (max != null)
    return t("public.jobDetail.budgetUpTo", { amount: formatMoneyAmount(max, job.currency, opt) });
  return job.budgetType.replace(/_/g, " ");
}

function locationParts(
  parts: { city?: string | null; country?: string | null }[]
): string | null {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const c = p.city?.trim();
    const co = p.country?.trim();
    if (c && !seen.has(`c:${c}`)) {
      seen.add(`c:${c}`);
      out.push(c);
    } else if (co && !seen.has(`co:${co}`)) {
      seen.add(`co:${co}`);
      out.push(co);
    }
  }
  return out.length > 0 ? out.join(" · ") : null;
}

function pickLocalizedJobTitle(
  row: { title: string; language: string; titleEn: string | null; titleId: string | null },
  loc: AppLocale | "source"
): string {
  const source = row.language === "id" ? "id" : "en";
  const target = loc === "source" ? source : loc;
  const pref = target === "id" ? row.titleId : row.titleEn;
  return pref ?? row.title;
}

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "?";
}

function formatRelativeTime(d: Date, t: Translator): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return t("public.jobDetail.timeMinutesAgo", { count: Math.max(1, mins) });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("public.jobDetail.timeHoursAgo", { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t("public.jobDetail.timeDaysAgo", { count: days });
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

function profileStrengthHint(completeness: number | null | undefined, t: Translator): string {
  if (completeness == null) return t("public.jobDetail.profileLimited");
  if (completeness >= 85) return t("public.jobDetail.profileStrong");
  if (completeness >= 60) return t("public.jobDetail.profileModerate");
  return t("public.jobDetail.profileSparse");
}

function bidDecisionHint(status: string, t: Translator): string {
  if (status === BidStatus.SHORTLISTED) return t("public.jobDetail.bidHintShortlisted");
  if (status === BidStatus.SUBMITTED) return t("public.jobDetail.bidHintSubmitted");
  if (status === BidStatus.ACCEPTED) return t("public.jobDetail.bidHintAccepted");
  return t("public.jobDetail.bidHintDefault");
}

function contractStatusHint(status: string, t: Translator): string {
  if (status === "PENDING") return t("public.jobDetail.contractPending");
  if (status === "IN_PROGRESS" || status === "ACTIVE") return t("public.jobDetail.contractInProgress");
  if (status === "COMPLETED") return t("public.jobDetail.contractCompleted");
  return t("public.jobDetail.contractAvailable");
}

function describeOwnerBidConversationState(
  convo:
    | { awaitingReply: boolean; hasMessages: boolean; lastMessageAt: Date | null }
    | undefined,
  t: Translator
) {
  if (!convo) {
    return {
      awaiting: false,
      title: t("public.jobDetail.noConversationYet"),
      detail: t("public.jobDetail.discussInviteDetail"),
      meta: ""
    };
  }

  const rel = convo.lastMessageAt ? formatRelativeTime(convo.lastMessageAt, t) : null;

  if (convo.awaitingReply) {
    return {
      awaiting: true,
      title: t("public.jobDetail.unreadMessage"),
      detail: t("public.jobDetail.waitingReply"),
      meta: rel ? t("public.jobDetail.lastMessage", { time: rel }) : t("public.jobDetail.noMessagesYet")
    };
  }
  if (convo.hasMessages) {
    return {
      awaiting: false,
      title: t("public.jobDetail.conversationActive"),
      detail: t("public.jobDetail.conversationOngoing"),
      meta: rel ? t("public.jobDetail.lastMessage", { time: rel }) : t("public.jobDetail.noMessagesYet")
    };
  }
  return {
    awaiting: false,
    title: t("public.jobDetail.threadActive"),
    detail: t("public.jobDetail.threadReadyDetail"),
    meta: rel ? t("public.jobDetail.lastMessage", { time: rel }) : t("public.jobDetail.noMessagesYet")
  };
}

export default async function JobDetailPage({ params, searchParams }: PageProps) {
  const { t, locale } = await getServerTranslator();
  const { jobId: rawId } = await params;
  const sp = await searchParams;
  const forceOriginal = sp.view === "original";
  const from = sp.from;
  const jobId = rawId?.trim() ?? "";
  if (!jobId) notFound();

  const session = await getSessionFromCookies();
  const jobService = new JobService();
  const job = await jobService.getJobByIdForPublic(jobId, forceOriginal ? "source" : locale, {
    viewerUserId: session?.userId,
    viewerIsStaff: Boolean(session && isStaffRole(session.role))
  });
  if (!job) notFound();

  const jobSkillRows = await db.jobSkill.findMany({
    where: { jobId: job.id },
    select: { skill: { select: { name: true } } }
  });
  const jobSkillNames = [...new Set(jobSkillRows.map((r) => r.skill.name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const owner = await db.job.findFirst({
    where: { id: job.id, deletedAt: null },
    select: { clientProfile: { select: { userId: true, id: true } } }
  });
  const isClientOwner = Boolean(
    session && owner?.clientProfile.userId === session.userId && session.role === UserRole.CLIENT
  );

  const bidRows = isClientOwner
    ? await db.bid.findMany({
        where: { jobId: job.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          bidAmount: true,
          estimatedDays: true,
          coverLetter: true,
          createdAt: true,
          freelancer: { select: { userId: true, fullName: true, username: true } },
          contract: { select: { id: true, status: true } }
        }
      })
    : [];
  const publicBidCount = await db.bid.count({ where: { jobId: job.id } });

  const clientUserId = owner?.clientProfile.userId;
  const clientProfileId = owner?.clientProfile.id;

  const [completedHiresCount, clientOpenJobsCount, relatedJobRows, freelancerSkillRows] = await Promise.all([
    clientUserId
      ? db.contract.count({
          where: { clientUserId, status: ContractStatus.COMPLETED, deletedAt: null }
        })
      : Promise.resolve(0),
    clientProfileId
      ? db.job.count({
          where: {
            clientProfileId,
            deletedAt: null,
            status: JobStatus.OPEN,
            visibility: JobVisibility.PUBLIC,
            moderationHiddenAt: null
          }
        })
      : Promise.resolve(0),
    db.job.findMany({
      where: {
        id: { not: job.id },
        categoryId: job.category.id,
        deletedAt: null,
        status: JobStatus.OPEN,
        visibility: JobVisibility.PUBLIC,
        moderationHiddenAt: null
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        language: true,
        titleEn: true,
        titleId: true,
        budgetMin: true,
        budgetMax: true,
        budgetType: true,
        currency: true,
        workMode: true,
        city: true,
        createdAt: true
      }
    }),
    session?.role === UserRole.FREELANCER && !isClientOwner
      ? db.freelancerSkill.findMany({
          where: { freelancerProfile: { userId: session.userId, deletedAt: null } },
          select: { skill: { select: { name: true } } },
          take: 120
        })
      : Promise.resolve([] as { skill: { name: string } }[])
  ]);

  const overlappingSkills = (() => {
    const mine = new Set(freelancerSkillRows.map((r) => r.skill.name));
    return jobSkillNames.filter((n) => mine.has(n));
  })();

  const competitionKey =
    publicBidCount >= 10
      ? ("high" as const)
      : publicBidCount <= 2
        ? ("low" as const)
        : ("mid" as const);

  const jobThreads = isClientOwner
    ? await db.messageThread.findMany({
        where: {
          type: "JOB",
          jobId: job.id,
          participants: { some: { userId: session!.userId } }
        },
        select: {
          id: true,
          participants: { select: { userId: true } },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true, senderId: true }
          }
        }
      })
    : [];

  const freelancerUserIds = [...new Set(bidRows.map((b) => b.freelancer.userId))];
  const freelancerProfiles = freelancerUserIds.length
    ? await db.freelancerProfile.findMany({
        where: { userId: { in: freelancerUserIds }, deletedAt: null },
        select: { userId: true, city: true, workMode: true, profileCompleteness: true }
      })
    : [];
  const profileMap = new Map(freelancerProfiles.map((p) => [p.userId, p]));

  const conversationMap = new Map<
    string,
    { threadId: string; lastMessageAt: Date | null; awaitingReply: boolean; hasMessages: boolean }
  >();
  if (session) {
    for (const t of jobThreads) {
      const peer = t.participants.find((p) => p.userId !== session.userId);
      if (!peer) continue;
      const last = t.messages[0] ?? null;
      conversationMap.set(peer.userId, {
        threadId: t.id,
        lastMessageAt: last?.createdAt ?? null,
        awaitingReply: Boolean(last && last.senderId !== session.userId),
        hasMessages: Boolean(last)
      });
    }
  }

  const pendingDecisionCount = bidRows.filter((b) => b.status === BidStatus.SUBMITTED).length;
  const shortlistedCount = bidRows.filter((b) => b.status === BidStatus.SHORTLISTED).length;
  const awaitingReplyCount = bidRows.filter((b) => conversationMap.get(b.freelancer.userId)?.awaitingReply).length;
  const acceptedBid = bidRows.find((b) => b.status === BidStatus.ACCEPTED) ?? null;

  const acceptedContractIds = bidRows.map((b) => b.contract?.id).filter((id): id is string => Boolean(id));
  const acceptedContractThreads = isClientOwner && acceptedContractIds.length > 0
    ? await db.messageThread.findMany({
        where: {
          type: "CONTRACT",
          contractId: { in: acceptedContractIds },
          participants: { some: { userId: session!.userId } }
        },
        select: {
          id: true,
          contractId: true
        }
      })
    : [];
  const contractThreadMap = new Map(
    acceptedContractThreads
      .filter((t): t is { id: string; contractId: string } => Boolean(t.contractId))
      .map((t) => [t.contractId, t.id])
  );

  const categoryLabel = job.subcategory
    ? `${job.category.name} · ${job.subcategory.name}`
    : job.category.name;

  const jobLocation = locationParts([{ city: job.city, country: job.country }]);
  const clientLocation = locationParts([
    { city: job.clientProfile.city, country: job.clientProfile.country }
  ]);

  const bidDeadline =
    job.bidDeadline != null
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(job.bidDeadline)
      : null;

  const jobBrowseRoot = withPublicLocale(locale, "/jobs");
  const returnToThisJob = `${jobBrowseRoot}/${job.id}`;
  const postedAtLabel = formatRelativeTime(job.createdAt, t);
  const showFreelancerApplyPanel = !isClientOwner;
  const isFreelancerViewer = Boolean(session && session.role === UserRole.FREELANCER && !isClientOwner);
  const isActiveHiring = job.isFeatured && (!job.featuredUntil || job.featuredUntil.getTime() > Date.now());
  const topSignals: string[] = [];
  if (isActiveHiring) topSignals.push(t("public.jobDetail.signalActiveHiring"));
  if (Date.now() - job.createdAt.getTime() <= 24 * 60 * 60 * 1000) topSignals.push(t("public.jobDetail.signalNewJob"));
  const maxBudgetSignal = Number(job.budgetMax ?? 0) || Number(job.budgetMin ?? 0);
  const jobCur = normalizeCurrencyCode(job.currency);
  if (
    (jobCur === "IDR" && maxBudgetSignal >= 3_000_000) ||
    (jobCur === "USD" && maxBudgetSignal >= 200)
  )
    topSignals.push(t("public.jobDetail.signalGoodBudgetFit"));
  if (job.city && job.workMode !== "REMOTE") topSignals.push(t("public.jobDetail.signalNearbyProject"));
  if (job.description.trim().length <= 220) topSignals.push(t("public.jobDetail.signalQuickBrief"));
  if (publicBidCount > 0 && publicBidCount <= 3) topSignals.push(t("public.jobDetail.signalLowCompetition"));
  if (topSignals.length === 0) topSignals.push(t("public.jobDetail.signalReviewWorth"));
  const showPostedFeedback = isClientOwner && from === "job-posted";

  const ownerBidMobileVms: OwnerBidMobileVm[] = isClientOwner
    ? bidRows.map((bid) => {
        const profile = profileMap.get(bid.freelancer.userId);
        const convo = conversationMap.get(bid.freelancer.userId);
        const cover = analyzeCoverLetterCompleteness(bid.coverLetter);
        const pct = cover.pct;
        const completenessFine = pct >= 80;
        const completenessThin = pct <= 45;
        const locLine =
          [profile?.city, profile?.workMode].filter(Boolean).join(" · ") || t("public.jobDetail.notSpecified");
        let locFootnote: string | null = null;
        if (job.city && profile?.city) {
          locFootnote =
            job.city.toLowerCase() === profile.city.toLowerCase()
              ? t("public.jobDetail.locationRelevant")
              : t("public.jobDetail.locationDifferent");
        }
        const isAcceptedRow = bid.status === BidStatus.ACCEPTED;
        const mutedAfter = Boolean(acceptedBid) && !isAcceptedRow;
        const covLines = describeOwnerBidConversationState(convo, t);
        const profilePct =
          profile?.profileCompleteness != null
            ? t("public.jobDetail.profileCompletenessPct", {
                percent: profile.profileCompleteness
              })
            : t("public.jobDetail.notAvailable");

        return {
          bidId: bid.id,
          jobId: job.id,
          freelancerName: bid.freelancer.fullName,
          freelancerUsername: bid.freelancer.username,
          freelancerUserId: bid.freelancer.userId,
          amountLine: formatMoneyAmount(bid.bidAmount, job.currency, {
            locale,
            maximumFractionDigits: normalizeCurrencyCode(job.currency) === "IDR" ? 0 : 2
          }),
          daysLine:
            bid.estimatedDays != null ? t("public.jobDetail.dayTimeline", { count: bid.estimatedDays }) : null,
          completenessPct: pct,
          completenessFine,
          completenessThin,
          profilePctLine: profilePct,
          profileStrengthHint: profileStrengthHint(profile?.profileCompleteness ?? null, t),
          locationLine: locLine,
          locationFootnote: locFootnote,
          bidStatusDisplay: localizedBidStatusLabel(bid.status, t),
          bidDecisionHint: bidDecisionHint(bid.status, t),
          submittedLine: `${t("public.jobDetail.submitted")} · ${new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric"
          }).format(bid.createdAt)}`,
          isAccepted: isAcceptedRow,
          isMutedAfterAccept: mutedAfter,
          convoThreadId: convo?.threadId ?? null,
          conversationAwaitingReply: covLines.awaiting,
          conversationTitle: covLines.title,
          conversationDetail: covLines.detail,
          conversationMeta: covLines.meta,
          bidStatusRaw: bid.status
        };
      })
    : [];

  const workModeLabel =
    job.workMode === "REMOTE"
      ? t("public.filters.workModeRemote")
      : job.workMode === "ONSITE"
        ? t("public.filters.workModeOnSite")
        : job.workMode === "HYBRID"
          ? t("public.filters.workModeHybrid")
          : job.workMode;

  const clientVerified = job.clientProfile.verificationStatus === "VERIFIED";
  const clientVerificationPending = job.clientProfile.verificationStatus === "PENDING";
  const memberSinceLabel = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric"
  }).format(job.clientProfile.createdAt);
  const competitionLabel =
    competitionKey === "high"
      ? t("public.jobDetail.competitionHigh")
      : competitionKey === "low"
        ? t("public.jobDetail.competitionLow")
        : t("public.jobDetail.competitionMid");

  const proposalAnchor = `${returnToThisJob}#nw-proposal-section` as Route;

  const profileUpdatedLabel = formatRelativeTime(job.clientProfile.updatedAt, t);
  const clientReviews = job.clientProfile.reviewCount;
  const clientRating = job.clientProfile.averageReviewRating;

  return (
    <div className={`${NW_PAGE_WRAP} nw-page-stack`}>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={jobBrowseRoot as Route} className="font-medium text-[#3525cd] underline-offset-4 hover:underline">
          {t("public.jobs.pageTitle")}
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="font-medium text-slate-900">{t("public.jobDetail.details")}</span>
      </nav>

      <header className={`${NW_HERO_WRAP} relative mb-5 p-5 sm:p-6`}>
        <div
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#3525cd]/35 to-transparent"
          aria-hidden
        />
        {showPostedFeedback ? (
          <div className="mb-5 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3.5">
            <p className="text-sm font-bold text-emerald-900">{t("public.jobDetail.jobPostedBannerTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">{t("public.jobDetail.jobPostedBannerBody")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
              <Link href={"/client/jobs?review=needs-review" as Route} className="text-[#3525cd] hover:underline">
                {t("public.jobDetail.jobPostedBannerPrimary")}
              </Link>
              <Link href={"/client/jobs" as Route} className="text-slate-700 hover:underline">
                {t("public.jobDetail.jobPostedBannerSecondary")}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/60 pb-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className={`${NW_BADGE_NEUTRAL} border-emerald-200/90 bg-emerald-50 font-bold uppercase tracking-wide text-emerald-900`}>
              {t("public.jobDetail.statusOpen")}
            </span>
            {isActiveHiring ? (
              <span className={`${NW_BADGE_PRIMARY} font-bold uppercase tracking-wide`}>
                {t("public.jobDetail.featuredOpportunity")}
              </span>
            ) : null}
            {publicBidCount > 0 ? (
              <span className={`${NW_BADGE_NEUTRAL} font-semibold`}>
                {publicBidCount === 1
                  ? t("public.jobDetail.proposalActivity", { count: publicBidCount })
                  : t("public.jobDetail.proposalActivity_plural", { count: publicBidCount })}
              </span>
            ) : (
              <span className={`${NW_BADGE_NEUTRAL} bg-white/90`}>{t("public.jobDetail.proposalAwaiting")}</span>
            )}
            <span className={`${NW_BADGE_NEUTRAL} inline-flex items-center gap-1 bg-white/90 font-medium`}>
              <Clock3 className="h-3 w-3 text-slate-400" aria-hidden />
              {postedAtLabel}
            </span>
            <span className={`${NW_BADGE_NEUTRAL} font-semibold text-slate-800`}>{competitionLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SaveJobButton jobId={job.id} />
            {session && !isClientOwner ? <ReportJobButton jobId={job.id} /> : null}
          </div>
        </div>

        <div className="mt-5 min-w-0">
          <p className={`${NW_SECTION_KICKER} text-[#3525cd]/90`}>{t("public.jobDetail.heroKicker")}</p>
          <h1 className="nw-type-display mt-2 text-balance text-slate-950 sm:text-[2rem]">
            {job.title}
          </h1>
          <p className="mt-3 text-xl font-semibold tabular-nums tracking-tight text-[#3525cd] sm:text-[1.45rem]">
            {budgetLine(job, t, locale)}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {[workModeLabel, jobLocation || t("public.jobDetail.notSpecified")].join(" · ")}
            </span>
            <span className="text-slate-300">·</span>
            <span>{categoryLabel}</span>
          </p>
          {bidDeadline ? (
            <p className="nw-type-meta mt-1.5 font-medium text-amber-800">{t("public.jobDetail.proposalsClose", { date: bidDeadline })}</p>
          ) : null}
        </div>

        {jobSkillNames.length > 0 ? (
          <div className="mt-5">
            <p className={NW_SECTION_KICKER}>{t("public.jobDetail.preferredSkillsTitle")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jobSkillNames.map((name) => (
                <span key={name} className="nw-chip nw-chip-muted normal-case tracking-normal">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {topSignals.slice(0, 5).map((signal) => (
            <span key={signal} className="nw-chip nw-chip-muted normal-case tracking-normal">
              {signal}
            </span>
          ))}
        </div>

        {showFreelancerApplyPanel && !isFreelancerViewer ? (
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/60 pt-5 sm:flex-row sm:flex-wrap lg:hidden">
            <AuthAwareCtaLink
              href={proposalAnchor}
              intent="submit-bid"
              unauthenticatedTo="register"
              registerRoleHint="freelancer"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
            >
              {t("public.jobDetail.sendProposal")}
            </AuthAwareCtaLink>
            <Link
              href={proposalAnchor}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              {t("public.jobDetail.ctaDiscussProject")}
            </Link>
          </div>
        ) : null}
      </header>

      {job.language !== locale ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700">
          <span>
            {job.isTranslated
              ? t("public.jobDetail.translatedFrom", {
                  language: job.translationSource === "id" ? t("public.jobs.langIndonesian") : t("public.jobs.langEnglish")
                })
              : t("public.jobDetail.originalLanguageOnly")}
          </span>
          <div className="flex items-center gap-2 font-bold">
            <Link href={`${returnToThisJob}?view=translated` as Route} className="text-[#3525cd] hover:underline">
              {t("public.jobDetail.showTranslated")}
            </Link>
            <span>·</span>
            <Link href={`${returnToThisJob}?view=original` as Route} className="text-[#3525cd] hover:underline">
              {t("public.jobDetail.showOriginal")}
            </Link>
          </div>
        </div>
      ) : null}
      <p className="mb-6 text-xs font-semibold leading-relaxed text-slate-600">
        {isClientOwner ? t("public.jobDetail.ownerHint") : t("public.jobDetail.freelancerHint")}
      </p>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),minmax(280px,340px)] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
          <section className={`${NW_CARD} overflow-hidden p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className={NW_SECTION_KICKER}>{t("public.jobDetail.clientTrustTitle")}</p>
                <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal">{t("public.jobDetail.clientTrustLead")}</p>
              </div>
              <Sparkles className="hidden h-8 w-8 text-[#3525cd]/25 sm:block" aria-hidden />
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-base font-extrabold text-slate-800"
                aria-hidden
              >
                {clientInitials(job.clientProfile.displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="nw-type-title text-slate-950">{job.clientProfile.displayName}</p>
                  {clientVerified ? (
                    <span className="nw-chip nw-chip-brand inline-flex items-center gap-1 normal-case tracking-normal">
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      {t("public.jobs.verifiedClient")}
                    </span>
                  ) : null}
                  {clientVerificationPending && !clientVerified ? (
                    <span className="nw-chip inline-flex border-amber-200 bg-amber-50 text-amber-900 normal-case tracking-normal">
                      {t("public.jobDetail.clientVerificationPending")}
                    </span>
                  ) : null}
                </div>
                {job.clientProfile.companyName ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                    {job.clientProfile.companyName}
                  </p>
                ) : null}
                <div className="mt-2 space-y-1 text-[13px] font-medium text-slate-600">
                  {job.clientProfile.industry ? <p>{job.clientProfile.industry}</p> : null}
                  {clientLocation ? <p>{clientLocation}</p> : null}
                  {!job.clientProfile.industry && !clientLocation ? (
                    <p>{t("public.jobDetail.noClientDetails")}</p>
                  ) : null}
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="nw-card-inset px-3 py-2.5">
                    <dt className="nw-type-micro">
                      {t("public.jobDetail.clientMemberSince")}
                    </dt>
                    <dd className="nw-type-body-strong mt-0.5 text-slate-900">{memberSinceLabel}</dd>
                  </div>
                  <div className="nw-card-inset px-3 py-2.5">
                    <dt className="nw-type-micro">
                      {t("public.jobDetail.clientProfileActivity")}
                    </dt>
                    <dd className="nw-type-body-strong mt-0.5 text-slate-900">{profileUpdatedLabel}</dd>
                  </div>
                  <div className="nw-card-inset px-3 py-2.5">
                    <dt className="nw-type-micro">
                      {t("public.jobDetail.clientCompletedHiresLabel")}
                    </dt>
                    <dd className="nw-type-body-strong mt-0.5 text-slate-900">{completedHiresCount}</dd>
                  </div>
                  <div className="nw-card-inset px-3 py-2.5">
                    <dt className="nw-type-micro">
                      {t("public.jobDetail.clientOpenRolesLabel")}
                    </dt>
                    <dd className="nw-type-body-strong mt-0.5 text-slate-900">{clientOpenJobsCount}</dd>
                  </div>
                </dl>
                {clientReviews > 0 && clientRating != null ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    {t("public.jobDetail.clientReviewsLine", {
                      rating: clientRating.toFixed(1),
                      count: clientReviews
                    })}
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-slate-500">{t("public.jobDetail.clientReviewsNone")}</p>
                )}
              </div>
            </div>
          </section>

          {isFreelancerViewer && overlappingSkills.length > 0 ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3.5 py-2.5">
              <p className="nw-type-micro text-emerald-900">{t("public.jobDetail.skillOverlapTitle")}</p>
              <p className="nw-type-body-strong mt-1 text-emerald-950">
                {t("public.jobDetail.skillOverlapLine", {
                  count: overlappingSkills.length,
                  skills: overlappingSkills.slice(0, 6).join(", ")
                })}
              </p>
            </div>
          ) : null}

          {isFreelancerViewer && overlappingSkills.length === 0 && jobSkillNames.length > 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
              {t("public.jobDetail.skillOverlapNone")}
            </p>
          ) : null}

        {isClientOwner ? (
        <Card id="nw-proposal-section" className="scroll-mt-28 border-slate-200/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("public.jobDetail.proposalReview")}</CardTitle>
            <CardDescription>
              {acceptedBid ? t("public.jobDetail.ownerAcceptedDesc") : t("public.jobDetail.ownerCompareDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {!acceptedBid && (pendingDecisionCount > 0 || awaitingReplyCount > 0) ? (
                <div className="rounded-md border border-amber-200 bg-amber-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    {t("public.jobDetail.ownerActionNeeded")}
                  </p>
                  <p className="mt-1 text-sm text-amber-900">{t("public.jobDetail.ownerActionSummary")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <Link href={"/messages" as Route} className="text-[#433C93] hover:underline">
                      {t("public.jobDetail.openMessages")}
                    </Link>
                    <Link href={"/client/jobs" as Route} className="text-slate-700 hover:underline">
                      {t("public.jobDetail.reviewAllJobs")}
                    </Link>
                  </div>
                </div>
              ) : null}
              {acceptedBid ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{t("public.jobDetail.hiredFreelancer")}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-emerald-900">{acceptedBid.freelancer.fullName}</p>
                    <span className="text-xs text-emerald-700">@{acceptedBid.freelancer.username}</span>
                    <span className="text-xs text-emerald-700">
                      {acceptedBid.contract
                        ? t("public.jobDetail.contractStatusLine", { status: acceptedBid.contract.status.replace(/_/g, " ").toLowerCase() })
                        : t("public.jobDetail.contractSetupPending")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">
                    {acceptedBid.contract ? contractStatusHint(acceptedBid.contract.status, t) : t("public.jobDetail.openContractWhenAvailable")}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                    {acceptedBid.contract ? (
                      <a
                        href={`/api/contracts/${acceptedBid.contract.id}`}
                        className="text-[#433C93] hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("public.jobDetail.openContract")}
                      </a>
                    ) : null}
                    {acceptedBid.contract && contractThreadMap.get(acceptedBid.contract.id) ? (
                      <Link
                        href={`/messages?thread=${contractThreadMap.get(acceptedBid.contract.id)}` as Route}
                        className="text-slate-700 hover:underline"
                      >
                        {t("public.jobDetail.openConversation")}
                      </Link>
                    ) : (
                      <Link
                        href={"/messages" as Route}
                        className="text-slate-700 hover:underline"
                      >
                        {t("public.jobDetail.continueCoordination")}
                      </Link>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.pendingDecision")}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{pendingDecisionCount}</p>
                  <p className="text-[11px] text-slate-500">{t("public.jobDetail.pendingDecisionHint")}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.shortlisted")}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{shortlistedCount}</p>
                  <p className="text-[11px] text-slate-500">{t("public.jobDetail.shortlistedHint")}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.totalBids")}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{bidRows.length}</p>
                  <p className="text-[11px] text-slate-500">{t("public.jobDetail.totalBidsHint")}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.awaitingReply")}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{awaitingReplyCount}</p>
                  <p className="text-[11px] text-slate-500">{t("public.jobDetail.awaitingReplyHint")}</p>
                </div>
              </div>

              {bidRows.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{t("public.jobDetail.proposalsEmptyTitle")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("public.jobDetail.proposalsEmptyWhy")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{t("public.jobDetail.proposalsEmptyNext")}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <Link href={"/client/jobs?review=needs-review" as Route} className="text-[#433C93] hover:underline">
                      {t("public.jobDetail.proposalsEmptyPrimary")}
                    </Link>
                    <Link href={"/client/jobs" as Route} className="text-slate-700 hover:underline">
                      {t("public.jobDetail.proposalsEmptySecondary")}
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <OwnerBidMobileCards
                    locale={locale}
                    bids={ownerBidMobileVms}
                    copy={{
                      compareKicker: t("public.jobDetail.ownerReviewMobileKicker"),
                      priceLabel: t("public.jobDetail.tablePrice"),
                      completenessLabel: t("public.jobDetail.tableProposalCompleteness"),
                      proposalFine: t("public.jobDetail.proposalCompletenessFine"),
                      proposalMedium: t("public.jobDetail.proposalCompletenessOk"),
                      proposalThin: t("public.jobDetail.proposalCompletenessThin"),
                      profileLabel: t("public.jobDetail.tableProfileStrength"),
                      locationLabel: t("public.jobDetail.tableLocationMode"),
                      discussHint: t("public.jobDetail.discussProminentHint"),
                      quickActionsLabel: t("public.jobDetail.discussProminentLabel"),
                      reportSecondaryNote: t("public.jobDetail.reportSecondaryNote"),
                      browseFreelancerLabel: t("public.jobDetail.mobileBrowseFreelancer"),
                      navigateJobLabel: t("public.jobDetail.mobileBackToJob"),
                      hiredLabel: t("public.jobDetail.hired")
                    }}
                    freelancerProfileAriaName={t("public.jobDetail.freelancerProfileAria")}
                  />
                  <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                    <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableFreelancer")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tablePrice")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableProposalCompleteness")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableProfileStrength")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableLocationMode")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableConversation")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableStatus")}</th>
                          <th className="px-3 py-2.5">{t("public.jobDetail.tableSafety")}</th>
                          <th className="px-3 py-2.5 text-right">{t("public.jobDetail.tableNextAction")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                      {bidRows.map((bid) => {
                        const profile = profileMap.get(bid.freelancer.userId);
                        const convo = conversationMap.get(bid.freelancer.userId);
                        const completeness = analyzeCoverLetterCompleteness(bid.coverLetter);
                        const isAccepted = bid.status === BidStatus.ACCEPTED;
                        const isMutedAfterAccept = Boolean(acceptedBid) && !isAccepted;
                        return (
                          <tr
                            key={bid.id}
                            className={[
                              isAccepted ? "bg-emerald-50/40" : "",
                              !acceptedBid && bid.status === BidStatus.SUBMITTED ? "bg-amber-50/30" : "",
                              isMutedAfterAccept ? "opacity-60" : ""
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">{bid.freelancer.fullName}</p>
                                {isAccepted ? (
                                  <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    {t("public.jobDetail.hired")}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-slate-500">@{bid.freelancer.username}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {t("public.jobDetail.submitted")}{" "}
                                {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
                                  bid.createdAt
                                )}
                              </p>
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-900">
                                {formatMoneyAmount(bid.bidAmount, job.currency, {
                                  locale,
                                  maximumFractionDigits: normalizeCurrencyCode(job.currency) === "IDR" ? 0 : 2
                                })}
                              </p>
                              {bid.estimatedDays != null ? (
                                <p className="text-xs text-slate-500">{t("public.jobDetail.dayTimeline", { count: bid.estimatedDays })}</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              <p className="text-base font-semibold tabular-nums text-slate-900">{completeness.pct}%</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {completeness.pct >= 80
                                  ? t("public.jobDetail.proposalCompletenessFine")
                                  : completeness.pct <= 45
                                    ? t("public.jobDetail.proposalCompletenessThin")
                                    : t("public.jobDetail.proposalCompletenessOk")}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {profile?.profileCompleteness != null ? (
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {t("public.jobDetail.profileCompletenessPct", {
                                      percent: profile.profileCompleteness
                                    })}
                                  </p>
                                  <p className="text-[11px] text-slate-500">{profileStrengthHint(profile.profileCompleteness, t)}</p>
                                </div>
                              ) : (
                                <span className="text-slate-500">{t("public.jobDetail.notAvailable")}</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              <div>
                                <p>{[profile?.city, profile?.workMode].filter(Boolean).join(" · ") || t("public.jobDetail.notSpecified")}</p>
                                {job.city && profile?.city ? (
                                  <p className="text-[11px] text-slate-500">
                                    {job.city.toLowerCase() === profile.city.toLowerCase()
                                      ? t("public.jobDetail.locationRelevant")
                                      : t("public.jobDetail.locationDifferent")}
                                  </p>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {!convo ? (
                                <div className="text-slate-500">
                                  <p>{t("public.jobDetail.noConversationYet")}</p>
                                  <div className="mt-1">
                                    <BidConversationAction
                                      threadId={null}
                                      jobId={job.id}
                                      freelancerUserId={bid.freelancer.userId}
                                      prominence="primary"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className={convo.awaitingReply ? "text-[#433C93]" : "text-slate-600"}>
                                  <p className="font-medium">
                                    {convo.awaitingReply
                                      ? t("public.jobDetail.unreadMessage")
                                      : convo.hasMessages
                                        ? t("public.jobDetail.conversationActive")
                                        : t("public.jobDetail.threadActive")}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {convo.awaitingReply ? t("public.jobDetail.waitingReply") : t("public.jobDetail.conversationOngoing")}
                                  </p>
                                  <p className="text-slate-500">
                                    {convo.lastMessageAt
                                      ? t("public.jobDetail.lastMessage", { time: formatRelativeTime(convo.lastMessageAt, t) })
                                      : t("public.jobDetail.noMessagesYet")}
                                  </p>
                                  <div className="mt-1">
                                    <BidConversationAction
                                      threadId={convo.threadId}
                                      jobId={job.id}
                                      freelancerUserId={bid.freelancer.userId}
                                      prominence="primary"
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div>
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                  {localizedBidStatusLabel(bid.status, t)}
                                </span>
                                <p className="mt-1 text-[11px] text-slate-500">{bidDecisionHint(bid.status, t)}</p>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <ModerationReportButton
                                intent="bid"
                                variant="text"
                                density="compact"
                                target={{ subjectType: "BID", subjectBidId: bid.id }}
                                className="text-slate-500"
                              />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <BidDecisionAction bidId={bid.id} currentStatus={bid.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href={"/client/jobs" as Route} className="font-semibold text-[#433C93] hover:underline">
                  {t("public.jobDetail.reviewAllJobs")}
                </Link>
                <Link href={"/messages" as Route} className="font-semibold text-slate-600 hover:underline">
                  {t("public.jobDetail.openMessages")}
                </Link>
              </div>
            </CardContent>
        </Card>
        ) : null}

          <section className={`${NW_CARD} overflow-hidden p-5 sm:p-6`}>
          <div className="border-b border-slate-100 pb-4">
            <p className={NW_SECTION_KICKER}>{t("public.jobDetail.aboutProjectTitle")}</p>
            <h2 className="nw-type-title mt-1 text-slate-950">{t("public.jobDetail.whatClientNeedsTitle")}</h2>
            <p className="nw-type-meta mt-1 font-medium normal-case tracking-normal">{t("public.jobDetail.whatClientNeedsLead")}</p>
          </div>
          <Separator className="my-5" />
          <p className="nw-type-body whitespace-pre-wrap text-slate-800 sm:text-[15px]">{job.description}</p>
          {jobSkillNames.length === 0 ? (
            <p className="mt-6 text-xs font-medium text-slate-500">{t("public.jobDetail.skillsEmpty")}</p>
          ) : null}
        </section>

        {relatedJobRows.length > 0 ? (
          <section className={`${NW_CARD} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className={NW_SECTION_KICKER}>{t("public.jobDetail.relatedJobsTitle")}</p>
                <p className="nw-type-body-strong mt-1 text-slate-800">{t("public.jobDetail.relatedJobsSubtitle")}</p>
              </div>
              <Users className="h-6 w-6 text-slate-300" aria-hidden />
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {relatedJobRows.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`${jobBrowseRoot}/${row.id}` as Route}
                    className="group flex flex-col gap-1 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-lg sm:px-2"
                  >
                    <span className="min-w-0 text-[13px] font-semibold text-slate-900 group-hover:text-[#3525cd]">
                      {pickLocalizedJobTitle(row, forceOriginal ? "source" : locale)}
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold tabular-nums text-slate-600">
                      {budgetLine(
                        {
                          budgetMin: row.budgetMin,
                          budgetMax: row.budgetMax,
                          currency: row.currency,
                          budgetType: row.budgetType
                        },
                        t,
                        locale
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </div>

        {showFreelancerApplyPanel ? (
          <aside
            id="nw-proposal-section"
            className={`${NW_CARD_INSET} ${NW_SIDEBAR_STICKY} mt-8 w-full space-y-3.5 border-slate-200/90 p-4 shadow-sm lg:mt-0`}
          >
            <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
              <p className={NW_SECTION_KICKER}>{t("public.jobDetail.sidebarOpportunityKicker")}</p>
              <div className="mt-2 space-y-1.5 text-[12px] font-semibold text-slate-700">
                <p className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Users className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                    {t("public.jobDetail.sidebarStatProposals")}
                  </span>
                  <span className="tabular-nums text-slate-900">{publicBidCount}</span>
                </p>
                <p className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {t("public.jobDetail.sidebarStatPosted")}
                  </span>
                  <span className="text-right text-slate-900">{postedAtLabel}</span>
                </p>
              </div>
            </div>

            <p className="nw-type-section text-slate-900">{t("public.jobDetail.applyKicker")}</p>
            <p className="nw-type-body font-medium">{t("public.jobDetail.applyDescription")}</p>

            <div className="flex flex-col gap-2">
              {isFreelancerViewer ? (
                <JobProposalForm
                  jobId={job.id}
                  currency={job.currency}
                  userId={session?.userId ?? null}
                  clientUserId={owner?.clientProfile.userId ?? null}
                  labels={{
                    title: t("public.jobDetail.formGuideTitle"),
                    subtitle: t("public.jobDetail.formGuideSubtitle"),
                    guidanceKicker: t("public.jobDetail.formGuidanceKicker"),
                    guidanceIntro: t("public.jobDetail.formGuidanceIntro"),
                    guidanceBullets: [
                      t("public.jobDetail.formGuidanceBullet1"),
                      t("public.jobDetail.formGuidanceBullet2"),
                      t("public.jobDetail.formGuidanceBullet3"),
                      t("public.jobDetail.formGuidanceBullet4"),
                      t("public.jobDetail.formGuidanceBullet5"),
                      t("public.jobDetail.formGuidanceBullet6")
                    ],
                    introLabel: t("public.jobDetail.formIntroLabel"),
                    introHint: t("public.jobDetail.formIntroHint"),
                    introPlaceholder: t("public.jobDetail.formIntroPlaceholder"),
                    experienceLabel: t("public.jobDetail.formExperienceLabel"),
                    experienceHint: t("public.jobDetail.formExperienceHint"),
                    experiencePlaceholder: t("public.jobDetail.formExperiencePlaceholder"),
                    approachLabel: t("public.jobDetail.formApproachLabel"),
                    approachHint: t("public.jobDetail.formApproachHint"),
                    approachPlaceholder: t("public.jobDetail.formApproachPlaceholder"),
                    timelineLabel: t("public.jobDetail.formTimelineLabel"),
                    timelineHint: t("public.jobDetail.formTimelineHint"),
                    timelinePlaceholder: t("public.jobDetail.formTimelinePlaceholder"),
                    quoteSectionKicker: t("public.jobDetail.formQuoteSectionKicker"),
                    amountLabel: t("public.jobDetail.formAmountLabel"),
                    amountHint: t("public.jobDetail.formAmountHint", {
                      currency: normalizeCurrencyCode(job.currency)
                    }),
                    daysLabel: t("public.jobDetail.formDaysLabel"),
                    daysHint: t("public.jobDetail.formDaysHint"),
                    reassurance: t("public.jobDetail.applyReassurance"),
                    firstStep: t("public.jobDetail.formFirstStep"),
                    submitCtaSubtitle: t("public.jobDetail.formSubmitCtaSubtitle"),
                    send: t("public.jobDetail.sendProposal"),
                    sending: t("public.jobDetail.sendingProposal"),
                    loadingOverlay: t("public.jobDetail.sendingProposalOverlay"),
                    success: t("public.jobDetail.proposalSent"),
                    genericError: t("public.jobDetail.proposalError"),
                    networkError: t("public.jobDetail.proposalNetworkError"),
                    draftRestored: t("public.jobDetail.draftRestored"),
                    savedLocally: t("public.jobDetail.savedLocally"),
                    clearDraft: t("public.jobDetail.clearDraft"),
                    draftCleared: t("public.jobDetail.draftCleared"),
                    openConversation: t("public.jobDetail.openConversation"),
                    conversationHint: t("public.jobDetail.afterProposalHint"),
                    conversationError: t("public.jobDetail.conversationUnavailableHint")
                  }}
                />
              ) : (
                <>
                  <AuthAwareCtaLink
                    href={proposalAnchor}
                    intent="submit-bid"
                    unauthenticatedTo="register"
                    registerRoleHint="freelancer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
                  >
                    {t("public.jobDetail.sendProposal")}
                  </AuthAwareCtaLink>
                  <p className="text-xs text-slate-600">{t("public.jobDetail.applyReassurance")}</p>
                  <Link
                    href={proposalAnchor}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    {t("public.jobDetail.ctaDiscussProject")}
                  </Link>
                  <p className="text-[11px] font-medium text-slate-500">{t("public.jobDetail.ctaDiscussHint")}</p>
                </>
              )}
              {publicBidCount > 0 && publicBidCount <= 3 ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                  {t("public.jobDetail.lowCompetitionHint", { count: publicBidCount })}
                </p>
              ) : null}
              <Link
                href={registerFreelancerReturnToJob(job.id, locale) as Route}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
              >
                {t("public.jobDetail.registerAsFreelancer")}
              </Link>
            </div>
          </aside>
        ) : null}
      </div>

      {showFreelancerApplyPanel ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.14)] md:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            {isFreelancerViewer ? (
              <Link
                href="#nw-proposal-section"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
              >
                {t("public.jobDetail.sendProposal")}
              </Link>
            ) : (
              <AuthAwareCtaLink
                href={proposalAnchor}
                intent="submit-bid"
                unauthenticatedTo="register"
                registerRoleHint="freelancer"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
              >
                {t("public.jobDetail.sendProposal")}
              </AuthAwareCtaLink>
            )}
            <Link
              href={proposalAnchor}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-900"
            >
              {t("public.jobDetail.ctaDiscussShort")}
            </Link>
          </div>
        </div>
      ) : null}
      {showFreelancerApplyPanel ? <div className="h-14 md:h-0" aria-hidden /> : null}
    </div>
  );
}
