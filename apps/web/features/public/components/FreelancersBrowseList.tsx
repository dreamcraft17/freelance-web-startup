import Link from "next/link";
import { MapPin, Star } from "lucide-react";

export type PublicFreelancerCard = {
  id: string;
  username: string;
  fullName: string;
  headline: string | null;
  primaryCategoryName: string | null;
  workMode: string;
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  availabilityStatus: string;
  reviewCount: number;
  averageReviewRating: number | null;
  /** Present when directory is sorted by browser location + radius */
  distanceKm?: number | null;
};

function workModeLabel(wm: string): string {
  if (wm === "REMOTE" || wm === "ONSITE" || wm === "HYBRID") {
    return wm.charAt(0) + wm.slice(1).toLowerCase();
  }
  return wm;
}

function locationLabel(f: PublicFreelancerCard): string | null {
  if (f.city && f.country) return `${f.city}, ${f.country}`;
  if (f.city) return f.city;
  if (f.country) return f.country;
  return null;
}

function availabilityLabel(s: string): string {
  return s.replace(/_/g, " ").toLowerCase();
}

function rateLabel(f: PublicFreelancerCard): string {
  if (f.hourlyRate == null || !Number.isFinite(f.hourlyRate)) return "Rate on request";
  try {
    return `${new Intl.NumberFormat(undefined, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(f.hourlyRate)}/hr`;
  } catch {
    return `${f.hourlyRate}/hr`;
  }
}

function specialtyLine(f: PublicFreelancerCard): string | null {
  if (f.primaryCategoryName?.trim()) return f.primaryCategoryName.trim();
  if (f.headline?.trim()) return f.headline.trim();
  return null;
}

function ratingLine(f: PublicFreelancerCard): string | null {
  if (f.reviewCount <= 0 || f.averageReviewRating == null || !Number.isFinite(f.averageReviewRating)) return null;
  const stars = f.averageReviewRating.toFixed(1);
  const n = f.reviewCount === 1 ? "1 review" : `${f.reviewCount} reviews`;
  return `${stars} · ${n}`;
}

type FreelancersBrowseListProps = {
  freelancers: PublicFreelancerCard[];
  /** When set, cards emphasize that listings are being filtered by this city */
  activeCityFilter?: string;
};

export function FreelancersBrowseList({ freelancers, activeCityFilter }: FreelancersBrowseListProps) {
  if (freelancers.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {freelancers.map((f) => {
        const loc = locationLabel(f);
        const spec = specialtyLine(f);
        const showHeadlineBelow = Boolean(f.primaryCategoryName?.trim() && f.headline?.trim());
        const rating = ratingLine(f);
        const showDistance = f.distanceKm != null && Number.isFinite(f.distanceKm);

        return (
          <li key={f.id}>
            <Link
              href={`/freelancers/${encodeURIComponent(f.username)}`}
              className="group flex h-full flex-col border border-slate-200 border-t-[3px] border-t-[#3525cd] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                  {workModeLabel(f.workMode)}
                </span>
                {showDistance ? (
                  <span className="rounded border border-emerald-300/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950">
                    ~{f.distanceKm} km
                  </span>
                ) : null}
                {activeCityFilter?.trim() && loc?.toLowerCase().includes(activeCityFilter.trim().toLowerCase()) ? (
                  <span className="rounded border border-[#3525cd]/35 bg-[#3525cd]/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3525cd]">
                    {activeCityFilter.trim()}
                  </span>
                ) : null}
              </div>

              <p className="text-base font-bold leading-snug text-slate-950 group-hover:text-[#3525cd]">{f.fullName}</p>
              <p className="text-xs font-medium text-slate-500">@{f.username}</p>

              {spec ? (
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-800">{spec}</p>
              ) : (
                <p className="mt-1.5 text-sm font-medium italic text-slate-400">Open profile for details</p>
              )}

              {showHeadlineBelow ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{f.headline}</p>
              ) : null}

              <div className="mt-auto pt-3">
                {loc ? (
                  <p className="flex items-start gap-1.5 text-xs font-semibold text-slate-700">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3525cd]" aria-hidden />
                    <span>{loc}</span>
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400">Location not listed</p>
                )}

                <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-slate-200/80 pt-2.5">
                  <span className="text-sm font-bold text-slate-900">{rateLabel(f)}</span>
                  {rating ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      {rating}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">No reviews yet</span>
                  )}
                </div>

                <p className="mt-2 inline-flex max-w-full rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {availabilityLabel(f.availabilityStatus)}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
