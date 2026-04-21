import type { Route } from "next";
import Link from "next/link";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function PricingPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">{t("marketing.pricing.sectionTitle")}</p>
        <h1 className="nw-page-title md:text-4xl">{t("marketing.pricing.pageTitle")}</h1>
        <p className="nw-page-description text-base leading-relaxed">
          {t("marketing.pricing.descriptionPrefix")}{" "}
          <span className="font-medium text-slate-800">{t("marketing.pricing.earlyAccessBold")}</span>.{" "}
          {t("marketing.pricing.descriptionSuffix")}
        </p>
      </header>

      <div className="grid gap-4">
        <section className="nw-surface p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900">{t("marketing.pricing.currentlyFreeTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{t("marketing.pricing.currentlyFreeBody1")}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            <span className="font-medium text-slate-900">{t("marketing.pricing.currentlyFreeBold")}</span>{" "}
            {t("marketing.pricing.currentlyFreeBody2")}
          </p>
        </section>

        <section className="nw-surface-soft px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">{t("marketing.pricing.donationTitle")}</h2>
          <p className="mt-3">{t("marketing.pricing.donationBody")}</p>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">{t("marketing.pricing.futureTitle")}</h2>
          <p className="mt-3">{t("marketing.pricing.futureBody1")}</p>
          <p className="mt-3">{t("marketing.pricing.futureBody2")}</p>
        </section>
      </div>

      <section className="nw-surface mt-8 px-6 py-7 sm:px-8">
        <h2 className="text-xl font-semibold text-slate-900">{t("marketing.pricing.ctaTitle")}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("marketing.pricing.ctaBody")}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="nw-cta-primary inline-flex justify-center px-6 py-3"
          >
            {t("marketing.pricing.ctaPrimary")}
          </AuthAwareCtaLink>
          <Link
            href="/register"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {t("marketing.pricing.ctaRegister")}
          </Link>
          <Link
            href="/jobs"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {t("marketing.pricing.ctaJobs")}
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center px-1 py-3 text-sm font-semibold text-[#433C93] hover:underline"
          >
            {t("marketing.pricing.ctaFreelancers")}
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-500">
          <Link href="/early-access" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            {t("marketing.pricing.footerEarlyAccess")}
          </Link>
          {" · "}
          <Link href="/help" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            {t("nav.help")}
          </Link>
        </p>
      </section>
    </div>
  );
}
