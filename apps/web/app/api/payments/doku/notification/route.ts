import { DokuPaymentService } from "@/server/services/doku-payment.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { consumeRateLimitOr429, getClientIp, paymentWebhookIpLimiter } from "@/server/security";

const service = new DokuPaymentService();
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(paymentWebhookIpLimiter, `dokuWebhook:${ip}`, 120, 60_000);
    if (limited) return limited;
    try {
      const body = await request.text();
      return jsonOk(await service.handleNotification({ body, clientId: request.headers.get("Client-Id") ?? "", requestId: request.headers.get("Request-Id") ?? "", timestamp: request.headers.get("Request-Timestamp") ?? "", signature: request.headers.get("Signature"), requestTarget: new URL(request.url).pathname }));
    } catch (error) {
      return jsonFail(error instanceof Error ? error.message : "Notification error", 400);
    }
  });
}
