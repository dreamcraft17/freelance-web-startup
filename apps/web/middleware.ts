import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AccountStatus } from "@acme/types";
import { canAccessAdminPage, isStaffRole } from "@/features/admin/lib/access";
import { LOCALE_COOKIE } from "@/lib/i18n/constants";
import { resolveNavigationLocale } from "@/lib/i18n/navigation-locale";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import type { AppLocale } from "@/lib/i18n/types";
import { isUnprefixedWorkspacePath, matchPrefixedWorkspacePath } from "@/lib/i18n/workspace-path";
import {
  getSessionFromRequest,
  homePathForSessionRole,
  resolvePostLoginRedirect,
  sanitizeReturnUrl
} from "@/lib/session";

const LOCALE_PREFIX = /^\/(en|id)(\/|$)/i;
const SEO_PREFIX_PATH = /^\/(jobs|freelancers|how-it-works|pricing|early-access|help)(\/.*)?$/i;

function localeDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEARWORK_DEBUG_LOCALE === "1";
}

function localeCookieOptions() {
  return {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}

function preferredLocale(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get("accept-language");
  const resolved = resolveLocale(cookieLocale, null);

  // Temporary internal log for locale verification in development.
  if (localeDebugEnabled()) {
    const urlLocaleMatch = request.nextUrl.pathname.match(LOCALE_PREFIX);
    const urlLocale = urlLocaleMatch?.[1]?.toLowerCase() ?? "none";
    console.info("[nearwork][locale-debug]", {
      pathname: request.nextUrl.pathname,
      urlLocale,
      langCookie: cookieLocale ?? "none",
      acceptLanguage: acceptLanguage ?? "none",
      resolvedLocale: resolved
    });
  }

  return resolved;
}

/** Cookie preference, overridden by same-origin Referer `/en|id/` when navigating to unprefixed paths. */
function navigationLocale(request: NextRequest): AppLocale {
  return resolveNavigationLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("referer"),
    request.headers.get("sec-fetch-site"),
    request.nextUrl.origin
  );
}

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
    p === "/admin" ||
    p.startsWith("/admin/") ||
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

  if (pathname === "/") {
    const locale = preferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
    return response;
  }

  const prefixedWorkspace = matchPrefixedWorkspacePath(pathname);
  if (prefixedWorkspace) {
    const { locale: wsLocale, internalPath } = prefixedWorkspace;
    const sessionWs = await getSessionFromRequest(request);
    if (!sessionWs) {
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

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    const wsHeaders = new Headers(request.headers);
    wsHeaders.set("x-nearwork-locale", wsLocale);
    const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
      request: { headers: wsHeaders }
    });
    rewriteResponse.cookies.set(LOCALE_COOKIE, wsLocale, localeCookieOptions());
    return rewriteResponse;
  }

  if (isUnprefixedWorkspacePath(pathname)) {
    const locale = navigationLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const redirectLocale = NextResponse.redirect(url);
    redirectLocale.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
    return redirectLocale;
  }

  const localeMatch = pathname.match(LOCALE_PREFIX);
  if (localeMatch?.[1]) {
    const locale = localeMatch[1].toLowerCase() as "en" | "id";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nearwork-locale", locale);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
    return response;
  }

  if (SEO_PREFIX_PATH.test(pathname)) {
    const locale = navigationLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const seoRedirect = NextResponse.redirect(url);
    seoRedirect.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
    return seoRedirect;
  }

  const session = await getSessionFromRequest(request);
  const navLocale = navigationLocale(request);

  if (isAuthPublicPath(pathname)) {
    const authPath = pathname.toLowerCase();
    if ((authPath === "/login" || authPath === "/register") && session) {
      const rawReturn =
        request.nextUrl.searchParams.get("returnUrl") ?? request.nextUrl.searchParams.get("next");
      const target = resolvePostLoginRedirect(session.role, rawReturn, navLocale);
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

    const adminPath = pathname.toLowerCase();
    if (adminPath === "/admin" || adminPath.startsWith("/admin/")) {
      // Align with protectStaff(): ACTIVE session required for staff-gated surfaces.
      if (session.accountStatus !== AccountStatus.ACTIVE) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
      if (!isStaffRole(session.role)) {
        // Logged-in marketplace user: send them to their workspace instead of a dead-end forbidden page.
        const dest = homePathForSessionRole(session.role, navLocale);
        return NextResponse.redirect(new URL(dest, request.url));
      }
      if (!canAccessAdminPage(session.role, pathname)) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/:locale(en|id)",
    "/:locale(en|id)/:path*",
    "/jobs/:path*",
    "/freelancers/:path*",
    "/how-it-works/:path*",
    "/pricing/:path*",
    "/early-access/:path*",
    "/help/:path*",
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/admin",
    "/admin/:path*",
    "/client/:path*",
    "/freelancer/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*"
  ]
};
