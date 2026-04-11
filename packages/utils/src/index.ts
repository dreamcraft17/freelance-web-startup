/**
 * Shared, framework-agnostic helpers. Keep side-effect free.
 */

export type PaginationParams = {
  page: number;
  limit: number;
};

export function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}

export function clampLimit(limit: number, max = 100): number {
  return Math.min(max, Math.max(1, Math.floor(limit)));
}

export function offsetFromPage(params: PaginationParams): number {
  return (clampPage(params.page) - 1) * clampLimit(params.limit);
}
