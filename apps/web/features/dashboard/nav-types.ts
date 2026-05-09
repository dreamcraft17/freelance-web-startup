/** Optional sidebar icon identifier (filled in DashboardNav via Lucide map). */
export type DashboardNavIconKey =
  | "overview"
  | "profile"
  | "proposals"
  | "nearby"
  | "messages"
  | "notifications"
  | "settings"
  | "clientOverview"
  | "clientJobs"
  | "clientNearby";

export type DashboardNavItem = {
  href: string;
  /** i18n key (e.g. `dashboardNav.client.overview`) */
  labelKey: string;
  /** Optional section heading key — shown when it changes from the previous item */
  sectionKey?: string;
  iconKey?: DashboardNavIconKey;
};
