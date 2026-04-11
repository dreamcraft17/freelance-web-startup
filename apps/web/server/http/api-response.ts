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

export function mapDomainErrorToResponse(error: unknown): NextResponse | null {
  if (error instanceof DomainError) {
    return jsonFail(error.message, error.status, error.code);
  }
  return null;
}

export async function withApiHandler(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    const mapped = mapDomainErrorToResponse(error);
    if (mapped) return mapped;
    return jsonFail("Internal server error", 500, "INTERNAL_ERROR");
  }
}
