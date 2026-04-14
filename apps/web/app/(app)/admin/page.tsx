import { db } from "@acme/database";
import { JobStatus, UserRole, VerificationStatus } from "@acme/types";
import { AdminPageIntro, AdminPanel, AdminStatCard, AdminStatGrid } from "@/features/admin/components/AdminUi";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminOverviewPage() {
  await requireStaffSession("overview");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalFreelancers,
    totalClients,
    openJobs,
    bidsToday,
    pendingVerification,
    totalDonations,
    activeSubscriptions
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, role: UserRole.FREELANCER } }),
    db.user.count({ where: { deletedAt: null, role: UserRole.CLIENT } }),
    db.job.count({ where: { deletedAt: null, status: JobStatus.OPEN } }),
    db.bid.count({ where: { createdAt: { gte: startOfDay } } }),
    db.verificationRequest.count({ where: { status: VerificationStatus.PENDING } }),
    db.donation.aggregate({ _sum: { amount: true } }),
    db.userSubscription.count({ where: { status: "ACTIVE" } })
  ]);

  const totalDonationAmount = totalDonations._sum.amount ? Number(totalDonations._sum.amount) : 0;

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Admin overview"
        description="Operational snapshot across users, hiring activity, moderation queues, and monetization."
        badge="Internal only"
      />

      <AdminStatGrid>
        <AdminStatCard label="Total users" value={String(totalUsers)} />
        <AdminStatCard label="Freelancers" value={String(totalFreelancers)} />
        <AdminStatCard label="Clients" value={String(totalClients)} />
        <AdminStatCard label="Open jobs" value={String(openJobs)} />
        <AdminStatCard label="Bids today" value={String(bidsToday)} />
        <AdminStatCard label="Pending verification" value={String(pendingVerification)} />
        <AdminStatCard label="Donations received" value={`$${totalDonationAmount.toLocaleString()}`} />
        <AdminStatCard label="Active subscriptions" value={String(activeSubscriptions)} />
      </AdminStatGrid>

      <AdminPanel title="Operational notes">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
          <li>Reports moderation queue is scaffolded in `/admin/reports` and ready for integration.</li>
          <li>Feature flags page is currently read-only and suitable for startup operational tracking.</li>
          <li>Use staff roles to scope access by function area (support, moderation, finance).</li>
        </ul>
      </AdminPanel>
    </div>
  );
}

