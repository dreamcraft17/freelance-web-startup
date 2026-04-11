import { NextResponse } from "next/server";
import {
  createFreelancerProfileSchema,
  freelancerProfileUsernameQuerySchema
} from "@acme/validators";
import { FreelancerProfileService } from "@/server/services/freelancer-profile.service";
import { getAuthActor, parseJson, parseSearchParams } from "@/server/http/route-helpers";

const freelancerProfileService = new FreelancerProfileService();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = parseSearchParams(url, freelancerProfileUsernameQuerySchema);
  if (!parsed.ok) return parsed.response;

  const data = await freelancerProfileService.getPublicProfileByUsername(parsed.data.username);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createFreelancerProfileSchema);
  if (!parsed.ok) return parsed.response;

  const data = await freelancerProfileService.createProfile(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
