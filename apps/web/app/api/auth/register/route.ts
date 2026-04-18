import { registerSchema } from "@acme/validators";
import { AuthService } from "@/server/services/auth.service";
import { parseJson } from "@/server/http/route-helpers";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";
import { buildSessionSetCookieHeader } from "@src/lib/session";
import {
  authRegisterIpLimiter,
  consumeRateLimitOr429,
  getClientIp,
  isContentLengthWithinLimit
} from "@/server/security";

const authService = new AuthService();

const REGISTER_IP_PER_MIN = 8;

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = getClientIp(request);
    const limited = consumeRateLimitOr429(authRegisterIpLimiter, `register:${ip}`, REGISTER_IP_PER_MIN, 60_000);
    if (limited) return limited;

    if (!isContentLengthWithinLimit(request)) {
      return jsonFail("Request body too large", 413, "PAYLOAD_TOO_LARGE");
    }

    const parsed = await parseJson(request, registerSchema);
    if (!parsed.ok) return parsed.response;
    const { token, session } = await authService.register(parsed.data);
    const res = jsonOk({ session }, 201);
    res.headers.append("Set-Cookie", buildSessionSetCookieHeader(token, request));
    return res;
  });
}
