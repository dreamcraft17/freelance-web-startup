import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { JobStatus } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
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
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client/jobs");
  }

  const sp = await searchParams;
  const statusFilter = statusFromSearchParam(sp.status);

  const clientProfile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true }
  });

  if (!clientProfile) {
    return <ClientJobsManager jobs={[]} statusParam={sp.status} hasProfile={false} />;
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
      status: true,
      workMode: true,
      city: true,
      createdAt: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      _count: { select: { bids: true } }
    }
  });

  const rows: ClientJobListRow[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    workMode: j.workMode,
    categoryName: j.category?.name ?? null,
    subcategoryName: j.subcategory?.name ?? null,
    city: j.city,
    bidCount: j._count.bids,
    createdAt: j.createdAt
  }));

  return <ClientJobsManager jobs={rows} statusParam={sp.status} hasProfile />;
}
