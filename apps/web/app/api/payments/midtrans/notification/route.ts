import { MidtransPaymentService } from "@/server/services/midtrans-payment.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new MidtransPaymentService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
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
