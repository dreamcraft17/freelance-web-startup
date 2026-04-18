import { loginSchema } from "@acme/validators";
import { AuthService } from "@/server/services/auth.service";
import { parseJson } from "@/server/http/route-helpers";
import { jsonFail, jsonOk, jsonRateLimited, withApiHandler } from "@/server/http/api-response";
import { DomainError } from "@/server/errors/domain-errors";
import { buildSessionSetCookieHeader } from "@src/lib/session";
import {
  authLoginIpLimiter,
  clearFailedLogin,
  consumeRateLimitOr429,
  getClientIp,
  getLoginAttemptState,
  isContentLengthWithinLimit,
  recordFailedLogin
} from "@/server/security";

const authService = new AuthService();

const LOGIN_IP_PER_MIN = 12;
const LOGIN_LOCK_MESSAGE = "Too many sign-in attempts. Please try again later.";

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const ipLimited = consumeRateLimitOr429(authLoginIpLimiter, `login:${ip}`, LOGIN_IP_PER_MIN, 60_000);
    if (ipLimited) return ipLimited;

    if (!isContentLengthWithinLimit(request)) {
      return jsonFail("Request body too large", 413, "PAYLOAD_TOO_LARGE");
    }

    const parsed = await parseJson(request, loginSchema);
    if (!parsed.ok) return parsed.response;

    const emailNorm = parsed.data.email.toLowerCase().trim();
    const lock = getLoginAttemptState(ip, emailNorm);
    if (lock.locked) {
      return jsonRateLimited(LOGIN_LOCK_MESSAGE, lock.retryAfterSec);
    }

    try {
      const { token, session } = await authService.login(parsed.data);
      clearFailedLogin(ip, emailNorm);
      const res = jsonOk({ session }, 200);
      res.headers.append("Set-Cookie", buildSessionSetCookieHeader(token, request));
      return res;
    } catch (err) {
      if (err instanceof DomainError && err.code === "INVALID_CREDENTIALS") {
        recordFailedLogin(ip, emailNorm);
        return jsonFail("Invalid email or password", 401, "INVALID_CREDENTIALS");
      }
      throw err;
    }
  });
}
