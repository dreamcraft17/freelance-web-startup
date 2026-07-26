import { DisputeAdminService } from "@/server/services/admin-finance.service";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { protectStaff } from "@/server/http/protect";
import { consumeRateLimitOr429, getClientIp, staffModerationPatchUserLimiter } from "@/server/security";

const disputeAdminService = new DisputeAdminService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(staffModerationPatchUserLimiter, `adminDisputesGet:${ip}`, 120, 60_000);
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const data = await disputeAdminService.listOpenDisputes();
    return jsonOk(data);
  });
}
