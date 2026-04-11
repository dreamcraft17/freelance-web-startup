import { searchJobsSchema } from "@acme/validators";
import { SearchService } from "@/server/services/search.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const searchService = new SearchService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const parsed = parseSearchParams(url, searchJobsSchema);
    if (!parsed.ok) return parsed.response;
    const data = await searchService.searchJobs(parsed.data);
    return jsonOk(data);
  });
}
