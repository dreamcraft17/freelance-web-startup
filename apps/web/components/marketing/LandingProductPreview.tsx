import type { Route } from "next";
import Link from "next/link";
import { Camera, Clapperboard, MapPin, PenSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Translator } from "@/lib/i18n/create-translator";

type PreviewRow = {
  kind: "Freelancer" | "Job";
  title: string;
  subtitle: string;
  location: string;
  distance: string;
  price: string;
  valueLine: string;
  initials: string;
  meta: string;
  tags: string[];
  chooseSignal: "respondsFast" | "popularChoice" | "recentlyHired" | "topRatedLocal";
  featured?: boolean;
  thumbnailIcon: LucideIcon;
};

const examples: PreviewRow[] = [
  {
    kind: "Freelancer",
    title: "Maya Sutanto",
    subtitle: "Portrait & small events",
    location: "Menteng, Jakarta",
    distance: "~6 km",
    price: "From Rp 2.4M / half-day",
    valueLine: "Starting at Rp 2.4M with on-site support",
    initials: "MS",
    meta: "Responds same day",
    tags: ["Portrait", "On-site", "Jakarta"],
    chooseSignal: "respondsFast",
    featured: true,
    thumbnailIcon: Camera
  },
  {
    kind: "Job",
    title: "Half-day brand shoot",
    subtitle: "Client needs on-site · 4h",
    location: "Kelapa Gading",
    distance: "~12 km",
    price: "Budget Rp 4.5–7M",
    valueLine: "Budget aligned for half-day shoot",
    initials: "JB",
    meta: "3 bids · open",
    tags: ["Brand shoot", "Half day", "Client brief"],
    chooseSignal: "popularChoice",
    thumbnailIcon: PenSquare
  },
  {
    kind: "Freelancer",
    title: "Rama Wijaya",
    subtitle: "Interview cuts & captions",
    location: "Remote",
    distance: "—",
    price: "From Rp 650k / day",
    valueLine: "Starting at Rp 650k with revision-ready workflow",
    initials: "RW",
    meta: "Top rated in category",
    tags: ["Video edit", "Captions", "Remote"],
    chooseSignal: "topRatedLocal",
    featured: true,
    thumbnailIcon: Clapperboard
  }
];

