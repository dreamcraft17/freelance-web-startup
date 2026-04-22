import { DEFAULT_LOCALE } from "./constants";
import type { AppLocale } from "./types";
import { isAppLocale } from "./types";

/**
 * Resolve active locale from stored preference, with deterministic default.
 * Priority:
 * 1) stored preference (cookie)
 * 2) default fallback
 *
 * Note: Accept-Language is intentionally not used for default routing here.
 */
export function resolveLocale(cookieValue: string | null | undefined, _acceptLanguage: string | null | undefined): AppLocale {
  if (isAppLocale(cookieValue)) return cookieValue;

  return DEFAULT_LOCALE;
}
