"use client";

import type { Route } from "next";
import Link from "next/link";
import { Building2, Clock3, MapPin, Users } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { useI18n } from "@/features/i18n/I18nProvider";
import { budgetListingUsesCompactNotation, formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import { withPublicLocale } from "@/lib/i18n/locale-path";
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
  /** Shortlisted proposals (real count from bids in SHORTLISTED). */
  shortlistedCount: number;
  skillNames: string[];
};

type ListProps = {
  jobs: JobsPublicCard[];
  /** When provided, avoids N+1 saved-state fetches (see `SaveJobButton`). */
  savedJobIds?: string[];
};

export function JobsPublicList({ jobs, savedJobIds }: ListProps) {
  const { t, locale } = useI18n();
  const jobsBase = withPublicLocale(locale, "/jobs");

  const workModeLabel = (wm: string) => {
    if (wm === "REMOTE") return t("public.filters.workModeRemote");
    if (wm === "ONSITE") return t("public.filters.workModeOnSite");
    if (wm === "HYBRID") return t("public.filters.workModeHybrid");
    return wm;
  };

  const budgetLabelLocalized = (job: JobsPublicCard): string => {
    const { budgetMin: min, budgetMax: max, currency, budgetType } = job;
    const cur = normalizeCurrencyCode(currency);
    const opt = {
      locale,
      maximumFractionDigits: cur === "IDR" ? 0 : 2,
      compact: budgetListingUsesCompactNotation(cur)
    } as const;
    if (min != null && max != null)
      return `${formatMoneyAmount(min, cur, opt)} – ${formatMoneyAmount(max, cur, opt)}`;
    if (min != null) return t("public.jobs.budgetFrom", { amount: formatMoneyAmount(min, cur, opt) });
    if (max != null) return t("public.jobs.budgetUpTo", { amount: formatMoneyAmount(max, cur, opt) });
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

  const maxBudgetUsdStrong = 200;
  const maxBudgetIdrStrong = 3_000_000;

  const whyApplySignal = (job: JobsPublicCard): string => {
    const ageHours = Math.floor((Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60));
    const cur = normalizeCurrencyCode(job.currency);
    const maxBudget = Math.max(job.budgetMin ?? 0, job.budgetMax ?? 0);
    const strongBudget =
      (cur === "IDR" && maxBudget >= maxBudgetIdrStrong) || (cur === "USD" && maxBudget >= maxBudgetUsdStrong);
    if (job.isFeaturedActive) return t("public.jobs.signalActiveHiring");
    if (Number.isFinite(ageHours) && ageHours <= 24) return t("public.jobs.signalNewJob");
    if (strongBudget) return t("public.jobs.signalGoodBudgetFit");
    if (job.city && job.workMode !== "REMOTE") return t("public.jobs.signalNearbyProject");
    if ((job.description || "").trim().length <= 180) return t("public.jobs.signalQuickBrief");
    return t("public.jobs.signalReviewBrief");
  };

  const showMatchChip = (job: JobsPublicCard): boolean => {
    if (job.isFeaturedActive) return true;
    const ageHours = (Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60);
    const cur = normalizeCurrencyCode(job.currency);
    const maxBudget = Math.max(job.budgetMin ?? 0, job.budgetMax ?? 0);
    const strongBudget =
      (cur === "IDR" && maxBudget >= maxBudgetIdrStrong) || (cur === "USD" && maxBudget >= maxBudgetUsdStrong);
    return ageHours <= 48 && strongBudget;
  };

  /** Status row: only show labels backed by real fields (time, featured, bid counts). */
  const jobStatusBadge = (job: JobsPublicCard): "new" | "urgent" | "few" | "competitive" | null => {
    const ageHours = Math.floor((Date.now() - Date.parse(job.createdAt)) / (1000 * 60 * 60));
    if (Number.isFinite(ageHours) && ageHours <= 6) return "new";
    if (job.isFeaturedActive) return "urgent";
    if (job.bidCount >= 10) return "competitive";
    if (job.bidCount <= 2) return "few";
    return null;
  };

  const clientInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "?";
  };

  return (
    <ul className="space-y-2.5 sm:space-y-3">
      {jobs.map((job) => {
        const saved =
          savedJobIds != null
            ? { known: true as const, value: savedJobIds.includes(job.id) }
            : { known: false as const, value: false };

        const statusBadge = jobStatusBadge(job);

        return (
          <li key={job.id}>
            <article className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-[#3525cd]/45 hover:shadow-md">
              <div className="flex flex-col gap-2.5 p-3 sm:p-3.5 lg:flex-row lg:items-stretch lg:justify-between lg:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="nw-chip nw-chip-muted normal-case tracking-normal">
                      {workModeLabel(job.workMode)}
                    </span>
                    {job.categoryName ? (
                      <span className="nw-chip nw-chip-muted normal-case tracking-normal">
                        {job.categoryName}
                      </span>
                    ) : null}
                    {job.isTranslated ? (
                      <span className="nw-chip nw-chip-muted normal-case tracking-normal text-slate-500">
                        {t("public.jobs.translatedFrom", {
                          language:
                            job.translationSource === "id"
                              ? t("public.jobs.langIndonesian")
                              : t("public.jobs.langEnglish")
                        })}
                      </span>
                    ) : null}
                    {statusBadge === "new" ? (
                      <span className="nw-chip border-emerald-700 bg-emerald-600 text-white normal-case tracking-normal">
                        {t("public.jobs.badgeNew")}
                      </span>
                    ) : null}
                    {statusBadge === "urgent" ? (
                      <span className="nw-chip border-amber-300 bg-amber-500 text-slate-900 normal-case tracking-normal">
                        {t("public.jobs.badgeUrgent")}
                      </span>
                    ) : null}
                    {statusBadge === "few" ? (
                      <span className="nw-chip nw-chip-muted normal-case tracking-normal text-slate-800">
                        {t("public.jobs.badgeFewApplicants")}
                      </span>
                    ) : null}
                    {statusBadge === "competitive" ? (
                      <span className="nw-chip border-slate-800 bg-slate-800 text-white normal-case tracking-normal">
                        {t("public.jobs.badgeCompetitive")}
                      </span>
                    ) : null}
                    {job.shortlistedCount > 0 ? (
                      <span
                        title={t("public.jobs.badgeInterviewingHint")}
                        className="nw-chip nw-chip-brand normal-case tracking-normal"
                      >
                        {job.shortlistedCount === 1
                          ? t("public.jobs.badgeInterviewingOne")
                          : t("public.jobs.badgeInterviewingMany", { count: job.shortlistedCount })}
                      </span>
                    ) : null}
                    {showMatchChip(job) ? (
                      <span
                        title={t("public.jobs.matchForYouHint")}
                        className="nw-chip nw-chip-success normal-case tracking-normal"
                      >
                        {t("public.jobs.matchForYou")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 sm:text-xs">
                    <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-900" title={job.clientDisplayName}>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[11px] font-bold text-slate-800"
                        aria-hidden
                      >
                        {clientInitials(job.clientDisplayName)}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Building2 className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" aria-hidden />
                        <span className="truncate">{job.clientDisplayName}</span>
                        {job.clientVerified ? (
                          <span className="hidden shrink-0 nw-chip nw-chip-brand normal-case tracking-normal sm:inline-flex">
                            {t("public.jobs.verifiedClient")}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
                      {job.city ?? t("public.jobs.noCity")}
                    </span>
                  </div>
                  {job.clientVerified ? (
                    <p className="mt-1 sm:hidden">
                      <span className="inline-flex nw-chip nw-chip-brand normal-case tracking-normal">
                        {t("public.jobs.verifiedClient")}
                      </span>
                    </p>
                  ) : null}

                  <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-slate-950 sm:text-lg">{job.title}</h2>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">{job.description}</p>

                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-slate-100 pt-2">
                    <span className="text-sm font-semibold tabular-nums text-slate-900">{budgetLabelLocalized(job)}</span>
                    <span className="text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span title={t("public.jobs.proposalsMetaHint")} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-700">
                      <Users className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                      {job.bidCount === 1 ? t("public.jobs.proposalsSingular") : t("public.jobs.proposalsCount", { count: job.bidCount })}
                    </span>
                    <span className="text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-normal tabular-nums text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {timeAgoLabel(job.createdAt)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skillNames.slice(0, 5).map((tag) => (
                      <span key={tag} className="nw-chip nw-chip-muted normal-case tracking-normal">
                        {tag}
                      </span>
                    ))}
                    {job.skillNames.length > 5 ? (
                      <span className="self-center px-1 text-[11px] font-semibold text-slate-400">+{job.skillNames.length - 5}</span>
                    ) : null}
                    <span
                      title={t("public.jobs.signalHint")}
                      className="self-center max-w-full truncate text-[11px] font-semibold text-[#3525cd] sm:max-w-none"
                    >
                      {whyApplySignal(job)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-row items-stretch gap-2 border-t border-slate-100 pt-3 sm:flex-col sm:border-0 sm:pt-0 lg:w-[11.5rem]">
                  <SaveJobButton
                    jobId={job.id}
                    initialSaved={saved.known ? saved.value : undefined}
                    appearance="icon"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 shrink-0 self-center rounded-lg border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  />
                  <AuthAwareCtaLink
                    href={`${jobsBase}/${job.id}` as Route}
                    intent="submit-bid"
                    unauthenticatedTo="register"
                    registerRoleHint="freelancer"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#3525cd] px-3 text-sm font-bold text-white transition hover:bg-[#2b1daa] sm:flex-none"
                  >
                    {t("public.jobs.primaryActionApply")}
                  </AuthAwareCtaLink>
                  <Link
                    href={`${jobsBase}/${job.id}` as Route}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
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
