import type { Prisma } from "@acme/database";

/**
 * Hide automation / HTTP E2E / legacy browser-test shaped rows from **public** listings and
 * marketing aggregates on deployed hosts (Vercel preview/staging/production).
 *
 * Local dev (no `VERCEL`): visible by default so `pnpm test:e2e` can assert on created jobs.
 * Force hide locally: `NEARWORK_HIDE_SYNTHETIC_PUBLIC_LISTINGS=1`
 * Force show on Vercel: `NEARWORK_SHOW_SYNTHETIC_PUBLIC_LISTINGS=1` (debug only)
 */
export function publicSyntheticListingsHidden(): boolean {
  if (process.env.NEARWORK_SHOW_SYNTHETIC_PUBLIC_LISTINGS === "1") return false;
  if (process.env.NEARWORK_HIDE_SYNTHETIC_PUBLIC_LISTINGS === "1") return true;
  return process.env.VERCEL === "1";
}

/** Substrings matched against job titles (canonical + localized) — keep aligned with `scripts/e2e-marketplace-flow.mjs`. */
const SYNTHETIC_JOB_TITLE_MARKERS = [
  "playwright",
  "e2e integration",
  "e2e pre-hire",
  "e2e smoke",
  "marketplace flow job"
] as const;

export function excludeSyntheticPublicJobsWhere(): Prisma.JobWhereInput | null {
  if (!publicSyntheticListingsHidden()) return null;
  const titleFields = ["title", "titleEn", "titleId"] as const;
  const or: Prisma.JobWhereInput[] = [];
  for (const field of titleFields) {
    for (const m of SYNTHETIC_JOB_TITLE_MARKERS) {
      or.push({ [field]: { contains: m, mode: "insensitive" } });
    }
  }
  return { NOT: { OR: or } };
}

export function excludeSyntheticPublicFreelancersWhere(): Prisma.FreelancerProfileWhereInput | null {
  if (!publicSyntheticListingsHidden()) return null;
  return {
    NOT: {
      OR: [
        { username: { startsWith: "pw_", mode: "insensitive" } },
        { username: { startsWith: "e2e_", mode: "insensitive" } },
        { fullName: { contains: "Playwright", mode: "insensitive" } },
        { headline: { contains: "Playwright", mode: "insensitive" } }
      ]
    }
  };
}

export function mergeJobWhere(
  base: Prisma.JobWhereInput,
  extra: Prisma.JobWhereInput | null | undefined
): Prisma.JobWhereInput {
  if (!extra || Object.keys(extra).length === 0) return base;
  return { AND: [base, extra] };
}

export function mergeFreelancerWhere(
  base: Prisma.FreelancerProfileWhereInput,
  extra: Prisma.FreelancerProfileWhereInput | null | undefined
): Prisma.FreelancerProfileWhereInput {
  if (!extra || Object.keys(extra).length === 0) return base;
  return { AND: [base, extra] };
}
