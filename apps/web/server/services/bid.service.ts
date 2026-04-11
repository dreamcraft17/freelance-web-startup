import { db } from "@acme/database";
import type { SubmitBidDto } from "@acme/validators";
import { BidStatus, ContractStatus, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { BidRepository } from "../repositories/bid.repository";
import { ClientRepository } from "../repositories/client.repository";
import { FreelancerRepository } from "../repositories/freelancer.repository";
import { JobRepository } from "../repositories/job.repository";
import { BidPolicy } from "../policies/bid.policy";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";
import { QuotaService } from "./quota.service";
import { NotificationService } from "./notification.service";

/**
 * Bid submission workflow: policies first, then centralized quota, then persistence.
 */
export class BidService {
  constructor(
    private readonly bidRepo = new BidRepository(),
    private readonly freelancerRepo = new FreelancerRepository(),
    private readonly jobRepo = new JobRepository(),
    private readonly clientRepo = new ClientRepository(),
    private readonly quotaService = new QuotaService(),
    private readonly notifications = new NotificationService()
  ) {}

  async submitBid(actor: AuthActor, dto: SubmitBidDto) {
    BidPolicy.assertActorMayPerformFreelancerWrites(actor);

    const profile = await this.freelancerRepo.requireProfileByUserId(actor.userId);
    BidPolicy.assertProfileMatchesActor(profile, actor);

    const job = await this.jobRepo.requireOpenJobForBid(dto.jobId);
    BidPolicy.assertFreelancerEligibleForJob(profile, job);

    const hasExisting = await this.bidRepo.hasSubmittedToJob(dto.jobId, profile.id);
    BidPolicy.assertNoExistingBidForJob(hasExisting);

    await this.quotaService.enforceWithinActiveBidAndContractLimits({
      userId: actor.userId,
      freelancerProfileId: profile.id
    });

    const bid = await this.bidRepo.createBid(profile.id, dto);

    const ownerUserId = await this.jobRepo.getOwnerUserId(bid.jobId);
    if (ownerUserId !== actor.userId) {
      const [jobRow, freelancerRow] = await Promise.all([
        db.job.findFirst({ where: { id: bid.jobId }, select: { title: true } }),
        db.freelancerProfile.findFirst({
          where: { id: bid.freelancerId },
          select: { fullName: true, username: true }
        })
      ]);
      const jobTitle = jobRow?.title ?? "Your job";
      const freelancerLabel =
        freelancerRow?.username != null && freelancerRow.username.length > 0
          ? `@${freelancerRow.username}`
          : (freelancerRow?.fullName ?? "A freelancer");

      await this.notifications.notifyNewBid({
        clientUserId: ownerUserId,
        jobId: bid.jobId,
        jobTitle,
        bidId: bid.id,
        freelancerLabel
      });
    }

    return bid;
  }

  /** Client job owner accepts a submitted bid and creates the contract. */
  async acceptBid(actor: AuthActor, bidId: string) {
    if (actor.role !== UserRole.CLIENT && actor.role !== UserRole.ADMIN) {
      throw new PolicyDeniedError("Only clients can accept bids");
    }

    const bid = await this.bidRepo.findBidForAccept(bidId);
    if (!bid) throw new NotFoundError("Bid not found");
    if (bid.status !== BidStatus.SUBMITTED) {
      throw new PolicyDeniedError("Bid cannot be accepted in its current state");
    }
    if (bid.contract) {
      throw new PolicyDeniedError("This bid already has a contract");
    }

    const clientProfileId = await this.clientRepo.requireClientProfileIdForUser(actor.userId);
    if (bid.job.clientProfileId !== clientProfileId) {
      throw new PolicyDeniedError("You do not own this job");
    }

    const contract = await db.$transaction(async (tx) => {
      const c = await tx.contract.create({
        data: {
          bidId: bid.id,
          freelancerUserId: bid.freelancer.userId,
          clientUserId: bid.job.clientProfile.userId,
          amount: bid.bidAmount,
          currency: bid.job.currency,
          status: ContractStatus.PENDING
        },
        select: { id: true }
      });
      await tx.bid.update({
        where: { id: bid.id },
        data: { status: BidStatus.ACCEPTED }
      });
      return c;
    });

    await this.notifications.notifyBidAccepted({
      freelancerUserId: bid.freelancer.userId,
      jobId: bid.job.id,
      jobTitle: bid.job.title,
      bidId: bid.id,
      contractId: contract.id
    });

    return contract;
  }
}
