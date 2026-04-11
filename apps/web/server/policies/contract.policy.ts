import { UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

/** Who may read or transition a contract. No I/O. */
export const ContractPolicy = {
  assertActorMayAccessContract(
    actor: AuthActor,
    participantClientUserId: string,
    participantFreelancerUserId: string
  ): void {
    const isParticipant =
      actor.userId === participantClientUserId || actor.userId === participantFreelancerUserId;
    const isPrivilegedStaff =
      actor.role === UserRole.ADMIN ||
      actor.role === UserRole.MODERATOR ||
      actor.role === UserRole.SUPPORT_ADMIN;

    if (!isParticipant && !isPrivilegedStaff) {
      throw new PolicyDeniedError("You cannot access this contract");
    }
  }
} as const;
