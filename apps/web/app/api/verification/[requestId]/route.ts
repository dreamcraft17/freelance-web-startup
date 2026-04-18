import { staffReviewVerificationSchema } from "@acme/validators";
import { VerificationService } from "@/server/services/verification.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser, protectStaff } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  sensitiveMutateIpLimiter,
  staffVerificationPatchUserLimiter
} from "@/server/security";

const verificationService = new VerificationService();

type RouteContext = { params: Promise<{ requestId: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `verifDetailIp:${ip}`, 100, 60_000);
    if (limited) return limited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const params = await context.params;
    const requestId = params.requestId?.trim();
    if (!requestId) return jsonFail("Invalid request id", 400, "INVALID_ID");
    const data = await verificationService.getRequestForActor(gate.actor, requestId);
    return jsonOk(data);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `verifStaffPatchIp:${ip}`, 90, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      staffVerificationPatchUserLimiter,
      `verifStaffPatch:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const params = await context.params;
    const requestId = params.requestId?.trim();
    if (!requestId) return jsonFail("Invalid request id", 400, "INVALID_ID");
    const parsed = await parseJson(request, staffReviewVerificationSchema);
    if (!parsed.ok) return parsed.response;
    const data = await verificationService.reviewVerificationRequest(gate.actor, requestId, parsed.data);
    return jsonOk(data);
  });
}
