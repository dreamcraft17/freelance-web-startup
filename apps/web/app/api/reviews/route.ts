import { createReviewSchema } from "@acme/validators";
import { ReviewService } from "@/server/services/review.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClientOrFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const reviewService = new ReviewService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createReviewSchema);
    if (!parsed.ok) return parsed.response;
    const data = await reviewService.createReview(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
