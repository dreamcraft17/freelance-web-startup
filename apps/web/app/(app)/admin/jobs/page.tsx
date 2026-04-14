import { db } from "@acme/database";
import { JobStatus } from "@acme/types";
import { AdminPageIntro, AdminPanel, AdminEmptyState } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminJobsPage() {
  await requireStaffSession("jobs");
  const jobs = await db.job.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 120,
    select: {
      id: true,
      title: true,
      status: true,
      workMode: true,
      city: true,
      updatedAt: true,
      clientProfile: { select: { displayName: true } }
    }
  });
  const openCount = jobs.filter((j) => j.status === JobStatus.OPEN).length;

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Jobs"
        description="Operational job inspection view for moderation, support, and quality checks."
      />
      <AdminPanel title={`Latest jobs (${jobs.length}) · Open now ${openCount}`}>
        {jobs.length === 0 ? (
          <AdminEmptyState title="No jobs yet" copy="No job records available for this scope." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Client</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Mode</th>
                <th className="px-2 py-2">City</th>
                <th className="px-2 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-2 py-2">{j.title}</td>
                  <td className="px-2 py-2">{j.clientProfile?.displayName ?? "—"}</td>
                  <td className="px-2 py-2">{j.status}</td>
                  <td className="px-2 py-2">{j.workMode}</td>
                  <td className="px-2 py-2">{j.city ?? "—"}</td>
                  <td className="px-2 py-2">{j.updatedAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}

