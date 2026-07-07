"use client";

import { useI18n } from "@/features/i18n/I18nProvider";
import { budgetListingUsesCompactNotation, formatMoneyAmount, normalizeCurrencyCode } from "@/lib/format-money";
import { JobsPublicJobCard } from "@/features/public/components/JobsPublicJobCard";

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
          <JobsPublicJobCard
            key={job.id}
            job={job}
            savedJobIds={savedJobIds}
            statusBadge={statusBadge}
            budgetLabel={budgetLabelLocalized(job)}
            timeAgoLabel={timeAgoLabel(job.createdAt)}
            workModeLabel={workModeLabel(job.workMode)}
          />
        );
      })}
    </ul>
  );
}
