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
  translationSource: "en" | "id";
  isTranslated: boolean;
  categoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
  createdAt: string;
  isFeaturedActive: boolean;
};

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
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

  const timeAgoLabel = (iso: string): string => {
    const ts = Date.parse(iso);
    if (!Number.isFinite(ts)) return t("public.jobs.postedUnknown");
    const diffMs = Date.now() - ts;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return t("public.jobs.postedHoursAgo", { count: Math.max(1, hours) });
    const days = Math.floor(hours / 24);
    return t("public.jobs.postedDaysAgo", { count: Math.max(1, days) });
  };

  const whyApplySignal = (job: JobsPublicCard): string => {
    const ageHours = Math.floor((Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60));
    if (job.isFeaturedActive) return t("public.jobs.signalActiveHiring");
    if (Number.isFinite(ageHours) && ageHours <= 24) return t("public.jobs.signalNewJob");
    if ((job.budgetMax ?? job.budgetMin ?? 0) >= 3000000) return t("public.jobs.signalGoodBudgetFit");
    if (job.city && job.workMode !== "REMOTE") return t("public.jobs.signalNearbyProject");
    if ((job.description || "").trim().length <= 180) return t("public.jobs.signalQuickBrief");
    return t("public.jobs.signalReviewBrief");
  };

  return (
    <ul className="space-y-2.5">
      {jobs.map((job) => (
        <li key={job.id}>
          <article className="border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                    {workModeLabel(job.workMode)}
                  </span>
                  {job.categoryName ? (
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {job.categoryName}
                    </span>
                  ) : null}
                  {job.isTranslated ? (
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {t("public.jobs.translatedFrom", {
                        language:
                          job.translationSource === "id" ? t("public.jobs.langIndonesian") : t("public.jobs.langEnglish")
                      })}
                    </span>
                  ) : null}
                  <span className="rounded border border-[#3525cd]/35 bg-[#3525cd]/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">
                    {whyApplySignal(job)}
                  </span>
                </div>

                <h2 className="mt-1.5 text-base font-bold leading-snug text-slate-950 sm:text-[17px]">{job.title}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{job.description}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 pt-2.5">
                  <span className="text-sm font-bold tabular-nums text-slate-950">{budgetLabelLocalized(job)}</span>
                  {job.city ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                      {job.city}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">{t("public.jobs.noCity")}</span>
                  )}
                  <span className="text-xs font-medium text-slate-500">{timeAgoLabel(job.createdAt)}</span>
                </div>

                <p className="mt-2 text-[11px] text-slate-600">{t("public.jobs.applyConfidenceLine")}</p>
              </div>

              <div className="flex shrink-0 items-start">
                <Link href={`/jobs/${job.id}` as Route} className="nw-cta-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold">
                  {t("public.jobs.primaryActionViewJob")}
                </Link>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
