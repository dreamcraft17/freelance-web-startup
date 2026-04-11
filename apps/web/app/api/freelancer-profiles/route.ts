import {
  createFreelancerProfileSchema,
  freelancerProfileUsernameQuerySchema
} from "@acme/validators";
import { FreelancerProfileService } from "@/server/services/freelancer-profile.service";
import { parseJson, parseSearchParams } from "@/server/http/route-helpers";
import { protectFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new FreelancerProfileService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const parsed = parseSearchParams(url, freelancerProfileUsernameQuerySchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.getPublicProfileByUsername(parsed.data.username);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectFreelancer(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createFreelancerProfileSchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.createProfile(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
