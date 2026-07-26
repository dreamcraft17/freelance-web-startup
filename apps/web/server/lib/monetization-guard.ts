import { getPublicMonetizationFlags } from "@acme/config";
import type { BoostTargetType } from "@acme/database";
import { DomainError } from "@/server/errors/domain-errors";

function assertPaidFeaturesMasterSwitch(): void {
  const flags = getPublicMonetizationFlags();
  if (!flags.isPaidFeatureEnabled) {
    throw new DomainError("Paid features are not enabled", "FEATURE_DISABLED", 403);
  }
}

/** Subscription checkout / upgrade requires paid plans to be toggled on. */
export function assertPaidPlansRouteEnabled(): void {
  assertPaidFeaturesMasterSwitch();
  const flags = getPublicMonetizationFlags();
  if (!flags.enablePaidPlans) {
    throw new DomainError("Subscription plans are not enabled", "FEATURE_DISABLED", 403);
  }
}

/** Boost purchase requires the matching FEATURE_ENABLE_* flag for the target type. */
export function assertBoostRouteEnabled(targetType: BoostTargetType): void {
  assertPaidFeaturesMasterSwitch();
  const flags = getPublicMonetizationFlags();
  if (targetType === "JOB" && !flags.enableFeaturedJobs) {
    throw new DomainError("Job boosts are not enabled", "FEATURE_DISABLED", 403);
  }
  if (targetType === "PROFILE" && !flags.enableProfileBoost) {
    throw new DomainError("Profile boosts are not enabled", "FEATURE_DISABLED", 403);
  }
}
