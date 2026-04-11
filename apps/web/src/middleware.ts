import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@src/lib/session";

/**
 * Authenticated areas only. Public routes (/ , /jobs , /freelancers , etc.) are not matched.
 * Session is read from the signed session cookie only — no header fallbacks.
 */
export default async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/freelancer/:path*"]
};
