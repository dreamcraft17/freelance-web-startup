import { skillListQuerySchema } from "@acme/validators";
import { SkillService } from "@/server/services/skill.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new SkillService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const parsed = parseSearchParams(url, skillListQuerySchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.list(parsed.data);
    return jsonOk(data);
  });
}
