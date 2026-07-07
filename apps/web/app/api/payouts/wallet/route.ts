import { PayoutService } from "@/server/services/v2-commerce.service";
import { createPayoutRequestSchema, createBankAccountSchema } from "@acme/validators";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new PayoutService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    return jsonOk(await service.getWallet(gate.actor.userId));
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createPayoutRequestSchema);
    if (!parsed.ok) return parsed.response;

    const data = await service.requestPayout(gate.actor.userId, parsed.data);
    return jsonOk(data, 201);
  });
}

export async function PUT(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createBankAccountSchema);
    if (!parsed.ok) return parsed.response;

    const data = await service.addBankAccount(gate.actor.userId, parsed.data);
    return jsonOk(data, 201);
  });
}
