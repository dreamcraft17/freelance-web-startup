import { DEFAULT_LOCALE } from "./constants";
import type { AppLocale } from "./types";
import { isAppLocale } from "./types";

/**
 * Resolve active locale from stored preference and browser languages.
 * Priority:
 * 1) stored preference (cookie)
 * 2) browser primary language token (Accept-Language first entry)
 * 3) default fallback
 */
export function resolveLocale(cookieValue: string | null | undefined, acceptLanguage: string | null | undefined): AppLocale {
  if (isAppLocale(cookieValue)) return cookieValue;

  if (acceptLanguage && acceptLanguage.trim().length > 0) {
    const primary = acceptLanguage.split(",")[0]?.trim().split(";")[0]?.toLowerCase() ?? "";
    if (primary === "id" || primary.startsWith("id-")) return "id";
    if (primary === "en" || primary.startsWith("en-")) return "en";
  }

  return DEFAULT_LOCALE;
}
