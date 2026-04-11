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
import { db, PaymentIntentKind } from "@acme/database";
import { DomainError, NotFoundError } from "@/server/errors/domain-errors";
import { PaymentService } from "@/server/services/payment.service";

export { MONETIZATION_PRICING_PLACEHOLDER } from "@acme/config";

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
  constructor(private readonly payments = new PaymentService()) {}

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
   * One DB read for plan tier + merged entitlements (keeps {@link QuotaService} consistent and efficient).
   */
  async resolveEffectivePlanContextForUser(userId: string): Promise<{
    planKey: PlanKey;
    entitlements: ResolvedPlanEntitlements;
  }> {
    const row = await this.findQualifyingSubscription(userId);
    if (!row?.plan?.code) {
      return {
        planKey: PLAN_KEYS.FREE,
        entitlements: resolvePlanEntitlements(PLAN_KEYS.FREE)
      };
    }
    const planKey = planCodeToPlanKey(row.plan.code);
    return {
      planKey,
      entitlements: resolvePlanEntitlements(planKey, row.plan.entitlements)
    };
  }

  /**
   * Resolves the user's quota tier from their current {@link UserSubscription} and joined {@link SubscriptionPlan}.
   * When there is no qualifying row, returns {@link PLAN_KEYS.FREE}.
   */
  async resolveEffectivePlanKeyForUser(userId: string): Promise<PlanKey> {
    return (await this.resolveEffectivePlanContextForUser(userId)).planKey;
  }

  /**
   * Effective entitlements for quota and future monetization UI: static plan defaults merged with
   * {@link SubscriptionPlan.entitlements} JSON when present.
   */
  async resolveEffectiveEntitlementsForUser(userId: string): Promise<ResolvedPlanEntitlements> {
    return (await this.resolveEffectivePlanContextForUser(userId)).entitlements;
  }

  /**
   * Creates a **PENDING** {@link PaymentIntent} (MOCK provider) and returns `checkoutUrl` to the mock checkout page.
   */
  async initiateSubscriptionCheckout(userId: string, input: CreateSubscriptionDto) {
    const normalizedCode = input.planCode.trim().toUpperCase();
    const plan = await db.subscriptionPlan.findFirst({
      where: { code: normalizedCode, isActive: true },
      select: { id: true, code: true, billingCycle: true, priceCents: true, currency: true }
    });
    if (!plan) {
      throw new NotFoundError("Subscription plan not found");
    }
    if (plan.billingCycle !== input.billingCycle) {
      throw new DomainError(
        "Selected billing cycle does not match this plan",
        "BILLING_CYCLE_MISMATCH",
        400
      );
    }

    const session = await this.payments.createPendingCheckoutSession({
      userId,
      kind: PaymentIntentKind.SUBSCRIPTION_PLAN,
      amountCents: plan.priceCents,
      currency: plan.currency,
      metadata: {
        planId: plan.id,
        planCode: plan.code,
        billingCycle: input.billingCycle
      }
    });

    return {
      userId,
      planCode: plan.code,
      billingCycle: input.billingCycle,
      paymentIntentId: session.paymentIntentId,
      checkoutUrl: session.checkoutUrl,
      provider: session.provider,
      amountCents: session.amountCents,
      currency: session.currency,
      status: session.status
    };
  }

  async getActiveSubscriptionSummary(userId: string) {
    const { planKey, entitlements } = await this.resolveEffectivePlanContextForUser(userId);

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
