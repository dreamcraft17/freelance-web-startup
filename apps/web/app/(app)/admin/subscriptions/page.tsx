import { db } from "@acme/database";
import { SubscriptionStatus } from "@acme/types";
import { AdminEmptyState, AdminPageIntro } from "@/features/admin/components/AdminUi";
import { SubscriptionPlanCatalog } from "@/features/admin/components/subscriptions/SubscriptionPlanCatalog";
import { UserSubscriptionsFilters } from "@/features/admin/components/subscriptions/UserSubscriptionsFilters";
import { UserSubscriptionsTable } from "@/features/admin/components/subscriptions/UserSubscriptionsTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

type SearchParams = { status?: string; plan?: string };

const PAGE_LIMIT = 120;

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminAccess("subscriptions");
  const sp = await searchParams;
  const planCode = sp.plan?.trim() || undefined;
  const status =
    sp.status && Object.values(SubscriptionStatus).includes(sp.status as SubscriptionStatus)
      ? (sp.status as SubscriptionStatus)
      : undefined;

  const hasActiveFilters = Boolean(status || planCode);

  const [planCatalog, subscriptions] = await Promise.all([
    db.subscriptionPlan.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        billingCycle: true,
        priceCents: true,
        currency: true,
        isActive: true,
        entitlements: true
      }
    }),
    db.userSubscription.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(planCode ? { plan: { code: planCode } } : {})
      },
      orderBy: { updatedAt: "desc" },
      take: PAGE_LIMIT,
      select: {
        id: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
        user: { select: { email: true } },
        plan: {
          select: {
            code: true,
            name: true,
            billingCycle: true
          }
        }
      }
    })
  ]);

  const filterPlans = planCatalog.map((p) => ({ code: p.code, name: p.name }));

  const rows = subscriptions.map((s) => ({
    id: s.id,
    userEmail: s.user.email,
    planLabel: s.plan.name,
    planCode: s.plan.code,
    billingCycle: s.plan.billingCycle,
    status: s.status,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    createdAt: s.createdAt,
    periodStart: s.currentPeriodStart,
    periodEnd: s.currentPeriodEnd
  }));

  return (
    <div className="space-y-6">
      <AdminPageIntro
        title="Subscriptions"
        description="Plan catalog plus subscriber rows for finance and product ops. Early billing stacks may have few rows—catalog stays useful for structure; lifecycle fields come from UserSubscription."
        badge="Finance / product"
      />

      <div className="rounded-lg border border-slate-200 border-dashed bg-[#f8f9fb] px-3.5 py-3 text-xs leading-relaxed text-slate-600">
        <p className="font-semibold text-slate-800">Internal note</p>
        <p className="mt-1">
          Monetization may still be early-access: PSP identifiers (<code className="rounded bg-white px-1 font-mono">external*</code>) and
          renewal automation can land later. This page surfaces what exists today—plans, subscriber status, and current
          billing period windows.
        </p>
      </div>

      <SubscriptionPlanCatalog plans={planCatalog} />

      <UserSubscriptionsFilters status={status} planCode={planCode} plans={filterPlans} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">
            Subscriber records
            <span className="ml-2 font-normal text-slate-500">({rows.length} shown)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Newest activity first, up to {PAGE_LIMIT} rows. Period = current invoice window from stored dates.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState
              title={hasActiveFilters ? "No matching subscriptions" : "No subscriber rows yet"}
              copy={
                hasActiveFilters
                  ? "Clear filters or pick another plan/status."
                  : "When users subscribe, rows appear here with status and period. Plans above still define what you can sell."
              }
            />
          </div>
        ) : (
          <UserSubscriptionsTable rows={rows} />
        )}
      </section>
    </div>
  );
}
