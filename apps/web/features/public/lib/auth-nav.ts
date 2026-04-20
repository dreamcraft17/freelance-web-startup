import { UserRole } from "@acme/types";
import { homePathForSessionRole } from "@src/lib/return-url";

export type PublicSessionLite = {
  userId: string;
  role: UserRole;
  accountStatus: string;
};

export type AuthNavAction = {
  labelKey: string;
  href: string;
};

function isStaffRole(role: UserRole): boolean {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.SUPPORT_ADMIN ||
    role === UserRole.MODERATOR ||
    role === UserRole.FINANCE_ADMIN
  );
}

export function primaryActionForRole(role: UserRole): AuthNavAction {
  if (isStaffRole(role)) {
    return { labelKey: "nav.auth.admin", href: "/admin" };
  }
  if (role === UserRole.CLIENT) {
    return { labelKey: "nav.auth.dashboardClient", href: "/client" };
  }
  if (role === UserRole.FREELANCER) {
    return { labelKey: "nav.auth.dashboardFreelancer", href: "/freelancer" };
  }
  return { labelKey: "nav.auth.dashboardFallback", href: homePathForSessionRole(role) };
}

export function secondaryActionForRole(role: UserRole): AuthNavAction | null {
  if (role === UserRole.CLIENT) return { labelKey: "nav.auth.secondaryPostJob", href: "/client/jobs/new" };
  if (role === UserRole.FREELANCER) return { labelKey: "nav.auth.secondaryMessages", href: "/messages" };
  return null;
}
