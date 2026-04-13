import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { withApiHandler } from "@/server/http/api-response";
import { buildSessionClearCookieHeader } from "@src/lib/session";

const authService = new AuthService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await authService.logout();
    const res = new NextResponse(null, { status: 204 });
    res.headers.append("Set-Cookie", buildSessionClearCookieHeader(request));
    return res;
  });
}
