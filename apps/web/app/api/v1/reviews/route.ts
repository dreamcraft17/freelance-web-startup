import { NextResponse } from "next/server";
import { createReviewSchema } from "@acme/validators";
import { ReviewService } from "@/server/services/review.service";
import { getAuthActor, parseJson } from "@/server/http/route-helpers";

const reviewService = new ReviewService();

export async function POST(request: Request) {
  const actor = getAuthActor(request);
  const parsed = await parseJson(request, createReviewSchema);
  if (!parsed.ok) return parsed.response;

  const data = await reviewService.createReview(actor, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
