import { DEFAULT_LOCALE } from "./constants";
import type { AppLocale } from "./types";
import { isAppLocale } from "./types";

/**
 * Resolve active locale from stored preference and browser languages.
 * First supported match in Accept-Language wins when no cookie.
 */
export function resolveLocale(cookieValue: string | null | undefined, acceptLanguage: string | null | undefined): AppLocale {
  if (isAppLocale(cookieValue)) return cookieValue;

  if (acceptLanguage && acceptLanguage.trim().length > 0) {
    const segments = acceptLanguage.split(",").map((part) => part.trim().split(";")[0]?.toLowerCase() ?? "");
    for (const tag of segments) {
      if (!tag) continue;
      if (tag === "id" || tag.startsWith("id-")) return "id";
      if (tag === "en" || tag.startsWith("en-")) return "en";
    }
  }

  return DEFAULT_LOCALE;
}
