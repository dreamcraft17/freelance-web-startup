import { db } from "@acme/database";
import { VerificationStatus } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminVerificationFilters } from "@/features/admin/components/verification/AdminVerificationFilters";
import { AdminVerificationTable } from "@/features/admin/components/verification/AdminVerificationTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { status?: string };

const PAGE_LIMIT = 120;

function statusLabel(status: VerificationStatus): string {
  switch (status) {
    case VerificationStatus.PENDING:
      return "Pending";
    case VerificationStatus.VERIFIED:
      return "Approved";
    case VerificationStatus.REJECTED:
      return "Rejected";
    case VerificationStatus.NOT_VERIFIED:
      return "Not verified";
    case VerificationStatus.EXPIRED:
      return "Expired";
    default:
      return status;
  }
}

export default async function AdminVerificationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("verification");
  const sp = await searchParams;
  const raw = sp.status?.trim();
  const status =
    raw && Object.values(VerificationStatus).includes(raw as VerificationStatus)
      ? (raw as VerificationStatus)
      : undefined;

  const hasActiveFilters = Boolean(status);

  const rows = await db.verificationRequest.findMany({
    where: {
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      reviewNote: true,
      user: { select: { email: true, role: true } },
      reviewer: { select: { email: true } }
    }
  });

  const tableRows = rows.map((r) => ({
    id: r.id,
    userEmail: r.user.email,
    userRole: r.user.role,
    type: r.type,
    status: r.status as VerificationStatus,
    statusLabel: statusLabel(r.status as VerificationStatus),
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
    reviewerEmail: r.reviewer?.email ?? null,
    reviewNote: r.reviewNote
  }));

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Verification queue"
        description="Freelancer verification intake: pending items can be approved or rejected via the same API used elsewhere. Read the review column for audit trail."
        badge="Moderation"
      />

      <AdminVerificationFilters status={status} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Requests
            <span className="ml-2 font-normal text-slate-500">({tableRows.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Approve / Reject calls{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">PATCH /api/verification/:id</code>{" "}
            (staff session required).
          </p>
        </div>

        {tableRows.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching requests" : "No verification requests"}
              copy={
                hasActiveFilters
                  ? "Try clearing the status filter."
                  : "Nothing in the queue yet. Requests appear when users submit verification."
              }
            />
          </div>
        ) : (
          <AdminVerificationTable rows={tableRows} />
        )}
      </section>
    </div>
  );
}
