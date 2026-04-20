import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE } from "./constants";
import { resolveLocale } from "./resolve-locale";
import type { AppLocale } from "./types";

export async function getAppLocale(): Promise<AppLocale> {
  const h = await headers();
  const localeFromRoute = h.get("x-nearwork-locale");
  if (localeFromRoute === "en" || localeFromRoute === "id") {
    return localeFromRoute;
  }

  const cookieVal = (await cookies()).get(LOCALE_COOKIE)?.value;
  const accept = h.get("accept-language");
  return resolveLocale(cookieVal, accept);
}
