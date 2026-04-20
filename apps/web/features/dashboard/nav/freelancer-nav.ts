import type { DashboardNavItem } from "../nav-types";

export const freelancerNavItems: DashboardNavItem[] = [
  { href: "/freelancer", labelKey: "dashboardNav.freelancer.overview", sectionKey: "dashboardNav.freelancer.sectionWork" },
  { href: "/freelancer/profile", labelKey: "dashboardNav.freelancer.profile" },
  { href: "/freelancer/proposals", labelKey: "dashboardNav.freelancer.proposals" },
  { href: "/freelancer/nearby", labelKey: "dashboardNav.freelancer.nearby" },
  { href: "/messages", labelKey: "dashboardNav.freelancer.messages", sectionKey: "dashboardNav.freelancer.sectionInbox" },
  { href: "/notifications", labelKey: "dashboardNav.freelancer.notifications" },
  { href: "/settings", labelKey: "dashboardNav.freelancer.settings", sectionKey: "dashboardNav.freelancer.sectionAccount" }
];
