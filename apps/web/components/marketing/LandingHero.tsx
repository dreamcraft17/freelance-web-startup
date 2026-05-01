"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Search, ShieldCheck, Zap } from "lucide-react";
import type { LandingIntent } from "@/components/marketing/LandingPage";

type ModeContent = {
  headline: string;
  primaryCtaLabel: string;
  primaryCtaHref: Route;
  secondaryCtaLabel: string;
  secondaryCtaHref: Route;
  searchAction: Route;
  searchPlaceholder: string;
};

export function LandingHero({
  intent,
  homePath
}: {
  intent: LandingIntent;
  homePath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIntent, setCurrentIntent] = useState<LandingIntent>(intent);
  const modeContent: ModeContent = useMemo(() => {
    if (currentIntent === "hire") {
      return {
        headline: "Temukan freelancer siap kerja sekarang",
        primaryCtaLabel: "Cari freelancer",
        primaryCtaHref: "/freelancers" as Route,
        secondaryCtaLabel: "Pasang lowongan",
        secondaryCtaHref: "/client/jobs/new" as Route,
        searchAction: "/freelancers" as Route,
        searchPlaceholder: "Cari freelancer atau skill"
      };
    }
    if (currentIntent === "work") {
      return {
        headline: "Temukan pekerjaan freelance yang sesuai skill Anda",
        primaryCtaLabel: "Cari pekerjaan",
        primaryCtaHref: "/jobs" as Route,
        secondaryCtaLabel: "Buat profil",
        secondaryCtaHref: "/freelancer/profile" as Route,
        searchAction: "/jobs" as Route,
        searchPlaceholder: "Cari pekerjaan atau proyek"
      };
    }
    return {
      headline: "Temukan pekerjaan atau freelancer dengan cepat",
      primaryCtaLabel: "Cari freelancer",
      primaryCtaHref: "/freelancers" as Route,
      secondaryCtaLabel: "Cari pekerjaan",
      secondaryCtaHref: "/jobs" as Route,
      searchAction: "/freelancers" as Route,
      searchPlaceholder: "Cari freelancer atau skill"
    };
  }, [currentIntent]);

  const toggleIntent = currentIntent === "neutral" ? "hire" : currentIntent;
  const subline = "Cari kerja, temukan klien, atau rekrut dalam satu platform.";

  const onIntentChange = (next: Exclude<LandingIntent, "neutral">) => {
    setCurrentIntent(next);
    startTransition(() => {
      router.replace(`${homePath}?intent=${next}` as Route, { scroll: false });
    });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1100px] px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8f8fc] p-5 sm:p-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => onIntentChange("hire")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${toggleIntent === "hire" ? "bg-[#4f35e8] text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Saya ingin rekrut
              </button>
              <button
                type="button"
                onClick={() => onIntentChange("work")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${toggleIntent === "work" ? "bg-[#4f35e8] text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Saya ingin kerja
              </button>
            </div>
          </div>

          <div className={`mt-6 text-center transition-opacity duration-200 ease-in-out ${isPending ? "opacity-70" : "opacity-100"}`}>
            <h1 className="text-3xl font-bold tracking-tight text-[#071027] sm:text-5xl">{modeContent.headline}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">{subline}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Link href={modeContent.primaryCtaHref} className="inline-flex items-center justify-center rounded-lg bg-[#4f35e8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                {modeContent.primaryCtaLabel}
              </Link>
              <Link href={modeContent.secondaryCtaHref} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {modeContent.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <form action={modeContent.searchAction} method="get" className="flex flex-col gap-2.5 lg:flex-row">
              <label className="flex min-h-[3.2rem] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <Search className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <input
                  name="keyword"
                  type="search"
                  placeholder={modeContent.searchPlaceholder}
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </label>
              <button type="submit" className="inline-flex min-h-[3.2rem] items-center justify-center rounded-lg bg-[#4f35e8] px-5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                Cari
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 text-[#4f35e8]" /> Cepat
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-[#4f35e8]" /> Aman
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Briefcase className="h-4 w-4 text-[#4f35e8]" /> Fleksibel
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-[#f4f2ff] p-4">
            <p className="text-sm font-semibold text-slate-900">Siap mulai sekarang?</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Link href={modeContent.primaryCtaHref} className="inline-flex items-center justify-center rounded-lg bg-[#4f35e8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                {modeContent.primaryCtaLabel}
              </Link>
              <Link href={modeContent.secondaryCtaHref} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {modeContent.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
