import { CategoryService } from "@/server/services/category.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new CategoryService();

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const params = await context.params;
    const slug = params.slug?.trim();
    if (!slug) {
      return jsonFail("Invalid slug", 400, "INVALID_SLUG");
    }
    const data = await service.getBySlug(slug);
    if (!data) {
      return jsonFail("Category not found", 404, "NOT_FOUND");
    }
    return jsonOk(data);
  });
}
