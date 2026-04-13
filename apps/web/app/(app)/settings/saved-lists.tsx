import Link from "next/link";
import type { Route } from "next";
import { getSessionFromCookies, sessionToActor } from "@src/lib/auth";
import { SavedFreelancerUnsaveButton, SavedJobUnsaveButton } from "@/features/saved/components/SavedListRefreshButtons";
import { SavedItemsService } from "@/server/services/saved-items.service";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { Briefcase, Users } from "lucide-react";

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
  const [jobsPayload, freelancersPayload]: [
    Awaited<ReturnType<SavedItemsService["listSavedJobs"]>>,
    Awaited<ReturnType<SavedItemsService["listSavedFreelancers"]>>
  ] = await Promise.all([savedItems.listSavedJobs(actor), savedItems.listSavedFreelancers(actor)]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section id="saved-freelancers" aria-labelledby="saved-freelancers-heading">
        <SettingsSectionCard
          icon={Users}
          title="Saved freelancers"
          description="Talent you bookmarked from search or the directory—handy when you are comparing hires."
          headingId="saved-freelancers-heading"
        >
          {freelancersPayload.items.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-600">
              No saved freelancers yet. Save profiles from search or directory when those flows expose a save
              control.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/30">
              {freelancersPayload.items.map(({ savedAt, freelancer }) => (
                <li key={freelancer.id} className="px-4 py-3.5 first:rounded-t-lg last:rounded-b-lg">
                  <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-slate-900">
                        <Link href={`/freelancers/${freelancer.username}` as Route} className="hover:underline">
                          @{freelancer.username}
                        </Link>
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {freelancer.fullName}
                        {freelancer.headline ? ` — ${freelancer.headline}` : ""}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {freelancer.deletedAt != null ? (
                          <span className="text-amber-700 dark:text-amber-400">Profile unavailable · </span>
                        ) : null}
                        Saved {savedAt}
                      </p>
                    </div>
                    <SavedFreelancerUnsaveButton freelancerProfileId={freelancer.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SettingsSectionCard>
      </section>

      <section id="saved-jobs" aria-labelledby="saved-jobs-heading">
        <SettingsSectionCard
          icon={Briefcase}
          title="Saved jobs"
          description="Roles you bookmarked from the board—return when you are ready to shortlist or compare."
          headingId="saved-jobs-heading"
        >
          {jobsPayload.items.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-600">
              No saved jobs yet.{" "}
              <Link
                href={"/jobs" as Route}
                className="font-medium text-[#3525cd] underline-offset-4 hover:underline"
              >
                Browse jobs
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/30">
              {jobsPayload.items.map(({ savedAt, job }) => (
                <li key={job.id} className="px-4 py-3.5 first:rounded-t-lg last:rounded-b-lg">
                  <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-slate-900">
                        <Link href={`/jobs/${job.id}` as Route} className="hover:underline">
                          {job.title}
                        </Link>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {budgetLine(job)} · {job.workMode}
                        {job.city ? ` · ${job.city}` : ""}
                        {job.status !== "OPEN" ? ` · ${job.status}` : ""}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">Saved {savedAt}</p>
                    </div>
                    <SavedJobUnsaveButton jobId={job.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SettingsSectionCard>
      </section>
    </div>
  );
}
