import { createClientProfileSchema } from "@acme/validators";
import { ClientProfileService } from "@/server/services/client-profile.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser, protectClient } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  clientProfileCreateUserLimiter,
  consumeRateLimitOr429,
  getClientIp,
  sensitiveMutateIpLimiter
} from "@/server/security";

const service = new ClientProfileService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `clientProfGetIp:${ip}`, 100, 60_000);
    if (limited) return limited;

    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await service.getProfileForActor(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `clientProfPostIp:${ip}`, 35, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      clientProfileCreateUserLimiter,
      `clientProfCreate:${gate.actor.userId}`,
      8,
      60 * 60 * 1000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, createClientProfileSchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.createProfile(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
