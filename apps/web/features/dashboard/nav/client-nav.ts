import type { DashboardNavItem } from "../components/DashboardShell";

export const clientNavItems: DashboardNavItem[] = [
  { href: "/client", label: "Overview" },
  { href: "/client/jobs", label: "My jobs" },
  { href: "/client/jobs/new", label: "Post a job" },
  { href: "/client/nearby", label: "Nearby talent" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" }
];
