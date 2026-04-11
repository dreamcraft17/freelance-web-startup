import { NextResponse } from "next/server";
import { createVerificationRequestSchema } from "@acme/validators";
import { VerificationService } from "@/server/services/verification.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const verificationService = new VerificationService();

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createVerificationRequestSchema);
  if (!parsed.ok) return parsed.response;

  const data = await verificationService.createVerificationRequest(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
