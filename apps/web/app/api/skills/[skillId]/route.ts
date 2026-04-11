import { SkillService } from "@/server/services/skill.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new SkillService();

type RouteContext = { params: Promise<{ skillId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const params = await context.params;
    const skillId = params.skillId?.trim();
    if (!skillId) {
      return jsonFail("Invalid skill id", 400, "INVALID_ID");
    }
    const data = await service.getById(skillId);
    if (!data) {
      return jsonFail("Skill not found", 404, "NOT_FOUND");
    }
    return jsonOk(data);
  });
}
