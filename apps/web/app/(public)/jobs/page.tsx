import Link from "next/link";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatMoney(amount: unknown, currency: string): string {
  const n = amount != null && typeof (amount as { toString?: () => string }).toString === "function" ? Number(amount) : NaN;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

export default async function JobsBrowsePage() {
  const jobService = new JobService();
  const { items, total } = await jobService.listOpenJobs({ page: 1, limit: 24 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader
        title="Browse jobs"
        description={`${total} open role${total === 1 ? "" : "s"} available. Refine results with search filters from the API when you add them to this page.`}
      />

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No open jobs right now. Check back soon.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((job) => {
            const min = job.budgetMin;
            const max = job.budgetMax;
            const budgetLabel =
              min != null && max != null
                ? `${formatMoney(min, job.currency)} – ${formatMoney(max, job.currency)}`
                : min != null
                  ? `From ${formatMoney(min, job.currency)}`
                  : max != null
                    ? `Up to ${formatMoney(max, job.currency)}`
                    : job.budgetType;

            return (
              <li key={job.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg leading-snug">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground space-y-1 text-xs">
                    <p>
                      <span className="font-medium text-foreground">{budgetLabel}</span>
                      <span className="mx-1">·</span>
                      {job.workMode}
                      {job.city ? (
                        <>
                          <span className="mx-1">·</span>
                          {job.city}
                        </>
                      ) : null}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
