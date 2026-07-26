import { z } from "zod";
import { StripePaymentService } from "@/server/services/stripe-payment.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const simulateSchema = z.object({
  contractId: z.string().min(1)
});

const service = new StripePaymentService();

/** Dev/E2E only — simulates successful escrow payment without PSP webhooks. */
export async function POST(request: Request) {
  return withApiHandler(async () => {
    if (process.env.NODE_ENV === "production") {
      return jsonFail("Mock payment is not available in production", 403, "MOCK_PAYMENT_FORBIDDEN");
    }

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, simulateSchema);
    if (!parsed.ok) return parsed.response;

    await service.simulateContractPaymentSuccess(parsed.data.contractId, gate.actor.userId);
    return jsonOk({ simulated: true, contractId: parsed.data.contractId });
  });
}
