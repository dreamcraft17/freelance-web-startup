import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function HowItWorksPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">{t("marketing.how.sectionTitle")}</p>
        <h1 className="nw-page-title md:text-4xl">{t("marketing.how.pageTitle")}</h1>
        <p className="nw-page-description text-base leading-relaxed">{t("marketing.how.description")}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="nw-surface p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900">{t("marketing.how.clientsTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("marketing.how.clientsSubtitle")}</p>
          <ol className="mt-6 space-y-6">
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.clientsStep1Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.clientsStep1Body")}</p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.clientsStep2Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.clientsStep2Body")}</p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.clientsStep3Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.clientsStep3Body")}</p>
            </li>
          </ol>
        </section>

        <section className="nw-surface p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900">{t("marketing.how.freelancersTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("marketing.how.freelancersSubtitle")}</p>
          <ol className="mt-6 space-y-6">
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.freelancersStep1Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.freelancersStep1Body")}</p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.freelancersStep2Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.freelancersStep2Body")}</p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">{t("marketing.how.freelancersStep3Title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("marketing.how.freelancersStep3Body")}</p>
            </li>
          </ol>
        </section>

        <section className="nw-surface-soft px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">{t("marketing.how.nearbyTitle")}</h2>
          <p className="mt-3">{t("marketing.how.nearbyBody")}</p>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">{t("marketing.how.earlyAccessTitle")}</h2>
          <p className="mt-3">{t("marketing.how.earlyAccessBody")}</p>
          <p className="mt-3">
            <Link href="/early-access" className="font-semibold text-[#3525cd] hover:underline">
              {t("marketing.how.earlyAccessLink")}
            </Link>
          </p>
        </section>
      </div>

      <section className="nw-surface mt-8 px-6 py-7 sm:px-8">
        <h2 className="text-xl font-semibold text-slate-900">{t("marketing.how.ctaTitle")}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("marketing.how.ctaBody")}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="nw-cta-primary inline-flex justify-center px-6 py-3"
          >
            {t("marketing.how.ctaPrimary")}
          </Link>
          <Link
            href="/jobs"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {t("marketing.how.ctaJobs")}
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center px-1 py-3 text-sm font-semibold text-[#433C93] hover:underline"
          >
            {t("marketing.how.ctaFreelancers")}
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-500">
          {t("marketing.how.footerPrefix")}{" "}
          <Link href="/help" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            {t("nav.help")}
          </Link>
        </p>
      </section>
    </div>
  );
}
