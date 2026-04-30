import { NextResponse } from "next/server";
import type { ZodType, ZodTypeDef, ZodError } from "zod";
import type { AuthActor } from "@/server/domain/auth-actor";

export type { AuthActor };

/** Field names whose validation messages must not echo schema hints (length rules, format) to the client. */
const SENSITIVE_VALIDATION_FIELDS = new Set([
  "password",
  "confirmPassword",
  "currentPassword",
  "newPassword",
  "oldPassword",
  "token",
  "accessToken",
  "refreshToken"
]);

/**
 * Redacts Zod `flatten().fieldErrors` entries for sensitive keys so responses never
 * disclose password-policy hints, token shape hints, or echoed input via custom refinements.
 */
export function redactSensitiveValidationDetails(flat: ReturnType<ZodError["flatten"]>) {
  const fieldErrors = { ...flat.fieldErrors };
  for (const key of Object.keys(fieldErrors)) {
    if (SENSITIVE_VALIDATION_FIELDS.has(key) && fieldErrors[key]?.length) {
      fieldErrors[key] = ["Invalid value"];
    }
  }
  return { formErrors: flat.formErrors, fieldErrors };
}

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
        {
          success: false,
          error: "Invalid query parameters",
          details: redactSensitiveValidationDetails(parsed.error.flatten())
        },
        { status: 400 }
      )
    };
  }
  return { ok: true as const, data: parsed.data };
}

export async function parseJson<Output, Input>(request: Request, schema: ZodType<Output, ZodTypeDef, Input>) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: redactSensitiveValidationDetails(parsed.error.flatten())
        },
        { status: 400 }
      )
    };
  }

  return { ok: true as const, data: parsed.data };
}
