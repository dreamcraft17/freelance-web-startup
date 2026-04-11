import type { PlanEntitlements } from "@acme/types";

import { PLAN_ENTITLEMENTS, type PlanKey } from "./plans";

function readBoolEnv(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

/**
 * Central toggles for early access vs paid launch. Override via env in deployment without code edits.
 *
 * - `FEATURE_PAID_ENABLED` → isPaidFeatureEnabled
 * - `FEATURE_FREE_UNLIMITED_QUOTAS` → allowFreeUnlimitedAccess
 * - `FEATURE_ENABLE_PAID_PLANS` → enablePaidPlans
 * - `FEATURE_ENABLE_PROFILE_BOOST` → enableProfileBoost
 * - `FEATURE_ENABLE_FEATURED_JOBS` → enableFeaturedJobs
 * - `FEATURE_ENABLE_PREMIUM_RANKING` → enablePremiumRanking
 */
export const monetizationFlags = {
  isPaidFeatureEnabled: readBoolEnv("FEATURE_PAID_ENABLED", false),
  allowFreeUnlimitedAccess: readBoolEnv("FEATURE_FREE_UNLIMITED_QUOTAS", true),
  enablePaidPlans: readBoolEnv("FEATURE_ENABLE_PAID_PLANS", false),
  enableProfileBoost: readBoolEnv("FEATURE_ENABLE_PROFILE_BOOST", false),
  enableFeaturedJobs: readBoolEnv("FEATURE_ENABLE_FEATURED_JOBS", false),
  enablePremiumRanking: readBoolEnv("FEATURE_ENABLE_PREMIUM_RANKING", false)
} as const;

export type MonetizationFlags = typeof monetizationFlags;

/** When true, bid/contract caps are not enforced (early access). Flip off to restore plan limits. */
export function shouldBypassQuotaEnforcement(flags: MonetizationFlags = monetizationFlags): boolean {
  return flags.allowFreeUnlimitedAccess && !flags.isPaidFeatureEnabled;
}

/** Public subset safe for API / client hints (no secrets). */
export function getPublicMonetizationFlags(flags: MonetizationFlags = monetizationFlags) {
  return { ...flags };
}

export type ResolvedPlanEntitlements = PlanEntitlements & {
  maxActiveContracts: number;
  canBoostProfile: boolean;
  canAccessAnalytics: boolean;
  isFeatured: boolean;
  /** Search / listing priority when {@link monetizationFlags.enablePremiumRanking} is on (prepare only). */
  hasPriorityRanking: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merges optional JSON from {@link SubscriptionPlan.entitlements} onto the static defaults for the plan key.
 */
export function mergePlanEntitlementPatch(
  planKey: PlanKey,
  patch: unknown
): PlanEntitlements {
  const base = PLAN_ENTITLEMENTS[planKey];
  if (!isRecord(patch)) {
    return { ...base };
  }

  const next: PlanEntitlements = { ...base };

  if (typeof patch.maxActiveBids === "number" && Number.isFinite(patch.maxActiveBids)) {
    next.maxActiveBids = Math.max(0, Math.floor(patch.maxActiveBids));
  }
  if (
    typeof patch.maxActiveAcceptedContracts === "number" &&
    Number.isFinite(patch.maxActiveAcceptedContracts)
  ) {
    next.maxActiveAcceptedContracts = Math.max(0, Math.floor(patch.maxActiveAcceptedContracts));
  }
  if (patch.analyticsTier === "LIMITED" || patch.analyticsTier === "ADVANCED" || patch.analyticsTier === "AGENCY") {
    next.analyticsTier = patch.analyticsTier;
  }
  if (typeof patch.hasBoost === "boolean") {
    next.hasBoost = patch.hasBoost;
  }
  if (typeof patch.hasPremiumBadge === "boolean") {
    next.hasPremiumBadge = patch.hasPremiumBadge;
  }

  return next;
}

export function resolvePlanEntitlements(
  planKey: PlanKey,
  patch?: unknown
): ResolvedPlanEntitlements {
  const merged = mergePlanEntitlementPatch(planKey, patch);
  return {
    ...merged,
    maxActiveContracts: merged.maxActiveAcceptedContracts,
    canBoostProfile: merged.hasBoost,
    canAccessAnalytics: merged.analyticsTier !== "LIMITED",
    isFeatured: merged.hasPremiumBadge,
    hasPriorityRanking: merged.hasPremiumBadge
  };
}
