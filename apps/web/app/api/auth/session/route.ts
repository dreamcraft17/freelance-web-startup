import { AuthService } from "@/server/services/auth.service";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const authService = new AuthService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const session = await authService.resolveSession(request);
    if (!session) {
      return jsonFail("Authentication required", 401, "UNAUTHORIZED");
    }
    const data = await authService.getSession(session);
    return jsonOk(data);
  });
}
