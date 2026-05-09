import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { BidStatus, UserRole } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { isStaffRole } from "@/features/admin/lib/access";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { ReportJobButton } from "@/features/moderation/components/ReportJobButton";
import { loginReturnTo, registerFreelancerReturnToJob } from "@/features/auth/lib/register-intents";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { JobProposalForm } from "@/features/public/components/JobProposalForm";
import { BidDecisionAction } from "@/components/client-jobs/BidDecisionAction";
import { BidConversationAction } from "@/components/client-jobs/BidConversationAction";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoneyAmount } from "@/lib/format-money";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import type { AppLocale } from "@/lib/i18n/types";
import type { Translator } from "@/lib/i18n/create-translator";
import { localizedBidStatusLabel } from "@/lib/i18n/marketplace-status-labels";
import { analyzeCoverLetterCompleteness } from "@/lib/proposals/cover-letter-completeness";
import { OwnerBidMobileCards, type OwnerBidMobileVm } from "@/components/client-jobs/OwnerBidMobileCards";
import {
  NW_BADGE_NEUTRAL,
  NW_CARD,
  NW_CARD_INSET,
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
  const opt = { locale, maximumFractionDigits: 0 } as const;
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
    select: { clientProfile: { select: { userId: true } } }
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

  const returnToThisJob = `/jobs/${job.id}`;
  const postedAtLabel = formatRelativeTime(job.createdAt, t);
  const showFreelancerApplyPanel = !isClientOwner;
  const isFreelancerViewer = Boolean(session && session.role === UserRole.FREELANCER && !isClientOwner);
  const isActiveHiring = job.isFeatured && (!job.featuredUntil || job.featuredUntil.getTime() > Date.now());
  const topSignals: string[] = [];
  if (isActiveHiring) topSignals.push(t("public.jobDetail.signalActiveHiring"));
  if (Date.now() - job.createdAt.getTime() <= 24 * 60 * 60 * 1000) topSignals.push(t("public.jobDetail.signalNewJob"));
  if ((Number(job.budgetMax ?? 0) || Number(job.budgetMin ?? 0)) >= 3000000) topSignals.push(t("public.jobDetail.signalGoodBudgetFit"));
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
          amountLine: formatMoneyAmount(bid.bidAmount, job.currency, { locale, maximumFractionDigits: 0 }),
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

  return (
    <div className={NW_PAGE_WRAP}>
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/jobs" className="font-medium text-[#3525cd] underline-offset-4 hover:underline">
          {t("public.jobs.pageTitle")}
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="font-medium text-slate-900">{t("public.jobDetail.details")}</span>
      </nav>

      <section className={`${NW_CARD} mb-8 p-6 sm:p-8`}>
        {showPostedFeedback ? (
          <div className="mb-6 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-4">
            <p className="text-sm font-semibold text-emerald-900">{t("public.jobDetail.jobPostedBannerTitle")}</p>
            <p className="mt-1 text-xs text-emerald-800">{t("public.jobDetail.jobPostedBannerBody")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <Link href={"/client/jobs?review=needs-review" as Route} className="text-[#3525cd] hover:underline">
                {t("public.jobDetail.jobPostedBannerPrimary")}
              </Link>
              <Link href={"/client/jobs" as Route} className="text-slate-700 hover:underline">
                {t("public.jobDetail.jobPostedBannerSecondary")}
              </Link>
            </div>
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),20rem] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={NW_SECTION_KICKER}>{categoryLabel}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`${NW_BADGE_NEUTRAL} border-emerald-200/80 bg-emerald-50/90 uppercase tracking-wide text-emerald-900`}>
                    {t("public.jobDetail.statusOpen")}
                  </span>
                  {publicBidCount > 0 ? (
                    <span className={`${NW_BADGE_NEUTRAL}`}>
                      {publicBidCount === 1
                        ? t("public.jobDetail.proposalActivity", { count: publicBidCount })
                        : t("public.jobDetail.proposalActivity_plural", { count: publicBidCount })}
                    </span>
                  ) : (
                    <span className={`${NW_BADGE_NEUTRAL} bg-white`}>{t("public.jobDetail.proposalAwaiting")}</span>
                  )}
                  <span className={`${NW_BADGE_NEUTRAL} bg-white`}>{postedAtLabel}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SaveJobButton jobId={job.id} />
                {session && !isClientOwner ? <ReportJobButton jobId={job.id} /> : null}
              </div>
            </div>

            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.125rem] sm:leading-tight">
                {job.title}
              </h1>
              <p className="mt-3 text-xl font-semibold text-slate-900">{budgetLine(job, t, locale)}</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                {[categoryLabel, job.workMode === "REMOTE"
                  ? t("public.filters.workModeRemote")
                  : job.workMode === "ONSITE"
                    ? t("public.filters.workModeOnSite")
                    : job.workMode === "HYBRID"
                      ? t("public.filters.workModeHybrid")
                      : job.workMode,
                jobLocation].filter(Boolean).join(" · ") || t("public.jobDetail.openRole")}
              </p>
            </div>

            {jobSkillNames.length > 0 ? (
              <div>
                <p className={NW_SECTION_KICKER}>{t("public.jobDetail.skillsSectionTitle")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobSkillNames.map((name) => (
                    <span key={name} className={`${NW_BADGE_NEUTRAL} bg-slate-50 px-3 py-1 font-medium text-slate-800`}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {topSignals.slice(0, 5).map((signal) => (
                <span key={signal} className={`${NW_BADGE_NEUTRAL} text-[10px] uppercase tracking-wide`}>
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {showFreelancerApplyPanel ? (
            <aside
              className={`${NW_CARD_INSET} ${NW_SIDEBAR_STICKY} w-full border-slate-200/90 bg-gradient-to-b from-[#faf9ff] to-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] lg:w-[20rem]`}
            >
              <p className={NW_SECTION_KICKER}>{t("public.jobDetail.applyKicker")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{t("public.jobDetail.applyDescription")}</p>
              <div className="mt-3 space-y-2">
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
                      amountHint: t("public.jobDetail.formAmountHint"),
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
                    <Link
                      href={loginReturnTo(returnToThisJob, "submit-bid") as Route}
                      className="nw-cta-primary inline-flex w-full justify-center px-4 py-2.5 text-sm font-semibold"
                    >
                      {t("public.jobDetail.sendProposal")}
                    </Link>
                    <p className="text-xs text-slate-600">{t("public.jobDetail.applyReassurance")}</p>
                  </>
                )}
                {publicBidCount > 0 && publicBidCount <= 3 ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                    {t("public.jobDetail.lowCompetitionHint", { count: publicBidCount })}
                  </p>
                ) : null}
                <Link
                  href={registerFreelancerReturnToJob(job.id) as Route}
                  className="inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  {t("public.jobDetail.registerAsFreelancer")}
                </Link>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
      {job.language !== locale ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <span>
            {job.isTranslated
              ? t("public.jobDetail.translatedFrom", {
                  language: job.translationSource === "id" ? t("public.jobs.langIndonesian") : t("public.jobs.langEnglish")
                })
              : t("public.jobDetail.originalLanguageOnly")}
          </span>
          <div className="flex items-center gap-2 font-semibold">
            <Link href={`/jobs/${job.id}?view=translated` as Route} className="text-[#3525cd] hover:underline">
              {t("public.jobDetail.showTranslated")}
            </Link>
            <span>·</span>
            <Link href={`/jobs/${job.id}?view=original` as Route} className="text-[#3525cd] hover:underline">
              {t("public.jobDetail.showOriginal")}
            </Link>
          </div>
        </div>
      ) : null}
      <p className="mb-8 text-xs font-medium text-slate-600">
        {isClientOwner
          ? t("public.jobDetail.ownerHint")
          : t("public.jobDetail.freelancerHint")}
      </p>

      <div className="space-y-6">
        <section className={`${NW_CARD} p-6 sm:p-7`}>
          <p className={NW_SECTION_KICKER}>{t("public.jobDetail.postingSnapshotTitle")}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold text-slate-500">{t("public.jobDetail.budget")}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{budgetLine(job, t, locale)}</p>
              {bidDeadline ? (
                <p className="mt-2 text-xs text-slate-600">{t("public.jobDetail.proposalsClose", { date: bidDeadline })}</p>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">{t("public.filters.category")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{categoryLabel}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {[job.workMode === "REMOTE"
                  ? t("public.filters.workModeRemote")
                  : job.workMode === "ONSITE"
                    ? t("public.filters.workModeOnSite")
                    : job.workMode === "HYBRID"
                      ? t("public.filters.workModeHybrid")
                      : job.workMode,
                jobLocation || t("public.jobDetail.notSpecified")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {jobSkillNames.length > 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  {t("public.jobDetail.skillsSectionTitle")}: {jobSkillNames.slice(0, 5).join(", ")}
                  {jobSkillNames.length > 5 ? ` +${jobSkillNames.length - 5}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{t("public.jobDetail.skillsEmpty")}</p>
              )}
            </div>
            <div className="rounded-xl border border-[#3525cd]/14 bg-[#3525cd]/[0.04] p-4">
              <p className="text-xs font-semibold text-[#3525cd]">{t("public.jobDetail.client")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {job.clientProfile.displayName}
                {job.clientProfile.companyName ? (
                  <>
                    {" "}
                    <span className="font-normal text-slate-600">({job.clientProfile.companyName})</span>
                  </>
                ) : null}
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                {job.clientProfile.industry ? <p>{job.clientProfile.industry}</p> : null}
                {clientLocation ? <p>{clientLocation}</p> : null}
                {!job.clientProfile.industry && !clientLocation ? (
                  <p className="text-slate-600">{t("public.jobDetail.noClientDetails")}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <Card id="nw-proposal-section" className="scroll-mt-28">
          <CardHeader>
            <CardTitle className="text-base">
              {isClientOwner ? t("public.jobDetail.proposalReview") : t("public.jobDetail.sendProposal")}
            </CardTitle>
            <CardDescription>
              {isClientOwner
                ? acceptedBid
                  ? t("public.jobDetail.ownerAcceptedDesc")
                  : t("public.jobDetail.ownerCompareDesc")
                : t("public.jobDetail.freelancerActionDesc")}
            </CardDescription>
          </CardHeader>
          {isClientOwner ? (
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
                                {formatMoneyAmount(bid.bidAmount, job.currency, { locale, maximumFractionDigits: 0 })}
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
          ) : (
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={loginReturnTo(returnToThisJob, "submit-bid") as Route}
                className="inline-flex justify-center rounded-lg bg-[#3525cd] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
              >
                {t("public.jobDetail.signInToSend")}
              </Link>
              <Link
                href={registerFreelancerReturnToJob(job.id) as Route}
                className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {t("public.jobDetail.registerAsFreelancer")}
              </Link>
            </CardContent>
          )}
        </Card>

        <section className={`${NW_CARD} p-6 sm:p-7`}>
          <p className={NW_SECTION_KICKER}>{t("public.jobDetail.description")}</p>
          <Separator className="mb-4 mt-3" />
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 sm:text-[15px]">{job.description}</p>
          {jobSkillNames.length === 0 ? (
            <p className="mt-4 text-xs text-slate-500">{t("public.jobDetail.skillsEmpty")}</p>
          ) : null}
        </section>
      </div>

      {showFreelancerApplyPanel ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md md:hidden">
          {isFreelancerViewer ? (
            <Link
              href={`#nw-proposal-section`}
              className="nw-cta-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold"
            >
              {t("public.jobDetail.sendProposal")}
            </Link>
          ) : (
            <Link
              href={loginReturnTo(returnToThisJob, "submit-bid") as Route}
              className="nw-cta-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold"
            >
              {t("public.jobDetail.sendProposal")}
            </Link>
          )}
        </div>
      ) : null}
      {showFreelancerApplyPanel ? <div className="h-14 md:h-0" aria-hidden /> : null}
    </div>
  );
}
