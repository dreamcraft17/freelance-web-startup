import { StripePaymentService } from "@/server/services/stripe-payment.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { consumeRateLimitOr429, getClientIp, paymentWebhookIpLimiter } from "@/server/security";

const service = new StripePaymentService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(paymentWebhookIpLimiter, `stripeWebhook:${ip}`, 120, 60_000);
    if (limited) return limited;

    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    try {
      const data = await service.handleWebhook(rawBody, signature);
      return jsonOk(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook error";
      return jsonFail(message, 400);
    }
  });
}
