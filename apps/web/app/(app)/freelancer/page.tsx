import type { Route } from "next";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";
import { BidStatus } from "@acme/types";
import type { ActivationChecklistStepVm } from "@/components/onboarding/ActivationChecklistCard";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { JobService } from "@/server/services/job.service";
import { MessageService } from "@/server/services/message.service";
import { OnboardingActivationService } from "@/server/services/onboarding-activation.service";
import { QuotaService } from "@/server/services/quota.service";
import {
  FreelancerDashboard,
  type FreelancerDashboardBid,
  type FreelancerDashboardContract,
  type FreelancerOpenJob
} from "@/components/dashboard/FreelancerDashboard";

function firstName(fullName: string): string | null {
  const t = fullName.trim();
  if (!t) return null;
  return t.split(/\s+/)[0] ?? null;
}

export default async function FreelancerDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer");
  }

  const { t } = await getServerTranslator();
  const onboardingSvc = new OnboardingActivationService();
  const activationRaw = await onboardingSvc.getFreelancerActivation(session.userId);
  const stepsVm: ActivationChecklistStepVm[] = activationRaw.map((s) => ({
    id: s.id,
    done: s.done,
    href: s.href as Route,
    label: t(`activation.freelancer.steps.${s.id}.label`),
    hint: t(`activation.freelancer.steps.${s.id}.hint`)
  }));
  const allActivationDone = stepsVm.every((x) => x.done);

  const [profile, recentContractsRaw, openJobsResult] = await Promise.all([
    db.freelancerProfile.findFirst({
      where: { userId: session.userId, deletedAt: null },
      select: {
        id: true,
        username: true,
        fullName: true,
        headline: true,
        profileCompleteness: true
      }
    }),
    db.contract.findMany({
      where: { freelancerUserId: session.userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        bid: {
          include: {
            job: { select: { id: true, title: true } }
          }
        }
      }
    }),
    new JobService().listOpenJobs({ page: 1, limit: 9 })
  ]);

  const [quota, recentBids] = profile
    ? await Promise.all([
        new QuotaService().getUsageForFreelancerUser(session.userId),
        db.bid.findMany({
          where: { freelancerId: profile.id },
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                workMode: true,
                currency: true
              }
            }
          }
        })
      ])
    : [null, [] as FreelancerDashboardBid[]];

  const [acceptedBids, proposalUpdates, awaitingReplyThreads] = profile
    ? await Promise.all([
        db.bid.count({ where: { freelancerId: profile.id, status: BidStatus.ACCEPTED } }),
        db.bid.count({
          where: {
            freelancerId: profile.id,
            updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
        new MessageService().countAwaitingReplyThreadsForUser(session.userId)
      ])
    : [0, 0, 0];

  const recentContracts: FreelancerDashboardContract[] = recentContractsRaw.map((c) => ({
    id: c.id,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    bid: { job: c.bid.job }
  }));

  const { items: openJobItems, total: openTotal } = openJobsResult;

  const openJobs: FreelancerOpenJob[] = openJobItems.map((j) => ({
    id: j.id,
    title: j.title,
    workMode: j.workMode,
    city: j.city
  }));

  const hasProfile = Boolean(profile);
  const completeness = profile?.profileCompleteness ?? null;
  const showStrongProfileCard = !hasProfile || (completeness != null && completeness < 85);

  const displayName = profile?.fullName?.trim() || "your account";
  const greetingName = profile?.fullName ? firstName(profile.fullName) : null;

  const welcomeTitle = greetingName
    ? t("dashboard.freelancer.welcomeNamed", { name: greetingName })
    : t("dashboard.freelancer.welcomeGeneric");
  const profileLine =
    profile?.fullName?.trim() ?
      `${profile.fullName.trim()}${profile.username ? ` · @${profile.username}` : ""}`
    : displayName;
  const subtitle = hasProfile
    ? t("dashboard.freelancer.subtitleHasProfile", { name: profileLine })
    : t("dashboard.freelancer.subtitleNoProfile");

  let stats: {
    activeBids: string;
    activeContracts: string;
    bidQuotaRemaining: string;
    bidQuotaHint: string;
    profileReadiness: string;
    profileHint: string;
    threadsAwaiting: string;
    threadsAwaitingHint: string;
  };

  if (!quota) {
    stats = {
      activeBids: "0",
      activeContracts: "0",
      bidQuotaRemaining: "—",
      bidQuotaHint: t("dashboard.freelancer.statBidQuotaHintNoProfile"),
      profileReadiness: t("dashboard.freelancer.statProfileNotStarted"),
      profileHint: t("dashboard.freelancer.statProfileHintNoProfile"),
      threadsAwaiting: "0",
      threadsAwaitingHint: t("dashboard.freelancer.statAwaitingRepliesHintNoProfile")
    };
  } else if (quota.quotasUnlimited) {
    stats = {
      activeBids: String(quota.usage.activeBids),
      activeContracts: String(quota.usage.activeContracts),
      bidQuotaRemaining: t("dashboard.freelancer.statQuotaUnlimitedValue"),
      bidQuotaHint: t("dashboard.freelancer.statQuotaUnlimitedHint"),
      profileReadiness: completeness != null ? `${completeness}%` : "—",
      profileHint:
        completeness != null && completeness < 100
          ? t("dashboard.freelancer.statProfileHintIncomplete")
          : t("dashboard.freelancer.statProfileHintComplete"),
      threadsAwaiting: String(awaitingReplyThreads),
      threadsAwaitingHint:
        awaitingReplyThreads > 0
          ? t("dashboard.freelancer.statAwaitingRepliesHintActive")
          : t("dashboard.freelancer.statAwaitingRepliesHintClear")
    };
  } else {
    const remBids = quota.remaining.activeBids;
    const lim = quota.limits.activeBids;
    stats = {
      activeBids: String(quota.usage.activeBids),
      activeContracts: String(quota.usage.activeContracts),
      bidQuotaRemaining: remBids != null ? String(remBids) : "—",
      bidQuotaHint:
        remBids != null && lim != null ?
          t("dashboard.freelancer.statBidQuotaHintPlan", { remaining: remBids, limit: lim })
        : t("dashboard.freelancer.statBidQuotaHintNoProfile"),
      profileReadiness: completeness != null ? `${completeness}%` : "—",
      profileHint:
        completeness != null && completeness < 100
          ? t("dashboard.freelancer.statProfileHintIncomplete")
          : t("dashboard.freelancer.statProfileHintComplete"),
      threadsAwaiting: String(awaitingReplyThreads),
      threadsAwaitingHint:
        awaitingReplyThreads > 0
          ? t("dashboard.freelancer.statAwaitingRepliesHintActive")
          : t("dashboard.freelancer.statAwaitingRepliesHintClear")
    };
  }

  return (
    <FreelancerDashboard
      welcomeTitle={welcomeTitle}
      subtitle={subtitle}
      hasProfile={hasProfile}
      profileCompleteness={completeness}
      showStrongProfileCard={showStrongProfileCard}
      stats={stats}
      recentBids={recentBids}
      recentContracts={recentContracts}
      openJobs={openJobs}
      openTotal={openTotal}
      attention={{
        acceptedBids,
        awaitingReplyThreads,
        proposalUpdates
      }}
      copy={{
        dashboardKicker: t("dashboard.freelancer.dashboardKicker"),
        browseJobsCta: t("dashboard.freelancer.browseJobsCta"),
        overviewTitle: t("dashboard.freelancer.overviewTitle"),
        overviewSubtitle: t("dashboard.freelancer.overviewSubtitle"),
        quickActionsHeading: t("dashboard.freelancer.quickActionsHeading"),
        statActiveBids: t("dashboard.freelancer.statActiveBids"),
        statActiveContracts: t("dashboard.freelancer.statActiveContracts"),
        statRemainingQuota: t("dashboard.freelancer.statRemainingQuota"),
        statProfileCompletion: t("dashboard.freelancer.statProfileCompletion"),
        statAwaitingReplies: t("dashboard.freelancer.statAwaitingReplies"),
        attentionKicker: t("dashboard.freelancer.attentionKicker"),
        attentionAccepted: t("dashboard.freelancer.attentionAccepted"),
        attentionAwaiting: t("dashboard.freelancer.attentionAwaiting"),
        attentionProposalUpdates: t("dashboard.freelancer.attentionProposalUpdates"),
        profileCardTitleNew: t("dashboard.freelancer.profileCardTitleNew"),
        profileCardTitleBoost: t("dashboard.freelancer.profileCardTitleBoost"),
        profileCardBodyNew: t("dashboard.freelancer.profileCardBodyNew"),
        profileCardBodyBoost: t("dashboard.freelancer.profileCardBodyBoost"),
        profileCardCta: t("dashboard.freelancer.profileCardCta"),
        quickCompleteProfile: t("dashboard.freelancer.quickCompleteProfile"),
        quickFindJobs: t("dashboard.freelancer.quickFindJobs"),
        quickTrackProposals: t("dashboard.freelancer.quickTrackProposals"),
        quickAvailability: t("dashboard.freelancer.quickAvailability"),
        activityTitle: t("dashboard.freelancer.activityTitle"),
        activitySubtitle: t("dashboard.freelancer.activitySubtitle"),
        activityViewAll: t("dashboard.freelancer.activityViewAll"),
        openJobsTitle: t("dashboard.freelancer.openJobsTitle"),
        openJobsSubtitle: t("dashboard.freelancer.openJobsSubtitle"),
        openJobsSeeAll: t("dashboard.freelancer.openJobsSeeAll"),
        activityEmptyNoProfileTitle: t("dashboard.freelancer.activityEmptyNoProfileTitle"),
        activityEmptyNoProfileBody: t("dashboard.freelancer.activityEmptyNoProfileBody"),
        activityEmptyNoActivityTitle: t("dashboard.freelancer.activityEmptyNoActivityTitle"),
        activityEmptyNoActivityBody: t("dashboard.freelancer.activityEmptyNoActivityBody"),
        activityEmptyPrimary: t("dashboard.freelancer.activityEmptyPrimary"),
        activityEmptySecondary: t("dashboard.freelancer.activityEmptySecondary"),
        openJobsEmptyTitle: t("dashboard.freelancer.openJobsEmptyTitle"),
        openJobsEmptyBody: t("dashboard.freelancer.openJobsEmptyBody"),
        openJobsEmptyCta: t("dashboard.freelancer.openJobsEmptyCta"),
        profileRequiredBanner: t("dashboard.freelancer.profileRequiredBanner"),
        profileRequiredSub: t("dashboard.freelancer.profileRequiredSub"),
        activityKindProposal: t("dashboard.freelancer.activityKindProposal"),
        activityKindContract: t("dashboard.freelancer.activityKindContract"),
        activityEmptyKickerProfile: t("dashboard.freelancer.activityEmptyKickerProfile"),
        activityEmptyKickerTimeline: t("dashboard.freelancer.activityEmptyKickerTimeline"),
        openJobsEmptyKicker: t("dashboard.freelancer.openJobsEmptyKicker"),
        nextActionAwaitingBanner: t("dashboard.freelancer.nextActionAwaitingBanner"),
        openMessagesCta: t("dashboard.freelancer.openMessagesCta")
      }}
      activationChecklist={{
        title: t("activation.freelancer.checklistTitle"),
        intro: t("activation.freelancer.checklistIntro"),
        steps: stepsVm,
        allCompleteBanner: allActivationDone ? t("activation.freelancer.allComplete") : null
      }}
      liquidityTips={{
        title: t("activation.freelancer.liquidityTitle"),
        intro: t("activation.shared.freelancerLiquidityIntro"),
        bullets: [
          t("activation.freelancer.liquidity.b1"),
          t("activation.freelancer.liquidity.b2"),
          t("activation.freelancer.liquidity.b3")
        ],
        footer: t("activation.shared.jobContextReminder")
      }}
    />
  );
}
