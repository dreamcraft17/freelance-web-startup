import { NotificationService } from "@/server/services/notification.service";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { getAppLocale } from "@/lib/i18n/server-locale";

const notificationService = new NotificationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const locale = await getAppLocale();
    const data = await notificationService.listForActor(gate.actor, locale);
    return jsonOk(data);
  });
}
