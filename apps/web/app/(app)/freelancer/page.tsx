import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";
import { BidStatus } from "@acme/types";
import { JobService } from "@/server/services/job.service";
import { MessageService } from "@/server/services/message.service";
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

  let stats: {
    activeBids: string;
    activeContracts: string;
    bidQuotaRemaining: string;
    bidQuotaHint: string;
    profileReadiness: string;
    profileHint: string;
  };

  if (!quota) {
    stats = {
      activeBids: "0",
      activeContracts: "0",
      bidQuotaRemaining: "—",
      bidQuotaHint: "Create a profile to see your plan limits",
      profileReadiness: "Not started",
      profileHint: "Complete setup to unlock bidding"
    };
  } else if (quota.quotasUnlimited) {
    stats = {
      activeBids: String(quota.usage.activeBids),
      activeContracts: String(quota.usage.activeContracts),
      bidQuotaRemaining: "Unlimited",
      bidQuotaHint: "No active bid cap on your current plan",
      profileReadiness: completeness != null ? `${completeness}%` : "—",
      profileHint:
        completeness != null && completeness < 100
          ? "Add details clients care about"
          : "Profile looks complete"
    };
  } else {
    const remBids = quota.remaining.activeBids;
    stats = {
      activeBids: String(quota.usage.activeBids),
      activeContracts: String(quota.usage.activeContracts),
      bidQuotaRemaining: remBids != null ? String(remBids) : "—",
      bidQuotaHint: `of ${quota.limits.activeBids} allowed on your plan`,
      profileReadiness: completeness != null ? `${completeness}%` : "—",
      profileHint:
        completeness != null && completeness < 100
          ? "Add details clients care about"
          : "Profile looks complete"
    };
  }

  return (
    <FreelancerDashboard
      displayName={displayName}
      greetingName={greetingName}
      hasProfile={hasProfile}
      username={profile?.username ?? null}
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
    />
  );
}
