import { ContractService } from "@/server/services/contract.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const contractService = new ContractService();

type RouteContext = { params: Promise<{ contractId: string }> };

/**
 * Mark a contract **COMPLETED** (client or freelancer only). Centralized rules in {@link ContractService} / {@link ContractPolicy}.
 */
export async function POST(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const params = await context.params;
    const contractId = params.contractId?.trim();
    if (!contractId) return jsonFail("Invalid contract id", 400, "INVALID_ID");
    const data = await contractService.completeContract(gate.actor, contractId);
    return jsonOk(data);
  });
}
