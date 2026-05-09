import type { DashboardNavItem } from "../nav-types";

export const freelancerNavItems: DashboardNavItem[] = [
  {
    href: "/freelancer",
    labelKey: "dashboardNav.freelancer.overview",
    sectionKey: "dashboardNav.freelancer.sectionWork",
    iconKey: "overview"
  },
  { href: "/freelancer/profile", labelKey: "dashboardNav.freelancer.profile", iconKey: "profile" },
  { href: "/freelancer/proposals", labelKey: "dashboardNav.freelancer.proposals", iconKey: "proposals" },
  { href: "/freelancer/nearby", labelKey: "dashboardNav.freelancer.nearby", iconKey: "nearby" },
  {
    href: "/messages",
    labelKey: "dashboardNav.freelancer.messages",
    sectionKey: "dashboardNav.freelancer.sectionInbox",
    iconKey: "messages"
  },
  { href: "/notifications", labelKey: "dashboardNav.freelancer.notifications", iconKey: "notifications" },
  {
    href: "/settings",
    labelKey: "dashboardNav.freelancer.settings",
    sectionKey: "dashboardNav.freelancer.sectionAccount",
    iconKey: "settings"
  }
];
