import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSessionFromRequest,
  homePathForSessionRole,
  sanitizeReturnUrl
} from "@src/lib/session";

function isAuthPublicPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p === "/login" ||
    p.startsWith("/login/") ||
    p === "/register" ||
    p.startsWith("/register/") ||
    p === "/forgot-password" ||
    p.startsWith("/forgot-password/")
  );
}

/** App workspaces that require a session. Everything else is public (browse-first). */
function isProtectedWorkspacePath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p === "/client" ||
    p.startsWith("/client/") ||
    p === "/freelancer" ||
    p.startsWith("/freelancer/") ||
    p === "/messages" ||
    p.startsWith("/messages/") ||
    p === "/notifications" ||
    p.startsWith("/notifications/") ||
    p === "/settings" ||
    p.startsWith("/settings/")
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (isAuthPublicPath(pathname)) {
    const authPath = pathname.toLowerCase();
    if ((authPath === "/login" || authPath === "/register") && session) {
      const rawReturn =
        request.nextUrl.searchParams.get("returnUrl") ?? request.nextUrl.searchParams.get("next");
      const fallback = homePathForSessionRole(session.role);
      const target = sanitizeReturnUrl(rawReturn, fallback);
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedWorkspacePath(pathname)) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.delete("returnUrl");
      const candidate = pathname + request.nextUrl.search;
      const safe = sanitizeReturnUrl(candidate, "/");
      if (safe !== "/") {
        url.searchParams.set("returnUrl", safe);
      }
      url.searchParams.set("intent", "protected");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Restrict middleware to auth + protected workspaces to reduce per-request overhead on public pages.
  matcher: [
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/client/:path*",
    "/freelancer/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*"
  ]
};
