import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { AccountStatus, UserRole } from "@acme/types";
import {
  buildSessionClearCookieHeader,
  buildSessionSetCookieHeader,
  normalizeSessionToken,
  signSessionToken,
  verifySessionToken
} from "./session";

describe("session helpers", () => {
  const originalSecret = process.env.SESSION_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;
  const mutableEnv = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    mutableEnv.SESSION_SECRET = "test-session-secret-0123456789";
    mutableEnv.NODE_ENV = "test";
  });

  afterEach(() => {
    mutableEnv.SESSION_SECRET = originalSecret;
    mutableEnv.NODE_ENV = originalNodeEnv;
  });

  it("normalizes valid tokens and rejects empty or oversized values", () => {
    expect(normalizeSessionToken("  token  ")).toBe("token");
    expect(normalizeSessionToken("")).toBeNull();
    expect(normalizeSessionToken(" ".repeat(10))).toBeNull();
    expect(normalizeSessionToken("x".repeat(12_001))).toBeNull();
  });

  it("signs and verifies a valid session token", async () => {
    const token = await signSessionToken({
      userId: "user_1",
      role: UserRole.CLIENT,
      accountStatus: AccountStatus.ACTIVE
    });
    expect(token).toBeTruthy();

    const payload = await verifySessionToken(token as string);
    expect(payload).toEqual({
      userId: "user_1",
      role: UserRole.CLIENT,
      accountStatus: AccountStatus.ACTIVE
    });
  });

  it("rejects malformed or tampered tokens", async () => {
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
    const token = await signSessionToken({
      userId: "user_2",
      role: UserRole.FREELANCER,
      accountStatus: AccountStatus.ACTIVE
    });
    const badToken = `${token}x`;
    expect(await verifySessionToken(badToken)).toBeNull();
  });

  it("builds set-cookie and clear-cookie headers with secure defaults in production", () => {
    mutableEnv.NODE_ENV = "production";
    const request = new Request("https://nearwork.app/api/auth/login");
    const setHeader = buildSessionSetCookieHeader("abc", request);
    const clearHeader = buildSessionClearCookieHeader(request);

    expect(setHeader).toContain("HttpOnly");
    expect(setHeader).toContain("SameSite=Lax");
    expect(setHeader).toContain("Secure");
    expect(clearHeader).toContain("Max-Age=0");
    expect(clearHeader).toContain("Secure");
  });
});
