import { createDonationSchema } from "@acme/validators";
import { resolveActorFromRequest } from "@src/lib/auth";
import { DonationService } from "@/server/services/donation.service";
import { parseJson } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const donationService = new DonationService();

/**
 * Optional support payment (no real charge). Attach session cookie to associate `userId`.
 */
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const parsed = await parseJson(request, createDonationSchema);
    if (!parsed.ok) return parsed.response;

    const actor = await resolveActorFromRequest(request);
    const data = await donationService.recordDonation({
      userId: actor?.userId ?? null,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      message: parsed.data.message
    });

    return jsonOk(data, 201);
  });
}
