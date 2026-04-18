import { submitBidSchema } from "@acme/validators";
import { BidService } from "@/server/services/bid.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  bidPostUserLimiter,
  consumeRateLimitOr429,
  getClientIp,
  sensitiveMutateIpLimiter
} from "@/server/security";

const bidService = new BidService();

/**
 * Submit a proposal. Requires a valid freelancer session cookie (see {@link protectFreelancer}).
 */
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `bidPostIp:${ip}`, 55, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      bidPostUserLimiter,
      `bidPost:${gate.actor.userId}`,
      25,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, submitBidSchema);
    if (!parsed.ok) return parsed.response;
    const data = await bidService.submitBid(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
