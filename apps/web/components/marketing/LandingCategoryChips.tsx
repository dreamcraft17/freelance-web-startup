import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Camera, GraduationCap, Megaphone, Palette, Video, Wrench } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

type CategoryChip = {
  labelKey: string;
  href: Route;
  icon: LucideIcon;
  /** Subtle identity — solid fills, no gradients */
  tone: "brand" | "slate" | "amber";
};

const categories: CategoryChip[] = [
  { labelKey: "landing.categories.items.design", href: "/freelancers?keyword=design", icon: Palette, tone: "brand" },
  { labelKey: "landing.categories.items.photo", href: "/freelancers?keyword=photography", icon: Camera, tone: "slate" },
  { labelKey: "landing.categories.items.video", href: "/freelancers?keyword=video", icon: Video, tone: "slate" },
  { labelKey: "landing.categories.items.tutor", href: "/freelancers?keyword=tutor", icon: GraduationCap, tone: "amber" },
  { labelKey: "landing.categories.items.marketing", href: "/freelancers?keyword=marketing", icon: Megaphone, tone: "brand" },
  { labelKey: "landing.categories.items.localFix", href: "/freelancers?keyword=repair", icon: Wrench, tone: "slate" }
];

const toneIconWrap: Record<CategoryChip["tone"], string> = {
  brand: "border-[#3525cd]/25 bg-[#3525cd]/[0.12] text-[#3525cd]",
  slate: "border-slate-200 bg-slate-100 text-slate-800",
  amber: "border-amber-200/90 bg-amber-50 text-amber-950"
};

export function LandingCategoryChips({ t }: { t: Translator }) {
  return (
    <section className="nw-section-slab">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="nw-section-title">{t("landing.categories.kicker")}</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{t("landing.categories.title")}</h2>
            <p className="mt-1 max-w-xl text-sm font-semibold text-slate-600">
              {t("landing.categories.subtitle")}
            </p>
          </div>
          <Link href="/jobs" className="text-sm font-bold text-[#3525cd] hover:underline sm:shrink-0">
            {t("landing.categories.secondaryCta")}
          </Link>
        </div>

        <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
          {categories.map(({ labelKey, href, icon: Icon, tone }) => (
            <Link
              key={labelKey}
              href={href}
              className="group flex min-w-[7.5rem] shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:border-[#3525cd]/35 hover:shadow-md sm:min-w-0 sm:flex-1 sm:max-w-[10.5rem]"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition group-hover:scale-[1.03] ${toneIconWrap[tone]}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
              </span>
              <span className="text-sm font-bold text-slate-900">{t(labelKey)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
