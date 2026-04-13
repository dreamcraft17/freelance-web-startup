import { redirect } from "next/navigation";
import { BidStatus, ContractStatus, JobStatus } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
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

  const clientProfile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true, displayName: true }
  });

  const hasProfile = Boolean(clientProfile);

  const [activeContractsCount, completedHiresCount] = await Promise.all([
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
    })
  ]);

  let openJobsCount = 0;
  let incomingBidsCount = 0;
  let recentJobsRaw: ClientJobRow[] = [];
  let recentBidsRaw: ClientBidRow[] = [];

  if (clientProfile) {
    const [open, incoming, jobs, bids] = await Promise.all([
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
      })
    ]);
    openJobsCount = open;
    incomingBidsCount = incoming;
    recentJobsRaw = jobs;
    recentBidsRaw = bids;
  }

  const recentContractsRaw = await db.contract.findMany({
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
  });

  const recentJobs: ClientDashboardJob[] = recentJobsRaw.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    workMode: j.workMode,
    city: j.city,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    categoryName: j.category?.name ?? null,
    bidCount: j._count.bids
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
        ? "Accepting proposals"
        : "Post a job to open a listing"
      : "Create a client profile to post",
    incomingBids: hasProfile ? String(incomingBidsCount) : "0",
    incomingBidsHint: hasProfile
      ? incomingBidsCount > 0
        ? "Awaiting your review"
        : "No pending proposals"
      : "Requires a posted job",
    activeContracts: String(activeContractsCount),
    activeContractsHint:
      activeContractsCount > 0 ? "In progress or pending start" : "Accept a bid to start a hire",
    hiresCompleted: String(completedHiresCount),
    hiresCompletedHint: completedHiresCount > 0 ? "All-time completed hires" : "Completed work counts here"
  };

  return (
    <ClientDashboard
      greetingName={greetingName}
      displayName={displayName}
      hasProfile={hasProfile}
      stats={stats}
      recentJobs={recentJobs}
      recentBids={recentBids}
      recentContracts={recentContracts}
    />
  );
}
