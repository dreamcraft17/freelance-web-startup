"use client";

import type { Route } from "next";
import Link from "next/link";
import { ProfileCard } from "@/components/design-system/ProfileCard";
import { useI18n } from "@/features/i18n/I18nProvider";
import { defaultFreelancerRateCurrency, formatMoneyAmount } from "@/lib/format-money";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import type { PublicFreelancerCard } from "@/features/public/components/FreelancersBrowseList";

type Props = {
  freelancer: PublicFreelancerCard;
  activeCityFilter?: string;
};

export function FreelancersPublicProfileCard({ freelancer, activeCityFilter }: Props) {
  const { t, locale } = useI18n();
  const href = withPublicLocale(locale, `/freelancers/${freelancer.username}`) as Route;

  const workModeLabel = (wm: string): string => {
    if (wm === "REMOTE") return t("public.filters.workModeRemote");
    if (wm === "ONSITE") return t("public.filters.workModeOnSite");
    if (wm === "HYBRID") return t("public.filters.workModeHybrid");
    return wm;
  };

  const location =
    freelancer.city && freelancer.country
      ? `${freelancer.city}, ${freelancer.country}`
      : freelancer.city ?? freelancer.country ?? undefined;

  const rateCents =
    freelancer.hourlyRate != null && Number.isFinite(freelancer.hourlyRate)
      ? Math.round(freelancer.hourlyRate)
      : undefined;

  return (
    <div className="space-y-2">
      {activeCityFilter ? <p className="text-xs text-slate-500">Near {activeCityFilter}</p> : null}
      <ProfileCard
        name={freelancer.fullName}
        headline={freelancer.headline ?? freelancer.primaryCategoryName}
        href={href}
        verified={freelancer.reviewCount > 0}
        rating={freelancer.averageReviewRating}
        reviewCount={freelancer.reviewCount}
        rateCents={rateCents}
        currency={defaultFreelancerRateCurrency()}
        actionLabel={t("public.freelancers.primaryActionViewProfile")}
        actionHref={href}
      />
      <p className="px-1 text-xs text-slate-600">
        {workModeLabel(freelancer.workMode)}
        {location ? ` · ${location}` : ""}
        {typeof freelancer.distanceKm === "number" ? ` · ~${freelancer.distanceKm.toFixed(1)} km` : ""}
        {freelancer.hourlyRate != null
          ? ` · ${formatMoneyAmount(freelancer.hourlyRate, defaultFreelancerRateCurrency(), { locale, maximumFractionDigits: 0 })}/hr`
          : ""}
      </p>
    </div>
  );
}
