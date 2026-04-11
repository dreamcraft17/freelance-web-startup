import type { CreateSubscriptionDto } from "@acme/validators";
import { PLAN_KEYS, type PlanKey } from "@acme/config";
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
  /**
   * Resolves the user's quota tier from their current {@link UserSubscription} and joined {@link SubscriptionPlan}.
   * When there is no qualifying row, returns {@link PLAN_KEYS.FREE}.
   */
  async resolveEffectivePlanKeyForUser(userId: string): Promise<PlanKey> {
    const now = new Date();

    const row = await db.userSubscription.findFirst({
      where: {
        userId,
        status: { in: SUBSCRIPTION_STATUSES_WITH_ACCESS },
        currentPeriodEnd: { gte: now }
      },
      orderBy: { currentPeriodEnd: "desc" },
      include: { plan: true }
    });

    if (!row?.plan?.code) {
      return PLAN_KEYS.FREE;
    }

    return planCodeToPlanKey(row.plan.code);
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
    const planKey = await this.resolveEffectivePlanKeyForUser(userId);
    return { userId, planKey };
  }
}
