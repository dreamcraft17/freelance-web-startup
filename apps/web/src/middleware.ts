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

/**
 * Matcher is limited to auth pages and authenticated workspaces only.
 *
 * Not matched (middleware never runs → never redirected to /login):
 * - /, /jobs, /jobs/[id], /freelancers, /freelancers/[username]
 * - /how-it-works, /pricing, /early-access, /help, /privacy, /terms, /contact, etc.
 * - /api/*, static assets (not listed here)
 *
 * Matched → session required except for /login, /register, /forgot-password:
 * - /client/*, /freelancer/*, /messages/*, /notifications/*, /settings/*
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getSessionFromRequest(request);

  if (isAuthPublicPath(pathname)) {
    if (pathname.toLowerCase() === "/login" && session) {
      const rawReturn = request.nextUrl.searchParams.get("returnUrl");
      const fallback = homePathForSessionRole(session.role);
      const target = sanitizeReturnUrl(rawReturn, fallback);
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.delete("returnUrl");
    const candidate = pathname + request.nextUrl.search;
    const safe = sanitizeReturnUrl(candidate, "/");
    if (safe !== "/") {
      url.searchParams.set("returnUrl", safe);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/register",
    "/register/:path*",
    "/forgot-password",
    "/forgot-password/:path*",
    "/client",
    "/client/:path*",
    "/freelancer",
    "/freelancer/:path*",
    "/messages",
    "/messages/:path*",
    "/notifications",
    "/notifications/:path*",
    "/settings",
    "/settings/:path*"
  ]
};
