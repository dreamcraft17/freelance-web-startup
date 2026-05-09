import { notFound } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Wallet
} from "lucide-react";
import { ContractStatus } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { defaultFreelancerRateCurrency, formatMoneyAmount } from "@/lib/format-money";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import {
  NW_BADGE_NEUTRAL,
  NW_BADGE_PRIMARY,
  NW_CARD,
  NW_CARD_INSET,
  NW_CHIP_SKILL,
  NW_HERO_WRAP,
  NW_PAGE_WRAP,
  NW_SECTION_KICKER,
  NW_SIDEBAR_STICKY
} from "@/lib/marketplace/nw-classes";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { t, locale } = await getServerTranslator();
  const { username: raw } = await params;
  const username = raw?.trim() ?? "";
  if (!username) notFound();

  const profile = await db.freelancerProfile.findFirst({
    where: { username, deletedAt: null },
    select: {
      id: true,
      userId: true,
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
        take: 16,
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
      portfolioItems: {
        where: { deletedAt: null },
        orderBy: { displayOrder: "asc" },
        take: 6,
        select: {
          id: true,
          title: true,
          description: true,
          mediaUrl: true,
          mediaType: true
        }
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: { select: { id: true } },
          contract: {
            select: {
              bid: { select: { job: { select: { title: true } } } }
            }
          }
        }
      }
    }
  });

  if (!profile) notFound();

  const [session, completedHiresViaMarketplace] = await Promise.all([
    getSessionFromCookies(),
    db.contract.count({
      where: {
        freelancerUserId: profile.userId,
        deletedAt: null,
        status: ContractStatus.COMPLETED
      }
    })
  ]);
  const canReportUser = Boolean(session?.userId && session.userId !== profile.userId);

  const locationLine = [profile.city, profile.country].filter(Boolean).join(", ");
  const rateValue = profile.hourlyRate ?? profile.fixedStartingPrice;
  const hasRate = rateValue != null;
  const rateText = hasRate
    ? formatMoneyAmount(Number(rateValue), defaultFreelancerRateCurrency(), { locale, maximumFractionDigits: 0 })
    : t("public.freelancerProfile.rateOnRequest");
  const ratingText =
    profile.averageReviewRating != null && Number.isFinite(profile.averageReviewRating)
      ? profile.averageReviewRating.toFixed(1)
      : null;
  const primaryCategory = profile.skills.find((s) => s.skill.category?.name)?.skill.category?.name ?? null;
  const skillNames = profile.skills.map((s) => s.skill.name).filter(Boolean);

  const servicesByCategory = new Map<string, string[]>();
  for (const s of profile.skills) {
    const cat = s.skill.category?.name?.trim() || t("public.freelancerProfile.servicesUncategorized");
    const name = s.skill.name?.trim();
    if (!name) continue;
    const list = servicesByCategory.get(cat) ?? [];
    if (!list.includes(name)) list.push(name);
    servicesByCategory.set(cat, list);
  }

  const availabilityLabel = t(`public.freelancerProfile.availability.${profile.availabilityStatus.toLowerCase()}`);
  const workModeLabel = t(
    `public.filters.workMode${profile.workMode === "ONSITE" ? "OnSite" : profile.workMode === "HYBRID" ? "Hybrid" : "Remote"}`
  );

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

  const SidebarCta = ({ className }: { className?: string }) => (
    <div className={className}>
      <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.ctaKicker")}</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">{t("public.freelancerProfile.ctaDescription")}</p>
      <div className="mt-4 space-y-2">
        <AuthAwareCtaLink
          href={"/messages" as Route}
          intent="send-message"
          unauthenticatedTo="login"
          className="nw-cta-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm shadow-[#3525cd]/20"
        >
          <MessageCircle className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
          {t("public.freelancerProfile.primaryCta")}
        </AuthAwareCtaLink>
        <p className="text-xs leading-relaxed text-slate-600">{t("public.freelancerProfile.ctaPreview")}</p>
        <Link
          href={"/freelancers" as Route}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {t("public.freelancerProfile.secondaryBackToDirectory")}
        </Link>
      </div>
      <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-600">
        <div className="flex flex-wrap gap-2">
          <dt className="sr-only">{t("public.freelancerProfile.factRate")}</dt>
          <dd className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200/70">
            <Wallet className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            {rateText}
          </dd>
          {locationLine ? (
            <>
              <dt className="sr-only">{t("public.freelancerProfile.factLocation")}</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200/70">
                <MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                {locationLine}
              </dd>
            </>
          ) : null}
        </div>
      </dl>
    </div>
  );

  return (
    <div className={NW_PAGE_WRAP}>
      <section className={`${NW_HERO_WRAP} p-6 sm:p-8`}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#3525cd]/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr),19rem] lg:items-start">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={NW_SECTION_KICKER}>{t("public.freelancerProfile.kicker")}</span>
              {profile.verificationStatus === "VERIFIED" ? (
                <span className={`${NW_BADGE_PRIMARY} gap-1 border-emerald-300/35 bg-emerald-50 text-emerald-900`}>
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  {t("public.freelancerProfile.verified")}
                </span>
              ) : null}
              {canReportUser ? (
                <ModerationReportButton intent="user" target={{ subjectType: "USER", subjectUserId: profile.userId }} />
              ) : null}
            </div>
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem] sm:leading-tight">
                {profile.fullName}
              </h1>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-relaxed text-slate-700 sm:text-[1.0625rem]">
                {profile.headline ?? t("public.freelancers.profileFallback")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`${NW_BADGE_NEUTRAL} uppercase tracking-wide`}>{workModeLabel}</span>
              <span className={`${NW_BADGE_NEUTRAL} bg-slate-50 uppercase tracking-wide`}>{availabilityLabel}</span>
              <span className={`${NW_BADGE_NEUTRAL} gap-1`}>
                <Briefcase className="h-3 w-3 text-slate-500" aria-hidden />
                {completedHiresViaMarketplace}{" "}
                {completedHiresViaMarketplace === 1
                  ? t("public.freelancerProfile.completedHiresSingular")
                  : t("public.freelancerProfile.completedHiresPlural")}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: t("public.freelancerProfile.factRate"), value: rateText },
                {
                  label: t("public.freelancerProfile.factRating"),
                  value:
                    ratingText != null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                        {ratingText}
                      </span>
                    ) : (
                      t("public.freelancerProfile.notRated")
                    ),
                  sub:
                    profile.reviewCount > 0
                      ? t("public.freelancerProfile.reviewCount", { count: profile.reviewCount })
                      : t("public.freelancerProfile.noReviewsYet")
                },
                {
                  label: t("public.freelancerProfile.factLocation"),
                  value: locationLine || t("public.freelancerProfile.locationNotListed")
                },
                {
                  label: t("public.freelancerProfile.factProfileQuality"),
                  value: t("public.freelancerProfile.profileCompleteness", { value: profile.profileCompleteness })
                }
              ].map((cell) => (
                <div key={cell.label} className={`${NW_CARD_INSET} px-3.5 py-3`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cell.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{cell.value}</p>
                  {"sub" in cell && cell.sub ? <p className="mt-0.5 text-[11px] text-slate-600">{cell.sub}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <aside className={`${NW_CARD_INSET} ${NW_SIDEBAR_STICKY} hidden border-slate-200/80 p-5 shadow-none lg:block`}>
            <SidebarCta />
          </aside>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <section className={`${NW_CARD} p-5 sm:p-6`}>
          <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.aboutTitle")}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
            {profile.bio?.trim() || t("public.freelancerProfile.aboutFallback")}
          </p>
        </section>
        <section className={`${NW_CARD} p-5 sm:p-6`}>
          <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.servicesTitle")}</p>
          <p className="mt-2 text-xs leading-snug text-slate-600">{t("public.freelancerProfile.servicesSubtitle")}</p>
          {servicesByCategory.size > 0 ? (
            <ul className="mt-4 space-y-4">
              {[...servicesByCategory.entries()].map(([category, names]) => (
                <li key={category}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#3525cd]/85">{category}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {names.map((name) => (
                      <span key={name} className={NW_CHIP_SKILL}>
                        {name}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : skillNames.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skillNames.map((name) => (
                <span key={name} className={NW_CHIP_SKILL}>
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">{t("public.freelancerProfile.skillsFallback")}</p>
          )}
        </section>
      </div>

      {profile.portfolioItems.length > 0 ? (
        <section className={`${NW_CARD} mt-6 p-5 sm:p-6`}>
          <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.portfolioTitle")}</p>
          <p className="mt-2 text-sm text-slate-600">{t("public.freelancerProfile.portfolioSubtitle")}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolioItems.map((item) => {
              const isImage = item.mediaType?.startsWith("image") ?? /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(item.mediaUrl);
              return (
                <li key={item.id} className={`${NW_CARD_INSET} overflow-hidden`}>
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35"
                  >
                    {isImage ? (
                      <img
                        src={item.mediaUrl}
                        alt=""
                        className="aspect-[16/10] w-full object-cover transition group-hover:opacity-95"
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-xs font-semibold text-slate-600">
                        {t("public.freelancerProfile.portfolioOpen")}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                        {item.description?.trim() ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.description.trim()}</p>
                        ) : null}
                      </div>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${NW_CARD} p-5 sm:p-6`}>
          <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.whyChooseTitle")}</p>
          <ul className="mt-4 space-y-3">
            {reasons.slice(0, 4).map((reason) => (
              <li key={reason} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${NW_CARD} p-5 sm:p-6`}>
          <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.trustSnapshotTitle")}</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("public.freelancerProfile.snapshotReviews")}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{profile.reviewCount}</p>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("public.freelancerProfile.snapshotAvailability")}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{availabilityLabel}</p>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("public.freelancerProfile.snapshotWorkMode")}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{workModeLabel}</p>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("public.freelancerProfile.snapshotCompleted")}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{completedHiresViaMarketplace}</p>
              <p className="mt-1 text-[11px] text-slate-600">{t("public.freelancerProfile.snapshotCompletedHint")}</p>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5 sm:col-span-2`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("public.freelancerProfile.snapshotExperience")}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {profile.yearsExperience != null
                  ? t("public.freelancerProfile.yearsExperience", { years: profile.yearsExperience })
                  : t("public.freelancerProfile.experienceNotListed")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${NW_CARD} mt-6 p-5 sm:p-6`}>
        <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.reviewsTitle")}</p>
        {profile.reviewsReceived.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {profile.reviewsReceived.map((review) => {
              const jobTitle = review.contract?.bid?.job?.title?.trim();
              return (
                <li key={review.id} className={`${NW_CARD_INSET} p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t("public.freelancerProfile.reviewSource")}</p>
                      {jobTitle ? (
                        <p className="mt-1 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">{t("public.freelancerProfile.reviewProject")}</span>{" "}
                          {jobTitle}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200/70">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                        {review.rating}/5
                      </span>
                      {session?.userId && session.userId !== review.author.id ? (
                        <ModerationReportButton
                          intent="review"
                          variant="text"
                          className="shrink-0"
                          target={{ subjectType: "REVIEW", subjectReviewId: review.id }}
                        />
                      ) : null}
                    </div>
                  </div>
                  {review.comment?.trim() ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment.trim()}</p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">{t("public.freelancerProfile.reviewNoComment")}</p>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <time dateTime={review.createdAt.toISOString()}>
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(review.createdAt)}
                    </time>
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">{t("public.freelancerProfile.reviewsFallback")}</p>
        )}
      </section>

      <section className={`${NW_CARD} mt-6 border-[#3525cd]/18 bg-gradient-to-br from-[#3525cd]/[0.04] to-white p-6`}>
        <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.finalCtaTitle")}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-700">{t("public.freelancerProfile.finalCtaBody")}</p>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 p-3 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md md:hidden">
        <AuthAwareCtaLink
          href={"/messages" as Route}
          intent="send-message"
          unauthenticatedTo="login"
          className="nw-cta-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {t("public.freelancerProfile.primaryCta")}
        </AuthAwareCtaLink>
      </div>
      <div className="h-16 md:h-0" aria-hidden />
    </div>
  );
}
