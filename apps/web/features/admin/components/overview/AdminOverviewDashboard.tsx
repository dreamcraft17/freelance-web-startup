import Link from "next/link";
import type { Route } from "next";
import type { AdminOverviewData } from "@/features/admin/data/overview-data";
import {
  AdminEmptyState,
  AdminInsightPanel,
  AdminPageIntro,
  AdminStatCard,
  AdminStatGrid,
  AdminStatSection,
  formatAdminDateTime
} from "@/features/admin/components/AdminUi";

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-[10rem] truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700">
      {children}
    </span>
  );
}

export function AdminOverviewDashboard({ data }: { data: AdminOverviewData }) {
  const { counts } = data;

  return (
    <div className="space-y-6">
      <AdminPageIntro
        title="Operations overview"
        description="Live counts and recent activity across users, hiring, moderation queues, and monetization."
        badge="Internal only"
      />

      <AdminStatSection title="Platform">
        <AdminStatGrid>
          <AdminStatCard label="Total users" value={String(counts.totalUsers)} />
          <AdminStatCard label="Freelancers" value={String(counts.totalFreelancers)} />
          <AdminStatCard label="Clients" value={String(counts.totalClients)} />
          <AdminStatCard label="Open jobs" value={String(counts.openJobs)} hint="Status: OPEN" />
          <AdminStatCard
            label="Active contracts"
            value={String(counts.activeContracts)}
            hint="ACTIVE or IN_PROGRESS"
          />
        </AdminStatGrid>
      </AdminStatSection>

      <AdminStatSection title="Activity & queues">
        <AdminStatGrid>
          <AdminStatCard label="Bids today" value={String(counts.bidsToday)} hint="Since midnight (server TZ)" />
          <AdminStatCard label="Bids (all time)" value={String(counts.totalBids)} />
          <AdminStatCard label="Pending verification" value={String(counts.pendingVerification)} hint="Queue depth" />
        </AdminStatGrid>
      </AdminStatSection>

      <AdminStatSection title="Monetization">
        <AdminStatGrid>
          <AdminStatCard
            label="Donations"
            value={counts.donationTotal}
            hint={`${counts.donationCount} records · sum of stored amounts`}
          />
          <AdminStatCard
            label="Active subscriptions"
            value={String(counts.subscriptionActive)}
            hint={
              counts.subscriptionHint ||
              (counts.subscriptionActive > 0
                ? "No trialing or at-risk rows in index"
                : "No active subscriptions")
            }
          />
        </AdminStatGrid>
      </AdminStatSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminInsightPanel title="Recent jobs" viewAllHref={"/admin/jobs" as Route}>
          {data.recentJobs.length === 0 ? (
            <div className="p-3.5">
              <AdminEmptyState title="No jobs yet" copy="Jobs will appear here as clients publish listings." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Job</th>
                    <th className="px-3 py-2 font-medium">Client</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Status</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentJobs.map((row) => (
                    <tr key={row.id} className="bg-white">
                      <td className="max-w-[14rem] truncate px-3 py-2 font-medium text-slate-900" title={row.title}>
                        {row.title}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2 text-slate-600" title={row.clientLabel}>
                        {row.clientLabel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <StatusPill>{row.status}</StatusPill>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {formatAdminDateTime(row.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminInsightPanel>

        <AdminInsightPanel title="Recent bids" viewAllHref={"/admin/bids" as Route}>
          {data.recentBids.length === 0 ? (
            <div className="p-3.5">
              <AdminEmptyState title="No bids yet" copy="Bid activity will show here once freelancers respond to jobs." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Job</th>
                    <th className="px-3 py-2 font-medium">Freelancer</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Amount</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Status</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentBids.map((row) => (
                    <tr key={row.id} className="bg-white">
                      <td className="max-w-[12rem] truncate px-3 py-2 text-slate-900" title={row.jobTitle}>
                        {row.jobTitle}
                      </td>
                      <td className="max-w-[9rem] truncate px-3 py-2 text-slate-600" title={row.freelancerUsername}>
                        @{row.freelancerUsername}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-medium tabular-nums text-slate-900">
                        {row.amountLabel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <StatusPill>{row.status}</StatusPill>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {formatAdminDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminInsightPanel>

        <AdminInsightPanel title="Pending verification" viewAllHref={"/admin/verification" as Route}>
          {data.verificationQueue.length === 0 ? (
            <div className="p-3.5">
              <AdminEmptyState title="Queue clear" copy="No requests waiting in PENDING status." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[24rem] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Type</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Queued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.verificationQueue.map((row) => (
                    <tr key={row.id} className="bg-white">
                      <td className="max-w-[16rem] truncate px-3 py-2 text-slate-900" title={row.userEmail}>
                        {row.userEmail}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <StatusPill>{row.type}</StatusPill>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {formatAdminDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminInsightPanel>

        <AdminInsightPanel title="Recent donations" viewAllHref={"/admin/donations" as Route}>
          {data.recentDonations.length === 0 ? (
            <div className="p-3.5">
              <AdminEmptyState
                title="No donations recorded"
                copy="Donations will list here when payments are stored against the platform."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentDonations.map((row) => (
                    <tr key={row.id} className="bg-white">
                      <td className="whitespace-nowrap px-3 py-2 font-medium tabular-nums text-slate-900">
                        {row.amountLabel}
                      </td>
                      <td className="max-w-[14rem] truncate px-3 py-2 text-slate-600" title={row.email ?? undefined}>
                        {row.email ?? "Anonymous"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {formatAdminDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminInsightPanel>
      </div>

      <section className="rounded-lg border border-slate-200 border-dashed bg-slate-50/80 px-3.5 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Data notes</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed">
          <li>
            Donation total sums numeric <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[11px]">amount</code>{" "}
            fields; confirm currency mix on the{" "}
            <Link href={"/admin/donations" as Route} className="font-medium text-[#3525cd] hover:underline">
              donations
            </Link>{" "}
            page before reporting.
          </li>
          <li>Subscription figures exclude expired rows; trialing / past due shown in the active card hint when present.</li>
        </ul>
      </section>
    </div>
  );
}
