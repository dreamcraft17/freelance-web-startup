import {
  createFreelancerProfileSchema,
  freelancerProfileUsernameQuerySchema,
  updateFreelancerProfileSchema
} from "@acme/validators";
import { FreelancerProfileService } from "@/server/services/freelancer-profile.service";
import { parseJson, parseSearchParams } from "@/server/http/route-helpers";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  consumeRateLimitOr429,
  freelancerProfileCreateUserLimiter,
  freelancerProfilePatchUserLimiter,
  getClientIp,
  publicReadIpLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const service = new FreelancerProfileService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `pub:${ip}`, 100, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const parsed = parseSearchParams(url, freelancerProfileUsernameQuerySchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.getPublicProfileByUsername(parsed.data.username);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `fpCreateIp:${ip}`, 40, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      freelancerProfileCreateUserLimiter,
      `fpCreate:${gate.actor.userId}`,
      6,
      60 * 60 * 1000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createFreelancerProfileSchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.createProfile(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}

export async function PATCH(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `fpPatchIp:${ip}`, 80, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      freelancerProfilePatchUserLimiter,
      `fpPatch:${gate.actor.userId}`,
      45,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, updateFreelancerProfileSchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.updateProfile(gate.actor, parsed.data);
    return jsonOk(data);
  });
}
