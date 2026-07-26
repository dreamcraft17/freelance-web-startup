import { PayoutAdminService } from "@/server/services/admin-finance.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { protectStaff } from "@/server/http/protect";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  staffModerationPatchUserLimiter
} from "@/server/security";

const payoutAdminService = new PayoutAdminService();

type RouteCtx = { params: Promise<{ payoutId: string }> };

export async function POST(request: Request, ctx: RouteCtx) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(staffModerationPatchUserLimiter, `adminPayoutApprove:${ip}`, 90, 60_000);
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `adminPayoutApproveUser:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { payoutId: rawId } = await ctx.params;
    const payoutId = rawId?.trim();
    if (!payoutId) return jsonFail("Invalid payout id", 400, "INVALID_ID");

    const data = await payoutAdminService.approvePayout(gate.actor, payoutId);
    return jsonOk(data);
  });
}
