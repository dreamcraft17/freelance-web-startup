import { resolveLocale } from "./resolve-locale";
import type { AppLocale } from "./types";

/**
 * When navigating from an unprefixed SEO path (e.g. `/jobs`), infer locale from the last
 * same-origin page if it was under `/en` or `/id` — beats a stale `lang` cookie.
 */
export function localeFromSameOriginReferer(
  referer: string | null,
  secFetchSite: string | null,
  requestOrigin: string
): AppLocale | null {
  if (!referer) return null;
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    return null;
  }
  try {
    const ref = new URL(referer);
    if (ref.origin !== requestOrigin) return null;
    const m = ref.pathname.match(/^\/(en|id)(\/|$)/i);
    const code = m?.[1]?.toLowerCase();
    if (code === "en" || code === "id") return code;
    return null;
  } catch {
    return null;
  }
}

/** Cookie preference, overridden by explicit `/en|id/` referer when same-origin navigation. */
export function resolveNavigationLocale(
  cookieValue: string | null | undefined,
  referer: string | null,
  secFetchSite: string | null,
  requestOrigin: string
): AppLocale {
  const fromRef = localeFromSameOriginReferer(referer, secFetchSite, requestOrigin);
  if (fromRef) return fromRef;
  return resolveLocale(cookieValue, null);
}
