import Link from "next/link";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import { SavedFreelancerUnsaveButton, SavedJobUnsaveButton } from "@/features/saved/components/SavedListRefreshButtons";
import { SavedItemsService } from "@/server/services/saved-items.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return String(job.budgetType).replace(/_/g, " ");
}

export async function SavedListsSection() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const actor = sessionToActor(session);
  const savedItems = new SavedItemsService();
  const [jobsPayload, freelancersPayload] = await Promise.all([
    savedItems.listSavedJobs(actor),
    savedItems.listSavedFreelancers(actor)
  ]);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section id="saved-jobs">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Saved jobs</h2>
        {jobsPayload.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No saved jobs yet.{" "}
            <Link href="/jobs" className="text-foreground font-medium underline-offset-4 hover:underline">
              Browse jobs
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {jobsPayload.items.map(({ savedAt, job }) => (
              <li key={job.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-snug">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          {job.title}
                        </Link>
                      </CardTitle>
                      <SavedJobUnsaveButton jobId={job.id} />
                    </div>
                    <CardDescription className="text-xs">
                      {budgetLine(job)} · {job.workMode}
                      {job.city ? ` · ${job.city}` : ""}
                      {job.status !== "OPEN" ? ` · ${job.status}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground pt-0 text-xs">Saved {savedAt}</CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="saved-freelancers">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Saved freelancers</h2>
        {freelancersPayload.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No saved freelancers yet. Save profiles from search or directory when those flows expose a save
            control.
          </p>
        ) : (
          <ul className="space-y-3">
            {freelancersPayload.items.map(({ savedAt, freelancer }) => (
              <li key={freelancer.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-snug">
                        <Link href={`/freelancers/${freelancer.username}`} className="hover:underline">
                          @{freelancer.username}
                        </Link>
                      </CardTitle>
                      <SavedFreelancerUnsaveButton freelancerProfileId={freelancer.id} />
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">
                      {freelancer.fullName}
                      {freelancer.headline ? ` — ${freelancer.headline}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground pt-0 text-xs">
                    {freelancer.deletedAt != null ? (
                      <span className="text-amber-700 dark:text-amber-400">Profile unavailable · </span>
                    ) : null}
                    Saved {savedAt}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
