import { AuthService } from "@/server/services/auth.service";
import {
  buildCsrfSetCookieHeader,
  consumeRateLimitOr429,
  createCsrfToken,
  getClientIp,
  hasCsrfCookie,
  publicReadIpLimiter
} from "@/server/security";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { buildSessionSetCookieHeader } from "@/lib/session";

const authService = new AuthService();

/**
 * Re-issues the session cookie when the current JWT is still valid.
 * Cookie is 7d, SameSite=Lax, HttpOnly — each refresh slides Max-Age/Expires (sliding reissue).
 */
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `sessionRefresh:${ip}`, 30, 60_000);
    if (limited) return limited;

    const session = await authService.resolveSession(request);
    if (!session) {
      return jsonFail("Authentication required", 401, "UNAUTHORIZED");
    }

    const { token, session: dto } = await authService.refreshSession(session);
    const res = jsonOk({ session: dto });
    res.headers.append("Set-Cookie", buildSessionSetCookieHeader(token, request));
    if (!hasCsrfCookie(request)) {
      res.headers.append("Set-Cookie", buildCsrfSetCookieHeader(createCsrfToken(), request));
    }
    return res;
  });
}
