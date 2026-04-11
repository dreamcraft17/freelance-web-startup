import { NextResponse } from "next/server";
import { createClientProfileSchema } from "@acme/validators";
import { ClientProfileService } from "@/server/services/client-profile.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const clientProfileService = new ClientProfileService();

export async function GET(request: Request) {
  const actor = getAuthActor(request);
  const data = await clientProfileService.getProfileForActor(actor);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createClientProfileSchema);
  if (!parsed.ok) return parsed.response;

  const data = await clientProfileService.createProfile(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
