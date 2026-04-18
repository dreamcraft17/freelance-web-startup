import { searchFreelancersSchema } from "@acme/validators";
import { SearchService } from "@/server/services/search.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { consumeRateLimitOr429, getClientIp, publicReadIpLimiter } from "@/server/security";

const searchService = new SearchService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `pub:${ip}`, 100, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const parsed = parseSearchParams(url, searchFreelancersSchema);
    if (!parsed.ok) return parsed.response;
    const data = await searchService.searchFreelancers(parsed.data);
    return jsonOk(data);
  });
}
