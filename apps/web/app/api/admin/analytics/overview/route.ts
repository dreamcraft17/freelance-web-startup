import { AnalyticsService } from "@/server/services/v2-commerce.service";
import { protectStaff } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new AnalyticsService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const section = url.searchParams.get("section") ?? "overview";

    if (section === "moderation") {
      return jsonOk(await service.getModerationMetrics());
    }
    return jsonOk(await service.getOverview());
  });
}
