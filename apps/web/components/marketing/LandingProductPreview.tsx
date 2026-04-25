import type { Route } from "next";
import Link from "next/link";
import { Camera, PenSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

type MarketplaceRow = {
  title: string;
  subtitle: string;
  meta: string;
  location: string;
  price: string;
  signal: string;
  href: Route;
};

const activeFreelancers: MarketplaceRow[] = [
  {
    title: "Maya Sutanto",
    subtitle: "Portrait & small events",
    meta: "Responds same day",
    location: "Menteng, Jakarta",
    price: "From Rp 2.4M / half-day",
    signal: "Active now",
    href: "/freelancers" as Route
  },
  {
    title: "Rama Wijaya",
    subtitle: "Interview cuts & captions",
    meta: "Top rated in category",
    location: "Remote",
    price: "From Rp 650k / day",
    signal: "Available this week",
    href: "/freelancers" as Route
  },
  {
    title: "Siska Putri",
    subtitle: "Brand photo + quick retouch",
    meta: "Recently hired",
    location: "South Jakarta",
    price: "From Rp 1.8M / session",
    signal: "New profile update",
    href: "/freelancers" as Route
  }
];

const recentJobs: MarketplaceRow[] = [
  {
    title: "Half-day brand shoot",
    subtitle: "Client needs on-site support",
    meta: "3 proposals in review",
    location: "Kelapa Gading",
    price: "Budget Rp 4.5M-7M",
    signal: "New today",
    href: "/jobs" as Route
  },
  {
    title: "Weekly short-video editing",
    subtitle: "Remote delivery for social channel",
    meta: "Brief updated 2h ago",
    location: "Remote",
    price: "Budget Rp 1.2M-2.5M",
    signal: "Active hiring",
    href: "/jobs" as Route
  },
  {
    title: "Math tutor (hybrid sessions)",
    subtitle: "Mix of online and in-person meetings",
    meta: "Client replies quickly",
    location: "Bandung",
    price: "Budget Rp 300k-500k / session",
    signal: "Open this week",
    href: "/jobs" as Route
  }
];

function PreviewList({
  title,
  rows,
  icon: Icon,
  ctaLabel,
  ctaHref
}: {
  title: string;
  rows: MarketplaceRow[];
  icon: LucideIcon;
  ctaLabel: string;
  ctaHref: Route;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon className="h-4 w-4 text-[#3525cd]" aria-hidden />
          {title}
        </p>
        <Link href={ctaHref} className="text-xs font-semibold text-[#3525cd] hover:underline">
          {ctaLabel}
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.title} className="px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                <p className="text-xs text-slate-600">{row.subtitle}</p>
                <p className="mt-1 text-[11px] text-slate-500">{row.meta}</p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {row.signal}
                </span>
                <span className="text-xs font-semibold text-slate-700">{row.location}</span>
                <span className="text-xs font-bold text-slate-900">{row.price}</span>
                <Link href={row.href} className="text-[11px] font-semibold text-[#3525cd] hover:underline">
                  Open
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingProductPreview({ t }: { t: Translator }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nw-section-title">{t("landing.preview.kicker")}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{t("landing.preview.marketTitle")}</h2>
        </div>
        <p className="text-xs font-semibold text-slate-500">{t("landing.preview.marketSubtitle")}</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PreviewList
          title={t("landing.preview.activeFreelancersTitle")}
          rows={activeFreelancers}
          icon={Camera}
          ctaLabel={t("landing.preview.ctaFreelancers")}
          ctaHref={"/freelancers" as Route}
        />
        <PreviewList
          title={t("landing.preview.recentJobsTitle")}
          rows={recentJobs}
          icon={PenSquare}
          ctaLabel={t("landing.preview.ctaJobs")}
          ctaHref={"/jobs" as Route}
        />
      </div>
    </section>
  );
}
