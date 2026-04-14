import { UserRole } from "@acme/types";

export const STAFF_ROLES = [
  UserRole.ADMIN,
  UserRole.SUPPORT_ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE_ADMIN
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type AdminSectionKey =
  | "overview"
  | "users"
  | "jobs"
  | "bids"
  | "contracts"
  | "verification"
  | "reviews"
  | "reports"
  | "donations"
  | "subscriptions"
  | "feature-flags"
  | "settings";

const FULL: AdminSectionKey[] = [
  "overview",
  "users",
  "jobs",
  "bids",
  "contracts",
  "verification",
  "reviews",
  "reports",
  "donations",
  "subscriptions",
  "feature-flags",
  "settings"
];

const SUPPORT: AdminSectionKey[] = ["overview", "users", "jobs", "bids", "contracts", "settings"];
const MODERATION: AdminSectionKey[] = ["overview", "jobs", "verification", "reviews", "reports", "settings"];
const FINANCE: AdminSectionKey[] = ["overview", "donations", "subscriptions", "settings"];

export function isStaffRole(role: UserRole): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

export function allowedSectionsForRole(role: UserRole): AdminSectionKey[] {
  switch (role) {
    case UserRole.ADMIN:
      return FULL;
    case UserRole.SUPPORT_ADMIN:
      return SUPPORT;
    case UserRole.MODERATOR:
      return MODERATION;
    case UserRole.FINANCE_ADMIN:
      return FINANCE;
    default:
      return [];
  }
}

export function canAccessAdminSection(role: UserRole, section: AdminSectionKey): boolean {
  return allowedSectionsForRole(role).includes(section);
}

