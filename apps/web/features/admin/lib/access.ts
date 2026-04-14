import { UserRole } from "@acme/types";

/** Staff roles allowed into the /admin workspace (non-staff → /forbidden). */
export const STAFF_ROLES = [
  UserRole.ADMIN,
  UserRole.SUPPORT_ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE_ADMIN
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Logical admin pages (maps to /admin and /admin/... routes).
 * Used for role-to-page checks and nav visibility.
 */
export type AdminPageKey =
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

/** @deprecated Use AdminPageKey — kept for incremental refactors */
export type AdminSectionKey = AdminPageKey;

const FULL: AdminPageKey[] = [
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

/** SUPPORT_ADMIN: users, jobs, bids, contracts, verification, reviews, settings (+ overview) */
const SUPPORT: AdminPageKey[] = [
  "overview",
  "users",
  "jobs",
  "bids",
  "contracts",
  "verification",
  "reviews",
  "settings"
];

/** MODERATOR: jobs, verification, reviews, reports (+ overview) — no settings per matrix */
const MODERATION: AdminPageKey[] = ["overview", "jobs", "verification", "reviews", "reports"];

/** FINANCE_ADMIN: donations, subscriptions, feature-flags, settings (+ overview) */
const FINANCE: AdminPageKey[] = ["overview", "donations", "subscriptions", "feature-flags", "settings"];

/**
 * Human-readable matrix (single source of truth for product docs).
 * ADMIN: implicit full access to all AdminPageKey values.
 */
/** Non-admin staff: which pages they may open (ADMIN always has full access). */
export const ADMIN_ACCESS_MATRIX: Readonly<
  Record<Exclude<StaffRole, UserRole.ADMIN>, AdminPageKey[]>
> = {
  [UserRole.SUPPORT_ADMIN]: SUPPORT,
  [UserRole.MODERATOR]: MODERATION,
  [UserRole.FINANCE_ADMIN]: FINANCE
} as const;

const PATH_SEGMENT_TO_PAGE: Record<string, AdminPageKey> = {
  users: "users",
  jobs: "jobs",
  bids: "bids",
  contracts: "contracts",
  verification: "verification",
  reviews: "reviews",
  reports: "reports",
  donations: "donations",
  subscriptions: "subscriptions",
  "feature-flags": "feature-flags",
  settings: "settings"
};

function normalizePathname(pathname: string): string {
  const p = pathname.toLowerCase();
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

/**
 * First URL segment under /admin mapped to a page key, or:
 * - `null` if the path is not under /admin
 * - `"unknown"` if under /admin but not a recognized first segment (only ADMIN may access)
 */
export function parseAdminPathname(pathname: string): AdminPageKey | "unknown" | null {
  const p = normalizePathname(pathname);
  if (p === "/admin") return "overview";
  if (!p.startsWith("/admin/")) return null;
  const rest = p.slice("/admin/".length);
  const first = rest.split("/").filter(Boolean)[0];
  if (!first) return "overview";
  const page = PATH_SEGMENT_TO_PAGE[first];
  if (page) return page;
  return "unknown";
}

export function isStaffRole(role: UserRole): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

export function allowedSectionsForRole(role: UserRole): AdminPageKey[] {
  if (role === UserRole.ADMIN) return [...FULL];
  const row = ADMIN_ACCESS_MATRIX[role as keyof typeof ADMIN_ACCESS_MATRIX];
  return row ? [...row] : [];
}

/** @deprecated Prefer canAccessAdminPage(role, pathname) or canAccessAdminPageKey */
export function canAccessAdminSection(role: UserRole, section: AdminPageKey): boolean {
  return allowedSectionsForRole(role).includes(section);
}

export function canAccessAdminPageKey(role: UserRole, page: AdminPageKey): boolean {
  return canAccessAdminSection(role, page);
}

/**
 * Whether `role` may access this pathname under /admin.
 * Unknown routes (e.g. /admin/experimental) → only ADMIN.
 */
export function canAccessAdminPage(role: UserRole, pathname: string): boolean {
  const key = parseAdminPathname(pathname);
  if (key === null) return false;
  if (key === "unknown") return role === UserRole.ADMIN;
  return canAccessAdminPageKey(role, key);
}
