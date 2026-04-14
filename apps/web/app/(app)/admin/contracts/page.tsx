import { db } from "@acme/database";
import { ContractStatus } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminContractsFilters } from "@/features/admin/components/contracts/AdminContractsFilters";
import { AdminContractsTable } from "@/features/admin/components/contracts/AdminContractsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { status?: string; q?: string };

const PAGE_LIMIT = 120;

function formatMoney(amount: unknown | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return "—";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) return "—";
  const cur = currency?.trim() || "USD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(n);
  } catch {
    return `${cur} ${n.toFixed(2)}`;
  }
}

function clientLabel(u: {
  email: string;
  clientProfile: { displayName: string | null; companyName: string | null } | null;
}): string {
  const cp = u.clientProfile;
  const fromProfile = cp?.companyName?.trim() || cp?.displayName?.trim();
  return fromProfile || u.email;
}

function freelancerLabel(u: {
  email: string;
  freelancerProfile: { username: string; fullName: string | null } | null;
}): { line: string; handle?: string } {
  const fp = u.freelancerProfile;
  if (!fp) return { line: u.email };
  const name = fp.fullName?.trim();
  const handle = `@${fp.username}`;
  return name ? { line: name, handle } : { line: handle };
}

export default async function AdminContractsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("contracts");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = Object.values(ContractStatus).includes(sp.status as ContractStatus)
    ? (sp.status as ContractStatus)
    : undefined;

  const hasActiveFilters = Boolean(status || q);

  const rows = await db.contract.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(q ? { bid: { job: { title: { contains: q, mode: "insensitive" } } } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      createdAt: true,
      bid: {
        select: {
          job: { select: { title: true, slug: true } }
        }
      },
      clientUser: {
        select: {
          email: true,
          clientProfile: { select: { displayName: true, companyName: true } }
        }
      },
      freelancerUser: {
        select: {
          email: true,
          freelancerProfile: { select: { username: true, fullName: true } }
        }
      }
    }
  });

  const contracts = rows.map((c) => {
    const fl = freelancerLabel(c.freelancerUser);
    return {
      id: c.id,
      jobTitle: c.bid.job.title,
      jobSlug: c.bid.job.slug,
      clientLabel: clientLabel(c.clientUser),
      freelancerLabel: fl.line,
      freelancerHandle: fl.handle,
      status: c.status,
      amountLabel: formatMoney(c.amount, c.currency),
      createdAt: c.createdAt
    };
  });

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Contracts"
        description="Accepted engagements linked to jobs: parties, value, lifecycle, and timestamps. Read-only operations view."
        badge="Read-only"
      />

      <AdminContractsFilters status={status} q={q} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Contract records
            <span className="ml-2 font-normal text-slate-500">({contracts.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Job title comes from the underlying listing; amount may be unset on
            some rows.
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching contracts" : "No contracts yet"}
              copy={
                hasActiveFilters
                  ? "Adjust status or job title search."
                  : "Contracts appear when bids are accepted and a contract record is created."
              }
            />
          </div>
        ) : (
          <AdminContractsTable contracts={contracts} />
        )}
      </section>
    </div>
  );
}
