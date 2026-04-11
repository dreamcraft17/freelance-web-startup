import { ContractStatus, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

/** Review creation rules (expand when linking contract participants). No I/O. */
export const ReviewPolicy = {
  assertActorMayWriteReview(actor: AuthActor): void {
    if (actor.role !== UserRole.CLIENT && actor.role !== UserRole.FREELANCER) {
      throw new PolicyDeniedError("Only clients and freelancers may submit reviews");
    }
  },

  assertContractEligibleForReview(contractStatus: ContractStatus): void {
    if (contractStatus !== ContractStatus.COMPLETED) {
      throw new PolicyDeniedError("Reviews are only allowed for completed contracts");
    }
  }
} as const;
