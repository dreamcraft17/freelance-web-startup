import type { Route } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

/** Public job card shape (matches `SerializableJobCard` from saved jobs UI). */
export type JobsPublicCard = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
};

const workModeLabel = (wm: string) =>
  wm === "REMOTE" || wm === "ONSITE" || wm === "HYBRID" ? wm.charAt(0) + wm.slice(1).toLowerCase() : wm;

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function budgetLabel(job: JobsPublicCard): string {
  const { budgetMin: min, budgetMax: max, currency, budgetType } = job;
  if (min != null && max != null) return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
  if (min != null) return `From ${formatMoney(min, currency)}`;
  if (max != null) return `Up to ${formatMoney(max, currency)}`;
  return budgetType.replace(/_/g, " ");
}

export function JobsPublicList({ jobs }: { jobs: JobsPublicCard[] }) {
  return (
    <ul className="nw-surface divide-y divide-slate-200 overflow-hidden">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}` as Route}
            className="flex flex-col gap-1 px-4 py-3.5 transition hover:bg-slate-50/90 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5 sm:py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">{job.title}</h2>
                <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {workModeLabel(job.workMode)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{job.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 border-t border-slate-100 pt-2 text-left sm:w-52 sm:border-t-0 sm:pt-0 sm:text-right">
              <span className="text-sm font-semibold tabular-nums text-slate-900">{budgetLabel(job)}</span>
              {job.city ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#433C93]" aria-hidden />
                  {job.city}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No city on brief</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
