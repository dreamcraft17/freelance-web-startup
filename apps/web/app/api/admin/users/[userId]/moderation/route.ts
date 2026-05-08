import { staffSetUserModerationSchema } from "@acme/validators";
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

type RouteCtx = { params: Promise<{ userId: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `userModPatch:${ip}`,
      80,
      60_000
    );
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { userId: rawId } = await ctx.params;
    const userId = rawId?.trim();
    if (!userId) return jsonFail("Invalid user id", 400, "INVALID_ID");

    const parsed = await parseJson(request, staffSetUserModerationSchema);
    if (!parsed.ok) return parsed.response;

    const data = await moderationActionsService.setUserAccountStatus(gate.actor, userId, parsed.data);
    return jsonOk(data);
  });
}
