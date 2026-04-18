import { postMessageSchema } from "@acme/validators";
import { MessageService } from "@/server/services/message.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClientOrFreelancer } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import {
  assertMutationCsrf,
  authenticatedReadUserLimiter,
  consumeRateLimitOr429,
  getClientIp,
  messagePostUserLimiter,
  sensitiveMutateIpLimiter
} from "@/server/security";

const messageService = new MessageService();

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `msgThreadGetIp:${ip}`, 120, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      authenticatedReadUserLimiter,
      `msgThreadGet:${gate.actor.userId}`,
      120,
      60_000
    );
    if (userLimited) return userLimited;

    const params = await context.params;
    const threadId = params.threadId?.trim();
    if (!threadId) return jsonFail("Invalid thread id", 400, "INVALID_ID");
    const data = await messageService.listMessagesForActor(gate.actor, threadId);
    return jsonOk(data);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(sensitiveMutateIpLimiter, `msgThreadPostIp:${ip}`, 60, 60_000);
    if (ipLimited) return ipLimited;

    const gate = await protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;

    const userLimited = consumeRateLimitOr429(
      messagePostUserLimiter,
      `msgThreadPost:${gate.actor.userId}`,
      30,
      60_000
    );
    if (userLimited) return userLimited;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const params = await context.params;
    const threadId = params.threadId?.trim();
    if (!threadId) return jsonFail("Invalid thread id", 400, "INVALID_ID");
    const parsed = await parseJson(request, postMessageSchema);
    if (!parsed.ok) return parsed.response;
    const data = await messageService.postMessage(gate.actor, threadId, parsed.data);
    return jsonOk(data, 201);
  });
}
