import { createJobSchema, searchJobsSchema } from "@acme/validators";
import { JobService } from "@/server/services/job.service";
import { parseJson, parseSearchParams } from "@/server/http/route-helpers";
import { protectClient } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  consumeRateLimitOr429,
  getClientIp,
  jobCreateUserLimiter,
  publicReadIpLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const jobService = new JobService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `pub:${ip}`, 100, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const parsed = parseSearchParams(url, searchJobsSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.listOpenJobs(parsed.data);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `jobPostIp:${ip}`, 45, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      jobCreateUserLimiter,
      `jobCreate:${gate.actor.userId}`,
      12,
      60 * 60 * 1000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, createJobSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.createDraftJob(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
