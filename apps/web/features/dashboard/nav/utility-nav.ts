import type { DashboardNavItem } from "../components/DashboardShell";

/** Used for cross-role pages (messages, notifications, settings). */
export const utilityNavItems: DashboardNavItem[] = [
  { href: "/freelancer", label: "Freelancer home" },
  { href: "/client", label: "Client home" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" }
];
