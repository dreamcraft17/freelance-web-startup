import { ReconciliationService } from "@/server/services/admin-finance.service";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { protectStaff } from "@/server/http/protect";
import { consumeRateLimitOr429, getClientIp, staffModerationPatchUserLimiter } from "@/server/security";

const reconciliationService = new ReconciliationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `adminReconciliationGet:${ip}`,
      60,
      60_000
    );
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const hoursRaw = url.searchParams.get("hours");
    const lookbackHours = hoursRaw ? Math.min(168, Math.max(1, Number(hoursRaw) || 72)) : 72;

    const data = await reconciliationService.getSummary(lookbackHours);
    return jsonOk(data);
  });
}
