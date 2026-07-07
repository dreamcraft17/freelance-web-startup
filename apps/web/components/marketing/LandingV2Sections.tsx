import type { Route } from "next";
import Link from "next/link";
import { BadgeCheck, HelpCircle, Lock, Shield, Star, Users } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import type { MarketplaceMomentumSnapshot } from "@/server/services/public-stats.service";
import { LandingV2FaqTranslated } from "@/components/marketing/LandingV2Faq";
import type { LandingCategoryOption } from "@/components/marketing/LandingHero";

const FALLBACK_CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video", "Business"];

type Props = {
  categories?: LandingCategoryOption[];
};

export async function LandingV2CategoryBrowse({ categories = [] }: Props) {
  const { t, locale } = await getServerTranslator();
  const pub = (path: string) => withPublicLocale(locale, path) as Route;
  const chips = categories.length > 0 ? categories.slice(0, 8) : FALLBACK_CATEGORIES.map((name, i) => ({ id: String(i), name }));

  return (
    <section aria-labelledby="v2-categories-heading" className="nw-section-mist border-t border-slate-200">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14">
        <p className="nw-section-title">{t("landing.v2.categories.kicker")}</p>
        <h2 id="v2-categories-heading" className="nw-v2-h2 mt-2 max-w-2xl">
          {t("landing.v2.categories.title")}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">{t("landing.v2.categories.subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {chips.map((cat) => (
            <Link
              key={cat.id}
              href={pub(`/jobs?categoryId=${encodeURIComponent(cat.id)}`)}
              className="nw-chip-quiet min-h-11 px-4 py-2.5 text-sm"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <Link href={pub("/jobs")} className="nw-link-action mt-6 inline-flex text-sm">
          {t("landing.v2.categories.viewAll")}
        </Link>
      </div>
    </section>
  );
}

export async function LandingV2SocialProof({ momentum }: { momentum: MarketplaceMomentumSnapshot }) {
  const { t } = await getServerTranslator();

  const stats = [
    { label: t("landing.v2.social.stats.freelancers"), value: momentum.freelancersAvailable.toLocaleString() },
    { label: t("landing.v2.social.stats.jobs"), value: momentum.openPublicJobs.toLocaleString() },
    { label: t("landing.v2.social.stats.proposals"), value: momentum.bidsLast24h.toLocaleString() }
  ];

  return (
    <section aria-labelledby="v2-social-heading" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="nw-section-title">{t("landing.v2.social.kicker")}</p>
            <h2 id="v2-social-heading" className="nw-v2-h2 mt-2">
              {t("landing.v2.social.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{t("landing.v2.social.body")}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="nw-card rounded-xl p-4 text-center">
                <dt className="text-xs font-medium text-slate-500">{stat.label}</dt>
                <dd className="nw-v2-price mt-1 text-2xl font-bold text-nw-brand">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <blockquote className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <p className="text-base leading-relaxed text-slate-800">&ldquo;{t("landing.v2.social.quote")}&rdquo;</p>
          <footer className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-nw-brand" aria-hidden />
            {t("landing.v2.social.quoteAuthor")}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

export async function LandingV2TrustSafety() {
  const { t } = await getServerTranslator();

  const items = [
    { icon: Lock, title: t("landing.v2.trust.escrow.title"), body: t("landing.v2.trust.escrow.body") },
    { icon: Shield, title: t("landing.v2.trust.moderation.title"), body: t("landing.v2.trust.moderation.body") },
    { icon: BadgeCheck, title: t("landing.v2.trust.verify.title"), body: t("landing.v2.trust.verify.body") },
    { icon: Star, title: t("landing.v2.trust.reviews.title"), body: t("landing.v2.trust.reviews.body") }
  ];

  return (
    <section aria-labelledby="v2-trust-heading" className="nw-section-slab border-t border-slate-200">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14">
        <p className="nw-section-title">{t("landing.v2.trust.kicker")}</p>
        <h2 id="v2-trust-heading" className="nw-v2-h2 mt-2 max-w-2xl">
          {t("landing.v2.trust.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">{t("landing.v2.trust.subtitle")}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, body }) => (
            <li key={title} className="nw-hero-panel flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nw-brand/10 text-nw-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function LandingV2CtaFaq() {
  const { t, locale } = await getServerTranslator();
  const pub = (path: string) => withPublicLocale(locale, path) as Route;

  const faqItems = [
    { questionKey: "q1", answerKey: "a1", question: t("landing.v2.faq.q1"), answer: t("landing.v2.faq.a1") },
    { questionKey: "q2", answerKey: "a2", question: t("landing.v2.faq.q2"), answer: t("landing.v2.faq.a2") },
    { questionKey: "q3", answerKey: "a3", question: t("landing.v2.faq.q3"), answer: t("landing.v2.faq.a3") },
    { questionKey: "q4", answerKey: "a4", question: t("landing.v2.faq.q4"), answer: t("landing.v2.faq.a4") }
  ];

  return (
    <section aria-labelledby="v2-faq-heading" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
          <div>
            <p className="nw-section-title">{t("landing.v2.cta.kicker")}</p>
            <h2 id="v2-faq-heading" className="nw-v2-h2 mt-2">
              {t("landing.v2.cta.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{t("landing.v2.cta.body")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={pub("/register")} className="nw-cta-primary inline-flex min-h-11 items-center px-5">
                {t("landing.v2.cta.primary")}
              </Link>
              <Link
                href={pub("/jobs")}
                className="nw-cta-secondary inline-flex min-h-11 items-center px-5"
              >
                {t("landing.v2.cta.secondary")}
              </Link>
            </div>
            <Link href={pub("/help")} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-nw-brand hover:underline">
              <HelpCircle className="h-4 w-4" aria-hidden />
              {t("landing.v2.cta.help")}
            </Link>
          </div>
          <LandingV2FaqTranslated items={faqItems} />
        </div>
      </div>
    </section>
  );
}
