import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import type { AuthActor } from "@/server/domain/auth-actor";

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
