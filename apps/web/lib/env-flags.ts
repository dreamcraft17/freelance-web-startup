/**
 * Read NextWork env vars with legacy NearWork (`NEARWORK_*`) fallbacks.
 * Prefer `NEXTWORK_*` going forward.
 */
export function envFlag(name: string, legacyName?: string): string | undefined {
  const primary = process.env[name]?.trim();
  if (primary) return primary;
  if (legacyName) {
    const legacy = process.env[legacyName]?.trim();
    if (legacy) return legacy;
  }
  return undefined;
}

export function envFlagIsOne(name: string, legacyName?: string): boolean {
  return envFlag(name, legacyName) === "1";
}

export const NEXTWORK_LOCALE_HEADER = "x-nextwork-locale";
/** Accepted during transition if an old edge rewrite still sets it. */
export const LEGACY_NEARWORK_LOCALE_HEADER = "x-nearwork-locale";

export function readLocaleHeader(headers: Headers): string | null {
  return headers.get(NEXTWORK_LOCALE_HEADER) ?? headers.get(LEGACY_NEARWORK_LOCALE_HEADER);
}
