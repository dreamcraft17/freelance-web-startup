import { saveJobBodySchema } from "@acme/validators";
import { SavedItemsService } from "@/server/services/saved-items.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const savedItemsService = new SavedItemsService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await savedItemsService.listSavedJobs(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, saveJobBodySchema);
    if (!parsed.ok) return parsed.response;
    const data = await savedItemsService.saveJob(gate.actor, parsed.data.jobId);
    return jsonOk(data, 201);
  });
}

export async function DELETE(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, saveJobBodySchema);
    if (!parsed.ok) return parsed.response;
    const data = await savedItemsService.unsaveJob(gate.actor, parsed.data.jobId);
    return jsonOk(data);
  });
}
