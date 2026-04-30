import * as jose from "jose";
import type { NextRequest } from "next/server";
import { AccountStatus, UserRole } from "@acme/types";

export const SESSION_COOKIE_NAME = "acme_session";

/** Session cookie + JWT calendar lifetime (keep in sync). */
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Reject pathological cookie values before `jwtVerify` (DoS / log noise). */
const MAX_SESSION_JWT_CHARS = 12_000;

export type SessionPayload = {
  userId: string;
  role: UserRole;
  accountStatus: AccountStatus;
};

function getSecretKey(): Uint8Array | null {
  const raw = process.env.SESSION_SECRET;
  /** Minimum 16 for dev; use 32+ random bytes in production (e.g. `openssl rand -base64 32`). */
  if (!raw || raw.length < 16) return null;
  return new TextEncoder().encode(raw);
}

/** Single entry for raw cookie / header token strings — trim, length-bound, no logging. */
export function normalizeSessionToken(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t.length) return null;
  if (t.length > MAX_SESSION_JWT_CHARS) return null;
  return t;
}

function readTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE_NAME && rest.length) {
      const decoded = decodeURIComponent(rest.join("=").trim());
      return normalizeSessionToken(decoded);
    }
  }
  return null;
}

/**
 * Issues a compact HS256 JWT. Payload is minimal: `sub` (user id), `role`, `accountStatus`, `jti`.
 * `jti` enables future server-side revocation / rotation without changing the session DTO shape.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string | null> {
  const secret = getSecretKey();
  if (!secret) return null;

  const exp = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);

  return new jose.SignJWT({
    role: payload.role,
    accountStatus: payload.accountStatus,
    jti: globalThis.crypto.randomUUID()
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Verifies signature, `exp`, and algorithm. Invalid / expired / tampered tokens → `null` (no error detail to callers).
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const normalized = normalizeSessionToken(token);
  if (!normalized) return null;

  const secret = getSecretKey();
  if (!secret) return null;

  try {
    const { payload } = await jose.jwtVerify(normalized, secret, {
      algorithms: ["HS256"],
      clockTolerance: 30
    });
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    const role = payload.role;
    const accountStatus = payload.accountStatus;
    if (
      !userId ||
      typeof role !== "string" ||
      !Object.values(UserRole).includes(role as UserRole) ||
      typeof accountStatus !== "string" ||
      !Object.values(AccountStatus).includes(accountStatus as AccountStatus)
    ) {
      return null;
    }
    return {
      userId,
      role: role as UserRole,
      accountStatus: accountStatus as AccountStatus
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: Request | NextRequest): Promise<SessionPayload | null> {
  const header = request.headers.get("cookie");
  const token = readTokenFromCookieHeader(header);
  if (!token) return null;
  return verifySessionToken(token);
}

export { sanitizeReturnUrl, homePathForSessionRole, resolvePostLoginRedirect } from "./return-url";

export function sessionCookieMaxAgeSec(): number {
  return SESSION_MAX_AGE_SEC;
}

export function shouldUseSecureCookies(request?: Request): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!request) return true;

  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (proto) return proto === "https";

  try {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    return url.protocol === "https:";
  } catch {
    return true;
  }
}

export function buildSessionSetCookieHeader(token: string, request?: Request): string {
  const secure = shouldUseSecureCookies(request);
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
    `Expires=${new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000).toUTCString()}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/**
 * Clears the session cookie with the same Path / HttpOnly / SameSite / Secure pattern as `Set-Cookie` on login.
 */
export function buildSessionClearCookieHeader(request?: Request): string {
  const secure = shouldUseSecureCookies(request);
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
