import { db } from "@acme/database";
import { JobStatus, JobVisibility } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminJobsFilters } from "@/features/admin/components/jobs/AdminJobsFilters";
import { AdminJobsTable } from "@/features/admin/components/jobs/AdminJobsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { status?: string; visibility?: string; q?: string };

const PAGE_LIMIT = 120;

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("jobs");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = Object.values(JobStatus).includes(sp.status as JobStatus) ? (sp.status as JobStatus) : undefined;
  const visibility = Object.values(JobVisibility).includes(sp.visibility as JobVisibility)
    ? (sp.visibility as JobVisibility)
    : undefined;

  const hasActiveFilters = Boolean(status || visibility || q);

  const rows = await db.job.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(visibility ? { visibility } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      clientProfile: { select: { displayName: true, companyName: true } },
      _count: { select: { bids: true } }
    }
  });

  const jobs = rows.map((j) => {
    const cp = j.clientProfile;
    const clientLabel = cp?.companyName?.trim() || cp?.displayName?.trim() || "—";
    return {
      id: j.id,
      title: j.title,
      slug: j.slug,
      clientLabel,
      status: j.status,
      createdAt: j.createdAt,
      bidCount: j._count.bids
    };
  });

  const openInResult = jobs.filter((j) => j.status === JobStatus.OPEN).length;

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Jobs"
        description="Operational listing for moderation and support: client, lifecycle status, bid volume, and timestamps. Read-only."
        badge="Read-only"
      />

      <AdminJobsFilters status={status} visibility={visibility} q={q} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Job listings
            <span className="ml-2 font-normal text-slate-500">
              ({jobs.length} shown
              {jobs.length > 0 ? ` · ${openInResult} OPEN in this result` : ""})
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Bid count includes all bids linked to the job record.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching jobs" : "No job listings yet"}
              copy={
                hasActiveFilters
                  ? "Adjust status, visibility, or title search."
                  : "Published jobs will appear here once clients create listings."
              }
            />
          </div>
        ) : (
          <AdminJobsTable jobs={jobs} />
        )}
      </section>
    </div>
  );
}
