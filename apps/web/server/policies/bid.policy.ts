import {
  AccountStatus,
  JobStatus,
  UserRole,
  WorkMode
} from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import type { FreelancerProfileForBid } from "../repositories/freelancer.repository";
import { PolicyDeniedError } from "../errors/domain-errors";

export type JobSnapshotForBid = {
  workMode: WorkMode;
  status: JobStatus;
  bidDeadline: Date | null;
};

/** Authorization and eligibility rules for bidding. No I/O. */
export const BidPolicy = {
  assertActorMayPerformFreelancerWrites(actor: AuthActor): void {
    if (actor.accountStatus !== AccountStatus.ACTIVE) {
      throw new PolicyDeniedError("Account is not allowed to bid");
    }
    if (actor.role !== UserRole.FREELANCER) {
      throw new PolicyDeniedError("Only freelancers can submit bids");
    }
  },

  assertProfileMatchesActor(profile: FreelancerProfileForBid, actor: AuthActor): void {
    if (profile.userRole !== UserRole.FREELANCER) {
      throw new PolicyDeniedError("Invalid freelancer profile");
    }
    if (profile.accountStatus !== AccountStatus.ACTIVE) {
      throw new PolicyDeniedError("Account is not allowed to bid");
    }
  },

  assertFreelancerEligibleForJob(profile: FreelancerProfileForBid, job: JobSnapshotForBid): void {
    if (!profile.isComplete) {
      throw new PolicyDeniedError("Freelancer profile must be completed before bidding");
    }

    if (job.status !== JobStatus.OPEN) {
      throw new PolicyDeniedError("Job is not open for bidding");
    }

    if (job.bidDeadline && job.bidDeadline.getTime() < Date.now()) {
      throw new PolicyDeniedError("Bid deadline has expired");
    }

    if (job.workMode === WorkMode.ONSITE && profile.workMode === WorkMode.REMOTE) {
      throw new PolicyDeniedError("Remote-only freelancer cannot bid on onsite-only job");
    }
  },

  assertNoExistingBidForJob(hasExistingBid: boolean): void {
    if (hasExistingBid) {
      throw new PolicyDeniedError("You have already submitted a bid for this job");
    }
  }
} as const;
