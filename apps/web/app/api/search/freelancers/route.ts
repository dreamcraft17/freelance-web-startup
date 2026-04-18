import { searchFreelancersSchema } from "@acme/validators";
import { SearchService } from "@/server/services/search.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { consumePublicDiscoveryLimits, getClientIp } from "@/server/security";

const searchService = new SearchService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const url = new URL(request.url);
    const limited = consumePublicDiscoveryLimits(request, ip, url);
    if (limited) return limited;

    const parsed = parseSearchParams(url, searchFreelancersSchema);
    if (!parsed.ok) return parsed.response;
    const data = await searchService.searchFreelancers(parsed.data);
    return jsonOk(data);
  });
}
