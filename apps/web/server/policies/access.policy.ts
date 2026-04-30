import { AccountStatus, UserRole } from "@acme/types";
import { DomainError, PolicyDeniedError } from "@/server/errors/domain-errors";
import type { SessionPayload } from "@/lib/session";

export function requireAuth(session: SessionPayload | null): SessionPayload {
  if (!session) {
    throw new DomainError("Authentication required", "UNAUTHORIZED", 401);
  }
  return session;
}

export function requireRole(session: SessionPayload, ...allowed: UserRole[]): SessionPayload {
  if (!allowed.includes(session.role)) {
    throw new PolicyDeniedError("Insufficient permissions for this resource");
  }
  return session;
}

export function requireActiveAccount(session: SessionPayload): SessionPayload {
  if (session.accountStatus !== AccountStatus.ACTIVE) {
    throw new DomainError("Account cannot perform this action", "ACCOUNT_INACTIVE", 403);
  }
  return session;
}
