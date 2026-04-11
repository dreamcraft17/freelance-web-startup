import { PLAN_ENTITLEMENTS, type PlanKey } from "@acme/config";
import type { AuthActor } from "../domain/auth-actor";
import { QuotaRepository } from "../repositories/quota.repository";
import { FreelancerRepository } from "../repositories/freelancer.repository";
import { BidPolicy } from "../policies/bid.policy";
import { SubscriptionService } from "./subscription.service";
import { QuotaExceededError } from "../errors/domain-errors";

export type FreelancerQuotaUsage = {
  limits: { activeBids: number; activeContracts: number };
  usage: { activeBids: number; activeContracts: number };
  planKey: PlanKey;
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
    const planKey = await this.subscriptionService.resolveEffectivePlanKeyForUser(userId);
    const entitlements = PLAN_ENTITLEMENTS[planKey];

    const [activeBids, activeContracts] = await Promise.all([
      this.quotaRepo.countActiveBids(freelancerProfileId),
      this.quotaRepo.countActiveAcceptedContracts(userId)
    ]);

    return {
      planKey,
      limits: {
        activeBids: entitlements.maxActiveBids,
        activeContracts: entitlements.maxActiveAcceptedContracts
      },
      usage: {
        activeBids,
        activeContracts
      }
    };
  }

  /**
   * Call from {@link BidService} after policy checks; enforces plan limits only.
   */
  async enforceWithinActiveBidAndContractLimits(params: {
    userId: string;
    freelancerProfileId: string;
  }): Promise<void> {
    const planKey = await this.subscriptionService.resolveEffectivePlanKeyForUser(params.userId);
    await this.assertFreelancerCanTakeNewBid({
      freelancerProfileId: params.freelancerProfileId,
      freelancerUserId: params.userId,
      planKey
    });
  }

  private async assertFreelancerCanTakeNewBid(input: {
    freelancerProfileId: string;
    freelancerUserId: string;
    planKey: PlanKey;
  }): Promise<void> {
    const entitlements = PLAN_ENTITLEMENTS[input.planKey];

    const [activeBids, activeContracts] = await Promise.all([
      this.quotaRepo.countActiveBids(input.freelancerProfileId),
      this.quotaRepo.countActiveAcceptedContracts(input.freelancerUserId)
    ]);

    if (activeBids >= entitlements.maxActiveBids) {
      throw new QuotaExceededError(
        `Active bids quota reached (${entitlements.maxActiveBids}) for plan ${input.planKey}`
      );
    }

    if (activeContracts >= entitlements.maxActiveAcceptedContracts) {
      throw new QuotaExceededError(
        `Active contracts quota reached (${entitlements.maxActiveAcceptedContracts}) for plan ${input.planKey}`
      );
    }
  }
}
