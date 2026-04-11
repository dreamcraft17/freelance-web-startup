import type { SubmitBidDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { BidRepository } from "../repositories/bid.repository";
import { FreelancerRepository } from "../repositories/freelancer.repository";
import { JobRepository } from "../repositories/job.repository";
import { BidPolicy } from "../policies/bid.policy";
import { QuotaService } from "./quota.service";

/**
 * Bid submission workflow: policies first, then centralized quota, then persistence.
 */
export class BidService {
  constructor(
    private readonly bidRepo = new BidRepository(),
    private readonly freelancerRepo = new FreelancerRepository(),
    private readonly jobRepo = new JobRepository(),
    private readonly quotaService = new QuotaService()
  ) {}

  async submitBid(actor: AuthActor, dto: SubmitBidDto) {
    BidPolicy.assertActorMayPerformFreelancerWrites(actor);

    const profile = await this.freelancerRepo.requireProfileByUserId(actor.userId);
    const job = await this.jobRepo.requireOpenJobForBid(dto.jobId);

    BidPolicy.assertFreelancerEligibleForJob(profile, job);

    const hasExisting = await this.bidRepo.hasSubmittedToJob(dto.jobId, profile.id);
    BidPolicy.assertNoExistingBidForJob(hasExisting);

    await this.quotaService.enforceWithinActiveBidAndContractLimits({
      userId: actor.userId,
      freelancerProfileId: profile.id
    });

    return this.bidRepo.createBid(profile.id, dto);
  }
}
