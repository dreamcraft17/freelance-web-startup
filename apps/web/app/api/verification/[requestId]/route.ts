import { staffReviewVerificationSchema } from "@acme/validators";
import { VerificationService } from "@/server/services/verification.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser, protectStaff } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const verificationService = new VerificationService();

type RouteContext =
  | { params: Promise<{ requestId: string }> }
  | { params: { requestId: string } };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const params = await Promise.resolve(context.params);
    const requestId = params.requestId?.trim();
    if (!requestId) return jsonFail("Invalid request id", 400, "INVALID_ID");
    const data = await verificationService.getRequestForActor(gate.actor, requestId);
    return jsonOk(data);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = protectStaff(request);
    if (!gate.ok) return gate.response;
    const params = await Promise.resolve(context.params);
    const requestId = params.requestId?.trim();
    if (!requestId) return jsonFail("Invalid request id", 400, "INVALID_ID");
    const parsed = await parseJson(request, staffReviewVerificationSchema);
    if (!parsed.ok) return parsed.response;
    const data = await verificationService.reviewVerificationRequest(gate.actor, requestId, parsed.data);
    return jsonOk(data);
  });
}
