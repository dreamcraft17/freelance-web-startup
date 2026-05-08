import { createModerationReportSchema } from "@acme/validators";
import { ModerationReportService } from "@/server/services/moderation-report.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  getClientIp,
  moderationReportPostUserLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const moderationReportService = new ModerationReportService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `reportIp:${ip}`, 50, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      moderationReportPostUserLimiter,
      `reports:${gate.actor.userId}`,
      20,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createModerationReportSchema);
    if (!parsed.ok) return parsed.response;

    const data = await moderationReportService.createReport(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
