import Link from "next/link";
import type { Translator } from "@/lib/i18n/create-translator";

export function LandingFinalCta({ t }: { t: Translator }) {
  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
      <div className="nw-hero-panel flex flex-col gap-6 rounded-2xl sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-xl">
          <p className="nw-section-title">{t("landing.finalCta.kicker")}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.65rem]">
            {t("landing.finalCta.title")}
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
            {t("landing.finalCta.subtitle")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
          <Link href="/freelancers" className="nw-cta-primary inline-flex min-w-[11rem] justify-center px-5 py-2.5">
            {t("landing.finalCta.primary")}
          </Link>
          <Link
            href="/jobs"
            className="inline-flex min-w-[11rem] items-center justify-center rounded-md border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {t("landing.finalCta.secondary")}
          </Link>
          <Link href="/register" className="text-center text-sm font-bold text-[#3525cd] hover:underline sm:text-right">
            {t("landing.finalCta.tertiary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
