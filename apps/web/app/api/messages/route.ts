import { createMessageThreadSchema } from "@acme/validators";
import { MessageService } from "@/server/services/message.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClientOrFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  authenticatedReadUserLimiter,
  consumeRateLimitOr429,
  getClientIp,
  messageCreateUserLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const messageService = new MessageService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `msgListIp:${ip}`, 120, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      authenticatedReadUserLimiter,
      `msgList:${gate.actor.userId}`,
      120,
      60_000
    );
    if (userLimited) return userLimited;

    const data = await messageService.listThreadsForActor(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `msgCreateIp:${ip}`, 50, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      messageCreateUserLimiter,
      `msgCreate:${gate.actor.userId}`,
      20,
      60_000
    );
    if (userLimited) return userLimited;

    const parsed = await parseJson(request, createMessageThreadSchema);
    if (!parsed.ok) return parsed.response;
    const data = await messageService.createThread(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
