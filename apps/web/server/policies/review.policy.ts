import { ContractStatus, ReviewTargetType, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

export type ContractParticipants = {
  clientUserId: string;
  freelancerUserId: string;
  status: ContractStatus;
};

/** Review creation rules. No I/O. */
export const ReviewPolicy = {
  assertActorMayWriteReview(actor: AuthActor): void {
    if (actor.role !== UserRole.CLIENT && actor.role !== UserRole.FREELANCER && actor.role !== UserRole.ADMIN) {
      throw new PolicyDeniedError("Only clients and freelancers may submit reviews");
    }
  },

  assertContractEligibleForReview(contract: ContractParticipants): void {
    if (contract.status !== ContractStatus.COMPLETED) {
      throw new PolicyDeniedError("Reviews are only allowed for completed contracts");
    }
  },

  assertActorIsContractParticipant(actorUserId: string, contract: ContractParticipants): void {
    if (actorUserId !== contract.clientUserId && actorUserId !== contract.freelancerUserId) {
      throw new PolicyDeniedError("Only contract participants can leave a review");
    }
  },

  /** Client reviews the freelancer; freelancer reviews the client. */
  assertTargetTypeMatchesParticipant(actorUserId: string, contract: ContractParticipants, targetType: string): void {
    if (targetType === ReviewTargetType.FREELANCER) {
      if (actorUserId !== contract.clientUserId) {
        throw new PolicyDeniedError("Only the client on this contract may review the freelancer");
      }
    } else if (targetType === ReviewTargetType.CLIENT) {
      if (actorUserId !== contract.freelancerUserId) {
        throw new PolicyDeniedError("Only the freelancer on this contract may review the client");
      }
    }
  }
} as const;
