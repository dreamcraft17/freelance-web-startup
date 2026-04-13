import type { DashboardNavItem } from "../nav-types";

type ParsedNavItem = {
  item: DashboardNavItem;
  path: string;
  hrefHash: string | null;
};

function parseNavItem(item: DashboardNavItem): ParsedNavItem {
  const hashIdx = item.href.indexOf("#");
  if (hashIdx === -1) {
    return { item, path: item.href, hrefHash: null };
  }
  return {
    item,
    path: item.href.slice(0, hashIdx),
    hrefHash: item.href.slice(hashIdx + 1)
  };
}

/**
 * Picks which nav `href` should show as active for the current path + hash.
 * Handles hash links (e.g. /settings#saved-jobs) and longest-prefix routes (e.g. /client/jobs/new).
 */
export function getActiveNavHref(pathname: string, hash: string, items: DashboardNavItem[]): string | null {
  const fragment = hash.replace(/^#/, "");
  const parsed = items.map(parseNavItem);

  const samePath = parsed.filter((p) => p.path === pathname);
  const hashHit = samePath.find((p) => p.hrefHash !== null && p.hrefHash === fragment);
  if (hashHit) return hashHit.item.href;

  const plainHit = samePath.find((p) => p.hrefHash === null);
  if (plainHit) return plainHit.item.href;

  const noHash = parsed.filter((p) => p.hrefHash === null);
  noHash.sort((a, b) => b.path.length - a.path.length);
  for (const p of noHash) {
    if (pathname === p.path || pathname.startsWith(`${p.path}/`)) {
      const longer = noHash.find(
        (q) =>
          q.path.length > p.path.length &&
          (pathname === q.path || pathname.startsWith(`${q.path}/`))
      );
      if (!longer) return p.item.href;
    }
  }
  return null;
}
