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
 * Authenticated areas: /client, /freelancer, /messages, /notifications, /settings.
 * Auth routes (/login, /register, /forgot-password) are matched so we never redirect them to /login
 * (avoids returnUrl=/login?returnUrl=… loops when session is missing).
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never touch Next/Vercel internals or public files — redirecting these breaks CSS/JS (unstyled /login).
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

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
    "/client/:path*",
    "/freelancer/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*"
  ]
};
