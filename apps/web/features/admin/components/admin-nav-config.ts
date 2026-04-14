import type { AdminPageKey } from "../lib/access";

export type AdminNavGroup = "Core" | "Operations" | "Finance" | "Platform";

export type AdminNavItem = {
  href: string;
  label: string;
  section: AdminPageKey;
  group: AdminNavGroup;
};

/** Single source for sidebar labels and route segments (RBAC filters in AdminShell). */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", section: "overview", group: "Core" },
  { href: "/admin/users", label: "Users", section: "users", group: "Core" },
  { href: "/admin/jobs", label: "Jobs", section: "jobs", group: "Operations" },
  { href: "/admin/bids", label: "Bids", section: "bids", group: "Operations" },
  { href: "/admin/contracts", label: "Contracts", section: "contracts", group: "Operations" },
  { href: "/admin/verification", label: "Verification", section: "verification", group: "Operations" },
  { href: "/admin/reviews", label: "Reviews", section: "reviews", group: "Operations" },
  { href: "/admin/reports", label: "Reports", section: "reports", group: "Operations" },
  { href: "/admin/donations", label: "Donations", section: "donations", group: "Finance" },
  { href: "/admin/subscriptions", label: "Subscriptions", section: "subscriptions", group: "Finance" },
  { href: "/admin/feature-flags", label: "Feature Flags", section: "feature-flags", group: "Platform" },
  { href: "/admin/settings", label: "Settings", section: "settings", group: "Platform" }
];

export const ADMIN_NAV_GROUP_ORDER: AdminNavGroup[] = ["Core", "Operations", "Finance", "Platform"];
