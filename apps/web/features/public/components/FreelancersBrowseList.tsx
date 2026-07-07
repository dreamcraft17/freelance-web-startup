"use client";

import type { Route } from "next";
import Link from "next/link";
import { FreelancersPublicProfileCard } from "@/features/public/components/FreelancersPublicProfileCard";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { useI18n } from "@/features/i18n/I18nProvider";
import { defaultFreelancerRateCurrency, formatMoneyAmount } from "@/lib/format-money";
import { withPublicLocale } from "@/lib/i18n/locale-path";

export type PublicFreelancerCard = {
  id: string;
  username: string;
  fullName: string;
  headline: string | null;
  primaryCategoryName: string | null;
  workMode: string;
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  availabilityStatus: string;
  reviewCount: number;
  averageReviewRating: number | null;
  createdAt: string;
  /** Present when directory is sorted by browser location + radius */
  distanceKm?: number | null;
};

function locationLabel(f: PublicFreelancerCard): string | null {
  if (f.city && f.country) return `${f.city}, ${f.country}`;
  if (f.city) return f.city;
  if (f.country) return f.country;
  return null;
}

function specialtyLine(f: PublicFreelancerCard): string | null {
  if (f.primaryCategoryName?.trim()) return f.primaryCategoryName.trim();
  if (f.headline?.trim()) return f.headline.trim();
  return null;
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "FW";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type FreelancersBrowseListProps = {
  freelancers: PublicFreelancerCard[];
  /** When set, cards emphasize that listings are being filtered by this city */
  activeCityFilter?: string;
};

export function FreelancersBrowseList({ freelancers, activeCityFilter }: FreelancersBrowseListProps) {
  const { t, locale } = useI18n();
  const flBase = withPublicLocale(locale, "/freelancers");

  const workModeLabel = (wm: string): string => {
    if (wm === "REMOTE") return t("public.filters.workModeRemote");
    if (wm === "ONSITE") return t("public.filters.workModeOnSite");
    if (wm === "HYBRID") return t("public.filters.workModeHybrid");
    return wm;
  };

  const rateLabel = (f: PublicFreelancerCard): string => {
    if (f.hourlyRate == null || !Number.isFinite(f.hourlyRate)) return t("public.freelancers.rateOnRequest");
    const cur = defaultFreelancerRateCurrency();
    return t("public.freelancers.ratePerHour", {
      amount: formatMoneyAmount(f.hourlyRate, cur, { locale, maximumFractionDigits: 0 })
    });
  };

  const ratingLine = (f: PublicFreelancerCard): string | null => {
    if (f.reviewCount <= 0 || f.averageReviewRating == null || !Number.isFinite(f.averageReviewRating)) return null;
    const stars = f.averageReviewRating.toFixed(1);
    return t(f.reviewCount === 1 ? "public.freelancers.reviewOne" : "public.freelancers.reviewMany", {
      stars,
      count: f.reviewCount
    });
  };

  const confidenceLine = (f: PublicFreelancerCard): string | null => {
    const parts: string[] = [];
    if (f.availabilityStatus === "AVAILABLE") parts.push(t("public.freelancers.confidenceAvailable"));
    if (f.reviewCount >= 3 && f.averageReviewRating != null && Number.isFinite(f.averageReviewRating)) {
      parts.push(t("public.freelancers.confidenceReviews"));
    }
    if (parts.length === 0) return null;
    return parts.join(" · ");
  };

  const roleLabel = (f: PublicFreelancerCard): string => {
    if (f.primaryCategoryName?.trim()) return f.primaryCategoryName.trim();
    return t("public.freelancers.roleGeneralist");
  };

  const valueStatement = (f: PublicFreelancerCard): string => {
    if (f.primaryCategoryName?.trim() && f.headline?.trim()) {
      return t("public.freelancers.valueStatementCategory", {
        category: f.primaryCategoryName.trim(),
        headline: f.headline.trim()
      });
    }
    if (f.headline?.trim()) return f.headline.trim();
    if (f.primaryCategoryName?.trim()) {
      return t("public.freelancers.valueStatementSimple", { category: f.primaryCategoryName.trim() });
    }
    return t("public.freelancers.valueStatementFallback");
  };

  const comparisonSignals = (f: PublicFreelancerCard): string[] => {
    const signals: string[] = [];
    if (f.availabilityStatus === "AVAILABLE") {
      signals.push(t("public.freelancers.signalAvailableThisWeek"));
    }
    if (f.reviewCount >= 5) {
      signals.push(t("public.freelancers.signalRespondsFast"));
    }
    if (f.averageReviewRating != null && Number.isFinite(f.averageReviewRating) && f.averageReviewRating >= 4.6 && f.reviewCount >= 3) {
      signals.push(t("public.freelancers.signalTopRated"));
    }
    if (signals.length === 0) {
      signals.push(t("public.freelancers.signalProfileReady"));
    }
    return signals.slice(0, 3);
  };

  const responseLabel = (f: PublicFreelancerCard): string => {
    if (f.reviewCount >= 12) return t("public.freelancers.responseLess15");
    if (f.reviewCount >= 6) return t("public.freelancers.responseLessHour");
    if (f.reviewCount >= 2) return t("public.freelancers.responseLess3Hours");
    return t("public.freelancers.responseWithinDay");
  };

  const chooseReason = (f: PublicFreelancerCard): string => {
    const rating = f.averageReviewRating ?? 0;
    const hasStrongReviews = f.reviewCount >= 5 && rating >= 4.6;
    const hasGoodVolume = f.reviewCount >= 10 && rating >= 4.3;
    const isNearbyFit = f.distanceKm != null && Number.isFinite(f.distanceKm) && f.distanceKm <= 25;
    const isBudgetFriendly = f.hourlyRate != null && Number.isFinite(f.hourlyRate) && f.hourlyRate <= 100000;

    if (hasStrongReviews && f.primaryCategoryName?.trim()) {
      return t("public.freelancers.whyStrongReviewsCategory", { category: f.primaryCategoryName.trim() });
    }
    if (hasGoodVolume) {
      return t("public.freelancers.whyFrequentlyHired");
    }
    if (isNearbyFit) {
      return t("public.freelancers.whyNearbyFit");
    }
    if (isBudgetFriendly) {
      return t("public.freelancers.whyBudgetFriendly");
    }
    if (f.availabilityStatus === "AVAILABLE") {
      return t("public.freelancers.whyAvailableThisWeek");
    }
    return t("public.freelancers.whyProfileReady");
  };

  if (freelancers.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {freelancers.map((f) => (
          <li key={f.id}>
            <FreelancersPublicProfileCard freelancer={f} activeCityFilter={activeCityFilter} />
          </li>
      ))}
    </ul>
  );
}
