import { SubscriptionService } from "@/server/services/subscription.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const subscriptionService = new SubscriptionService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const data = await subscriptionService.cancelSubscriptionAtPeriodEnd(gate.actor.userId);
    return jsonOk(data);
  });
}
