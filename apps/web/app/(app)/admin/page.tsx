import { AdminOverviewDashboard } from "@/features/admin/components/overview/AdminOverviewDashboard";
import { getAdminOverviewData } from "@/features/admin/data/overview-data";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminOverviewPage() {
  await requireAdminAccess("overview");
  const data = await getAdminOverviewData();
  return <AdminOverviewDashboard data={data} />;
}
