import type { Route } from "next";
import Link from "next/link";

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
  wm === "REMOTE" || wm === "ONSITE" || wm === "HYBRID"
    ? wm.charAt(0) + wm.slice(1).toLowerCase()
    : wm;

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
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}` as Route}
            className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200/80 hover:shadow-md"
          >
            <h2 className="text-base font-semibold leading-snug text-slate-900">{job.title}</h2>
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{job.description}</p>
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p>
                <span className="font-medium text-slate-800">{budgetLabel(job)}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="text-slate-600">{workModeLabel(job.workMode)}</span>
                {job.city ? (
                  <>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-slate-600">{job.city}</span>
                  </>
                ) : null}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