function ListingAvatar({ initials, kind }: { initials: string; kind: PreviewRow["kind"] }) {
  const ring = kind === "Job" ? "ring-amber-200/80" : "ring-[#3525cd]/25";
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold tracking-tight text-slate-800 ring-2 ${ring}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function ListingThumb({ icon: Icon, kind }: { icon: LucideIcon; kind: PreviewRow["kind"] }) {
  const tone = kind === "Job" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-100 text-slate-800";
  return (
    <span className={`flex h-14 w-20 shrink-0 items-center justify-center rounded-md border ${tone}`} aria-hidden>
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function LandingProductPreview({ t }: { t: Translator }) {
  const getActivityBadge = (row: PreviewRow) =>
    row.kind === "Job" ? t("landing.preview.signal.new") : t("landing.preview.signal.activeNow");

  const getUpdateText = (row: PreviewRow) =>
    row.meta.toLowerCase().includes("bids") ? row.meta : t("landing.preview.signal.recentlyUpdated");

  const getChooseSignal = (row: PreviewRow) => {
    if (row.chooseSignal === "respondsFast") return t("landing.preview.why.respondsFast");
    if (row.chooseSignal === "popularChoice") return t("landing.preview.why.popularChoice");
    if (row.chooseSignal === "recentlyHired") return t("landing.preview.why.recentlyHired");
    return t("landing.preview.why.topRatedLocal");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12">
      <div className="flex flex-col gap-2 border-b-2 border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nw-section-title">{t("landing.preview.kicker")}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{t("landing.preview.title")}</h2>
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("landing.preview.disclaimer")}</p>
      </div>

      <ul className="mt-6 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
        {examples.map((row, i) => (
          <li
            key={row.title}
            className={`border-b border-slate-200/90 last:border-b-0 ${
              row.featured ? "bg-slate-50/95" : i % 2 === 1 ? "bg-slate-50/70" : "bg-white"
            }`}
          >
            <div
              className={`flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:py-5 ${
                row.featured ? "border-l-2 border-l-[#3525cd]/35" : ""
              }`}
            >
              <div className="flex shrink-0 items-start gap-4">
                <ListingThumb icon={row.thumbnailIcon} kind={row.kind} />
                <ListingAvatar initials={row.initials} kind={row.kind} />
                <div className="min-w-0 sm:hidden">
                  <span
                    className={
                      row.kind === "Job"
                        ? "inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
                        : "inline-block rounded border border-[#3525cd]/30 bg-[#3525cd]/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]"
                    }
                  >
                    {row.kind}
                  </span>
                  <p className="mt-1 text-lg font-bold text-slate-950">{row.title}</p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="hidden items-center gap-2 sm:flex">
                  <span
                    className={
                      row.kind === "Job"
                        ? "rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
                        : "rounded border border-[#3525cd]/30 bg-[#3525cd]/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]"
                    }
                  >
                    {row.kind}
                  </span>
                  <span className="text-lg font-bold tracking-tight text-slate-950">{row.title}</span>
                </div>
                <p className="mt-0.5 text-sm font-bold text-slate-700 sm:mt-1">{row.subtitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-[#3525cd]/25 bg-[#3525cd]/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">
                    {getActivityBadge(row)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">{getUpdateText(row)}</span>
                  {row.featured ? (
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                      {t("landing.preview.featured")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700">{getChooseSignal(row)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {row.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-2.5 border-t border-slate-200/80 pt-3 sm:w-56 sm:border-t-0 sm:pt-0 sm:text-right">
                <span className="inline-flex min-h-[1.5rem] items-center justify-start gap-1.5 text-xs font-bold text-slate-800 sm:justify-end">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                  <span>
                    {row.location}
                    {row.distance !== "—" ? (
                      <span className="font-semibold text-slate-500"> · {row.distance}</span>
                    ) : null}
                  </span>
                </span>
                <span className="min-h-[1.5rem] text-base font-bold tabular-nums text-slate-950">{row.price}</span>
                <span className="text-[11px] font-semibold text-slate-600 sm:pl-4">{row.valueLine}</span>
                <div className="flex gap-2 sm:justify-end">
                  <Link
                    href={row.kind === "Job" ? ("/jobs" as Route) : ("/freelancers" as Route)}
                    className="inline-flex items-center rounded-md border border-[#3525cd]/30 bg-[#3525cd]/[0.06] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#3525cd] transition hover:border-[#3525cd]/60"
                  >
                    {row.kind === "Job" ? t("landing.preview.primaryAction.job") : t("landing.preview.primaryAction.freelancer")}
                  </Link>
                  <Link
                    href={row.kind === "Job" ? ("/jobs" as Route) : ("/freelancers" as Route)}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-400"
                  >
                    {t("landing.preview.secondaryAction")}
                  </Link>
                </div>
                <div className="flex gap-3 text-[11px] font-semibold text-slate-600 sm:justify-end">
                  <Link
                    href={row.kind === "Job" ? ("/jobs" as Route) : ("/freelancers" as Route)}
                    className="hover:text-[#3525cd] hover:underline"
                  >
                    {row.kind === "Job" ? t("landing.preview.openJobLink") : t("landing.preview.viewProfileLink")}
                  </Link>
                  <Link
                    href="/jobs"
                    className="hover:text-[#3525cd] hover:underline"
                  >
                    {t("landing.preview.compareLink")}
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          <span className="text-slate-900">{t("landing.preview.railBids")}</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-900">{t("landing.preview.railProof")}</span>
          <span className="mx-2 font-normal text-slate-300">·</span>
          <span className="text-slate-900">{t("landing.preview.railThread")}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold">
          <Link href={"/freelancers" as Route} className="text-[#3525cd] transition hover:underline">
            {t("landing.preview.ctaFreelancers")}
          </Link>
          <Link href={"/jobs" as Route} className="text-[#3525cd] transition hover:underline">
            {t("landing.preview.ctaJobs")}
          </Link>
        </div>
      </div>
    </section>
  );
}
