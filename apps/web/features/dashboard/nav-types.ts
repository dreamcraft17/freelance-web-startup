export type DashboardNavItem = {
  href: string;
  /** i18n key (e.g. `dashboardNav.client.overview`) */
  labelKey: string;
  /** Optional section heading key — shown when it changes from the previous item */
  sectionKey?: string;
};
