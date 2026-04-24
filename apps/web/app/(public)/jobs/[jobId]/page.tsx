import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { BidStatus, UserRole } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { loginReturnTo, registerFreelancerReturnToJob } from "@/features/auth/lib/register-intents";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { BidDecisionAction } from "@/components/client-jobs/BidDecisionAction";
import { BidConversationAction } from "@/components/client-jobs/BidConversationAction";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import type { Translator } from "@/lib/i18n/create-translator";

type PageProps = {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ view?: string }>;
};

function formatMoney(amount: unknown, currency: string): string {
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

function budgetLine(job: {
  budgetMin: unknown;
  budgetMax: unknown;
  currency: string;
  budgetType: string;
}, t: Translator): string {
  const min = job.budgetMin;
  const max = job.budgetMax;
  if (min != null && max != null) {
    return `${formatMoney(min, job.currency)} – ${formatMoney(max, job.currency)}`;
  }
  if (min != null) return t("public.jobDetail.budgetFrom", { amount: formatMoney(min, job.currency) });
  if (max != null) return t("public.jobDetail.budgetUpTo", { amount: formatMoney(max, job.currency) });
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

export default async function JobDetailPage({ params, searchParams }: PageProps) {
  const { t, locale } = await getServerTranslator();
  const { jobId: rawId } = await params;
  const sp = await searchParams;
  const forceOriginal = sp.view === "original";
  const jobId = rawId?.trim() ?? "";
  if (!jobId) notFound();

  const jobService = new JobService();
  const job = await jobService.getJobByIdForPublic(jobId, forceOriginal ? "source" : locale);
  if (!job) notFound();
  const session = await getSessionFromCookies();

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
  const isActiveHiring = job.isFeatured && (!job.featuredUntil || job.featuredUntil.getTime() > Date.now());
  const topSignals: string[] = [];
  if (isActiveHiring) topSignals.push(t("public.jobDetail.signalActiveHiring"));
  if (Date.now() - job.createdAt.getTime() <= 24 * 60 * 60 * 1000) topSignals.push(t("public.jobDetail.signalNewJob"));
  if ((Number(job.budgetMax ?? 0) || Number(job.budgetMin ?? 0)) >= 3000000) topSignals.push(t("public.jobDetail.signalGoodBudgetFit"));
  if (job.city && job.workMode !== "REMOTE") topSignals.push(t("public.jobDetail.signalNearbyProject"));
  if (job.description.trim().length <= 220) topSignals.push(t("public.jobDetail.signalQuickBrief"));
  if (publicBidCount > 0 && publicBidCount <= 3) topSignals.push(t("public.jobDetail.signalLowCompetition"));
  if (topSignals.length === 0) topSignals.push(t("public.jobDetail.signalReviewWorth"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/jobs" className="hover:text-foreground underline-offset-4 hover:underline">
          {t("public.jobs.pageTitle")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t("public.jobDetail.details")}</span>
      </nav>

      <section className="mb-6 border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{job.title}</h1>
              <SaveJobButton jobId={job.id} />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {[categoryLabel, job.workMode, jobLocation].filter(Boolean).join(" · ") || t("public.jobDetail.openRole")}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">{job.description}</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.budget")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{budgetLine(job, t)}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.locationLabel")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{jobLocation || t("public.jobDetail.notSpecified")}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.filters.workMode")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {job.workMode === "REMOTE"
                    ? t("public.filters.workModeRemote")
                    : job.workMode === "ONSITE"
                      ? t("public.filters.workModeOnSite")
                      : job.workMode === "HYBRID"
                        ? t("public.filters.workModeHybrid")
                        : job.workMode}
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.postedLabel")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{postedAtLabel}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {topSignals.slice(0, 4).map((signal) => (
                <span
                  key={signal}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {showFreelancerApplyPanel ? (
            <aside className="w-full border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-24 lg:w-72">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.jobDetail.applyKicker")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{t("public.jobDetail.applyDescription")}</p>
              <div className="mt-3 space-y-2">
                <Link
                  href={loginReturnTo(returnToThisJob, "submit-bid") as Route}
                  className="nw-cta-primary inline-flex w-full justify-center px-4 py-2.5 text-sm font-semibold"
                >
                  {t("public.jobDetail.sendProposal")}
                </Link>
                <p className="text-xs text-slate-600">{t("public.jobDetail.applyReassurance")}</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("public.jobDetail.budget")}</CardTitle>
            <CardDescription>{budgetLine(job, t)}</CardDescription>
          </CardHeader>
          {bidDeadline ? (
            <CardContent className="text-muted-foreground pt-0 text-sm">
              {t("public.jobDetail.proposalsClose", { date: bidDeadline })}
            </CardContent>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("public.filters.category")}</CardTitle>
            <CardDescription>{categoryLabel}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("public.jobDetail.client")}</CardTitle>
            <CardDescription>
              {job.clientProfile.displayName}
              {job.clientProfile.companyName ? ` · ${job.clientProfile.companyName}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            {job.clientProfile.industry ? <p>{job.clientProfile.industry}</p> : null}
            {clientLocation ? <p>{clientLocation}</p> : null}
            {!job.clientProfile.industry && !clientLocation ? (
              <p className="text-muted-foreground/80">{t("public.jobDetail.noClientDetails")}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
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
                  {t("public.jobDetail.noProposalsYet")}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2.5">{t("public.jobDetail.tableFreelancer")}</th>
                        <th className="px-3 py-2.5">{t("public.jobDetail.tablePrice")}</th>
                        <th className="px-3 py-2.5">{t("public.jobDetail.tableProfileStrength")}</th>
                        <th className="px-3 py-2.5">{t("public.jobDetail.tableLocationMode")}</th>
                        <th className="px-3 py-2.5">{t("public.jobDetail.tableConversation")}</th>
                        <th className="px-3 py-2.5">{t("public.jobDetail.tableStatus")}</th>
                        <th className="px-3 py-2.5 text-right">{t("public.jobDetail.tableNextAction")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bidRows.map((bid) => {
                        const profile = profileMap.get(bid.freelancer.userId);
                        const convo = conversationMap.get(bid.freelancer.userId);
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
                              <p className="font-semibold text-slate-900">{formatMoney(bid.bidAmount, job.currency)}</p>
                              {bid.estimatedDays != null ? (
                                <p className="text-xs text-slate-500">{t("public.jobDetail.dayTimeline", { count: bid.estimatedDays })}</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {profile?.profileCompleteness != null ? (
                                <div>
                                  <p className="font-medium text-slate-800">{profile.profileCompleteness}% complete</p>
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
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div>
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                  {bid.status.replace(/_/g, " ").toLowerCase()}
                                </span>
                                <p className="mt-1 text-[11px] text-slate-500">{bidDecisionHint(bid.status, t)}</p>
                              </div>
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

        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">{t("public.jobDetail.description")}</h2>
          <Separator className="mb-4" />
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        </div>
      </div>
    </div>
  );
}
