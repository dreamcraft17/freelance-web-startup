import { createAppealSchema } from "@acme/validators";
import { SuspensionAppealService } from "@/server/services/v2-commerce.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser, protectStaff } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new SuspensionAppealService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createAppealSchema);
    if (!parsed.ok) return parsed.response;

    const data = await service.submitAppeal(gate.actor.userId, parsed.data);
    return jsonOk(data, 201);
  });
}

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const data = await service.listAppealsForAdmin(status as never);
    return jsonOk({ appeals: data });
  });
}
