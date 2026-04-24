import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { BidStatus, JobStatus } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import { getAppLocale } from "@/lib/i18n/server-locale";
import {
  ClientJobsManager,
  type ClientJobListRow
} from "@/components/client-jobs/ClientJobsManager";

function statusFromSearchParam(raw: string | undefined): JobStatus | null {
  if (!raw || raw === "all") return null;
  if ((Object.values(JobStatus) as string[]).includes(raw)) return raw as JobStatus;
  return null;
}

export default async function ClientJobsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; review?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client/jobs");
  }

  const sp = await searchParams;
  const locale = await getAppLocale();
  const statusFilter = statusFromSearchParam(sp.status);

  const clientProfile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true }
  });

  if (!clientProfile) {
    return <ClientJobsManager jobs={[]} statusParam={sp.status} reviewParam={sp.review} hasProfile={false} />;
  }

  const jobs = await db.job.findMany({
    where: {
      clientProfileId: clientProfile.id,
      deletedAt: null,
      ...(statusFilter ? { status: statusFilter } : {})
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      titleEn: true,
      titleId: true,
      language: true,
      status: true,
      workMode: true,
      city: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      _count: { select: { bids: true } }
    }
  });

  const [bidAgg, latestBidAgg, messageThreads] = await Promise.all([
    db.bid.groupBy({
      by: ["jobId", "status"],
      where: {
        job: { clientProfileId: clientProfile.id, deletedAt: null }
      },
      _count: { _all: true }
    }),
    db.bid.groupBy({
      by: ["jobId"],
      where: {
        job: { clientProfileId: clientProfile.id, deletedAt: null }
      },
      _max: { createdAt: true }
    }),
    db.messageThread.findMany({
      where: {
        type: "JOB",
        job: { clientProfileId: clientProfile.id, deletedAt: null },
        participants: { some: { userId: session.userId } }
      },
      select: {
        id: true,
        jobId: true,
        updatedAt: true,
        participants: { select: { userId: true } },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, senderId: true }
        }
      }
    })
  ]);

  const bidMap = new Map<
    string,
    { submitted: number; shortlisted: number; accepted: number; latestBidAt: Date | null }
  >();
  for (const b of bidAgg) {
    const row = bidMap.get(b.jobId) ?? { submitted: 0, shortlisted: 0, accepted: 0, latestBidAt: null };
    if (b.status === BidStatus.SUBMITTED) row.submitted += b._count._all;
    if (b.status === BidStatus.SHORTLISTED) row.shortlisted += b._count._all;
    if (b.status === BidStatus.ACCEPTED) row.accepted += b._count._all;
    bidMap.set(b.jobId, row);
  }
  for (const b of latestBidAgg) {
    const row = bidMap.get(b.jobId) ?? { submitted: 0, shortlisted: 0, accepted: 0, latestBidAt: null };
    row.latestBidAt = b._max.createdAt ?? null;
    bidMap.set(b.jobId, row);
  }

  const messageMap = new Map<
    string,
    { conversationCount: number; awaitingReplyCount: number; latestMessageAt: Date | null }
  >();
  for (const t of messageThreads) {
    if (!t.jobId) continue;
    const row = messageMap.get(t.jobId) ?? { conversationCount: 0, awaitingReplyCount: 0, latestMessageAt: null };
    row.conversationCount += 1;
    const last = t.messages[0] ?? null;
    if (last && last.senderId !== session.userId) {
      row.awaitingReplyCount += 1;
    }
    if (last?.createdAt && (!row.latestMessageAt || last.createdAt > row.latestMessageAt)) {
      row.latestMessageAt = last.createdAt;
    }
    messageMap.set(t.jobId, row);
  }

  const rows: ClientJobListRow[] = jobs.map((j) => ({
    ...(bidMap.get(j.id) ?? { submitted: 0, shortlisted: 0, accepted: 0, latestBidAt: null }),
    ...(messageMap.get(j.id) ?? { conversationCount: 0, awaitingReplyCount: 0, latestMessageAt: null }),
    id: j.id,
    title: locale === "id" ? (j.titleId ?? j.title) : (j.titleEn ?? j.title),
    status: j.status,
    workMode: j.workMode,
    categoryName: j.category?.name ?? null,
    subcategoryName: j.subcategory?.name ?? null,
    city: j.city,
    bidCount: j._count.bids,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt
  }));

  return <ClientJobsManager jobs={rows} statusParam={sp.status} reviewParam={sp.review} hasProfile />;
}
