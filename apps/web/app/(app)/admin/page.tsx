import { AdminOverviewDashboard } from "@/features/admin/components/overview/AdminOverviewDashboard";
import { getAdminOverviewData } from "@/features/admin/data/overview-data";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function AdminOverviewPage() {
  await requireAdminAccess("overview");
  const { locale } = await getServerTranslator();
  const data = await getAdminOverviewData(locale);
  return <AdminOverviewDashboard data={data} />;
}
