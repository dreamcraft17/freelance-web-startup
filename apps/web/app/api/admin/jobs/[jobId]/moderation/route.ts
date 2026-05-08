import { staffSetJobModerationSchema } from "@acme/validators";
import { ModerationActionsService } from "@/server/services/moderation-actions.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectStaff } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  staffModerationPatchUserLimiter
} from "@/server/security";

const moderationActionsService = new ModerationActionsService();

type RouteCtx = { params: Promise<{ jobId: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `jobModPatch:${ip}`,
      80,
      60_000
    );
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { jobId: rawId } = await ctx.params;
    const jobId = rawId?.trim();
    if (!jobId) return jsonFail("Invalid job id", 400, "INVALID_ID");

    const parsed = await parseJson(request, staffSetJobModerationSchema);
    if (!parsed.ok) return parsed.response;

    const data = await moderationActionsService.setJobModerationHidden(gate.actor, jobId, parsed.data);
    return jsonOk(data);
  });
}
