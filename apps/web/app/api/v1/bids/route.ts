import { NextResponse } from "next/server";
import { submitBidSchema } from "@acme/validators";
import { BidService } from "@/server/services/bid.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const bidService = new BidService();

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, submitBidSchema);
  if (!parsed.ok) return parsed.response;

  const data = await bidService.submitBid(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
