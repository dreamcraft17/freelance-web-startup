import * as jose from "jose";
import type { NextRequest } from "next/server";
import { AccountStatus, UserRole } from "@acme/types";

export const SESSION_COOKIE_NAME = "acme_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  role: UserRole;
  accountStatus: AccountStatus;
};

function getSecretKey(): Uint8Array | null {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 16) return null;
  return new TextEncoder().encode(raw);
}

function readTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE_NAME && rest.length) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }
  return null;
}

export async function signSessionToken(payload: SessionPayload): Promise<string | null> {
  const secret = getSecretKey();
  if (!secret) return null;

  return new jose.SignJWT({
    role: payload.role,
    accountStatus: payload.accountStatus
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(SESSION_MAX_AGE_SEC / 86400)}d`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const secret = getSecretKey();
  if (!secret) return null;

  try {
    const { payload } = await jose.jwtVerify(token, secret);
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

function shouldUseSecureCookies(request?: Request): boolean {
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
