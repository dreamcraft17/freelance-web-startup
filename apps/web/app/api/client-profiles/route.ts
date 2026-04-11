import { createClientProfileSchema } from "@acme/validators";
import { ClientProfileService } from "@/server/services/client-profile.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser, protectClient } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const service = new ClientProfileService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await service.getProfileForActor(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectClient(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createClientProfileSchema);
    if (!parsed.ok) return parsed.response;
    const data = await service.createProfile(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
