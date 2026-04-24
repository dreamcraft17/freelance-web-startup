"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";

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

function availabilityLabel(s: string): string {
  return s.replace(/_/g, " ").toLowerCase();
}

function daysSince(iso: string): number | null {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return null;
  const diff = Date.now() - ts;
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function specialtyLine(f: PublicFreelancerCard): string | null {
  if (f.primaryCategoryName?.trim()) return f.primaryCategoryName.trim();
  if (f.headline?.trim()) return f.headline.trim();
  return null;
}

type FreelancersBrowseListProps = {
  freelancers: PublicFreelancerCard[];
  /** When set, cards emphasize that listings are being filtered by this city */
  activeCityFilter?: string;
};

export function FreelancersBrowseList({ freelancers, activeCityFilter }: FreelancersBrowseListProps) {
  const { t } = useI18n();

  const workModeLabel = (wm: string): string => {
    if (wm === "REMOTE") return t("public.filters.workModeRemote");
    if (wm === "ONSITE") return t("public.filters.workModeOnSite");
    if (wm === "HYBRID") return t("public.filters.workModeHybrid");
    return wm;
  };

  const rateLabel = (f: PublicFreelancerCard): string => {
    if (f.hourlyRate == null || !Number.isFinite(f.hourlyRate)) return t("public.freelancers.rateOnRequest");
    try {
      return t("public.freelancers.ratePerHour", {
        amount: new Intl.NumberFormat(undefined, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
          f.hourlyRate
        )
      });
    } catch {
      return t("public.freelancers.ratePerHour", { amount: String(f.hourlyRate) });
    }
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
      {freelancers.map((f, rank) => {
        const loc = locationLabel(f);
        const spec = specialtyLine(f);
        const showHeadlineBelow = Boolean(f.primaryCategoryName?.trim() && f.headline?.trim());
        const rating = ratingLine(f);
        const confidence = confidenceLine(f);
        const showDistance = f.distanceKm != null && Number.isFinite(f.distanceKm);
        const reason = chooseReason(f);
        const recommendedLabel = rank === 0 ? t("public.freelancers.bestMatch") : rank === 1 ? t("public.freelancers.recommended") : null;
        const emphasizeTop = rank <= 1;

        return (
          <li key={f.id}>
            <article
              className={`border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-slate-300 ${
                emphasizeTop ? "border-slate-300" : "border-slate-200"
              }`}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {recommendedLabel ? (
                      <span className="rounded border border-[#3525cd]/35 bg-[#3525cd]/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">
                        {recommendedLabel}
                      </span>
                    ) : null}
                    <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                      {workModeLabel(f.workMode)}
                    </span>
                    {showDistance ? (
                      <span className="rounded border border-emerald-300/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950">
                        ~{f.distanceKm} km
                      </span>
                    ) : null}
                    {activeCityFilter?.trim() && loc?.toLowerCase().includes(activeCityFilter.trim().toLowerCase()) ? (
                      <span className="rounded border border-[#3525cd]/35 bg-[#3525cd]/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">
                        {activeCityFilter.trim()}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-snug text-slate-950">{f.fullName}</p>
                      <p className="text-xs font-medium text-slate-500">@{f.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                        {rating ?? t("public.freelancers.noReviewsYet")}
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancers.rateStartingLabel")}</p>
                      <p className="text-sm font-bold text-slate-900">{rateLabel(f)}</p>
                    </div>
                  </div>

                  {spec ? (
                    <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-800">{spec}</p>
                  ) : (
                    <p className="mt-1.5 text-sm font-medium italic text-slate-400">{t("public.freelancers.openProfileDetails")}</p>
                  )}

                  {showHeadlineBelow ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{f.headline}</p>
                  ) : null}

                  <p className="mt-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    {reason}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 pt-2.5">
                    {loc ? (
                      <p className="flex items-start gap-1.5 text-xs font-semibold text-slate-700">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                        <span>{loc}</span>
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-slate-400">{t("public.freelancers.locationNotListed")}</p>
                    )}
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                      {availabilityLabel(f.availabilityStatus)}
                    </span>
                  </div>

                  {confidence ? (
                    <p className="mt-2 text-[11px] font-medium leading-snug text-slate-600">{confidence}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-start">
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-[11px] font-medium text-slate-500">{t("public.freelancers.nextStepHint")}</p>
                    <Link
                      href={`/freelancers/${encodeURIComponent(f.username)}`}
                      className="nw-cta-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
                    >
                      {t("public.freelancers.primaryActionViewProfile")}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
