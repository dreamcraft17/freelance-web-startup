import { AnalyticsService } from "@/server/services/v2-commerce.service";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";
import { Card } from "@/components/ui/card";

export default async function AdminAnalyticsPage() {
  await requireAdminAccess("analytics");
  const analytics = new AnalyticsService();
  const overview = await analytics.getOverview();
  const moderation = await analytics.getModerationMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="nw-type-page-title text-slate-900">Analytics</h1>
        <p className="nw-type-body mt-1 text-slate-600">NextWork V2 marketplace metrics (real data).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="GMV (completed)" value={`${overview.gmvCents.toLocaleString()} cents`} />
        <MetricCard label="Open jobs" value={String(overview.openJobs)} />
        <MetricCard label="Active contracts" value={String(overview.activeContracts)} />
        <MetricCard label="Completion rate" value={`${overview.completionRatePercent}%`} />
        <MetricCard label="Active subscriptions" value={String(overview.activeSubscriptions)} />
        <MetricCard label="Pending payouts" value={String(overview.pendingPayouts)} />
        <MetricCard label="Open reports" value={String(moderation.open)} />
        <MetricCard label="SLA overdue" value={String(moderation.overdue)} />
        <MetricCard label="Pending appeals" value={String(moderation.pendingAppeals)} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="nw-card p-4">
      <p className="nw-type-caption text-slate-500">{label}</p>
      <p className="nw-type-section-title mt-1 text-slate-900">{value}</p>
    </Card>
  );
}
