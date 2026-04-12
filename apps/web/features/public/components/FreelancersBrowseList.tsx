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
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {freelancers.map((f) => {
        const loc = locationLabel(f);
        const spec = specialtyLine(f);
        const showHeadlineBelow = Boolean(f.primaryCategoryName?.trim() && f.headline?.trim());
        const rating = ratingLine(f);

        return (
          <li key={f.id}>
            <Link
              href={`/freelancers/${encodeURIComponent(f.username)}`}
              className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200/80 hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {workModeLabel(f.workMode)}
                </span>
                {activeCityFilter?.trim() && loc?.toLowerCase().includes(activeCityFilter.trim().toLowerCase()) ? (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-[#3525cd]">
                    Lists {activeCityFilter.trim()}
                  </span>
                ) : null}
              </div>

              <p className="text-base font-semibold leading-snug text-slate-900">{f.fullName}</p>
              <p className="text-sm text-slate-500">@{f.username}</p>

              {spec ? (
                <p className="mt-2 text-sm font-medium text-slate-700 line-clamp-2">{spec}</p>
              ) : (
                <p className="mt-2 text-sm italic text-slate-400">Profile focus on their page</p>
              )}

              {showHeadlineBelow ? (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{f.headline}</p>
              ) : null}

              <div className="mt-auto pt-4">
                {loc ? (
                  <p className="flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden />
                    <span>{loc}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Location not listed</p>
                )}

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-slate-800">{rateLabel(f)}</span>
                  {rating ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      {rating}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No reviews yet</span>
                  )}
                </div>

                <p className="mt-2 text-[11px] capitalize tracking-wide text-slate-400">{availabilityLabel(f.availabilityStatus)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
