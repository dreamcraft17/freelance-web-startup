import { redirect } from "next/navigation";
import type { UserRole } from "@acme/types";
import { getSessionFromCookies } from "@src/lib/auth";
import { canAccessAdminSection, STAFF_ROLES, type AdminSectionKey } from "./access";

export async function requireStaffSession(section?: AdminSectionKey) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?returnUrl=/admin");
  if (!(STAFF_ROLES as readonly UserRole[]).includes(session.role)) {
    redirect("/forbidden");
  }
  if (section && !canAccessAdminSection(session.role, section)) {
    redirect("/forbidden");
  }
  return session;
}

