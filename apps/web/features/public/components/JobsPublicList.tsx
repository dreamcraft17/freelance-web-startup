"use client";

import type { Route } from "next";
import Link from "next/link";
import { Building2, Clock3, MapPin, Sparkles, Users } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { useI18n } from "@/features/i18n/I18nProvider";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";

/** Public job card shape for `/jobs` marketplace listing. */
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
  clientDisplayName: string;
  clientVerified: boolean;
  bidCount: number;
  skillNames: string[];
};

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

type ListProps = {
  jobs: JobsPublicCard[];
  /** When provided, avoids N+1 saved-state fetches (see `SaveJobButton`). */
  savedJobIds?: string[];
};

export function JobsPublicList({ jobs, savedJobIds }: ListProps) {
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

  const showMatchChip = (job: JobsPublicCard): boolean => {
    if (job.isFeaturedActive) return true;
    const ageHours = (Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60);
    const maxBudget = Math.max(job.budgetMin ?? 0, job.budgetMax ?? 0);
    return ageHours <= 48 && maxBudget >= 3000000;
  };

  const badgeType = (job: JobsPublicCard): "new" | "urgent" | "few" => {
    const ageHours = Math.floor((Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60));
    if (Number.isFinite(ageHours) && ageHours <= 6) return "new";
    if (job.isFeaturedActive) return "urgent";
    return "few";
  };

  return (
    <ul className="space-y-4">
      {jobs.map((job) => {
        const saved =
          savedJobIds != null
            ? { known: true as const, value: savedJobIds.includes(job.id) }
            : { known: false as const, value: false };

        return (
          <li key={job.id}>
            <article
              className={[
                "group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/95",
                "shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35),0_1px_0_rgba(255,255,255,0.8)_inset]",
                "transition duration-200 hover:border-[#3525cd]/25 hover:shadow-[0_22px_55px_-28px_rgba(53,37,205,0.35)]"
              ].join(" ")}
            >
              <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-gradient-to-br from-[#3525cd]/12 via-violet-200/20 to-transparent blur-2xl" />
              <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 sm:pr-10">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                        {workModeLabel(job.workMode)}
                      </span>
                      {job.categoryName ? (
                        <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          {job.categoryName}
                        </span>
                      ) : null}
                      {job.isTranslated ? (
                        <span className="rounded-full border border-slate-100 bg-slate-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                          {t("public.jobs.translatedFrom", {
                            language:
                              job.translationSource === "id"
                                ? t("public.jobs.langIndonesian")
                                : t("public.jobs.langEnglish")
                          })}
                        </span>
                      ) : null}
                      {badgeType(job) === "new" ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                          {t("public.jobs.badgeNew")}
                        </span>
                      ) : null}
                      {badgeType(job) === "urgent" ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-100">
                          {t("public.jobs.badgeUrgent")}
                        </span>
                      ) : null}
                      {badgeType(job) === "few" ? (
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-800 ring-1 ring-violet-100">
                          {t("public.jobs.badgeFewApplicants")}
                        </span>
                      ) : null}
                      {showMatchChip(job) ? (
                        <span
                          title={t("public.jobs.matchForYouHint")}
                          className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 ring-1 ring-emerald-100/90"
                        >
                          <Sparkles className="h-3 w-3" aria-hidden />
                          {t("public.jobs.matchForYou")}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                      <Building2 className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                      <span className="truncate">{job.clientDisplayName}</span>
                      {job.clientVerified ? (
                        <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd] ring-1 ring-[#3525cd]/15">
                          {t("public.jobs.verifiedClient")}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                      {job.city ?? t("public.jobs.noCity")}
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold leading-snug text-slate-950 sm:text-xl">{job.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{job.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-900/[0.04] px-3 py-1 text-sm font-bold tabular-nums text-slate-900 ring-1 ring-slate-900/5">
                      {budgetLabelLocalized(job)}
                    </span>
                    <span
                      title={t("public.jobs.proposalsMetaHint")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/90"
                    >
                      <Users className="h-3.5 w-3.5 text-[#3525cd]" aria-hidden />
                      {job.bidCount === 1
                        ? t("public.jobs.proposalsSingular")
                        : t("public.jobs.proposalsCount", { count: job.bidCount })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/90">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {timeAgoLabel(job.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skillNames.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-100"
                      >
                        {tag}
                      </span>
                    ))}
                    <span
                      title={t("public.jobs.signalHint")}
                      className="rounded-lg bg-[#f9f8ff] px-2 py-0.5 text-[11px] font-semibold text-[#4338ca] ring-1 ring-[#3525cd]/10"
                    >
                      {whyApplySignal(job)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <SaveJobButton
                      jobId={job.id}
                      initialSaved={saved.known ? saved.value : undefined}
                      appearance="icon"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    />
                  </div>
                  <AuthAwareCtaLink
                    href={`/jobs/${job.id}` as Route}
                    intent="submit-bid"
                    unauthenticatedTo="register"
                    registerRoleHint="freelancer"
                    className="inline-flex w-full min-w-[10rem] items-center justify-center rounded-xl bg-[#3525cd] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(53,37,205,0.85)] transition group-hover:bg-[#2b1daa] sm:w-auto"
                  >
                    {t("public.jobs.primaryActionApply")}
                  </AuthAwareCtaLink>
                  <Link
                    href={`/jobs/${job.id}` as Route}
                    className="inline-flex w-full min-w-[10rem] items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                  >
                    {t("public.jobs.primaryActionViewJob")}
                  </Link>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
