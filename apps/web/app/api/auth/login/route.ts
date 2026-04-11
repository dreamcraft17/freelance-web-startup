import { loginSchema } from "@acme/validators";
import { AuthService } from "@/server/services/auth.service";
import { parseJson } from "@/server/http/route-helpers";
import { jsonOk, withApiHandler } from "@/server/http/api-response";
import { buildSessionSetCookieHeader } from "@src/lib/session";

const authService = new AuthService();

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const parsed = await parseJson(request, loginSchema);
    if (!parsed.ok) return parsed.response;
    const { token, session } = await authService.login(parsed.data);
    const res = jsonOk({ session }, 200);
    res.headers.append("Set-Cookie", buildSessionSetCookieHeader(token));
    return res;
  });
}
