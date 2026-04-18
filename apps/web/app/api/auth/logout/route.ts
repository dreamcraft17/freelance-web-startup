import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { withApiHandler } from "@/server/http/api-response";
import { assertMutationCsrf, buildCsrfClearCookieHeader } from "@/server/security";
import { buildSessionClearCookieHeader } from "@src/lib/session";

const authService = new AuthService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const session = await authService.resolveSession(request);
    if (session) {
      const csrf = assertMutationCsrf(request);
      if (csrf) return csrf;
    }

    await authService.logout();
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Cache-Control", "no-store, private");
    res.headers.append("Set-Cookie", buildSessionClearCookieHeader(request));
    res.headers.append("Set-Cookie", buildCsrfClearCookieHeader(request));
    return res;
  });
}
