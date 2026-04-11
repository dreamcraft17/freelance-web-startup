import { ContractService } from "@/server/services/contract.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const contractService = new ContractService();

type RouteContext = { params: Promise<{ contractId: string }> } | { params: { contractId: string } };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const params = await Promise.resolve(context.params);
    const contractId = params.contractId?.trim();
    if (!contractId) return jsonFail("Invalid contract id", 400, "INVALID_ID");
    const data = await contractService.getByIdForActor(gate.actor, contractId);
    return jsonOk(data);
  });
}
