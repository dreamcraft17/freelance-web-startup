import { NextResponse } from "next/server";
import { searchJobsSchema } from "@acme/validators";
import { SearchService } from "@/server/services/search.service";

const searchService = new SearchService();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = searchJobsSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await searchService.searchJobs(parsed.data);
  return NextResponse.json({ success: true, data });
}
