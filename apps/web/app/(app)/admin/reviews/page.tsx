import { db } from "@acme/database";
import { AdminPageIntro, AdminPanel } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminReviewsPage() {
  await requireStaffSession("reviews");
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      rating: true,
      targetType: true,
      comment: true,
      createdAt: true,
      author: { select: { email: true } }
    }
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro title="Reviews" description="Internal moderation visibility for ratings and review comments." />
      <AdminPanel title={`Recent reviews (${reviews.length})`}>
        <div className="space-y-2">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{r.rating}/5</span>
                <span>{r.targetType}</span>
                <span>{r.author.email}</span>
                <span>{r.createdAt.toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.comment?.trim() ? r.comment : "No comment provided."}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

