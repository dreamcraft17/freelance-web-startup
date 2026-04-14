import { db } from "@acme/database";
import { ReviewTargetType } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminReviewsFilters } from "@/features/admin/components/reviews/AdminReviewsFilters";
import { AdminReviewsTable } from "@/features/admin/components/reviews/AdminReviewsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { targetType?: string; q?: string };

const PAGE_LIMIT = 120;

function buildTargetLine(
  targetType: ReviewTargetType,
  row: {
    targetClientUser: { email: string } | null;
    targetFreelancerUser: { email: string } | null;
    targetClientProfile: { displayName: string | null; companyName: string | null } | null;
    targetFreelancerProfile: { username: string; fullName: string | null } | null;
  }
): string {
  if (targetType === ReviewTargetType.CLIENT) {
    const p = row.targetClientProfile;
    const u = row.targetClientUser;
    return p?.companyName?.trim() || p?.displayName?.trim() || u?.email || "—";
  }
  const p = row.targetFreelancerProfile;
  const u = row.targetFreelancerUser;
  const name = p?.fullName?.trim();
  const handle = p?.username ? `@${p.username}` : null;
  if (name && handle) return `${name} (${handle})`;
  if (handle) return handle;
  if (name) return name;
  return u?.email ?? "—";
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("reviews");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const targetType =
    sp.targetType && Object.values(ReviewTargetType).includes(sp.targetType as ReviewTargetType)
      ? (sp.targetType as ReviewTargetType)
      : undefined;

  const hasActiveFilters = Boolean(targetType || q);

  const reviews = await db.review.findMany({
    where: {
      ...(targetType ? { targetType } : {}),
      ...(q ? { comment: { contains: q, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      targetType: true,
      rating: true,
      comment: true,
      createdAt: true,
      author: { select: { email: true, role: true } },
      targetClientUser: { select: { email: true } },
      targetFreelancerUser: { select: { email: true } },
      targetClientProfile: { select: { displayName: true, companyName: true } },
      targetFreelancerProfile: { select: { username: true, fullName: true } }
    }
  });

  const rows = reviews.map((r) => ({
    id: r.id,
    authorLine: r.author.email,
    authorRole: r.author.role,
    targetLine: buildTargetLine(r.targetType as ReviewTargetType, r),
    targetKind: r.targetType as ReviewTargetType,
    rating: r.rating,
    createdAt: r.createdAt,
    commentPreview: r.comment
  }));

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Reviews"
        description="Contract-linked ratings and comments for moderation and support. Read-only directory."
        badge="Read-only"
      />

      <AdminReviewsFilters targetType={targetType} q={q} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Review records
            <span className="ml-2 font-normal text-slate-500">({rows.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Target resolves from profile + user fallbacks. Comment search matches
            stored text only (empty comments excluded from text search).
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching reviews" : "No reviews yet"}
              copy={
                hasActiveFilters
                  ? "Clear filters or try a different comment search."
                  : "Reviews appear after parties leave feedback on completed contracts."
              }
            />
          </div>
        ) : (
          <AdminReviewsTable rows={rows} />
        )}
      </section>
    </div>
  );
}
