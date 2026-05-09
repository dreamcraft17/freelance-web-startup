import type { Route } from "next";
import { redirect } from "next/navigation";
import { BadgeDollarSign, ListChecks, MessageCircle as MessageCircleLucide, Target } from "lucide-react";
import { BidStatus, VerificationStatus } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";
import type { FreelancerConversationVm, FreelancerSkillChipVm } from "@/components/dashboard/FreelancerDashboard";
import type { FreelancerHeroStatVm } from "@/components/dashboard/FreelancerDashboardHero";
import type { FreelancerProposalPlaybookSection } from "@/components/onboarding/FreelancerProposalPlaybook";
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
        profileCompleteness: true,
        availabilityStatus: true,
        verificationStatus: true,
        averageReviewRating: true,
        reviewCount: true,
        _count: { select: { savedByUsers: true } }
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

  let acceptedBids = 0;
  let proposalUpdates = 0;
  let awaitingReplyThreads = 0;
  let bidsSubmittedTotal = 0;
  let topSkillsRows: { years: number | null; skill: { name: string } }[] = [];
  let conversationThreadsRaw: Array<{
    id: string;
    updatedAt: Date;
    job: { id: string; title: string } | null;
  }> = [];

  if (profile) {
    const [acc, pu, atr, btc, ts, ctr] = await Promise.all([
      db.bid.count({ where: { freelancerId: profile.id, status: BidStatus.ACCEPTED } }),
      db.bid.count({
        where: {
          freelancerId: profile.id,
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      new MessageService().countAwaitingReplyThreadsForUser(session.userId),
      db.bid.count({ where: { freelancerId: profile.id } }),
      db.freelancerSkill.findMany({
        where: { freelancerProfileId: profile.id },
        orderBy: [{ years: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          years: true,
          skill: { select: { name: true } }
        }
      }),
      db.messageThread.findMany({
        where: { participants: { some: { userId: session.userId } } },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: {
          id: true,
          updatedAt: true,
          job: { select: { id: true, title: true } }
        }
      })
    ]);
    acceptedBids = acc;
    proposalUpdates = pu;
    awaitingReplyThreads = atr;
    bidsSubmittedTotal = btc;
    topSkillsRows = ts;
    conversationThreadsRaw = ctr;
  }

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

  const savedCount = profile?._count.savedByUsers ?? 0;
  const reviewAvg = profile?.averageReviewRating;
  const reviewCount = profile?.reviewCount ?? 0;

  const heroTrustPills: string[] = [];
  if (profile) {
    heroTrustPills.push(t(`dashboard.freelancer.availability.${profile.availabilityStatus}`));
    if (profile.verificationStatus === VerificationStatus.VERIFIED) {
      heroTrustPills.push(t("dashboard.freelancer.trustVerified"));
    }
    if (profile.profileCompleteness != null) {
      heroTrustPills.push(t("dashboard.freelancer.trustProfilePercent", { percent: profile.profileCompleteness }));
    }
  }

  const heroReviewValue =
    reviewCount > 0 && reviewAvg != null ? `${reviewAvg.toFixed(1)}★` : "—";
  const heroReviewHint =
    reviewCount > 0 && reviewAvg != null
      ? t("dashboard.freelancer.heroStatReviewsHint", { count: reviewCount })
      : t("dashboard.freelancer.heroStatReviewsEmpty");

  const proposalsHint = !hasProfile
    ? t("dashboard.freelancer.heroStatProposalsHintSetup")
    : bidsSubmittedTotal === 0
      ? t("dashboard.freelancer.heroStatProposalsHintQuiet")
      : undefined;

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

  const activeContractsHero = quota ? String(quota.usage.activeContracts) : "0";
  const contractsHint =
    hasProfile && Number(activeContractsHero) === 0 ? t("dashboard.freelancer.heroStatContractsHintZero") : undefined;
  const savedHint =
    hasProfile && savedCount === 0 ? t("dashboard.freelancer.heroStatSavedEmptyHint") : undefined;

  const heroStats: FreelancerHeroStatVm[] = [
    {
      label: t("dashboard.freelancer.heroStatProposals"),
      value: String(bidsSubmittedTotal),
      hint: proposalsHint
    },
    {
      label: t("dashboard.freelancer.heroStatContracts"),
      value: activeContractsHero,
      hint: contractsHint
    },
    {
      label: t("dashboard.freelancer.heroStatReviews"),
      value: heroReviewValue,
      hint: heroReviewHint
    },
    {
      label: t("dashboard.freelancer.heroStatSaved"),
      value: String(savedCount),
      hint: savedHint
    }
  ];

  const skillsVm: FreelancerSkillChipVm[] = topSkillsRows.map((row) => ({
    name: row.skill.name,
    years: row.years
  }));

  const conversations: FreelancerConversationVm[] = conversationThreadsRaw.map((row) => ({
    threadId: row.id,
    title: row.job?.title ?? t("dashboard.freelancer.directConversationLabel"),
    updatedAt: row.updatedAt
  }));

  const playbookSections: FreelancerProposalPlaybookSection[] = [
    {
      Icon: MessageCircleLucide,
      title: t("dashboard.freelancer.playbookS1Title"),
      body: t("dashboard.freelancer.playbookS1Body")
    },
    {
      Icon: ListChecks,
      title: t("dashboard.freelancer.playbookS2Title"),
      body: t("dashboard.freelancer.playbookS2Body")
    },
    {
      Icon: Target,
      title: t("dashboard.freelancer.playbookS3Title"),
      body: t("dashboard.freelancer.playbookS3Body")
    },
    {
      Icon: BadgeDollarSign,
      title: t("dashboard.freelancer.playbookS4Title"),
      body: t("dashboard.freelancer.playbookS4Body")
    }
  ];

  return (
    <FreelancerDashboard
      welcomeTitle={welcomeTitle}
      subtitle={subtitle}
      hasProfile={hasProfile}
      profileCompleteness={completeness}
      showStrongProfileCard={showStrongProfileCard}
      stats={stats}
      heroStats={heroStats}
      heroTrustPills={heroTrustPills}
      proposalPlaybook={{
        title: t("dashboard.freelancer.playbookTitle"),
        intro: t("dashboard.freelancer.playbookIntro"),
        footer: t("dashboard.freelancer.playbookFooter"),
        sections: playbookSections
      }}
      snapshot={{
        bidUpdates7d: String(proposalUpdates),
        acceptedBids: String(acceptedBids),
        awaitingReplyThreads: String(awaitingReplyThreads),
        savedByClients: String(savedCount)
      }}
      skills={skillsVm}
      conversations={conversations}
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
        browseJobsCta: t("dashboard.freelancer.browseJobsCta"),
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
        openMessagesCta: t("dashboard.freelancer.openMessagesCta"),
        pulseStripTitle: t("dashboard.freelancer.pulseStripTitle"),
        playbookTitle: t("dashboard.freelancer.playbookTitle"),
        playbookIntro: t("dashboard.freelancer.playbookIntro"),
        playbookFooter: t("dashboard.freelancer.playbookFooter"),
        pulseQuotaLabel: t("dashboard.freelancer.pulseQuotaLabel"),
        pulseProfileLabel: t("dashboard.freelancer.pulseProfileLabel"),
        pulseAwaitingLabel: t("dashboard.freelancer.pulseAwaitingLabel"),
        snapshotTitle: t("dashboard.freelancer.snapshotTitle"),
        snapshotSubtitle: t("dashboard.freelancer.snapshotSubtitle"),
        snapshotBidUpdatesLabel: t("dashboard.freelancer.snapshotBidUpdatesLabel"),
        snapshotAcceptedLabel: t("dashboard.freelancer.snapshotAcceptedLabel"),
        snapshotAwaitingLabel: t("dashboard.freelancer.snapshotAwaitingLabel"),
        snapshotSavedLabel: t("dashboard.freelancer.snapshotSavedLabel"),
        conversationsTitle: t("dashboard.freelancer.conversationsTitle"),
        conversationsSubtitle: t("dashboard.freelancer.conversationsSubtitle"),
        conversationsSeeAll: t("dashboard.freelancer.conversationsSeeAll"),
        conversationsEmptyTitle: t("dashboard.freelancer.conversationsEmptyTitle"),
        conversationsEmptyBody: t("dashboard.freelancer.conversationsEmptyBody"),
        skillsTitle: t("dashboard.freelancer.skillsTitle"),
        skillsSubtitle: t("dashboard.freelancer.skillsSubtitle"),
        skillsEmptyBody: t("dashboard.freelancer.skillsEmptyBody"),
        skillsYearsShort: t("dashboard.freelancer.skillsYearsShort"),
        heroMotivation: t("dashboard.freelancer.heroMotivation"),
        heroTrustCaption: t("dashboard.freelancer.heroTrustCaption")
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
