"use client";

import type { Route } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";

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

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function workModeChipClass(wm: string): string {
  if (wm === "REMOTE") return "border-slate-300 bg-slate-50 text-slate-800";
  if (wm === "ONSITE") return "border-amber-300/70 bg-amber-50 text-amber-950";
  if (wm === "HYBRID") return "border-[#3525cd]/35 bg-[#3525cd]/[0.07] text-[#3525cd]";
  return "border-slate-200 bg-white text-slate-700";
}

export function JobsPublicList({ jobs }: { jobs: JobsPublicCard[] }) {
  const { t } = useI18n();

  const workModeLabel = (wm: string) => {
    if (wm === "REMOTE") return t("public.filters.workModeRemote");
    if (wm === "ONSITE") return t("public.filters.workModeOnSite");
    if (wm === "HYBRID") return t("public.filters.workModeHybrid");
    return wm;
  };

  const budgetLabelLocalized = (job: JobsPublicCard): string => {
    const { budgetMin: min, budgetMax: max, currency, budgetType } = job;
    if (min != null && max != null) return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
    if (min != null) return t("public.jobs.budgetFrom", { amount: formatMoney(min, currency) });
    if (max != null) return t("public.jobs.budgetUpTo", { amount: formatMoney(max, currency) });
    return budgetType.replace(/_/g, " ");
  };

  return (
    <ul className="divide-y divide-slate-200 overflow-hidden border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}` as Route}
            className="group flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-slate-50/90 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5 sm:py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold leading-snug text-slate-950 group-hover:text-[#3525cd] sm:text-[17px]">
                  {job.title}
                </h2>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${workModeChipClass(job.workMode)}`}
                >
                  {workModeLabel(job.workMode)}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{job.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 border-t border-slate-100 pt-2.5 text-left sm:w-56 sm:border-t-0 sm:items-end sm:pt-0 sm:text-right">
              <span className="text-[15px] font-bold tabular-nums text-slate-950">{budgetLabelLocalized(job)}</span>
              {job.city ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                  {job.city}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">{t("public.jobs.noCity")}</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
