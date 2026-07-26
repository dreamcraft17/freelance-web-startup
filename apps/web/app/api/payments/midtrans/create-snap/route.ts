import { createMidtransSnapSchema } from "@acme/validators";
import { MidtransPaymentService } from "@/server/services/midtrans-payment.service";
import { db } from "@acme/database";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf } from "@/server/security";

const service = new MidtransPaymentService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;

    const csrf = assertMutationCsrf(request);
    if (csrf) return csrf;

    const parsed = await parseJson(request, createMidtransSnapSchema);
    if (!parsed.ok) return parsed.response;

    const user = await db.user.findUnique({
      where: { id: gate.actor.userId },
      select: { email: true, clientProfile: { select: { displayName: true } } }
    });

    const data = await service.createContractSnap({
      userId: gate.actor.userId,
      contractId: parsed.data.contractId,
      clientEmail: user?.email ?? "client@nextwork.local",
      clientName: user?.clientProfile?.displayName ?? "Client"
    });
    return jsonOk(data);
  });
}
