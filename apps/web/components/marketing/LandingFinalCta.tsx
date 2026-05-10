import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";
import type { AppLocale } from "@/lib/i18n/types";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

export function LandingFinalCta({ t, locale }: { t: Translator; locale: AppLocale }) {
  const jobsPath = withPublicLocale(locale, "/jobs");
  const freelancersPath = withPublicLocale(locale, "/freelancers");
  const postJobPath = withWorkspaceLocale(locale, "/client/jobs/new");

  return (
    <section className="mx-auto mt-6 max-w-[1280px] px-4 sm:px-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#e5e7eb] bg-[#f5f3ff] p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-xl">
          <p className="nw-section-title">{t("landing.finalCta.kicker")}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.65rem]">{t("landing.finalCta.title")}</h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
            {t("landing.finalCta.subtitle")}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-600">{t("landing.finalCta.urgency")}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link href={postJobPath as Route} className="nw-cta-primary inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-lg bg-[#4f35e8] px-5 py-2.5 text-white hover:bg-[#4326d9]">
            {t("landing.finalCta.primary")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={freelancersPath as Route}
            className="inline-flex min-w-[11rem] items-center justify-center rounded-md border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {t("landing.finalCta.secondary")}
          </Link>
          <Link href={jobsPath as Route} className="text-center text-sm font-bold text-[#3525cd] hover:underline sm:text-right">
            {t("landing.finalCta.tertiary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
