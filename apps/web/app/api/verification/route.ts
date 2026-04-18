import { createVerificationRequestSchema } from "@acme/validators";
import { VerificationService } from "@/server/services/verification.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  consumeRateLimitOr429,
  getClientIp,
  sensitiveMutateIpLimiter,
  verificationFreelancerUserLimiter
} from "@/server/security";

const verificationService = new VerificationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `verifListIp:${ip}`, 100, 60_000);
    if (limited) return limited;

    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      verificationFreelancerUserLimiter,
      `verifList:${gate.actor.userId}`,
      60,
      60_000
    );
    if (userLimited) return userLimited;

    const data = await verificationService.listOwnRequests(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `verifCreateIp:${ip}`, 40, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      verificationFreelancerUserLimiter,
      `verifCreate:${gate.actor.userId}`,
      8,
      60 * 60 * 1000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, createVerificationRequestSchema);
    if (!parsed.ok) return parsed.response;
    const data = await verificationService.createVerificationRequest(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
