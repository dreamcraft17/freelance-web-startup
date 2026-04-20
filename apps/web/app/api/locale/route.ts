import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE } from "@/lib/i18n/constants";
import { isAppLocale } from "@/lib/i18n/types";

const bodySchema = z.object({
  locale: z.string()
});

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || !isAppLocale(parsed.data.locale)) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, locale: parsed.data.locale });
  res.cookies.set(LOCALE_COOKIE, parsed.data.locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res;
}
