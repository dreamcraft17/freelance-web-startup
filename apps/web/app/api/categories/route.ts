import { categoryListQuerySchema } from "@acme/validators";
import { CategoryService } from "@/server/services/category.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new CategoryService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const parsed = parseSearchParams(url, categoryListQuerySchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.list(parsed.data);
    return jsonOk(data);
  });
}
