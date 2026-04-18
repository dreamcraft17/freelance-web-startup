import { updateJobSchema } from "@acme/validators";
import { JobService } from "@/server/services/job.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClient } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  consumeRateLimitOr429,
  getClientIp,
  jobUpdateUserLimiter,
  publicReadIpLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const jobService = new JobService();

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `pub:${ip}`, 100, 60_000);
    if (limited) return limited;

    const params = await context.params;
    const jobId = params.jobId?.trim();
    if (!jobId) return jsonFail("Invalid job id", 400, "INVALID_ID");
    const data = await jobService.getJobByIdForPublic(jobId);
    if (!data) return jsonFail("Job not found", 404, "NOT_FOUND");
    return jsonOk(data);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `jobPatchIp:${ip}`, 70, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      jobUpdateUserLimiter,
      `jobPatch:${gate.actor.userId}`,
      40,
      60_000
    );
    if (userLimited) return userLimited;

    const params = await context.params;
    const jobId = params.jobId?.trim();
    if (!jobId) return jsonFail("Invalid job id", 400, "INVALID_ID");
    const parsed = await parseJson(request, updateJobSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.updateJob(gate.actor, jobId, parsed.data);
    return jsonOk(data);
  });
}
