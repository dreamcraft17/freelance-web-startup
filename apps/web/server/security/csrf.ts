import { randomBytes, timingSafeEqual } from "node:crypto";
import { jsonFail } from "@/server/http/api-response";
import type { NextResponse } from "next/server";
import { NW_CSRF_COOKIE_NAME, NW_CSRF_HEADER_NAME } from "@src/lib/csrf-constants";
import { sessionCookieMaxAgeSec, shouldUseSecureCookies } from "@src/lib/session";

const MAX_CSRF_TOKEN_CHARS = 256;

/** Opaque CSRF token (double-submit cookie value). */
export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Non-HttpOnly cookie so same-origin JS can mirror the value into `X-CSRF-Token`.
 * Lifetime aligned with the session cookie.
 */
export function buildCsrfSetCookieHeader(token: string, request?: Request): string {
  const secure = shouldUseSecureCookies(request);
  const maxAge = sessionCookieMaxAgeSec();
  const parts = [
    `${NW_CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    `Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildCsrfClearCookieHeader(request?: Request): string {
  const secure = shouldUseSecureCookies(request);
  const parts = [
    `${NW_CSRF_COOKIE_NAME}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function hasCsrfCookie(request: Request): boolean {
  return readCsrfFromCookieHeader(request.headers.get("cookie")) != null;
}

function readCsrfFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === NW_CSRF_COOKIE_NAME && rest.length) {
      const v = decodeURIComponent(rest.join("=").trim());
      if (!v.length || v.length > MAX_CSRF_TOKEN_CHARS) return null;
      return v;
    }
  }
  return null;
}

/** If `Origin` is present, it must match the request URL origin (defense in depth with double-submit). */
export function assertSameOriginForMutation(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    return jsonFail("Invalid request", 400, "BAD_REQUEST");
  }
  if (origin !== expected) {
    return jsonFail("Invalid request origin", 403, "CSRF_ORIGIN");
  }
  return null;
}

/**
 * Validates double-submit CSRF (cookie + `X-CSRF-Token`) and optional Origin check.
 * Use on cookie-authenticated POST/PATCH/DELETE handlers.
 */
export function assertMutationCsrf(request: Request): NextResponse | null {
  const originBlock = assertSameOriginForMutation(request);
  if (originBlock) return originBlock;

  const cookieToken = readCsrfFromCookieHeader(request.headers.get("cookie"));
  const headerToken =
    request.headers.get(NW_CSRF_HEADER_NAME)?.trim() ??
    request.headers.get(NW_CSRF_HEADER_NAME.toLowerCase())?.trim() ??
    "";

  if (!cookieToken || !headerToken) {
    return jsonFail("CSRF token required", 403, "CSRF_REQUIRED");
  }

  try {
    const a = Buffer.from(cookieToken, "utf8");
    const b = Buffer.from(headerToken, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return jsonFail("Invalid CSRF token", 403, "CSRF_INVALID");
    }
  } catch {
    return jsonFail("Invalid CSRF token", 403, "CSRF_INVALID");
  }
  return null;
}
