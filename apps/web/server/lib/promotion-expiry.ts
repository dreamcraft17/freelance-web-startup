/**
 * Pure helpers for “active” featured/boost — must stay aligned with `SearchService` SQL `CASE … featuredUntil / boostedUntil` ranking.
 */

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  return value instanceof Date ? value : new Date(value);
}

/** Featured job counts for ranking/UI only when `featuredUntil` is absent or still in the future. */
export function isJobFeaturedActiveAt(
  now: Date,
  isFeatured: boolean,
  featuredUntil: Date | string | null | undefined
): boolean {
  if (!isFeatured) return false;
  const end = toDate(featuredUntil);
  if (end == null) return true;
  return end > now;
}

/** Boosted freelancer counts for ranking/UI only when `boostedUntil` is absent or still in the future. */
export function isFreelancerBoostActiveAt(
  now: Date,
  isBoosted: boolean,
  boostedUntil: Date | string | null | undefined
): boolean {
  if (!isBoosted) return false;
  const end = toDate(boostedUntil);
  if (end == null) return true;
  return end > now;
}
