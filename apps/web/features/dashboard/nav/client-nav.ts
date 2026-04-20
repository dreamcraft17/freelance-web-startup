import type { DashboardNavItem } from "../nav-types";

export const clientNavItems: DashboardNavItem[] = [
  { href: "/client", labelKey: "dashboardNav.client.overview", sectionKey: "dashboardNav.client.sectionHiring" },
  { href: "/client/jobs", labelKey: "dashboardNav.client.myJobs" },
  { href: "/client/jobs/new", labelKey: "dashboardNav.client.postJob" },
  { href: "/client/nearby", labelKey: "dashboardNav.client.nearbyTalent" },
  { href: "/messages", labelKey: "dashboardNav.client.messages", sectionKey: "dashboardNav.client.sectionInbox" },
  { href: "/notifications", labelKey: "dashboardNav.client.notifications" },
  { href: "/settings", labelKey: "dashboardNav.client.settings", sectionKey: "dashboardNav.client.sectionAccount" }
];
