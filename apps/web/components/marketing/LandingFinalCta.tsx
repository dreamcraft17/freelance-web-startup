import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

export function LandingFinalCta({ t }: { t: Translator }) {
  return (
    <section className="mx-auto mt-6 max-w-[1280px] px-4 sm:px-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#e5e7eb] bg-[#f5f3ff] p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-xl">
          <p className="nw-section-title">{t("landing.finalCta.kicker")}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.65rem]">
            Mulai dari satu brief - cari freelancer, diskusi, lalu rekrut dengan jelas.
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
            {t("landing.finalCta.subtitle")}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-600">{t("landing.finalCta.urgency")}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link href="/client/jobs/new" className="nw-cta-primary inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-lg bg-[#4f35e8] px-5 py-2.5 text-white hover:bg-[#4326d9]">
            Pasang lowongan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex min-w-[11rem] items-center justify-center rounded-md border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Cari freelancer
          </Link>
          <Link href="/jobs" className="text-center text-sm font-bold text-[#3525cd] hover:underline sm:text-right">
            Buka job board
          </Link>
        </div>
      </div>
    </section>
  );
}
