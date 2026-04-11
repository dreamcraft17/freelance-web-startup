import { QuotaService } from "@/server/services/quota.service";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const quotaService = new QuotaService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = protectFreelancer(request);
    if (!gate.ok) return gate.response;
    const data = await quotaService.getFreelancerQuotaUsage(gate.actor);
    return jsonOk(data);
  });
}
