import type { Route } from "next";
import Link from "next/link";
import { Camera, PenSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

type MarketplaceRow = {
  titleKey: string;
  subtitleKey: string;
  metaKey: string;
  urgencyKey: string;
  locationKey: string;
  priceKey: string;
  signalKey: string;
  href: Route;
};

const activeFreelancers: MarketplaceRow[] = [
  {
    titleKey: "landing.previewRowsData.freelancers.one.title",
    subtitleKey: "landing.previewRowsData.freelancers.one.subtitle",
    metaKey: "landing.previewRowsData.freelancers.one.meta",
    urgencyKey: "landing.previewRowsData.freelancers.one.urgency",
    locationKey: "landing.previewRowsData.freelancers.one.location",
    priceKey: "landing.previewRowsData.freelancers.one.price",
    signalKey: "landing.previewRowsData.freelancers.one.signal",
    href: "/freelancers" as Route
  },
  {
    titleKey: "landing.previewRowsData.freelancers.two.title",
    subtitleKey: "landing.previewRowsData.freelancers.two.subtitle",
    metaKey: "landing.previewRowsData.freelancers.two.meta",
    urgencyKey: "landing.previewRowsData.freelancers.two.urgency",
    locationKey: "landing.previewRowsData.freelancers.two.location",
    priceKey: "landing.previewRowsData.freelancers.two.price",
    signalKey: "landing.previewRowsData.freelancers.two.signal",
    href: "/freelancers" as Route
  },
  {
    titleKey: "landing.previewRowsData.freelancers.three.title",
    subtitleKey: "landing.previewRowsData.freelancers.three.subtitle",
    metaKey: "landing.previewRowsData.freelancers.three.meta",
    urgencyKey: "landing.previewRowsData.freelancers.three.urgency",
    locationKey: "landing.previewRowsData.freelancers.three.location",
    priceKey: "landing.previewRowsData.freelancers.three.price",
    signalKey: "landing.previewRowsData.freelancers.three.signal",
    href: "/freelancers" as Route
  }
];

const recentJobs: MarketplaceRow[] = [
  {
    titleKey: "landing.previewRowsData.jobs.one.title",
    subtitleKey: "landing.previewRowsData.jobs.one.subtitle",
    metaKey: "landing.previewRowsData.jobs.one.meta",
    urgencyKey: "landing.previewRowsData.jobs.one.urgency",
    locationKey: "landing.previewRowsData.jobs.one.location",
    priceKey: "landing.previewRowsData.jobs.one.price",
    signalKey: "landing.previewRowsData.jobs.one.signal",
    href: "/jobs" as Route
  },
  {
    titleKey: "landing.previewRowsData.jobs.two.title",
    subtitleKey: "landing.previewRowsData.jobs.two.subtitle",
    metaKey: "landing.previewRowsData.jobs.two.meta",
    urgencyKey: "landing.previewRowsData.jobs.two.urgency",
    locationKey: "landing.previewRowsData.jobs.two.location",
    priceKey: "landing.previewRowsData.jobs.two.price",
    signalKey: "landing.previewRowsData.jobs.two.signal",
    href: "/jobs" as Route
  },
  {
    titleKey: "landing.previewRowsData.jobs.three.title",
    subtitleKey: "landing.previewRowsData.jobs.three.subtitle",
    metaKey: "landing.previewRowsData.jobs.three.meta",
    urgencyKey: "landing.previewRowsData.jobs.three.urgency",
    locationKey: "landing.previewRowsData.jobs.three.location",
    priceKey: "landing.previewRowsData.jobs.three.price",
    signalKey: "landing.previewRowsData.jobs.three.signal",
    href: "/jobs" as Route
  }
];

function PreviewList({
  title,
  rows,
  icon: Icon,
  ctaLabel,
  ctaHref,
  rowActionLabel,
  t
}: {
  title: string;
  rows: MarketplaceRow[];
  icon: LucideIcon;
  ctaLabel: string;
  ctaHref: Route;
  rowActionLabel: string;
  t: Translator;
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
          <li key={row.titleKey} className="px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{t(row.titleKey)}</p>
                <p className="text-xs text-slate-600">{t(row.subtitleKey)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-[11px] text-slate-500">{t(row.metaKey)}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">•</span>
                  <p className="text-[11px] font-semibold text-slate-700">{t(row.urgencyKey)}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {t(row.signalKey)}
                </span>
                <span className="text-xs font-semibold text-slate-700">{t(row.locationKey)}</span>
                <span className="text-xs font-bold text-slate-900">{t(row.priceKey)}</span>
                <Link href={row.href} className="text-[11px] font-semibold text-[#3525cd] hover:underline">
                  {rowActionLabel}
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
          rowActionLabel={t("landing.preview.rowActionOpen")}
          t={t}
        />
        <PreviewList
          title={t("landing.preview.recentJobsTitle")}
          rows={recentJobs}
          icon={PenSquare}
          ctaLabel={t("landing.preview.ctaJobs")}
          ctaHref={"/jobs" as Route}
          rowActionLabel={t("landing.preview.rowActionOpen")}
          t={t}
        />
      </div>
    </section>
  );
}
