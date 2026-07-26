import { BoostService } from "@/server/services/boost.service";
import { purchaseBoostSchema } from "@acme/validators";
import { BoostTargetType } from "@acme/database";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new BoostService();

export async function GET() {
  return withApiHandler(async () => {
    const products = await service.listProducts();
    return jsonOk({ products });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, purchaseBoostSchema);
    if (!parsed.ok) return parsed.response;

    const result = await service.purchaseBoost({
      userId: gate.actor.userId,
      productCode: parsed.data.productCode,
      targetType: parsed.data.targetType as BoostTargetType,
      targetId: parsed.data.targetId,
      paymentMethod: parsed.data.paymentMethod
    });
    return jsonOk(result, result.paymentRequired ? 200 : 201);
  });
}
