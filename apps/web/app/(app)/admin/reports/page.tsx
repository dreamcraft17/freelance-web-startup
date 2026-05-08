import { adminReportsQuerySchema } from "@acme/validators";
import { AdminPageIntro, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { AdminModerationReportsTable } from "@/features/admin/components/reports/AdminModerationReportsTable";
import { AdminReportsFilterBar } from "@/features/admin/components/reports/AdminReportsFilterBar";
import { sessionToActor } from "@/lib/auth";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";
import type { ModerationReport } from "@prisma/client";
import { ModerationReportService } from "@/server/services/moderation-report.service";

type SearchParams = {
  status?: string;
  subjectType?: string;
  assigned?: string;
  q?: string;
  page?: string;
  limit?: string;
};

function shortenId(id: string | null | undefined): string {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

function subjectSummary(row: ModerationReport): string {
  switch (row.subjectType) {
    case "USER":
      return `User · ${shortenId(row.subjectUserId)}`;
    case "JOB":
      return `Job · ${shortenId(row.subjectJobId)}`;
    case "BID":
      return `Bid · ${shortenId(row.subjectBidId)}`;
    case "REVIEW":
      return `Review · ${shortenId(row.subjectReviewId)}`;
    case "MESSAGE_THREAD":
      return `Thread · ${shortenId(row.subjectThreadId)}`;
    case "MESSAGE":
      return `Message · ${shortenId(row.subjectMessageId)}`;
    default:
      return "—";
  }
}

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireAdminAccess("reports");
  const sp = await searchParams;

  const parsed = adminReportsQuerySchema.safeParse({
    page: sp.page ?? "1",
    limit: sp.limit ?? "40",
    status: sp.status,
    subjectType: sp.subjectType,
    assignedToStaffUserId: sp.assigned || undefined,
    q: sp.q
  });

  const query = parsed.success ? parsed.data : adminReportsQuerySchema.parse({});

  const actor = sessionToActor(session);
  const svc = new ModerationReportService();
  const { items, total, page, limit } = await svc.listForStaff(actor, query);

  const rows = (
    items as Array<
      ModerationReport & {
        reporter: { email: string };
        assignedToStaff: { email: string; id: string } | null;
        _count: { notes: number };
      }
    >
  ).map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    status: r.status,
    subjectType: r.subjectType,
    subjectRef: subjectSummary(r),
    category: r.category,
    descriptionPreview:
      r.description.length > 180 ? `${r.description.slice(0, 177).trim()}…` : r.description.trim(),
    reporterEmail: r.reporter.email,
    assigneeEmail: r.assignedToStaff?.email ?? null,
    assigneeId: r.assignedToStaffUserId ?? null,
    noteCount: r._count.notes
  }));

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Moderation queue"
        description="Operational triage for user-submitted reports. Assign, annotate, resolve or dismiss—with audit timestamps and actor references stored on each ticket."
        badge="Trust & safety"
      />

      <AdminReportsFilterBar query={{ ...query, page, limit }} total={total} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Reports
            <span className="ml-2 font-normal text-slate-500">
              ({rows.length} on this page · {total} matched)
            </span>
          </h3>
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <AdminEmptyState
              title="No reports in this slice"
              copy="Try clearing filters—or check back once users submit content reports from jobs, messages, and profiles."
            />
          </div>
        ) : (
          <AdminModerationReportsTable rows={rows} staffUserId={session.userId} />
        )}
      </section>
    </div>
  );
}
