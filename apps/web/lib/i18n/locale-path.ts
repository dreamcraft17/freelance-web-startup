import type { AppLocale } from "./types";
import { withWorkspaceLocale } from "./workspace-path";

/**
 * Public SEO roots that middleware redirects from unprefixed URLs.
 * Keep aligned with `SEO_PREFIX_PATH` in `middleware.ts`.
 */
export const PUBLIC_LOCALE_ROOTS = [
  "jobs",
  "freelancers",
  "how-it-works",
  "pricing",
  "early-access",
  "help"
] as const;

const ROOT_SET = new Set<string>(PUBLIC_LOCALE_ROOTS);

function firstPathSegment(pathOnly: string): string | null {
  const trimmed = pathOnly.startsWith("/") ? pathOnly.slice(1) : pathOnly;
  if (!trimmed) return null;
  return trimmed.split("/")[0]?.toLowerCase() ?? null;
}

/**
 * Prefix locale for marketplace/marketing paths: `/jobs` → `/en/jobs`.
 * Leaves `/en/...`, `/id/...`, `/login`, `/api/...`, workspace roots (handled elsewhere), etc. unchanged.
 */
export function withPublicLocale(locale: AppLocale, href: string): string {
  const qIdx = href.indexOf("?");
  const pathOnly = qIdx === -1 ? href : href.slice(0, qIdx);
  const query = qIdx === -1 ? "" : href.slice(qIdx);

  if (/^\/(en|id)(\/|$)/i.test(pathOnly)) {
    return href;
  }

  const seg = firstPathSegment(pathOnly);
  if (!seg || !ROOT_SET.has(seg)) {
    return href;
  }

  const normalized = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return `/${locale}${normalized}${query}`;
}

/** Prefer workspace prefixing, then public SEO prefixing. */
export function withActiveLocaleHref(locale: AppLocale, href: string): string {
  const workspace = withWorkspaceLocale(locale, href);
  if (workspace !== href) return workspace;
  return withPublicLocale(locale, href);
}

/** @deprecated Prefer `withPublicLocale` — alias requested by routing docs */
export const withLocale = withPublicLocale;
