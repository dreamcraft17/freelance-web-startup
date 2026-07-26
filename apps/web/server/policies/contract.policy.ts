import { ContractStatus, UserRole } from "@acme/types";
import { EscrowStatus } from "@acme/database";
import type { AuthActor } from "../domain/auth-actor";
import { DomainError, PolicyDeniedError } from "../errors/domain-errors";

/** Statuses from which participants may finalize the contract (centralized lifecycle gate). */
export const CONTRACT_STATUSES_ALLOWED_TO_COMPLETE: readonly ContractStatus[] = [
  ContractStatus.PENDING,
  ContractStatus.ACTIVE,
  ContractStatus.IN_PROGRESS
] as const;

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
  },

  /** Only the economic parties may mark the contract completed (not staff). */
  assertActorMayCompleteContract(
    actor: AuthActor,
    participantClientUserId: string,
    participantFreelancerUserId: string
  ): void {
    const ok =
      actor.userId === participantClientUserId || actor.userId === participantFreelancerUserId;
    if (!ok) {
      throw new PolicyDeniedError("Only the client or freelancer on this contract may mark it completed");
    }
  },

  assertContractCompletable(status: ContractStatus): void {
    if (status === ContractStatus.COMPLETED) {
      throw new DomainError("Contract is already completed", "ALREADY_COMPLETED", 409);
    }
    if (!CONTRACT_STATUSES_ALLOWED_TO_COMPLETE.includes(status)) {
      throw new PolicyDeniedError("Contract cannot be completed in its current status");
    }
  },

  /**
   * Funds still locked in escrow must complete via submit → review → release,
   * not the generic POST /contracts/:id/complete shortcut.
   */
  assertEscrowAllowsDirectComplete(escrowStatus: string | null | undefined): void {
    if (escrowStatus === EscrowStatus.LOCKED || escrowStatus === EscrowStatus.DISPUTED) {
      throw new DomainError(
        "Escrow is locked — submit and approve work (or resolve dispute) before completing",
        "ESCROW_LOCKED_COMPLETE_FORBIDDEN",
        409
      );
    }
  }
} as const;
