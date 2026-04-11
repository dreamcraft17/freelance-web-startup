import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";
import { JobService } from "@/server/services/job.service";

function money(amount: unknown, currency: string): string {
  const n = amount != null && typeof (amount as { toString?: () => string }).toString === "function" ? Number(amount) : NaN;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

export default async function FreelancerDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer");
  }

  const profile = await db.freelancerProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true, username: true, fullName: true }
  });

  const bids = profile
    ? await db.bid.findMany({
        where: { freelancerId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              workMode: true,
              currency: true
            }
          }
        }
      })
    : [];

  const jobService = new JobService();
  const { items: openJobs, total: openTotal } = await jobService.listOpenJobs({ page: 1, limit: 9 });

  return (
    <>
      <PageHeader
        title="Freelancer overview"
        description={
          profile
            ? `Signed in as ${profile.fullName} (@${profile.username}). Recent bids and open jobs load from the database.`
            : "Create your freelancer profile to start bidding. Open roles below are still available to browse."
        }
      />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Your bids</h2>
        {!profile ? (
          <p className="text-muted-foreground text-sm">
            No freelancer profile on this account yet.{" "}
            <Link href="/settings" className="text-primary font-medium underline-offset-4 hover:underline">
              Complete setup
            </Link>
          </p>
        ) : bids.length === 0 ? (
          <p className="text-muted-foreground text-sm">You have not submitted any bids yet.</p>
        ) : (
          <ul className="space-y-3">
            {bids.map((bid) => (
              <li key={bid.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Link href={`/jobs/${bid.job.id}`} className="hover:underline">
                        {bid.job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Status: {bid.status} · Job: {bid.job.status} · {bid.job.workMode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Bid {money(bid.bidAmount, bid.job.currency)}
                    {bid.estimatedDays != null ? ` · ~${bid.estimatedDays} day(s)` : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Open jobs ({openTotal})</h2>
        {openJobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No open listings.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {openJobs.map((job) => (
              <li key={job.id}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {job.workMode}
                      {job.city ? ` · ${job.city}` : ""}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
