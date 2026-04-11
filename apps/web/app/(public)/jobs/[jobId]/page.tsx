import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

function formatMoney(amount: unknown, currency: string): string {
  const n =
    amount != null && typeof (amount as { toString?: () => string }).toString === "function"
      ? Number(amount)
      : NaN;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function budgetLine(job: {
  budgetMin: unknown;
  budgetMax: unknown;
  currency: string;
  budgetType: string;
}): string {
  const min = job.budgetMin;
  const max = job.budgetMax;
  if (min != null && max != null) {
    return `${formatMoney(min, job.currency)} – ${formatMoney(max, job.currency)}`;
  }
  if (min != null) return `From ${formatMoney(min, job.currency)}`;
  if (max != null) return `Up to ${formatMoney(max, job.currency)}`;
  return job.budgetType.replace(/_/g, " ");
}

function locationParts(
  parts: { city?: string | null; country?: string | null }[]
): string | null {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const c = p.city?.trim();
    const co = p.country?.trim();
    if (c && !seen.has(`c:${c}`)) {
      seen.add(`c:${c}`);
      out.push(c);
    } else if (co && !seen.has(`co:${co}`)) {
      seen.add(`co:${co}`);
      out.push(co);
    }
  }
  return out.length > 0 ? out.join(" · ") : null;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { jobId: rawId } = await params;
  const jobId = rawId?.trim() ?? "";
  if (!jobId) notFound();

  const jobService = new JobService();
  const job = await jobService.getJobByIdForPublic(jobId);
  if (!job) notFound();

  const categoryLabel = job.subcategory
    ? `${job.category.name} · ${job.subcategory.name}`
    : job.category.name;

  const jobLocation = locationParts([{ city: job.city, country: job.country }]);
  const clientLocation = locationParts([
    { city: job.clientProfile.city, country: job.clientProfile.country }
  ]);

  const bidDeadline =
    job.bidDeadline != null
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(job.bidDeadline)
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/jobs" className="hover:text-foreground underline-offset-4 hover:underline">
          Browse jobs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Details</span>
      </nav>

      <PageHeader
        title={job.title}
        description={
          [categoryLabel, job.workMode, jobLocation].filter(Boolean).join(" · ") || "Open role"
        }
        actions={<SaveJobButton jobId={job.id} />}
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget</CardTitle>
            <CardDescription>{budgetLine(job)}</CardDescription>
          </CardHeader>
          {bidDeadline ? (
            <CardContent className="text-muted-foreground pt-0 text-sm">Bids close {bidDeadline}</CardContent>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category</CardTitle>
            <CardDescription>{categoryLabel}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
            <CardDescription>
              {job.clientProfile.displayName}
              {job.clientProfile.companyName ? ` · ${job.clientProfile.companyName}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            {job.clientProfile.industry ? <p>{job.clientProfile.industry}</p> : null}
            {clientLocation ? <p>{clientLocation}</p> : null}
            {!job.clientProfile.industry && !clientLocation ? (
              <p className="text-muted-foreground/80">No additional client details.</p>
            ) : null}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Description</h2>
          <Separator className="mb-4" />
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        </div>
      </div>
    </div>
  );
}
