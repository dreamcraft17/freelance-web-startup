import { MidtransPaymentService } from "@/server/services/midtrans-payment.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { consumeRateLimitOr429, getClientIp, paymentWebhookIpLimiter } from "@/server/security";

const service = new MidtransPaymentService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(paymentWebhookIpLimiter, `midtransWebhook:${ip}`, 120, 60_000);
    if (limited) return limited;

    try {
      const body = await request.json();
      const data = await service.handleNotification(body);
      return jsonOk(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Notification error";
      return jsonFail(message, 400);
    }
  });
}
