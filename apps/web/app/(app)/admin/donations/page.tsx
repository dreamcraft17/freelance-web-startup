import { db } from "@acme/database";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { AdminDonationsFilters } from "@/features/admin/components/donations/AdminDonationsFilters";
import { AdminDonationsTable } from "@/features/admin/components/donations/AdminDonationsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { provider?: string; currency?: string; q?: string };

const PAGE_LIMIT = 120;

/** Schema has no payment lifecycle; rows represent captured ledger entries. */
const DISPLAY_STATUS = "Recorded";

function formatMoney(amount: unknown, currency: string): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default async function AdminDonationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("donations");
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const provider = sp.provider?.trim() || undefined;
  const currency = sp.currency?.trim()?.toUpperCase() || undefined;

  const hasActiveFilters = Boolean(provider || currency || q);

  const [distinctProviders, distinctCurrencies, donations] = await Promise.all([
    db.donation.findMany({
      select: { provider: true },
      distinct: ["provider"],
      orderBy: { provider: "asc" }
    }),
    db.donation.findMany({
      select: { currency: true },
      distinct: ["currency"],
      orderBy: { currency: "asc" }
    }),
    db.donation.findMany({
      where: {
        ...(provider ? { provider } : {}),
        ...(currency ? { currency } : {}),
        ...(q
          ? {
              user: {
                email: { contains: q, mode: "insensitive" }
              }
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_LIMIT,
      select: {
        id: true,
        amount: true,
        currency: true,
        provider: true,
        createdAt: true,
        user: { select: { email: true } }
      }
    })
  ]);

  const providerOptions = distinctProviders.map((p) => p.provider);
  const currencyOptions = distinctCurrencies.map((c) => c.currency);

  const rows = donations.map((d) => ({
    id: d.id,
    amountLabel: formatMoney(d.amount, d.currency ?? "USD"),
    methodLabel: d.provider,
    statusLabel: DISPLAY_STATUS,
    userLabel: d.user?.email ?? "Anonymous",
    createdAt: d.createdAt
  }));

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Donations"
        description="Support payment records for finance review. Amounts use stored currency codes; status reflects ledger capture (no chargeback/dispute fields in the model yet)."
        badge="Read-only"
      />

      <AdminDonationsFilters
        provider={provider}
        currency={currency}
        q={q}
        providerOptions={providerOptions}
        currencyOptions={currencyOptions}
      />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Donation records
            <span className="ml-2 font-normal text-slate-500">({rows.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest first, up to {PAGE_LIMIT} rows. Method maps to the stored payment provider/rail (e.g. MOCK). User may be
            empty for anonymous gifts.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching donations" : "No donations recorded"}
              copy={
                hasActiveFilters
                  ? "Adjust provider, currency, or email filter."
                  : "Donations will list here when support payments are persisted."
              }
            />
          </div>
        ) : (
          <AdminDonationsTable rows={rows} />
        )}
      </section>
    </div>
  );
}
