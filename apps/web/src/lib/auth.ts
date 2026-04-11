import { cookies } from "next/headers";
import type { AuthActor } from "@/server/domain/auth-actor";
import { getSessionFromRequest, verifySessionToken, SESSION_COOKIE_NAME } from "@src/lib/session";
import type { SessionPayload } from "@src/lib/session";
import { requireActiveAccount, requireAuth, requireRole } from "@src/server/policies/access.policy";
import type { UserRole } from "@acme/types";

export type { SessionPayload };

export { getSessionFromRequest, requireAuth, requireRole, requireActiveAccount };

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionToActor(session: SessionPayload): AuthActor {
  return {
    userId: session.userId,
    role: session.role,
    accountStatus: session.accountStatus
  };
}

/** Server-only: load session from cookies, then enforce auth + optional role + active account. */
export async function requireAuthenticatedSession(options?: {
  roles?: UserRole[];
  requireActive?: boolean;
}): Promise<SessionPayload> {
  const session = requireAuth(await getSessionFromCookies());
  if (options?.requireActive !== false) {
    requireActiveAccount(session);
  }
  if (options?.roles?.length) {
    requireRole(session, ...options.roles);
  }
  return session;
}
