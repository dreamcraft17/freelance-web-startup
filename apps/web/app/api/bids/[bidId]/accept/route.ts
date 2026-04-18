import { BidService } from "@/server/services/bid.service";
import { protectClient } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const bidService = new BidService();

type RouteContext = { params: Promise<{ bidId: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const params = await context.params;
    const bidId = params.bidId?.trim();
    if (!bidId) return jsonFail("Invalid bid id", 400, "INVALID_ID");
    const data = await bidService.acceptBid(gate.actor, bidId);
    return jsonOk(data, 201);
  });
}
