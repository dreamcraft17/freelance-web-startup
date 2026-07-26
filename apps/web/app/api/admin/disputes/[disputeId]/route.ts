import { DisputeDecision } from "@acme/database";
import { resolveDisputeSchema } from "@acme/validators";
import { DisputeAdminService } from "@/server/services/admin-finance.service";
import { parseJson } from "@/server/http/route-helpers";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { protectStaff } from "@/server/http/protect";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  staffModerationPatchUserLimiter
} from "@/server/security";

const disputeAdminService = new DisputeAdminService();

type RouteCtx = { params: Promise<{ disputeId: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(staffModerationPatchUserLimiter, `adminDisputePatch:${ip}`, 90, 60_000);
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `adminDisputePatchUser:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { disputeId: rawId } = await ctx.params;
    const disputeId = rawId?.trim();
    if (!disputeId) return jsonFail("Invalid dispute id", 400, "INVALID_ID");

    const parsed = await parseJson(request, resolveDisputeSchema);
    if (!parsed.ok) return parsed.response;

    const data = await disputeAdminService.resolveDispute(gate.actor, disputeId, {
      decision: parsed.data.decision as DisputeDecision,
      resolution: parsed.data.resolution
    });
    return jsonOk(data);
  });
}
