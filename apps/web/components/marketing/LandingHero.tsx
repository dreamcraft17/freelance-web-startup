"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Grid2X2, MapPin, Search, ShieldCheck, Zap } from "lucide-react";
import type { LandingIntent } from "@/components/marketing/LandingPage";

type ModeContent = {
  headline: string;
  primaryCtaLabel: string;
  primaryCtaHref: Route;
  secondaryCtaLabel: string;
  secondaryCtaHref: Route;
  searchAction: Route;
  searchPlaceholder: string;
  ctaBandLabel: string;
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
        searchPlaceholder: "Cari freelancer atau skill",
        ctaBandLabel: "Pasang lowongan sekarang"
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
        searchPlaceholder: "Cari pekerjaan atau proyek",
        ctaBandLabel: "Mulai kerja sekarang"
      };
    }
    return {
      headline: "Temukan pekerjaan atau freelancer dengan cepat",
      primaryCtaLabel: "Cari freelancer",
      primaryCtaHref: "/freelancers" as Route,
      secondaryCtaLabel: "Cari pekerjaan",
      secondaryCtaHref: "/jobs" as Route,
      searchAction: "/freelancers" as Route,
      searchPlaceholder: "Cari freelancer atau skill",
      ctaBandLabel: "Mulai sekarang"
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
      <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8f8fc] px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex justify-center lg:justify-start">
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

              <div className={`mt-6 text-center transition-opacity duration-200 ease-in-out lg:text-left ${isPending ? "opacity-70" : "opacity-100"}`}>
                <h1 className="text-3xl font-bold tracking-tight text-[#071027] sm:text-5xl">{modeContent.headline}</h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base lg:mx-0">{subline}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                  <Link href={modeContent.primaryCtaHref} className="inline-flex items-center justify-center rounded-lg bg-[#4f35e8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                    {modeContent.primaryCtaLabel}
                  </Link>
                  <Link href={modeContent.secondaryCtaHref} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    {modeContent.secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="hidden lg:col-span-4 lg:block">
              <div className="relative min-h-[220px] rounded-2xl bg-[#ede9fe] p-4">
                <div className="space-y-3">
                  {[
                    { name: "Siska Putri", role: "UI/UX Designer", rating: "4.9" },
                    { name: "Rama Wijaya", role: "Video Editor", rating: "4.8" },
                    { name: "Daffa Pratama", role: "Web Developer", rating: "4.9" }
                  ].map((row) => (
                    <div key={row.name} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-600">{row.role}</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">★ {row.rating} · Siap bekerja</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <form action={modeContent.searchAction} method="get" className="grid gap-2.5 lg:grid-cols-[minmax(0,1.8fr),minmax(0,1fr),minmax(0,1fr),auto]">
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <Search className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <input
                  name="keyword"
                  type="search"
                  placeholder={modeContent.searchPlaceholder}
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </label>
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <MapPin className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <input
                  name="city"
                  type="text"
                  placeholder="Lokasi (opsional)"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </label>
              <label className="flex min-h-[3.2rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <Grid2X2 className="h-4 w-4 text-[#4f35e8]" aria-hidden />
                <select name="categoryId" className="w-full border-0 bg-transparent text-sm text-slate-900 focus:outline-none focus:ring-0">
                  <option value="">Semua kategori</option>
                  <option value="design">Desain</option>
                  <option value="video">Video</option>
                  <option value="web">Website</option>
                </select>
              </label>
              <button type="submit" className="inline-flex min-h-[3.2rem] items-center justify-center rounded-lg bg-[#4f35e8] px-5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                Cari
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Populer:</span>
              {["Desain logo", "Video editing", "Website", "Copywriting", "SEO", "UI/UX"].map((tag) => (
                <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
              <p className="text-sm text-slate-600">Mulai dari satu langkah kecil, lalu lanjutkan sesuai kebutuhan Anda.</p>
              <Link href={modeContent.secondaryCtaHref} className="inline-flex items-center justify-center rounded-lg bg-[#4f35e8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4326d9]">
                {modeContent.ctaBandLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
