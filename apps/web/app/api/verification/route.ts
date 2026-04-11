import { createVerificationRequestSchema } from "@acme/validators";
import { VerificationService } from "@/server/services/verification.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectAnyActiveUser } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const verificationService = new VerificationService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const gate = protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const data = await verificationService.listOwnRequests(gate.actor);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = protectAnyActiveUser(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createVerificationRequestSchema);
    if (!parsed.ok) return parsed.response;
    const data = await verificationService.createVerificationRequest(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
