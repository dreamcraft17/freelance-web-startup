import { patchModerationReportSchema } from "@acme/validators";
import { ModerationReportService } from "@/server/services/moderation-report.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectStaff } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  staffModerationPatchUserLimiter
} from "@/server/security";

const moderationReportService = new ModerationReportService();

type RouteCtx = { params: Promise<{ reportId: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `adminReportPatch:${ip}`,
      90,
      60_000
    );
    if (limited) return limited;

    const gate = await protectStaff(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      staffModerationPatchUserLimiter,
      `adminReportPatchUser:${gate.actor.userId}`,
      120,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const { reportId: rawId } = await ctx.params;
    const reportId = rawId?.trim();
    if (!reportId) return jsonFail("Invalid report id", 400, "INVALID_ID");

    const parsed = await parseJson(request, patchModerationReportSchema);
    if (!parsed.ok) return parsed.response;

    const data = await moderationReportService.patchReport(gate.actor, reportId, parsed.data);
    return jsonOk(data);
  });
}
