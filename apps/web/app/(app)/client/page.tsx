import type { Route } from "next";
import { redirect } from "next/navigation";
import { BidStatus, ContractStatus, JobStatus } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import type { ActivationChecklistStepVm } from "@/components/onboarding/ActivationChecklistCard";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { MessageService } from "@/server/services/message.service";
import { OnboardingActivationService } from "@/server/services/onboarding-activation.service";
import {
  ClientDashboard,
  type ClientDashboardBid,
  type ClientDashboardContract,
  type ClientDashboardJob
} from "@/components/dashboard/ClientDashboard";

function firstToken(name: string): string | null {
  const t = name.trim();
  if (!t) return null;
  return t.split(/\s+/)[0] ?? null;
}

type ClientJobRow = {
  id: string;
  title: string;
  status: string;
  workMode: string;
  city: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string } | null;
  _count: { bids: number };
  latestBidAt?: Date | null;
};

type ClientBidRow = {
  id: string;
  status: string;
  createdAt: Date;
  bidAmount: unknown;
  job: { id: string; title: string; currency: string };
  freelancer: { fullName: string; username: string };
};

export default async function ClientDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client");
  }

  const { t } = await getServerTranslator();
  const activationSvc = new OnboardingActivationService();
  const activationRaw = await activationSvc.getClientActivation(session.userId);
  const stepsVm: ActivationChecklistStepVm[] = activationRaw.map((s) => ({
    id: s.id,
    done: s.done,
    href: s.href as Route,
    label: t(`activation.client.steps.${s.id}.label`),
    hint: t(`activation.client.steps.${s.id}.hint`)
  }));
  const allActivationDone = stepsVm.every((x) => x.done);

  const [clientProfile, activeContractsCount, completedHiresCount, recentContractsRaw] = await Promise.all([
    db.clientProfile.findFirst({
      where: { userId: session.userId, deletedAt: null },
      select: { id: true, displayName: true }
    }),
    db.contract.count({
      where: {
        clientUserId: session.userId,
        deletedAt: null,
        status: {
          in: [ContractStatus.PENDING, ContractStatus.ACTIVE, ContractStatus.IN_PROGRESS]
        }
      }
    }),
    db.contract.count({
      where: {
        clientUserId: session.userId,
        deletedAt: null,
        status: ContractStatus.COMPLETED
      }
    }),
    db.contract.findMany({
      where: { clientUserId: session.userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        amount: true,
        currency: true,
        bid: {
          select: {
            job: { select: { id: true, title: true } },
            freelancer: { select: { fullName: true, username: true } }
          }
        }
      }
    })
  ]);

  const hasProfile = Boolean(clientProfile);

  let openJobsCount = 0;
  let incomingBidsCount = 0;
  let awaitingReplyThreads = 0;
  let recentJobsRaw: ClientJobRow[] = [];
  let recentBidsRaw: ClientBidRow[] = [];

  if (clientProfile) {
    const [open, incoming, jobs, bids, latestBidByJob] = await Promise.all([
      db.job.count({
        where: {
          clientProfileId: clientProfile.id,
          deletedAt: null,
          status: JobStatus.OPEN
        }
      }),
      db.bid.count({
        where: {
          status: { in: [BidStatus.SUBMITTED, BidStatus.SHORTLISTED] },
          job: { clientProfileId: clientProfile.id, deletedAt: null }
        }
      }),
      db.job.findMany({
        where: { clientProfileId: clientProfile.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          workMode: true,
          city: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { name: true } },
          _count: { select: { bids: true } }
        }
      }),
      db.bid.findMany({
        where: { job: { clientProfileId: clientProfile.id, deletedAt: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          createdAt: true,
          bidAmount: true,
          job: { select: { id: true, title: true, currency: true } },
          freelancer: { select: { fullName: true, username: true } }
        }
      }),
      db.bid.groupBy({
        by: ["jobId"],
        where: { job: { clientProfileId: clientProfile.id, deletedAt: null } },
        _max: { createdAt: true }
      })
    ]);
    openJobsCount = open;
    incomingBidsCount = incoming;
    awaitingReplyThreads = await new MessageService().countAwaitingReplyThreadsForUser(session.userId);
    recentJobsRaw = jobs;
    recentBidsRaw = bids;
    const latestBidMap = new Map(latestBidByJob.map((x) => [x.jobId, x._max.createdAt ?? null]));
    recentJobsRaw = jobs.map((j) => ({ ...j, latestBidAt: latestBidMap.get(j.id) ?? null }));
  }

  const recentJobs: ClientDashboardJob[] = recentJobsRaw.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    workMode: j.workMode,
    city: j.city,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    categoryName: j.category?.name ?? null,
    bidCount: j._count.bids,
    latestBidAt: j.latestBidAt ?? null
  }));

  const recentBids: ClientDashboardBid[] = recentBidsRaw.map((b) => ({
    id: b.id,
    status: b.status,
    createdAt: b.createdAt,
    bidAmount: b.bidAmount,
    job: b.job,
    freelancer: b.freelancer
  }));

  const recentContracts: ClientDashboardContract[] = recentContractsRaw.map((c) => ({
    id: c.id,
    status: c.status,
    updatedAt: c.updatedAt,
    amount: c.amount,
    currency: c.currency,
    bid: c.bid
  }));

  const displayName = clientProfile?.displayName?.trim() || "your workspace";
  const greetingName = clientProfile?.displayName ? firstToken(clientProfile.displayName) : null;

  const stats = {
    openJobs: hasProfile ? String(openJobsCount) : "0",
    openJobsHint: hasProfile
      ? openJobsCount > 0
        ? t("dashboard.client.statOpenJobsHintListing")
        : t("dashboard.client.statOpenJobsHintEmpty")
      : t("dashboard.client.statOpenJobsHintNoProfile"),
    incomingBids: hasProfile ? String(incomingBidsCount) : "0",
    incomingBidsHint: hasProfile
      ? incomingBidsCount > 0
        ? t("dashboard.client.statIncomingHintReview")
        : t("dashboard.client.statIncomingHintEmpty")
      : t("dashboard.client.statIncomingHintNoProfile"),
    threadsAwaiting: hasProfile ? String(awaitingReplyThreads) : "0",
    threadsAwaitingHint: hasProfile
      ? awaitingReplyThreads > 0
        ? t("dashboard.client.statUnreadThreadsHint")
        : t("dashboard.client.statUnreadThreadsClear")
      : t("dashboard.client.statUnreadThreadsNoProfileHint"),
    activeContracts: String(activeContractsCount),
    activeContractsHint:
      activeContractsCount > 0
        ? t("dashboard.client.statActiveContractsHintActive")
        : t("dashboard.client.statActiveContractsHintEmpty"),
    hiresCompleted: String(completedHiresCount),
    hiresCompletedHint:
      completedHiresCount > 0
        ? t("dashboard.client.statCompletedHiresHintActive")
        : t("dashboard.client.statCompletedHiresHintEmpty")
  };

  return (
    <ClientDashboard
      welcomeLine={
        greetingName
          ? t("dashboard.client.welcomeNamed", { name: greetingName })
          : t("dashboard.client.welcomeGeneric")
      }
      subline={
        hasProfile
          ? t("dashboard.client.subtitleHasProfile", { workspace: displayName })
          : t("dashboard.client.subtitleNoProfile")
      }
      hasProfile={hasProfile}
      stats={stats}
      recentJobs={recentJobs}
      recentBids={recentBids}
      recentContracts={recentContracts}
      copy={{
        nearworkKicker: t("dashboard.client.nearworkKicker"),
        summaryHeading: t("dashboard.client.summaryHeading"),
        summarySub: t("dashboard.client.summarySub"),
        statOpenJobs: t("dashboard.client.statOpenJobs"),
        statIncomingProposals: t("dashboard.client.statIncomingProposals"),
        statUnreadThreads: t("dashboard.client.statUnreadThreads"),
        statActiveContracts: t("dashboard.client.statActiveContracts"),
        statCompletedHires: t("dashboard.client.statCompletedHires"),
        quickActionsHeading: t("dashboard.client.quickActionsHeading"),
        quickActionsSub: t("dashboard.client.quickActionsSub"),
        recentJobsHeading: t("dashboard.client.recentJobsHeading"),
        recentJobsSub: t("dashboard.client.recentJobsSub"),
        incomingBidsHeading: t("dashboard.client.incomingBidsHeading"),
        incomingBidsSub: t("dashboard.client.incomingBidsSub"),
        contractsHeading: t("dashboard.client.contractsHeading"),
        contractsSub: t("dashboard.client.contractsSub"),
        contractsMessagesLink: t("dashboard.client.contractsMessagesLink"),
        incomingBidsManageLink: t("dashboard.client.incomingBidsManageLink"),
        proposalNewBadge: t("dashboard.client.proposalNewBadge"),
        viewAllJobs: t("dashboard.client.viewAllJobs"),
        finishProfileCardTitle: t("dashboard.client.finishProfileCardTitle"),
        finishProfileCardBody: t("dashboard.client.finishProfileCardBody"),
        finishProfileCta: t("dashboard.client.finishProfileCta"),
        jobsEmptyNoProfileTitle: t("dashboard.client.jobsEmptyNoProfileTitle"),
        jobsEmptyNoProfileBody: t("dashboard.client.jobsEmptyNoProfileBody"),
        jobsEmptyFirstTitle: t("dashboard.client.jobsEmptyFirstTitle"),
        jobsEmptyFirstBody: t("dashboard.client.jobsEmptyFirstBody"),
        jobsEmptyFirstPrimary: t("dashboard.client.jobsEmptyFirstPrimary"),
        jobsEmptyFirstSecondary: t("dashboard.client.jobsEmptyFirstSecondary"),
        bidsEmptyNoProfileTitle: t("dashboard.client.bidsEmptyNoProfileTitle"),
        bidsEmptyNoProfileBody: t("dashboard.client.bidsEmptyNoProfileBody"),
        bidsEmptyNoBidsTitle: t("dashboard.client.bidsEmptyNoBidsTitle"),
        bidsEmptyNoBidsBody: t("dashboard.client.bidsEmptyNoBidsBody"),
        bidsEmptyNoBidsPrimary: t("dashboard.client.bidsEmptyNoBidsPrimary"),
        bidsEmptyNoBidsSecondary: t("dashboard.client.bidsEmptyNoBidsSecondary"),
        contractsEmptyTitle: t("dashboard.client.contractsEmptyTitle"),
        contractsEmptyBody: t("dashboard.client.contractsEmptyBody"),
        contractsEmptyPrimary: t("dashboard.client.contractsEmptyPrimary"),
        contractsEmptySecondary: t("dashboard.client.contractsEmptySecondary")
      }}
      activationChecklist={{
        title: t("activation.client.checklistTitle"),
        intro: t("activation.client.checklistIntro"),
        steps: stepsVm,
        allCompleteBanner: allActivationDone ? t("activation.client.allComplete") : null
      }}
      liquidityTips={{
        title: t("activation.client.liquidityTitle"),
        intro: t("activation.shared.clientLiquidityIntro"),
        bullets: [
          t("activation.client.liquidity.b1"),
          t("activation.client.liquidity.b2"),
          t("activation.client.liquidity.b3")
        ],
        footer: t("activation.shared.jobContextReminder")
      }}
    />
  );
}
