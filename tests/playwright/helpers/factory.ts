import { uniqueEmail as uniqueEmailFromSession } from "./session";

/** Shared password for Playwright UI + fixture accounts (override with PLAYWRIGHT_E2E_PASSWORD). */
export const PLAYWRIGHT_E2E_PASSWORD = process.env.PLAYWRIGHT_E2E_PASSWORD ?? "NearWorkE2Epass123!";

export const uniqueEmail = uniqueEmailFromSession;

export function buildTestJobTitle(prefix = "Playwright job"): string {
  return `${prefix} ${Date.now()}`;
}
