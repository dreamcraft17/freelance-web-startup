import type { MonetizationFlags } from "@acme/config";

/**
 * Single source for /admin/feature-flags: env keys match `packages/config/src/monetization.ts`.
 */
export type MonetizationFlagDef = {
  envKey: string;
  property: keyof MonetizationFlags;
  description: string;
};

export const MONETIZATION_FLAG_DEFS: MonetizationFlagDef[] = [
  {
    envKey: "FEATURE_PAID_ENABLED",
    property: "isPaidFeatureEnabled",
    description: "Master gate for paid product behavior (quotas, checkout paths, and related enforcement)."
  },
  {
    envKey: "FEATURE_FREE_UNLIMITED_QUOTAS",
    property: "allowFreeUnlimitedAccess",
    description: "When paid is off, relax bid/contract limits for early access (pairs with quota bypass logic)."
  },
  {
    envKey: "FEATURE_ENABLE_PAID_PLANS",
    property: "enablePaidPlans",
    description: "Expose subscription plan purchase and entitlements in product flows."
  },
  {
    envKey: "FEATURE_ENABLE_PROFILE_BOOST",
    property: "enableProfileBoost",
    description: "Allow freelancer profile boost purchases and ranking effects where implemented."
  },
  {
    envKey: "FEATURE_ENABLE_FEATURED_JOBS",
    property: "enableFeaturedJobs",
    description: "Allow featured job listings and related billing hooks where implemented."
  },
  {
    envKey: "FEATURE_ENABLE_PREMIUM_RANKING",
    property: "enablePremiumRanking",
    description: "Premium / priority ranking in search and listings (prepare-only in some areas)."
  }
];
