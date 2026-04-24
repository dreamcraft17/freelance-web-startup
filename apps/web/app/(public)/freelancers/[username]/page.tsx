import { notFound } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, MapPin, ShieldCheck, Star, Wallet } from "lucide-react";
import { db } from "@acme/database";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { getServerTranslator } from "@/lib/i18n/server-translator";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { t } = await getServerTranslator();
  const { username: raw } = await params;
  const username = raw?.trim() ?? "";
  if (!username) notFound();

  const profile = await db.freelancerProfile.findFirst({
    where: { username, deletedAt: null },
    select: {
      id: true,
      fullName: true,
      headline: true,
      bio: true,
      workMode: true,
      city: true,
      country: true,
      hourlyRate: true,
      fixedStartingPrice: true,
      availabilityStatus: true,
      averageReviewRating: true,
      reviewCount: true,
      profileCompleteness: true,
      yearsExperience: true,
      verificationStatus: true,
      skills: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          years: true,
          skill: {
            select: {
              name: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: { select: { id: true } }
        }
      }
    }
  });

  if (!profile) notFound();

  const locationLine = [profile.city, profile.country].filter(Boolean).join(", ");
  const rateValue = profile.hourlyRate ?? profile.fixedStartingPrice;
  const hasRate = rateValue != null;
  const rateText = hasRate
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(rateValue))
    : t("public.freelancerProfile.rateOnRequest");
  const ratingText =
    profile.averageReviewRating != null && Number.isFinite(profile.averageReviewRating)
      ? profile.averageReviewRating.toFixed(1)
      : null;
  const primaryCategory = profile.skills.find((s) => s.skill.category?.name)?.skill.category?.name ?? null;
  const skillNames = profile.skills.map((s) => s.skill.name).filter(Boolean);
  const availabilityLabel = t(`public.freelancerProfile.availability.${profile.availabilityStatus.toLowerCase()}`);
  const workModeLabel = t(`public.filters.workMode${profile.workMode === "ONSITE" ? "OnSite" : profile.workMode === "HYBRID" ? "Hybrid" : "Remote"}`);

  const reasons: string[] = [];
  if (profile.reviewCount >= 5 && (profile.averageReviewRating ?? 0) >= 4.6 && primaryCategory) {
    reasons.push(t("public.freelancerProfile.reasonStrongReviewsCategory", { category: primaryCategory }));
  }
  if (profile.city && profile.workMode !== "REMOTE") {
    reasons.push(t("public.freelancerProfile.reasonNearbyFit", { city: profile.city }));
  }
  if (profile.availabilityStatus === "AVAILABLE") {
    reasons.push(t("public.freelancerProfile.reasonAvailableNow"));
  }
  if (hasRate) {
    reasons.push(t("public.freelancerProfile.reasonStartingRate", { rate: rateText }));
  }
  if (profile.profileCompleteness >= 70) {
    reasons.push(t("public.freelancerProfile.reasonCompleteProfile"));
  }
  if (reasons.length === 0) {
    reasons.push(t("public.freelancerProfile.reasonFallback"));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <section className="border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.kicker")}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{profile.fullName}</h1>
            <p className="mt-2 text-base font-semibold text-slate-800">{profile.headline ?? t("public.freelancers.profileFallback")}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-800">
                {workModeLabel}
              </span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {availabilityLabel}
              </span>
              {profile.verificationStatus === "VERIFIED" ? (
                <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                  {t("public.freelancerProfile.verified")}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRate")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{rateText}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRating")}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  {ratingText ?? t("public.freelancerProfile.notRated")}
                </p>
                <p className="text-[11px] text-slate-600">
                  {profile.reviewCount > 0
                    ? t("public.freelancerProfile.reviewCount", { count: profile.reviewCount })
                    : t("public.freelancerProfile.noReviewsYet")}
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factLocation")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{locationLine || t("public.freelancerProfile.locationNotListed")}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factProfileQuality")}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {t("public.freelancerProfile.profileCompleteness", { value: profile.profileCompleteness })}
                </p>
              </div>
            </div>
          </div>

          <aside className="w-full border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-24 lg:w-72">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.ctaKicker")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{t("public.freelancerProfile.ctaDescription")}</p>
            <div className="mt-3 space-y-2">
              <AuthAwareCtaLink
                href={"/messages" as Route}
                intent="send-message"
                unauthenticatedTo="login"
                className="nw-cta-primary inline-flex w-full items-center justify-center px-3 py-2.5 text-sm font-semibold"
              >
                {t("public.freelancerProfile.primaryCta")}
              </AuthAwareCtaLink>
              <p className="text-xs text-slate-600">
                {t("public.freelancerProfile.ctaPreview")}
              </p>
              <Link href={"/freelancers" as Route} className="inline-flex w-full items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 hover:underline">
                {t("public.freelancerProfile.secondaryBackToDirectory")}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.whyChooseTitle")}</p>
          <ul className="mt-3 space-y-2">
            {reasons.slice(0, 4).map((reason) => (
              <li key={reason} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.trustSnapshotTitle")}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotReviews")}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{profile.reviewCount}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotAvailability")}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{availabilityLabel}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotWorkMode")}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{workModeLabel}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotExperience")}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {profile.yearsExperience != null
                  ? t("public.freelancerProfile.yearsExperience", { years: profile.yearsExperience })
                  : t("public.freelancerProfile.experienceNotListed")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.aboutTitle")}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {profile.bio?.trim() || t("public.freelancerProfile.aboutFallback")}
        </p>
      </section>

      <section className="mt-5 border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.skillsTitle")}</p>
        {skillNames.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {skillNames.map((name) => (
              <span key={name} className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t("public.freelancerProfile.skillsFallback")}</p>
        )}
      </section>

      <section className="mt-5 border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.reviewsTitle")}</p>
        {profile.reviewsReceived.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {profile.reviewsReceived.map((review) => (
              <li key={review.id} className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{t("public.freelancerProfile.reviewSource")}</p>
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                    {review.rating.toFixed(1)}
                  </p>
                </div>
                {review.comment?.trim() ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{review.comment.trim()}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-500">{t("public.freelancerProfile.reviewNoComment")}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  <Clock3 className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t("public.freelancerProfile.reviewsFallback")}</p>
        )}
      </section>

      <section className="mt-5 border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.finalCtaTitle")}</p>
        <p className="mt-1 text-sm text-slate-700">{t("public.freelancerProfile.finalCtaBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AuthAwareCtaLink
            href={"/messages" as Route}
            intent="send-message"
            unauthenticatedTo="login"
            className="nw-cta-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
          >
            {t("public.freelancerProfile.primaryCta")}
          </AuthAwareCtaLink>
          <span className="inline-flex items-center px-1 py-2 text-xs text-slate-600">{t("public.freelancerProfile.ctaPreview")}</span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {locationLine || t("public.freelancerProfile.locationNotListed")}
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            {rateText}
          </span>
          {profile.verificationStatus === "VERIFIED" ? (
            <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t("public.freelancerProfile.verified")}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
