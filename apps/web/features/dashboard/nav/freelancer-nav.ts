import type { DashboardNavItem } from "../nav-types";

export const freelancerNavItems: DashboardNavItem[] = [
  { href: "/freelancer", label: "Overview", section: "Work" },
  { href: "/freelancer/profile", label: "Profile" },
  { href: "/freelancer/proposals", label: "Proposals" },
  { href: "/freelancer/nearby", label: "Nearby" },
  { href: "/messages", label: "Messages", section: "Inbox" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings", section: "Account" }
];
