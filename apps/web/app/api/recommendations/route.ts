import { RecommendationService } from "@/server/services/recommendation.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new RecommendationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await service.listForFreelancer(gate.actor.userId, 5);
    return jsonOk({ recommendations: data });
  });
}
