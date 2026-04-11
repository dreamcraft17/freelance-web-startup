import type { CreateSubscriptionDto } from "@acme/validators";
import {
  PLAN_KEYS,
  getPublicMonetizationFlags,
  resolvePlanEntitlements,
  shouldBypassQuotaEnforcement,
  type PlanKey,
  type ResolvedPlanEntitlements
} from "@acme/config";
import { SubscriptionStatus } from "@acme/types";
import { db } from "@acme/database";

const SUBSCRIPTION_STATUSES_WITH_ACCESS: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.PAST_DUE
];

function planCodeToPlanKey(code: string): PlanKey {
  const normalized = code.trim().toUpperCase();
  const known = Object.values(PLAN_KEYS) as PlanKey[];
  if (known.includes(normalized as PlanKey)) {
    return normalized as PlanKey;
  }
  return PLAN_KEYS.FREE;
}

/**
 * Billing provider integration for checkout lives here later. Plan resolution feeds {@link QuotaService}.
 */
export class SubscriptionService {
  private async findQualifyingSubscription(userId: string) {
    const now = new Date();
    return db.userSubscription.findFirst({
      where: {
        userId,
        status: { in: SUBSCRIPTION_STATUSES_WITH_ACCESS },
        currentPeriodEnd: { gte: now }
      },
      orderBy: { currentPeriodEnd: "desc" },
      include: { plan: true }
    });
  }

  /**
   * Resolves the user's quota tier from their current {@link UserSubscription} and joined {@link SubscriptionPlan}.
   * When there is no qualifying row, returns {@link PLAN_KEYS.FREE}.
   */
  async resolveEffectivePlanKeyForUser(userId: string): Promise<PlanKey> {
    const row = await this.findQualifyingSubscription(userId);
    if (!row?.plan?.code) {
      return PLAN_KEYS.FREE;
    }
    return planCodeToPlanKey(row.plan.code);
  }

  /**
   * Effective entitlements for quota and future monetization UI: static plan defaults merged with
   * {@link SubscriptionPlan.entitlements} JSON when present.
   */
  async resolveEffectiveEntitlementsForUser(userId: string): Promise<ResolvedPlanEntitlements> {
    const row = await this.findQualifyingSubscription(userId);
    if (!row?.plan?.code) {
      return resolvePlanEntitlements(PLAN_KEYS.FREE);
    }
    const planKey = planCodeToPlanKey(row.plan.code);
    return resolvePlanEntitlements(planKey, row.plan.entitlements);
  }

  /**
   * TODO: create hosted checkout session with payment provider; return redirect URL.
   */
  async initiateSubscriptionCheckout(userId: string, input: CreateSubscriptionDto) {
    return {
      userId,
      planCode: input.planCode,
      billingCycle: input.billingCycle,
      checkoutUrl: null as string | null
    };
  }

  async getActiveSubscriptionSummary(userId: string) {
    const row = await this.findQualifyingSubscription(userId);
    const planKey = row?.plan?.code ? planCodeToPlanKey(row.plan.code) : PLAN_KEYS.FREE;
    const entitlements = row?.plan?.code
      ? resolvePlanEntitlements(planKey, row.plan.entitlements)
      : resolvePlanEntitlements(PLAN_KEYS.FREE);

    return {
      userId,
      planKey,
      entitlements,
      launch: {
        earlyAccessUnlimitedQuotas: shouldBypassQuotaEnforcement(),
        paidFeaturesEnabled: getPublicMonetizationFlags().isPaidFeatureEnabled
      },
      featureFlags: getPublicMonetizationFlags()
    };
  }
}
