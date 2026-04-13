import type { DashboardNavItem } from "../nav-types";

/** Used for cross-role pages (messages, notifications, settings). */
export const utilityNavItems: DashboardNavItem[] = [
  { href: "/freelancer", label: "Freelancer home", section: "Go to" },
  { href: "/client", label: "Client home" },
  { href: "/messages", label: "Messages", section: "Inbox" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings#saved-jobs", label: "Saved", section: "Account" },
  { href: "/settings", label: "Settings", section: "Account" }
];
