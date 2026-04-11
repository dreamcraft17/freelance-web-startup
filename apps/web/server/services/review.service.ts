import type { CreateReviewDto } from "@acme/validators";
import type { AuthActor } from "../domain/auth-actor";
import { ReviewPolicy } from "../policies/review.policy";

/**
 * Review creation after contract completion — persistence and duplicate checks TODO.
 */
export class ReviewService {
  async createReview(actor: AuthActor, input: CreateReviewDto) {
    ReviewPolicy.assertActorMayWriteReview(actor);
    // TODO: load contract, assert participant + ReviewPolicy.assertContractEligibleForReview
    return { authorUserId: actor.userId, ...input };
  }

  async listFreelancerProfileReviews(_freelancerProfileId: string) {
    return { items: [] as const };
  }
}
