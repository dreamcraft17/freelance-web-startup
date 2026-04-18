import { NextResponse } from "next/server";
import { DomainError } from "../errors/domain-errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonFail(
  message: string,
  status: number,
  code?: string,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: message, ...(code ? { code } : {}), ...(details !== undefined ? { details } : {}) },
    { status }
  );
}

/** Rate limit / lockout responses — safe, minimal payload. */
export function jsonRateLimited(message: string, retryAfterSec?: number) {
  const headers = new Headers();
  if (retryAfterSec != null && Number.isFinite(retryAfterSec)) {
    headers.set("Retry-After", String(Math.min(Math.max(1, Math.floor(retryAfterSec)), 86_400)));
  }
  return NextResponse.json(
    { success: false, error: message, code: "RATE_LIMITED" as const },
    { status: 429, headers }
  );
}

export function mapDomainErrorToResponse(error: unknown): NextResponse | null {
  if (error instanceof DomainError) {
    return jsonFail(error.message, error.status, error.code);
  }
  return null;
}

function logUnhandledApiError(error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    const name = error instanceof Error ? error.name : typeof error;
    console.error("[nearwork:api] unhandled_error", { name });
  } else {
    console.error("[nearwork:api] unhandled_error", error);
  }
}

export async function withApiHandler(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    const mapped = mapDomainErrorToResponse(error);
    if (mapped) return mapped;
    logUnhandledApiError(error);
    return jsonFail("Internal server error", 500, "INTERNAL_ERROR");
  }
}
