import { AccountStatus, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

/** Authorization rules for job lifecycle. No I/O. */
export const JobPolicy = {
  assertActorMayPerformClientWrites(actor: AuthActor): void {
    if (actor.accountStatus !== AccountStatus.ACTIVE) {
      throw new PolicyDeniedError("Account is not allowed to post jobs");
    }
    if (actor.role !== UserRole.CLIENT) {
      throw new PolicyDeniedError("Only clients can create jobs");
    }
  },

  assertClientOwnsJob(actor: AuthActor, jobOwnerUserId: string): void {
    if (actor.userId !== jobOwnerUserId) {
      throw new PolicyDeniedError("Only the job owner can modify this job");
    }
  }
} as const;
