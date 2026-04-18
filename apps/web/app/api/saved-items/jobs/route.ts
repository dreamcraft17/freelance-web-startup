import { saveJobBodySchema } from "@acme/validators";
import { SavedItemsService } from "@/server/services/saved-items.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  consumeRateLimitOr429,
  getClientIp,
  savedJobsMutateUserLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const savedItemsService = new SavedItemsService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `savedJobsGetIp:${ip}`, 100, 60_000);
    if (limited) return limited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const idsOnly = new URL(request.url).searchParams.get("idsOnly");
    const data =
      idsOnly === "1"
        ? await savedItemsService.listSavedJobIds(gate.actor)
        : await savedItemsService.listSavedJobs(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `savedJobsPostIp:${ip}`, 80, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      savedJobsMutateUserLimiter,
      `savedJobs:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, saveJobBodySchema);
    if (!parsed.ok) return parsed.response;
    const data = await savedItemsService.saveJob(gate.actor, parsed.data.jobId);
    return jsonOk(data, 201);
  });
}

export async function DELETE(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `savedJobsDelIp:${ip}`, 80, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      savedJobsMutateUserLimiter,
      `savedJobs:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, saveJobBodySchema);
    if (!parsed.ok) return parsed.response;
    const data = await savedItemsService.unsaveJob(gate.actor, parsed.data.jobId);
    return jsonOk(data);
  });
}
