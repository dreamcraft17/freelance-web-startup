import type { Route } from "next";
import { redirect } from "next/navigation";
import { AccountStatus, type UserRole } from "@acme/types";
import { getSessionFromCookies, homePathForSessionRole } from "@src/lib/auth";
import {
  canAccessAdminPageKey,
  STAFF_ROLES,
  type AdminPageKey
} from "./access";

export type { AdminPageKey };

/**
 * Session exists, ACTIVE, and staff role — matches `protectStaff()` + middleware /admin gate.
 * Non-staff → their product home; inactive → /forbidden.
 */
export async function requireStaffSession() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?returnUrl=/admin");
  if (session.accountStatus !== AccountStatus.ACTIVE) {
    redirect("/forbidden");
  }
  if (!(STAFF_ROLES as readonly UserRole[]).includes(session.role)) {
    redirect(homePathForSessionRole(session.role) as Route);
  }
  return session;
}

/**
 * Staff session + RBAC for a specific admin page.
 * Use in each /admin route (and keep layout on requireStaffSession only).
 */
export async function requireAdminAccess(page: AdminPageKey) {
  const session = await requireStaffSession();
  if (!canAccessAdminPageKey(session.role, page)) {
    redirect("/forbidden");
  }
  return session;
}
