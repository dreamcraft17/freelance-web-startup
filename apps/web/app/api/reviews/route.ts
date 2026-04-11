import { createReviewSchema } from "@acme/validators";
import { ReviewService } from "@/server/services/review.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClientOrFreelancer } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const reviewService = new ReviewService();

/** Public list: exactly one of `freelancerProfileId` or `clientProfileId`. */
export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const freelancerProfileId = url.searchParams.get("freelancerProfileId")?.trim();
    const clientProfileId = url.searchParams.get("clientProfileId")?.trim();
    if ((!freelancerProfileId && !clientProfileId) || (freelancerProfileId && clientProfileId)) {
      return jsonFail("Provide exactly one of freelancerProfileId or clientProfileId", 400, "INVALID_QUERY");
    }
    const data = freelancerProfileId
      ? await reviewService.listForFreelancerProfile(freelancerProfileId)
      : await reviewService.listForClientProfile(clientProfileId!);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createReviewSchema);
    if (!parsed.ok) return parsed.response;
    const data = await reviewService.createReview(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
