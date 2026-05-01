import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Camera, GraduationCap, Megaphone, Palette, Video, Wrench } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

type CategoryChip = {
  labelKey: string;
  useCaseKey: string;
  href: Route;
  icon: LucideIcon;
  /** Subtle identity — solid fills, no gradients */
  tone: "brand" | "slate" | "amber";
};

const categories: CategoryChip[] = [
  {
    labelKey: "landing.categories.items.design",
    useCaseKey: "landing.categories.examples.design",
    href: "/freelancers?keyword=design",
    icon: Palette,
    tone: "brand"
  },
  {
    labelKey: "landing.categories.items.photo",
    useCaseKey: "landing.categories.examples.photo",
    href: "/freelancers?keyword=photography",
    icon: Camera,
    tone: "slate"
  },
  {
    labelKey: "landing.categories.items.video",
    useCaseKey: "landing.categories.examples.video",
    href: "/freelancers?keyword=video",
    icon: Video,
    tone: "slate"
  },
  {
    labelKey: "landing.categories.items.tutor",
    useCaseKey: "landing.categories.examples.tutor",
    href: "/freelancers?keyword=tutor",
    icon: GraduationCap,
    tone: "amber"
  },
  {
    labelKey: "landing.categories.items.marketing",
    useCaseKey: "landing.categories.examples.marketing",
    href: "/freelancers?keyword=marketing",
    icon: Megaphone,
    tone: "brand"
  },
  {
    labelKey: "landing.categories.items.localFix",
    useCaseKey: "landing.categories.examples.localFix",
    href: "/freelancers?keyword=repair",
    icon: Wrench,
    tone: "slate"
  }
];

const toneIconWrap: Record<CategoryChip["tone"], string> = {
  brand: "border-[#3525cd]/25 bg-[#3525cd]/[0.12] text-[#3525cd]",
  slate: "border-slate-200 bg-slate-100 text-slate-800",
  amber: "border-amber-200/90 bg-amber-50 text-amber-950"
};

export function LandingCategoryChips({ t }: { t: Translator }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="nw-section-title">{t("landing.categories.kicker")}</p>
            <h2 className="text-xl font-bold tracking-tight text-[#071027] sm:text-2xl">Cari freelancer sesuai kebutuhan</h2>
            <p className="mt-1 max-w-xl text-sm font-semibold text-slate-600">
              {t("landing.categories.subtitle")}
            </p>
          </div>
          <Link href="/jobs" className="text-sm font-bold text-[#3525cd] hover:underline sm:shrink-0">
            Lihat semua kategori →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ labelKey, useCaseKey, href, icon: Icon, tone }) => (
            <Link
              key={labelKey}
              href={href}
              className="group flex min-h-[9.8rem] flex-col items-start justify-between rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4 text-left transition hover:border-[#4f35e8]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f35e8]/25"
            >
              <div>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 transition group-hover:scale-[1.03] ${toneIconWrap[tone]}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <span className="mt-2.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("landing.categories.entryLabel")}</span>
                <span className="mt-1 block text-base font-bold leading-tight text-slate-900 group-hover:text-[#3525cd]">{t(labelKey)}</span>
                <span className="mt-1.5 block text-xs font-medium leading-snug text-slate-600">{t(useCaseKey)}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 group-hover:text-[#3525cd]">
                {t("landing.categories.entrySubline")}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
