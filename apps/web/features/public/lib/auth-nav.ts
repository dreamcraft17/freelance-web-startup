import { UserRole } from "@acme/types";
import { homePathForSessionRole } from "@src/lib/return-url";
import type { AppLocale } from "@/lib/i18n/types";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

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

export function primaryActionForRole(role: UserRole, locale: AppLocale): AuthNavAction {
  if (isStaffRole(role)) {
    return { labelKey: "nav.auth.admin", href: "/admin" };
  }
  if (role === UserRole.CLIENT) {
    return { labelKey: "nav.auth.dashboardClient", href: withWorkspaceLocale(locale, "/client") };
  }
  if (role === UserRole.FREELANCER) {
    return { labelKey: "nav.auth.dashboardFreelancer", href: withWorkspaceLocale(locale, "/freelancer") };
  }
  return { labelKey: "nav.auth.dashboardFallback", href: homePathForSessionRole(role, locale) };
}

export function secondaryActionForRole(role: UserRole, locale: AppLocale): AuthNavAction | null {
  if (role === UserRole.CLIENT) {
    return { labelKey: "nav.auth.secondaryPostJob", href: withWorkspaceLocale(locale, "/client/jobs/new") };
  }
  if (role === UserRole.FREELANCER) {
    return { labelKey: "nav.auth.secondaryMessages", href: withWorkspaceLocale(locale, "/messages") };
  }
  return null;
}
