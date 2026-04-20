import type { DashboardNavItem } from "../nav-types";

/** Used for cross-role pages (messages, notifications, settings). */
export const utilityNavItems: DashboardNavItem[] = [
  { href: "/freelancer", labelKey: "dashboardNav.utility.freelancerHome", sectionKey: "dashboardNav.utility.sectionGoTo" },
  { href: "/client", labelKey: "dashboardNav.utility.clientHome" },
  { href: "/messages", labelKey: "dashboardNav.utility.messages", sectionKey: "dashboardNav.utility.sectionInbox" },
  { href: "/notifications", labelKey: "dashboardNav.utility.notifications" },
  { href: "/settings#saved-jobs", labelKey: "dashboardNav.utility.saved", sectionKey: "dashboardNav.utility.sectionAccount" },
  { href: "/settings", labelKey: "dashboardNav.utility.settings", sectionKey: "dashboardNav.utility.sectionAccount" }
];
