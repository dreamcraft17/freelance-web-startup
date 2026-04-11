import { NextResponse } from "next/server";
import { QuotaService } from "@/server/services/quota.service";
import { getAuthActor } from "@/server/http/route-helpers";

const quotaService = new QuotaService();

export async function GET(request: Request) {
  const actor = getAuthActor(request);
  const data = await quotaService.getFreelancerQuotaUsage(actor);
  return NextResponse.json({ success: true, data });
}
