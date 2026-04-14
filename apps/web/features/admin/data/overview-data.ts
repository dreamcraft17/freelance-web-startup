import { db } from "@acme/database";
import {
  ContractStatus,
  JobStatus,
  SubscriptionStatus,
  UserRole,
  VerificationStatus
} from "@acme/types";

function money(amount: unknown, currency = "USD"): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export type AdminOverviewData = {
  counts: {
    totalUsers: number;
    totalFreelancers: number;
    totalClients: number;
    openJobs: number;
    activeContracts: number;
    bidsToday: number;
    totalBids: number;
    pendingVerification: number;
    donationCount: number;
    donationTotal: string;
    subscriptionActive: number;
    subscriptionHint: string;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    clientLabel: string;
    updatedAt: Date;
  }>;
  recentBids: Array<{
    id: string;
    jobTitle: string;
    freelancerUsername: string;
    amountLabel: string;
    status: string;
    createdAt: Date;
  }>;
  verificationQueue: Array<{
    id: string;
    userEmail: string;
    type: string;
    createdAt: Date;
  }>;
  recentDonations: Array<{
    id: string;
    amountLabel: string;
    email: string | null;
    createdAt: Date;
  }>;
};

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalFreelancers,
    totalClients,
    openJobs,
    activeContracts,
    bidsToday,
    totalBids,
    pendingVerificationCount,
    donationCount,
    donationAgg,
    subscriptionGroups,
    recentJobsRaw,
    recentBidsRaw,
    pendingVerificationRaw,
    recentDonationsRaw
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, role: UserRole.FREELANCER } }),
    db.user.count({ where: { deletedAt: null, role: UserRole.CLIENT } }),
    db.job.count({ where: { deletedAt: null, status: JobStatus.OPEN } }),
    db.contract.count({
      where: {
        deletedAt: null,
        status: { in: [ContractStatus.ACTIVE, ContractStatus.IN_PROGRESS] }
      }
    }),
    db.bid.count({ where: { createdAt: { gte: startOfDay } } }),
    db.bid.count(),
    db.verificationRequest.count({ where: { status: VerificationStatus.PENDING } }),
    db.donation.count(),
    db.donation.aggregate({ _sum: { amount: true } }),
    db.userSubscription.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    db.job.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 7,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        clientProfile: { select: { displayName: true, companyName: true } }
      }
    }),
    db.bid.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: {
        id: true,
        status: true,
        bidAmount: true,
        createdAt: true,
        job: { select: { title: true, currency: true } },
        freelancer: { select: { username: true } }
      }
    }),
    db.verificationRequest.findMany({
      where: { status: VerificationStatus.PENDING },
      orderBy: { createdAt: "asc" },
      take: 7,
      select: {
        id: true,
        type: true,
        createdAt: true,
        user: { select: { email: true } }
      }
    }),
    db.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: {
        id: true,
        amount: true,
        currency: true,
        createdAt: true,
        user: { select: { email: true } }
      }
    })
  ]);

  const sum = donationAgg._sum.amount;
  const donationTotal = sum != null ? money(sum) : money(0);

  const subMap = Object.fromEntries(subscriptionGroups.map((g) => [g.status, g._count.id])) as Partial<
    Record<SubscriptionStatus, number>
  >;
  const subscriptionActive = subMap[SubscriptionStatus.ACTIVE] ?? 0;
  const subscriptionHint = [
    subMap[SubscriptionStatus.TRIALING] ? `${subMap[SubscriptionStatus.TRIALING]} trialing` : null,
    subMap[SubscriptionStatus.PAST_DUE] ? `${subMap[SubscriptionStatus.PAST_DUE]} past due` : null,
    subMap[SubscriptionStatus.CANCELED] ? `${subMap[SubscriptionStatus.CANCELED]} canceled` : null
  ]
    .filter(Boolean)
    .join(" · ");

  const recentJobs = recentJobsRaw.map((j) => {
    const cp = j.clientProfile;
    const clientLabel = cp?.companyName?.trim() || cp?.displayName?.trim() || "—";
    return {
      id: j.id,
      title: j.title,
      status: j.status,
      clientLabel,
      updatedAt: j.updatedAt
    };
  });

  const recentBids = recentBidsRaw.map((b) => ({
    id: b.id,
    jobTitle: b.job.title,
    freelancerUsername: b.freelancer.username,
    amountLabel: money(b.bidAmount, b.job.currency ?? "USD"),
    status: b.status,
    createdAt: b.createdAt
  }));

  const verificationQueue = pendingVerificationRaw.map((v) => ({
    id: v.id,
    userEmail: v.user.email,
    type: v.type,
    createdAt: v.createdAt
  }));

  const recentDonations = recentDonationsRaw.map((d) => ({
    id: d.id,
    amountLabel: money(d.amount, d.currency ?? "USD"),
    email: d.user?.email ?? null,
    createdAt: d.createdAt
  }));

  return {
    counts: {
      totalUsers,
      totalFreelancers,
      totalClients,
      openJobs,
      activeContracts,
      bidsToday,
      totalBids,
      pendingVerification: pendingVerificationCount,
      donationCount,
      donationTotal,
      subscriptionActive,
      subscriptionHint
    },
    recentJobs,
    recentBids,
    verificationQueue,
    recentDonations
  };
}
