import { adminReportsQuerySchema } from "@acme/validators";
import { ModerationReportService } from "@/server/services/moderation-report.service";
import { parseSearchParams } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { protectStaff } from "@/server/http/protect";
import { consumeRateLimitOr429, getClientIp, staffModerationPatchUserLimiter } from "@/server/security";

const moderationReportService = new ModerationReportService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(staffModerationPatchUserLimiter, `adminReportsGet:${ip}`, 120, 60_000);
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const parsed = parseSearchParams(url, adminReportsQuerySchema);
    if (!parsed.ok) return parsed.response;

    const data = await moderationReportService.listForStaff(gate.actor, parsed.data);
    return jsonOk(data);
  });
}
