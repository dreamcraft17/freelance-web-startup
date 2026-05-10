import type { AppLocale } from "./types";

/** Workspace segments that appear after `/<locale>/…` in the browser URL. */
export const WORKSPACE_URL_SEGMENTS = [
  "client",
  "freelancer",
  "messages",
  "notifications",
  "settings"
] as const;

export type WorkspaceUrlSegment = (typeof WORKSPACE_URL_SEGMENTS)[number];

const WORKSPACE_PATH_RE = new RegExp(
  `^\\/(${WORKSPACE_URL_SEGMENTS.join("|")})(\\/.*)?$`,
  "i"
);

const PREFIXED_WORKSPACE_RE =
  /^\/(en|id)\/(client|freelancer|messages|notifications|settings)(\/.*)?$/i;

/** Browser-facing workspace URL: `/<locale>/client/...` */
export function withWorkspaceLocale(locale: AppLocale, href: string): string {
  const qIdx = href.indexOf("?");
  const pathPart = qIdx === -1 ? href : href.slice(0, qIdx);
  const query = qIdx === -1 ? "" : href.slice(qIdx);
  const match = pathPart.match(WORKSPACE_PATH_RE);
  if (!match) return href;
  return `/${locale}${pathPart}${query}`;
}

/**
 * Strip `/(en|id)` when it prefixes a workspace path so nav matching uses internal roots (`/client`, …).
 */
export function pathnameForWorkspaceNavMatch(pathname: string): string {
  const m = pathname.match(PREFIXED_WORKSPACE_RE);
  if (!m) return pathname;
  return `/${m[2]}${m[3] ?? ""}`;
}

/** `/en/client/foo` → `/client/foo` (path segment only; use before comparing workspace return URLs). */
export function stripLeadingLocaleFromWorkspacePath(pathOnly: string): string {
  const m = pathOnly.match(PREFIXED_WORKSPACE_RE);
  if (!m) return pathOnly;
  return `/${m[2]}${m[3] ?? ""}`;
}

export function matchPrefixedWorkspacePath(pathname: string): {
  locale: AppLocale;
  internalPath: string;
} | null {
  const m = pathname.match(PREFIXED_WORKSPACE_RE);
  if (!m?.[1] || !m[2]) return null;
  const locale = m[1].toLowerCase() as AppLocale;
  const internalPath = `/${m[2]}${m[3] ?? ""}`;
  return { locale, internalPath };
}

export function isUnprefixedWorkspacePath(pathname: string): boolean {
  const pathOnly = pathname.split("?")[0] ?? pathname;
  return WORKSPACE_PATH_RE.test(pathOnly);
}
