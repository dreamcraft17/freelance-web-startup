import { UserRole } from "@acme/types";
import { homePathForSessionRole } from "@src/lib/return-url";

export type PublicSessionLite = {
  userId: string;
  role: UserRole;
  accountStatus: string;
};

export type AuthNavAction = {
  label: string;
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
    return { label: "Admin", href: "/admin" };
  }
  if (role === UserRole.CLIENT) {
    return { label: "Dashboard", href: "/client" };
  }
  if (role === UserRole.FREELANCER) {
    return { label: "Dashboard", href: "/freelancer" };
  }
  return { label: "Dashboard", href: homePathForSessionRole(role) };
}

export function secondaryActionForRole(role: UserRole): AuthNavAction | null {
  if (role === UserRole.CLIENT) return { label: "Post a job", href: "/client/jobs/new" };
  if (role === UserRole.FREELANCER) return { label: "Messages", href: "/messages" };
  return null;
}
