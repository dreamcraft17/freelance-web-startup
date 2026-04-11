import { NextResponse } from "next/server";
import { createSubscriptionSchema } from "@acme/validators";
import { SubscriptionService } from "@/server/services/subscription.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const subscriptionService = new SubscriptionService();

export async function GET(request: Request) {
  const actor = getAuthActor(request);
  const data = await subscriptionService.getActiveSubscriptionSummary(actor.userId);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createSubscriptionSchema);
  if (!parsed.ok) return parsed.response;

  const data = await subscriptionService.initiateSubscriptionCheckout(actor.userId, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
