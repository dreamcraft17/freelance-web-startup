import { NextResponse } from "next/server";
import { createJobSchema } from "@acme/validators";
import { JobService } from "@/server/services/job.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const jobService = new JobService();

export async function GET() {
  return NextResponse.json({ success: true, data: { items: [] } });
}

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createJobSchema);
  if (!parsed.ok) return parsed.response;

  const data = await jobService.createDraftJob(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
