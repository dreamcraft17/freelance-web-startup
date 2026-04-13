import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";
import { JobService } from "@/server/services/job.service";
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

  const profile = await db.freelancerProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: {
      id: true,
      username: true,
      fullName: true,
      headline: true,
      profileCompleteness: true
    }
  });

  const quotaService = new QuotaService();
  const quota = profile ? await quotaService.getUsageForFreelancerUser(session.userId) : null;

  const recentBids: FreelancerDashboardBid[] = profile
    ? await db.bid.findMany({
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
    : [];

  const recentContractsRaw = await db.contract.findMany({
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
  });

  const recentContracts: FreelancerDashboardContract[] = recentContractsRaw.map((c) => ({
    id: c.id,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    bid: { job: c.bid.job }
  }));

  const jobService = new JobService();
  const { items: openJobItems, total: openTotal } = await jobService.listOpenJobs({ page: 1, limit: 9 });

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
    />
  );
}
