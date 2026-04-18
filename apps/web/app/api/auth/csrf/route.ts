import { AuthService } from "@/server/services/auth.service";
import {
  buildCsrfSetCookieHeader,
  consumeRateLimitOr429,
  createCsrfToken,
  getClientIp,
  publicReadIpLimiter
} from "@/server/security";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const authService = new AuthService();

/** Mint CSRF cookie for an existing session (e.g. legacy logins without double-submit cookie). */
export async function GET(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(publicReadIpLimiter, `csrfMint:${ip}`, 30, 60_000);
    if (limited) return limited;

    const session = await authService.resolveSession(request);
    if (!session) {
      return jsonFail("Authentication required", 401, "UNAUTHORIZED");
    }
    const token = createCsrfToken();
    const res = jsonOk({ csrfToken: token });
    res.headers.append("Set-Cookie", buildCsrfSetCookieHeader(token, request));
    return res;
  });
}
