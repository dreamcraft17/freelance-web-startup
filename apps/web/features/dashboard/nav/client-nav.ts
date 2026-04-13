import type { DashboardNavItem } from "../nav-types";

export const clientNavItems: DashboardNavItem[] = [
  { href: "/client", label: "Overview", section: "Hiring" },
  { href: "/client/jobs", label: "My jobs" },
  { href: "/client/jobs/new", label: "Post a job" },
  { href: "/client/nearby", label: "Nearby talent" },
  { href: "/messages", label: "Messages", section: "Inbox" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings", section: "Account" }
];
