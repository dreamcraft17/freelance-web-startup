import { cookies, headers } from "next/headers";
import { readLocaleHeader } from "@/lib/env-flags";
import { LOCALE_COOKIE } from "./constants";
import { resolveLocale } from "./resolve-locale";
import type { AppLocale } from "./types";

export async function getAppLocale(): Promise<AppLocale> {
  const h = await headers();
  const localeFromRoute = readLocaleHeader(h);
  if (localeFromRoute === "en" || localeFromRoute === "id") {
    return localeFromRoute;
  }

  const cookieVal = (await cookies()).get(LOCALE_COOKIE)?.value;
  return resolveLocale(cookieVal, null);
}
