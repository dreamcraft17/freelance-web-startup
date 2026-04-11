import { markNotificationReadBodySchema } from "@acme/validators";
import { NotificationService } from "@/server/services/notification.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const notificationService = new NotificationService();

type RouteContext =
  | { params: Promise<{ notificationId: string }> }
  | { params: { notificationId: string } };

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const params = await Promise.resolve(context.params);
    const notificationId = params.notificationId?.trim();
    if (!notificationId) return jsonFail("Invalid notification id", 400, "INVALID_ID");
    const parsed = await parseJson(request, markNotificationReadBodySchema);
    if (!parsed.ok) return parsed.response;
    const data = await notificationService.markNotificationAsRead(gate.actor, notificationId);
    return jsonOk(data);
  });
}
