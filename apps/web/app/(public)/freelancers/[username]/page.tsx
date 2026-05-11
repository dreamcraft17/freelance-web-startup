import { notFound } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet
} from "lucide-react";
import { ContractStatus } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { ModerationReportButton } from "@/features/moderation/components/ModerationReportButton";
import { SaveFreelancerButton } from "@/features/saved/components/SaveFreelancerButton";
import { defaultFreelancerRateCurrency, formatMoneyAmount } from "@/lib/format-money";
import type { Translator } from "@/lib/i18n/create-translator";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import type { AppLocale } from "@/lib/i18n/types";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";
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

function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "?";
}

function relativeUpdatedLabel(d: Date, t: Translator): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return t("public.jobDetail.timeMinutesAgo", { count: Math.max(1, mins) });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("public.jobDetail.timeHoursAgo", { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t("public.jobDetail.timeDaysAgo", { count: days });
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { t, locale } = await getServerTranslator();
  const freelancersBrowseRoot = withPublicLocale(locale, "/freelancers");
  const workspaceMessages = withWorkspaceLocale(locale as AppLocale, "/messages") as Route;
  const workspaceProfileEdit = withWorkspaceLocale(locale as AppLocale, "/freelancer/profile") as Route;
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
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
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
        take: 9,
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
        take: 8,
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

  const session = await getSessionFromCookies();

  const [completedHiresViaMarketplace, savedRow] = await Promise.all([
    db.contract.count({
      where: {
        freelancerUserId: profile.userId,
        deletedAt: null,
        status: ContractStatus.COMPLETED
      }
    }),
    session?.userId && session.userId !== profile.userId
      ? db.savedFreelancer.findFirst({
          where: { userId: session.userId, freelancerProfileId: profile.id },
          select: { id: true }
        })
      : Promise.resolve(null)
  ]);

  const isProfileOwner = Boolean(session?.userId && session.userId === profile.userId);
  const canReportUser = Boolean(session?.userId && session.userId !== profile.userId);
  const initialSavedFreelancer = Boolean(savedRow);

  const locationLine = [profile.city, profile.country].filter(Boolean).join(", ");
  const rateValue = profile.hourlyRate ?? profile.fixedStartingPrice;
  const hasRate = rateValue != null;
  const rateText = hasRate
    ? formatMoneyAmount(Number(rateValue), defaultFreelancerRateCurrency(), { locale: locale as AppLocale, maximumFractionDigits: 0 })
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

  const memberSinceLabel = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric"
  }).format(profile.createdAt);

  const verified = profile.verificationStatus === "VERIFIED";
  const verificationPending = profile.verificationStatus === "PENDING";

  const completenessHint =
    profile.profileCompleteness >= 85
      ? t("public.freelancerProfile.completenessStrong")
      : profile.profileCompleteness >= 60
        ? t("public.freelancerProfile.completenessModerate")
        : t("public.freelancerProfile.completenessSparse");

  return (
    <div className={NW_PAGE_WRAP}>
      <nav className="mb-5 text-sm text-slate-500">
        <Link href={freelancersBrowseRoot as Route} className="font-medium text-[#3525cd] underline-offset-4 hover:underline">
          {t("public.freelancers.pageTitle")}
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="font-medium text-slate-900">{profile.fullName}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),minmax(280px,320px)] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
          <header className={`${NW_HERO_WRAP} relative overflow-hidden p-6 sm:p-8`}>
            <div
              className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#3525cd]/30 to-transparent"
              aria-hidden
            />

            {isProfileOwner ? (
              <div className="mb-5 rounded-xl border border-[#3525cd]/20 bg-[#f4f2ff] px-4 py-3">
                <p className="text-sm font-bold text-[#2a1daa]">{t("public.freelancerProfile.ownerBannerTitle")}</p>
                <p className="mt-1 text-xs font-medium text-slate-700">{t("public.freelancerProfile.ownerBannerBody")}</p>
                <Link
                  href={workspaceProfileEdit}
                  className="mt-2 inline-flex text-xs font-bold text-[#3525cd] hover:underline"
                >
                  {t("public.freelancerProfile.ownerBannerCta")}
                </Link>
              </div>
            ) : null}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                {profile.avatarUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external portfolio/avatar URLs
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-24 w-24 rounded-2xl border border-slate-200/90 object-cover shadow-sm sm:h-28 sm:w-28"
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-2xl font-extrabold text-slate-700 shadow-inner sm:h-28 sm:w-28 sm:text-3xl"
                    aria-hidden
                  >
                    {initialsFromFullName(profile.fullName)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`${NW_SECTION_KICKER} text-[#3525cd]/90`}>{t("public.freelancerProfile.heroKicker")}</p>
                  {verified ? (
                    <span className={`${NW_BADGE_PRIMARY} inline-flex items-center gap-1 font-bold`}>
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      {t("public.freelancerProfile.verified")}
                    </span>
                  ) : null}
                  {verificationPending && !verified ? (
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                      {t("public.freelancerProfile.verificationPending")}
                    </span>
                  ) : null}
                  {canReportUser ? (
                    <ModerationReportButton intent="user" target={{ subjectType: "USER", subjectUserId: profile.userId }} />
                  ) : null}
                </div>

                <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl sm:leading-tight">
                  {profile.fullName}
                </h1>
                <p className="mt-2 max-w-3xl text-base font-semibold leading-relaxed text-slate-700 sm:text-lg">
                  {profile.headline?.trim() || t("public.freelancers.profileFallback")}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`${NW_BADGE_NEUTRAL} font-semibold`}>{workModeLabel}</span>
                  <span className={`${NW_BADGE_NEUTRAL} bg-emerald-50/90 font-semibold text-emerald-900`}>{availabilityLabel}</span>
                  <span className={`${NW_BADGE_NEUTRAL} inline-flex items-center gap-1 font-semibold`}>
                    <Briefcase className="h-3 w-3 text-slate-500" aria-hidden />
                    {completedHiresViaMarketplace}{" "}
                    {completedHiresViaMarketplace === 1
                      ? t("public.freelancerProfile.completedHiresSingular")
                      : t("public.freelancerProfile.completedHiresPlural")}
                  </span>
                </div>

                {locationLine ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    {locationLine}
                  </p>
                ) : null}

                {skillNames.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skillNames.slice(0, 10).map((name) => (
                      <span key={name} className={NW_CHIP_SKILL}>
                        {name}
                      </span>
                    ))}
                    {skillNames.length > 10 ? (
                      <span className="self-center text-xs font-bold text-slate-400">+{skillNames.length - 10}</span>
                    ) : null}
                  </div>
                ) : null}

                {reasons.length > 0 ? (
                  <div className="mt-5 border-t border-slate-200/70 pt-4">
                    <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.greatForTitle")}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {reasons.slice(0, 4).map((reason) => (
                        <li
                          key={reason}
                          className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm"
                        >
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {!isProfileOwner ? (
                    <>
                      <AuthAwareCtaLink
                        href={workspaceMessages}
                        intent="send-message"
                        unauthenticatedTo="login"
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2b1daa] sm:min-w-[12rem]"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                        {t("public.freelancerProfile.primaryCta")}
                      </AuthAwareCtaLink>
                      {session?.userId ? (
                        <SaveFreelancerButton
                          freelancerProfileId={profile.id}
                          initialSaved={initialSavedFreelancer}
                          size="default"
                          variant="outline"
                          className="min-h-12 shrink-0 rounded-xl border-2 border-slate-200 px-5 text-sm font-bold text-slate-900 hover:bg-slate-50"
                        />
                      ) : null}
                    </>
                  ) : null}
                  <Link
                    href={freelancersBrowseRoot as Route}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t("public.freelancerProfile.secondaryBackToDirectory")}
                  </Link>
                </div>
                {!isProfileOwner ? (
                  <p className="mt-3 max-w-xl text-xs font-medium leading-relaxed text-slate-600">{t("public.freelancerProfile.ctaPreview")}</p>
                ) : null}
              </div>
            </div>

            {/* Mobile trust strip */}
            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-5 lg:hidden">
              <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRating")}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-900">
                  {ratingText != null ? (
                    <>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                      {ratingText}
                    </>
                  ) : (
                    t("public.freelancerProfile.notRated")
                  )}
                </p>
                <p className="text-[11px] text-slate-600">{t("public.freelancerProfile.reviewCount", { count: profile.reviewCount })}</p>
              </div>
              <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRate")}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                  <Wallet className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  {rateText}
                </p>
              </div>
            </div>
          </header>

          <section className={`${NW_CARD} overflow-hidden p-5 sm:p-6`}>
            <div className="border-b border-slate-100 pb-3">
              <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.aboutSectionTitle")}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">{t("public.freelancerProfile.aboutTitle")}</h2>
            </div>
            <p className="mt-4 text-[15px] leading-[1.65] text-slate-800 sm:text-base">
              {profile.bio?.trim() || t("public.freelancerProfile.aboutFallback")}
            </p>
          </section>

          <section className={`${NW_CARD} overflow-hidden p-5 sm:p-6`}>
            <div className="border-b border-slate-100 pb-3">
              <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.servicesSectionTitle")}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">{t("public.freelancerProfile.servicesTitle")}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">{t("public.freelancerProfile.servicesSubtitle")}</p>
            </div>
            {servicesByCategory.size > 0 ? (
              <ul className="mt-5 space-y-5">
                {[...servicesByCategory.entries()].map(([category, names]) => (
                  <li key={category}>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#3525cd]/90">{category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
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
              <div className="mt-5 flex flex-wrap gap-2">
                {skillNames.map((name) => (
                  <span key={name} className={NW_CHIP_SKILL}>
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm font-medium text-slate-600">
                {isProfileOwner ? t("public.freelancerProfile.servicesEmptyOwner") : t("public.freelancerProfile.skillsFallback")}
              </p>
            )}
          </section>

          <section className={`${NW_CARD} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.workPreferencesTitle")}</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">{t("public.freelancerProfile.workPreferencesHeading")}</h2>
              </div>
              <Sparkles className="h-6 w-6 text-slate-200" aria-hidden />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className={`${NW_CARD_INSET} px-3 py-3`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.filters.workMode")}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">{workModeLabel}</dd>
              </div>
              <div className={`${NW_CARD_INSET} px-3 py-3`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotAvailability")}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">{availabilityLabel}</dd>
              </div>
              <div className={`${NW_CARD_INSET} px-3 py-3`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factLocation")}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">{locationLine || t("public.freelancerProfile.locationNotListed")}</dd>
              </div>
              <div className={`${NW_CARD_INSET} px-3 py-3`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotExperience")}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">
                  {profile.yearsExperience != null
                    ? t("public.freelancerProfile.yearsExperience", { years: profile.yearsExperience })
                    : t("public.freelancerProfile.experienceNotListed")}
                </dd>
              </div>
            </dl>
          </section>

          <section className={`${NW_CARD} p-5 sm:p-6`}>
            <div className="border-b border-slate-100 pb-3">
              <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.languagesTitle")}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{t("public.freelancerProfile.languagesLead")}</p>
            </div>
            <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              {t("public.freelancerProfile.languagesNotOnProfile")}
            </p>
          </section>

          {profile.portfolioItems.length > 0 ? (
            <section className={`${NW_CARD} p-5 sm:p-6`}>
              <div className="border-b border-slate-100 pb-3">
                <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.portfolioSectionTitle")}</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">{t("public.freelancerProfile.portfolioTitle")}</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">{t("public.freelancerProfile.portfolioSubtitle")}</p>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {profile.portfolioItems.map((item) => {
                  const isImage = item.mediaType?.startsWith("image") ?? /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(item.mediaUrl);
                  return (
                    <li key={item.id} className={`${NW_CARD_INSET} group overflow-hidden transition hover:shadow-md`}>
                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35"
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- user-provided external media URL
                          <img
                            src={item.mediaUrl}
                            alt=""
                            className="aspect-[16/10] w-full object-cover transition group-hover:opacity-95"
                          />
                        ) : (
                          <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-xs font-bold text-slate-600">
                            <Globe2 className="mr-2 h-4 w-4" aria-hidden />
                            {t("public.freelancerProfile.portfolioOpen")}
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
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
          ) : isProfileOwner ? (
            <section className={`${NW_CARD} border-dashed border-slate-200 p-5 sm:p-6`}>
              <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.portfolioSectionTitle")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{t("public.freelancerProfile.portfolioEmptyOwnerTitle")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("public.freelancerProfile.portfolioEmptyOwnerBody")}</p>
              <Link href={workspaceProfileEdit} className="mt-3 inline-flex text-sm font-bold text-[#3525cd] hover:underline">
                {t("public.freelancerProfile.portfolioEmptyOwnerCta")}
              </Link>
            </section>
          ) : null}

          <section className={`${NW_CARD} overflow-hidden p-5 sm:p-6`}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.reviewsSectionKicker")}</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">{t("public.freelancerProfile.reviewsTitle")}</h2>
                <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500">{t("public.freelancerProfile.reviewsSectionLead")}</p>
              </div>
              {ratingText != null ? (
                <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
                  <div>
                    <p className="text-lg font-extrabold leading-none text-slate-900">{ratingText}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900/80">
                      {t("public.freelancerProfile.reviewCount", { count: profile.reviewCount })}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {profile.reviewsReceived.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {profile.reviewsReceived.map((review) => {
                  const jobTitle = review.contract?.bid?.job?.title?.trim();
                  return (
                    <li key={review.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#3525cd]/90">
                            {t("public.freelancerProfile.reviewClientFeedback")}
                          </p>
                          {jobTitle ? (
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              <span className="font-medium text-slate-500">{t("public.freelancerProfile.reviewWorkedTogether")} </span>
                              {jobTitle}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-600">{t("public.freelancerProfile.reviewProjectContextUnknown")}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-950 ring-1 ring-amber-200/80">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                            {review.rating}/5
                          </span>
                          {canReportUser && session?.userId !== review.author.id ? (
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
                        <p className="mt-3 text-sm leading-relaxed text-slate-800">{review.comment.trim()}</p>
                      ) : (
                        <p className="mt-3 text-sm italic text-slate-500">{t("public.freelancerProfile.reviewNoComment")}</p>
                      )}
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <time dateTime={review.createdAt.toISOString()}>
                          {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { dateStyle: "medium" }).format(
                            review.createdAt
                          )}
                        </time>
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600">
                {t("public.freelancerProfile.reviewsFallback")}
              </p>
            )}
          </section>

          {!isProfileOwner ? (
            <section className={`${NW_CARD} border-[#3525cd]/15 bg-gradient-to-br from-[#faf9ff] to-white p-5 sm:p-6`}>
              <p className="text-sm font-bold text-slate-900">{t("public.freelancerProfile.finalCtaTitle")}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t("public.freelancerProfile.finalCtaBody")}</p>
              <AuthAwareCtaLink
                href={workspaceMessages}
                intent="send-message"
                unauthenticatedTo="login"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2b1daa]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("public.freelancerProfile.primaryCta")}
              </AuthAwareCtaLink>
            </section>
          ) : null}
        </div>

        <aside className={`${NW_CARD_INSET} ${NW_SIDEBAR_STICKY} mt-8 hidden space-y-5 border-slate-200/90 p-5 shadow-sm lg:mt-0 lg:block`}>
          <div>
            <p className={NW_SECTION_KICKER}>{t("public.freelancerProfile.trustPanelTitle")}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t("public.freelancerProfile.trustPanelLead")}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRating")}</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
              {ratingText != null ? (
                <>
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden />
                  {ratingText}
                </>
              ) : (
                <span className="text-base font-bold">{t("public.freelancerProfile.notRated")}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">{t("public.freelancerProfile.reviewCount", { count: profile.reviewCount })}</p>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotCompleted")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{completedHiresViaMarketplace}</dd>
              <dd className="mt-1 text-[11px] font-medium text-slate-600">{t("public.freelancerProfile.snapshotCompletedHint")}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.memberSinceLabel")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{memberSinceLabel}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.profileUpdatedLabel")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{relativeUpdatedLabel(profile.updatedAt, t)}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factRate")}</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                <Wallet className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                {rateText}
              </dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factProfileQuality")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">
                {t("public.freelancerProfile.profileCompleteness", { value: profile.profileCompleteness })}
              </dd>
              <dd className="mt-1 text-[11px] font-medium text-slate-600">{completenessHint}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotWorkMode")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{workModeLabel}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.snapshotAvailability")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{availabilityLabel}</dd>
            </div>
            <div className={`${NW_CARD_INSET} px-3 py-2.5`}>
              <dt className="font-bold uppercase tracking-wide text-slate-500">{t("public.freelancerProfile.factLocation")}</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{locationLine || t("public.freelancerProfile.locationNotListed")}</dd>
            </div>
          </dl>

          {!isProfileOwner ? (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <AuthAwareCtaLink
                href={workspaceMessages}
                intent="send-message"
                unauthenticatedTo="login"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#2b1daa]"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                {t("public.freelancerProfile.primaryCta")}
              </AuthAwareCtaLink>
              {session?.userId ? (
                <SaveFreelancerButton
                  freelancerProfileId={profile.id}
                  initialSaved={initialSavedFreelancer}
                  className="w-full rounded-xl border-2 border-slate-200 font-bold"
                />
              ) : null}
              <p className="text-[11px] font-medium leading-relaxed text-slate-600">{t("public.freelancerProfile.ctaReassurance")}</p>
              <Link
                href={freelancersBrowseRoot as Route}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {t("public.freelancerProfile.secondaryBackToDirectory")}
              </Link>
            </div>
          ) : null}
        </aside>
      </div>

      {!isProfileOwner ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-3 py-3 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.14)] lg:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            <AuthAwareCtaLink
              href={workspaceMessages}
              intent="send-message"
              unauthenticatedTo="login"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-3 text-sm font-bold text-white"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              {t("public.freelancerProfile.primaryCtaShort")}
            </AuthAwareCtaLink>
            {session?.userId ? (
              <SaveFreelancerButton
                freelancerProfileId={profile.id}
                initialSaved={initialSavedFreelancer}
                size="default"
                variant="outline"
                className="min-h-12 shrink-0 rounded-xl border-2 border-slate-200 px-3 font-bold"
              />
            ) : null}
          </div>
        </div>
      ) : null}
      {!isProfileOwner ? <div className="h-16 lg:h-0" aria-hidden /> : null}
    </div>
  );
}
