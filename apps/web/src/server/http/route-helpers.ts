import { NextResponse } from "next/server";
import type { ZodType, ZodTypeDef } from "zod";
import type { AuthActor } from "@/server/domain/auth-actor";

export type { AuthActor };

/** `ZodSchema<T>` sets Input = Output and widens `.default()` fields; `ZodType<Out, _, In>` preserves parsed output. */
export function parseSearchParams<Output, Input>(
  url: URL,
  schema: ZodType<Output, ZodTypeDef, Input>
) {
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

export async function parseJson<Output, Input>(request: Request, schema: ZodType<Output, ZodTypeDef, Input>) {
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
