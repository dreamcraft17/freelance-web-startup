import { db } from "@acme/database";
import { BidStatus } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminBidsFilters } from "@/features/admin/components/bids/AdminBidsFilters";
import { AdminBidsTable } from "@/features/admin/components/bids/AdminBidsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { status?: string; q?: string; freelancer?: string };

const PAGE_LIMIT = 120;

function formatMoney(amount: unknown, currency: string): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default async function AdminBidsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("bids");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const freelancer = sp.freelancer?.trim() || undefined;
  const status = Object.values(BidStatus).includes(sp.status as BidStatus) ? (sp.status as BidStatus) : undefined;

  const hasActiveFilters = Boolean(status || q || freelancer);

  const rows = await db.bid.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { job: { title: { contains: q, mode: "insensitive" } } } : {}),
      ...(freelancer
        ? { freelancer: { username: { contains: freelancer, mode: "insensitive" } } }
        : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      status: true,
      bidAmount: true,
      createdAt: true,
      freelancer: { select: { username: true, fullName: true } },
      job: { select: { title: true, slug: true, currency: true } }
    }
  });

  const bids = rows.map((b) => {
    const name = b.freelancer.fullName?.trim();
    const handle = `@${b.freelancer.username}`;
    return {
      id: b.id,
      freelancerLine: name || handle,
      freelancerHandle: name ? handle : undefined,
      jobTitle: b.job.title,
      jobSlug: b.job.slug,
      amountLabel: formatMoney(b.bidAmount, b.job.currency ?? "USD"),
      status: b.status,
      createdAt: b.createdAt
    };
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Bids"
        description="Cross-job bid log for support: match freelancers to jobs, amounts, and lifecycle status. Read-only."
        badge="Read-only"
      />

      <AdminBidsFilters status={status} q={q} freelancer={freelancer} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Bid records
            <span className="ml-2 font-normal text-slate-500">({bids.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Amount uses the job&apos;s currency. Bid ID on hover for tickets.
          </p>
        </div>

        {bids.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching bids" : "No bids yet"}
              copy={
                hasActiveFilters
                  ? "Try clearing filters or broadening job title / username search."
                  : "Bids appear when freelancers submit proposals on jobs."
              }
            />
          </div>
        ) : (
          <AdminBidsTable bids={bids} />
        )}
      </section>
    </div>
  );
}
