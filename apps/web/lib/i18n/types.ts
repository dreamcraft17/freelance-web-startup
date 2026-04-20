export const APP_LOCALES = ["en", "id"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "en" || value === "id";
}
