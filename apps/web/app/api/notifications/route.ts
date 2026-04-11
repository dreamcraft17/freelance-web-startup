import { NotificationService } from "@/server/services/notification.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const notificationService = new NotificationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await notificationService.listForActor(gate.actor);
    return jsonOk(data);
  });
}
