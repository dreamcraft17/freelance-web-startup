import { submitBidSchema } from "@acme/validators";
import { BidService } from "@/server/services/bid.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const bidService = new BidService();

/**
 * Submit a proposal. Requires `x-user-id` + freelancer role (see {@link protectFreelancer}).
 */
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectFreelancer(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, submitBidSchema);
    if (!parsed.ok) return parsed.response;
    const data = await bidService.submitBid(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
