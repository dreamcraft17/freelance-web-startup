import type { Metadata } from "next";
import { APP_LOCALES, type AppLocale, isAppLocale } from "./types";

const DEFAULT_SITE_URL = "https://nearwork.com";

function getSiteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_SITE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function normalizeLocale(input: string): AppLocale | null {
  return isAppLocale(input) ? input : null;
}

export function allLocales(): AppLocale[] {
  return [...APP_LOCALES];
}

function withLocalePath(locale: AppLocale, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `/${locale}${clean}`;
}

function absolute(urlPath: string): string {
  return `${getSiteUrl()}${urlPath}`;
}

export function buildLocaleAlternates(path: string): {
  canonicalEn: string;
  canonicalId: string;
  xDefault: string;
  languages: Record<string, string>;
} {
  const canonicalEn = absolute(withLocalePath("en", path));
  const canonicalId = absolute(withLocalePath("id", path));
  const xDefault = absolute("/");
  return {
    canonicalEn,
    canonicalId,
    xDefault,
    languages: {
      en: canonicalEn,
      id: canonicalId,
      "x-default": xDefault
    }
  };
}

export function localizedMetadata(params: {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const alt = buildLocaleAlternates(params.path);
  const canonical = params.locale === "id" ? alt.canonicalId : alt.canonicalEn;
  return {
    title: params.title,
    description: params.description,
    alternates: {
      canonical,
      languages: alt.languages
    },
    openGraph: {
      title: params.title,
      description: params.description,
      url: canonical,
      locale: params.locale
    },
    twitter: {
      title: params.title,
      description: params.description
    }
  };
}
