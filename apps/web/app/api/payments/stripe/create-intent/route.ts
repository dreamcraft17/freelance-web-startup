import { createStripeIntentSchema } from "@acme/validators";
import { StripePaymentService } from "@/server/services/stripe-payment.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new StripePaymentService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createStripeIntentSchema);
    if (!parsed.ok) return parsed.response;

    const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;
    const data = await service.createContractPaymentIntent({
      userId: gate.actor.userId,
      contractId: parsed.data.contractId,
      idempotencyKey
    });
    return jsonOk(data);
  });
}
