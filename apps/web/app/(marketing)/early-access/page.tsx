import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function EarlyAccessPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">{t("marketing.earlyAccess.sectionTitle")}</p>
        <h1 className="nw-page-title md:text-4xl">{t("marketing.earlyAccess.pageTitle")}</h1>
        <p className="nw-page-description text-base leading-relaxed">{t("marketing.earlyAccess.description")}</p>
      </header>

      <div className="grid gap-4 text-sm leading-relaxed text-slate-700">
        <section className="nw-surface p-5">
          <h2 className="text-base font-semibold text-slate-900">{t("marketing.earlyAccess.whyTitle")}</h2>
          <p className="mt-2">{t("marketing.earlyAccess.whyBody")}</p>
        </section>
        <section className="nw-surface p-5">
          <h2 className="text-base font-semibold text-slate-900">{t("marketing.earlyAccess.todayTitle")}</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>{t("marketing.earlyAccess.todayItem1")}</li>
            <li>{t("marketing.earlyAccess.todayItem2")}</li>
            <li>{t("marketing.earlyAccess.todayItem3")}</li>
          </ul>
        </section>
        <section className="nw-surface p-5">
          <h2 className="text-base font-semibold text-slate-900">{t("marketing.earlyAccess.evolvingTitle")}</h2>
          <p className="mt-2">
            {t("marketing.earlyAccess.evolvingPrefix")}{" "}
            <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
              {t("nav.help")}
            </Link>{" "}
            {t("marketing.earlyAccess.evolvingSuffix")}
          </p>
        </section>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="nw-cta-primary inline-flex justify-center px-6 py-3 text-center"
        >
          {t("marketing.earlyAccess.ctaJoin")}
        </Link>
        <Link
          href="/freelancers"
          className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          {t("marketing.earlyAccess.ctaFreelancers")}
        </Link>
        <Link
          href="/jobs"
          className="inline-flex justify-center rounded-lg border border-transparent px-6 py-3 text-center text-sm font-semibold text-[#3525cd] hover:underline"
        >
          {t("marketing.earlyAccess.ctaJobs")}
        </Link>
      </div>
    </div>
  );
}
