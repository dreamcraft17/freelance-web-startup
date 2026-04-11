import { NextResponse } from "next/server";
import { AccountStatus, UserRole } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import { jsonFail } from "./api-response";

export type ProtectResult = { ok: true; actor: AuthActor } | { ok: false; response: NextResponse };

const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.SUPPORT_ADMIN
];

function parseActorFromRequest(request: Request): AuthActor | null {
  const userId = request.headers.get("x-user-id")?.trim();
  if (!userId) return null;

  const rawRole = request.headers.get("x-user-role");
  const role = Object.values(UserRole).includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : UserRole.FREELANCER;

  const rawStatus = request.headers.get("x-account-status");
  const accountStatus = Object.values(AccountStatus).includes(rawStatus as AccountStatus)
    ? (rawStatus as AccountStatus)
    : AccountStatus.ACTIVE;

  return { userId, role, accountStatus };
}

/** Requires `x-user-id` (replace with session/JWT in production). */
export function requireAuth(request: Request): ProtectResult {
  const actor = parseActorFromRequest(request);
  if (!actor) {
    return {
      ok: false,
      response: jsonFail("Authentication required", 401, "UNAUTHORIZED")
    };
  }
  return { ok: true, actor };
}

export function requireActiveAccount(actor: AuthActor): ProtectResult {
  if (actor.accountStatus !== AccountStatus.ACTIVE) {
    return {
      ok: false,
      response: jsonFail("Account cannot perform this action", 403, "ACCOUNT_INACTIVE")
    };
  }
  return { ok: true, actor };
}

export function requireRoles(actor: AuthActor, allowed: UserRole[]): ProtectResult {
  if (!allowed.includes(actor.role)) {
    return {
      ok: false,
      response: jsonFail("Insufficient permissions for this resource", 403, "FORBIDDEN_ROLE")
    };
  }
  return { ok: true, actor };
}

export type ProtectOptions = {
  roles?: UserRole[];
  /** When true, only ACTIVE accounts may proceed. Default true for mutating endpoints. */
  requireActiveAccount?: boolean;
};

/**
 * Composable gate for API routes: auth → optional active check → optional role allow-list.
 */
export function protect(request: Request, options?: ProtectOptions): ProtectResult {
  const auth = requireAuth(request);
  if (!auth.ok) return auth;

  const requireActive = options?.requireActiveAccount !== false;
  if (requireActive) {
    const active = requireActiveAccount(auth.actor);
    if (!active.ok) return active;
  }

  if (options?.roles?.length) {
    const roleCheck = requireRoles(auth.actor, options.roles);
    if (!roleCheck.ok) return roleCheck;
  }

  return { ok: true, actor: auth.actor };
}

export function protectClient(request: Request, opts?: { requireActive?: boolean }): ProtectResult {
  return protect(request, {
    roles: [UserRole.CLIENT],
    requireActiveAccount: opts?.requireActive !== false
  });
}

export function protectFreelancer(request: Request, opts?: { requireActive?: boolean }): ProtectResult {
  return protect(request, {
    roles: [UserRole.FREELANCER],
    requireActiveAccount: opts?.requireActive !== false
  });
}

export function protectClientOrFreelancer(request: Request): ProtectResult {
  return protect(request, {
    roles: [UserRole.CLIENT, UserRole.FREELANCER],
    requireActiveAccount: true
  });
}

export function protectStaff(request: Request): ProtectResult {
  const base = requireAuth(request);
  if (!base.ok) return base;
  const active = requireActiveAccount(base.actor);
  if (!active.ok) return active;
  return requireRoles(base.actor, STAFF_ROLES);
}

/** Authenticated user with an ACTIVE account (any role). */
export function protectAnyActiveUser(request: Request): ProtectResult {
  return protect(request, { requireActiveAccount: true });
}
