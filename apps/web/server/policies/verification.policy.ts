import { UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { PolicyDeniedError } from "../errors/domain-errors";

const REVIEW_ROLES: ReadonlyArray<UserRole> = [
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.SUPPORT_ADMIN
];

/** Verification request submission vs staff review. No I/O. */
export const VerificationPolicy = {
  assertActorMaySubmitVerificationRequest(actor: AuthActor): void {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR) {
      return;
    }
    // Any authenticated user with a normal account may request verification for themselves (service enforces userId match).
    if (!actor.userId) {
      throw new PolicyDeniedError("Authentication required");
    }
  },

  assertActorMayReviewVerificationRequest(actor: AuthActor): void {
    if (!REVIEW_ROLES.includes(actor.role)) {
      throw new PolicyDeniedError("Only staff can review verification requests");
    }
  }
} as const;
