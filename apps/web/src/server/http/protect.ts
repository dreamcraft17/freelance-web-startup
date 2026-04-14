import { NextResponse } from "next/server";
import { AccountStatus, UserRole } from "@acme/types";
import type { AuthActor } from "@/server/domain/auth-actor";
import { STAFF_ROLES } from "@/features/admin/lib/access";
import { jsonFail } from "@/server/http/api-response";
import { resolveActorFromRequest } from "@src/lib/auth";

export type ProtectResult = { ok: true; actor: AuthActor } | { ok: false; response: NextResponse };

/** Same allow-list as /admin middleware + RBAC nav (order-independent). */
const STAFF_ROLES_API: UserRole[] = [...STAFF_ROLES];

/** Resolves the actor from the signed session cookie only (same source as middleware). */
export async function requireAuth(request: Request): Promise<ProtectResult> {
  const actor = await resolveActorFromRequest(request);
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
 * Composable gate for API routes: cookie session → optional active check → optional role allow-list.
 */
export async function protect(request: Request, options?: ProtectOptions): Promise<ProtectResult> {
  const auth = await requireAuth(request);
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

/** Client-owned flows; `ADMIN` may pass for staff operations aligned with product rules. */
export async function protectClient(
  request: Request,
  opts?: { requireActive?: boolean }
): Promise<ProtectResult> {
  return protect(request, {
    roles: [UserRole.CLIENT, UserRole.ADMIN],
    requireActiveAccount: opts?.requireActive !== false
  });
}

/** Freelancer-owned flows; `ADMIN` may pass. */
export async function protectFreelancer(
  request: Request,
  opts?: { requireActive?: boolean }
): Promise<ProtectResult> {
  return protect(request, {
    roles: [UserRole.FREELANCER, UserRole.ADMIN],
    requireActiveAccount: opts?.requireActive !== false
  });
}

export async function protectClientOrFreelancer(request: Request): Promise<ProtectResult> {
  return protect(request, {
    roles: [UserRole.CLIENT, UserRole.FREELANCER, UserRole.ADMIN],
    requireActiveAccount: true
  });
}

export async function protectStaff(request: Request): Promise<ProtectResult> {
  const base = await requireAuth(request);
  if (!base.ok) return base;
  const active = requireActiveAccount(base.actor);
  if (!active.ok) return active;
  return requireRoles(base.actor, STAFF_ROLES_API);
}

/** Authenticated user with an ACTIVE account (any role). */
export async function protectAnyActiveUser(request: Request): Promise<ProtectResult> {
  return protect(request, { requireActiveAccount: true });
}
