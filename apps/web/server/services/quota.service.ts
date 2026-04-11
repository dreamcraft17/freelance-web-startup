import {
  shouldBypassQuotaEnforcement,
  type PlanKey,
  type ResolvedPlanEntitlements
} from "@acme/config";
import type { AuthActor } from "../domain/auth-actor";
import { QuotaRepository } from "../repositories/quota.repository";
import { FreelancerRepository } from "../repositories/freelancer.repository";
import { BidPolicy } from "../policies/bid.policy";
import { SubscriptionService } from "./subscription.service";
import { QuotaExceededError } from "../errors/domain-errors";

export type FreelancerQuotaUsage = {
  limits: { activeBids: number; activeContracts: number };
  usage: { activeBids: number; activeContracts: number };
  remaining: { activeBids: number | null; activeContracts: number | null };
  planKey: PlanKey;
  /** Plan-derived caps merged with optional DB overrides; same source as enforcement. */
  entitlements: ResolvedPlanEntitlements;
  /** When true, UI should show "no cap" for remaining; counts still reflect real usage. */
  quotasUnlimited: boolean;
};

/**
 * Single entry point for bid/contract quota evaluation. Counting rules live in {@link QuotaRepository}.
 */
export class QuotaService {
  constructor(
    private readonly quotaRepo = new QuotaRepository(),
    private readonly freelancerRepo = new FreelancerRepository(),
    private readonly subscriptionService = new SubscriptionService()
  ) {}

  /**
   * Authenticated freelancer dashboard — authorization in service, not route handlers.
   */
  async getFreelancerQuotaUsage(actor: AuthActor): Promise<FreelancerQuotaUsage> {
    BidPolicy.assertActorMayPerformFreelancerWrites(actor);
    return this.getUsageForFreelancerUser(actor.userId);
  }

  async getUsageForFreelancerUser(userId: string): Promise<FreelancerQuotaUsage> {
    const freelancerProfileId = await this.freelancerRepo.requireProfileIdForUser(userId);
    const { planKey, entitlements } = await this.subscriptionService.resolveEffectivePlanContextForUser(userId);
    const unlimited = shouldBypassQuotaEnforcement();

    const [activeBids, activeContracts] = await Promise.all([
      this.quotaRepo.countActiveBids(freelancerProfileId),
      this.quotaRepo.countActiveAcceptedContracts(userId)
    ]);

    const limits = {
      activeBids: entitlements.maxActiveBids,
      activeContracts: entitlements.maxActiveContracts
    };

    const remaining = unlimited
      ? { activeBids: null as number | null, activeContracts: null as number | null }
      : {
          activeBids: Math.max(0, limits.activeBids - activeBids),
          activeContracts: Math.max(0, limits.activeContracts - activeContracts)
        };

    return {
      planKey,
      entitlements,
      quotasUnlimited: unlimited,
      limits,
      usage: {
        activeBids,
        activeContracts
      },
      remaining
    };
  }

  /**
   * Call from {@link BidService} after policy checks; enforces plan limits only.
   */
  async enforceWithinActiveBidAndContractLimits(params: {
    userId: string;
    freelancerProfileId: string;
  }): Promise<void> {
    if (shouldBypassQuotaEnforcement()) {
      return;
    }
    const { planKey, entitlements } = await this.subscriptionService.resolveEffectivePlanContextForUser(
      params.userId
    );
    await this.assertFreelancerCanTakeNewBid({
      freelancerProfileId: params.freelancerProfileId,
      freelancerUserId: params.userId,
      planKey,
      entitlements
    });
  }

  private async assertFreelancerCanTakeNewBid(input: {
    freelancerProfileId: string;
    freelancerUserId: string;
    planKey: PlanKey;
    entitlements: ResolvedPlanEntitlements;
  }): Promise<void> {
    const [activeBids, activeContracts] = await Promise.all([
      this.quotaRepo.countActiveBids(input.freelancerProfileId),
      this.quotaRepo.countActiveAcceptedContracts(input.freelancerUserId)
    ]);

    if (activeBids >= input.entitlements.maxActiveBids) {
      throw new QuotaExceededError(
        `Active bids quota reached (${input.entitlements.maxActiveBids}) for plan ${input.planKey}`
      );
    }

    if (activeContracts >= input.entitlements.maxActiveContracts) {
      throw new QuotaExceededError(
        `Active contracts quota reached (${input.entitlements.maxActiveContracts}) for plan ${input.planKey}`
      );
    }
  }
}
