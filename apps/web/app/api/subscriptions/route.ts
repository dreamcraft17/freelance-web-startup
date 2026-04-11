import { createSubscriptionSchema } from "@acme/validators";
import { SubscriptionService } from "@/server/services/subscription.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const subscriptionService = new SubscriptionService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await subscriptionService.getActiveSubscriptionSummary(gate.actor.userId);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createSubscriptionSchema);
    if (!parsed.ok) return parsed.response;
    const data = await subscriptionService.initiateSubscriptionCheckout(gate.actor.userId, parsed.data);
    return jsonOk(data, 201);
  });
}
