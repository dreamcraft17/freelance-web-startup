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

const MAX_RETURN_URL_LEN = 2048;

/** Paths that must never be used as post-login return targets (prevents /login → /login loops). */
function isDisallowedReturnPath(pathOnly: string): boolean {
  const p = pathOnly.toLowerCase();
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
 * Same-origin relative return URL only. Rejects open redirects, auth pages, and oversized values.
 */
export function sanitizeReturnUrl(raw: string | null | undefined, fallback: string): string {
  if (raw == null) return fallback;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_RETURN_URL_LEN) return fallback;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("@") || trimmed.includes("\\") || trimmed.includes("\0")) return fallback;

  const q = trimmed.indexOf("?");
  const pathOnly = (q === -1 ? trimmed : trimmed.slice(0, q)) || "/";
  if (isDisallowedReturnPath(pathOnly)) return fallback;

  return trimmed;
}

/** Default app home after sign-in when no safe returnUrl is provided. */
export function homePathForSessionRole(role: UserRole): string {
  switch (role) {
    case UserRole.FREELANCER:
      return "/freelancer";
    case UserRole.CLIENT:
      return "/client";
    default:
      return "/client";
  }
}

export function sessionCookieMaxAgeSec(): number {
  return SESSION_MAX_AGE_SEC;
}

export function buildSessionSetCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SEC}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildSessionClearCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
