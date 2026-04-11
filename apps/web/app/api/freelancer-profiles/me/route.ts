import { FreelancerProfileService } from "@/server/services/freelancer-profile.service";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new FreelancerProfileService();

/** Current freelancer’s profile (includes `id` and `username` for reviews and public links). */
export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectFreelancer(request);
    if (!gate.ok) return gate.response;
    const data = await service.getProfileByUserId(gate.actor.userId);
    return jsonOk(data);
  });
}
