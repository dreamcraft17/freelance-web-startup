import { reviewAppealSchema } from "@acme/validators";
import { SuspensionAppealService } from "@/server/services/v2-commerce.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectStaff } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new SuspensionAppealService();

type RouteContext = { params: Promise<{ appealId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, reviewAppealSchema);
    if (!parsed.ok) return parsed.response;

    const { appealId } = await context.params;
    const data = await service.reviewAppeal(appealId, gate.actor.userId, parsed.data);
    return jsonOk(data);
  });
}
