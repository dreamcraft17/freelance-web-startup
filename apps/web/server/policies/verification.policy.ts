import { UserRole, VerificationStatus } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

const STAFF_REVIEW_ROLES: ReadonlyArray<UserRole> = [
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.SUPPORT_ADMIN
];

function isStaff(actor: AuthActor): boolean {
  return STAFF_REVIEW_ROLES.includes(actor.role);
}

/** Verification: freelancer self-service vs staff review. No I/O. */
export const VerificationPolicy = {
  /** Submit + list own: freelancer role only (not client, not staff acting without freelancer role). */
  assertFreelancerMayUseSelfServiceVerification(actor: AuthActor): void {
    if (actor.role !== UserRole.FREELANCER) {
      throw new PolicyDeniedError("Only freelancer accounts may submit or list their verification requests");
    }
  },

  assertActorMayReviewVerificationRequest(actor: AuthActor): void {
    if (!isStaff(actor)) {
      throw new PolicyDeniedError("Only staff can review verification requests");
    }
  },

  /** Read single request: subject user or staff. */
  assertActorMayReadVerificationRequest(actor: AuthActor, subjectUserId: string): void {
    if (actor.userId === subjectUserId) {
      return;
    }
    if (isStaff(actor)) {
      return;
    }
    throw new PolicyDeniedError("You cannot access this verification request");
  },

  assertVerificationRequestIsPending(status: VerificationStatus): void {
    if (status !== VerificationStatus.PENDING) {
      throw new PolicyDeniedError("This verification request has already been reviewed");
    }
  }
} as const;
