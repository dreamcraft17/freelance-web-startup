import { EscrowService } from "@/server/services/escrow.service";
import { submitWorkSchema, reviewWorkSchema } from "@acme/validators";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new EscrowService();

type RouteContext = { params: Promise<{ contractId: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const { contractId } = await context.params;
    const data = await service.getEscrowStatus(gate.actor, contractId);
    return jsonOk(data);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { contractId } = await context.params;
    const parsed = await parseJson(request, submitWorkSchema);
    if (!parsed.ok) return parsed.response;

    const data = await service.submitWork(gate.actor, contractId, parsed.data.message);
    return jsonOk(data);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { contractId } = await context.params;
    const parsed = await parseJson(request, reviewWorkSchema);
    if (!parsed.ok) return parsed.response;

    const data = await service.reviewWork(
      gate.actor,
      contractId,
      parsed.data.action,
      parsed.data.message
    );
    return jsonOk(data);
  });
}
