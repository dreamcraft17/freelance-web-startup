import type { CreateVerificationRequestDto, StaffReviewVerificationDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { VerificationPolicy } from "../policies/verification.policy";

/**
 * Verification intake and staff decisions — Prisma persistence TODO.
 */
export class VerificationService {
  async listOwnRequests(actor: AuthActor) {
    VerificationPolicy.assertActorMaySubmitVerificationRequest(actor);
    return { items: [] as const, userId: actor.userId };
  }

  async createVerificationRequest(actor: AuthActor, input: CreateVerificationRequestDto) {
    VerificationPolicy.assertActorMaySubmitVerificationRequest(actor);
    // TODO: enforce actor.userId is subject unless staff proxy
    return { userId: actor.userId, ...input, status: "PENDING" as const };
  }

  async getRequestForActor(actor: AuthActor, requestId: string) {
    // TODO: load row; allow owner or staff
    VerificationPolicy.assertActorMaySubmitVerificationRequest(actor);
    return { id: requestId, userId: actor.userId };
  }

  async reviewVerificationRequest(
    actor: AuthActor,
    requestId: string,
    input: StaffReviewVerificationDto
  ) {
    VerificationPolicy.assertActorMayReviewVerificationRequest(actor);
    // TODO: persist review + update user/profile verification flags
    return { reviewerUserId: actor.userId, requestId, ...input };
  }
}
