import { createMessageThreadSchema } from "@acme/validators";
import { MessageService } from "@/server/services/message.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClientOrFreelancer } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const messageService = new MessageService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;
    const data = await messageService.listThreadsForActor(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectClientOrFreelancer(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createMessageThreadSchema);
    if (!parsed.ok) return parsed.response;
    const data = await messageService.createThread(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
