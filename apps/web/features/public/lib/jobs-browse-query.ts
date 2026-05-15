/** Shared URLSearchParams helper for `/jobs` browse filters (SSR + client filter sheet). */
export function jobsBrowseQueryString(args: {
  keyword: string;
  city: string;
  workMode: string;
  categoryId: string;
  minBudget: string;
  postedWithinDays: string;
  page: number;
}): string {
  const u = new URLSearchParams();
  if (args.keyword.trim()) u.set("keyword", args.keyword.trim());
  if (args.city.trim()) u.set("city", args.city.trim());
  if (args.workMode) u.set("workMode", args.workMode);
  if (args.categoryId.trim()) u.set("categoryId", args.categoryId.trim());
  if (args.minBudget.trim()) u.set("minBudget", args.minBudget.trim());
  if (args.postedWithinDays.trim()) u.set("postedWithinDays", args.postedWithinDays.trim());
  if (args.page > 1) u.set("page", String(args.page));
  const s = u.toString();
  return s ? `?${s}` : "";
}
