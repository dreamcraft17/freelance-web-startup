import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { AccountStatus, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";

export type { AuthActor };

export function parseSearchParams<T>(url: URL, schema: ZodSchema<T>) {
  const parsed = schema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    };
  }
  return { ok: true as const, data: parsed.data };
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    };
  }

  return { ok: true as const, data: parsed.data };
}

/**
 * Temporary until session middleware supplies the real principal.
 * Production: replace with validated session / JWT claims.
 */
export function getAuthActor(request: Request): AuthActor {
  const rawRole = request.headers.get("x-user-role");
  const role = Object.values(UserRole).includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : UserRole.FREELANCER;

  const rawStatus = request.headers.get("x-account-status");
  const accountStatus = Object.values(AccountStatus).includes(rawStatus as AccountStatus)
    ? (rawStatus as AccountStatus)
    : AccountStatus.ACTIVE;

  return {
    userId: request.headers.get("x-user-id") ?? "dev-user-id",
    role,
    accountStatus
  };
}

/** @deprecated Use getAuthActor */
export const getActorFromHeaders = getAuthActor;
