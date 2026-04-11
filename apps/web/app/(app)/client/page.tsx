import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionFromCookies } from "@src/lib/auth";
import { db } from "@acme/database";

type ClientDashboardJob = {
  id: string;
  title: string;
  slug: string;
  status: string;
  workMode: string;
  city: string | null;
  createdAt: Date;
  _count: { bids: number };
};

export default async function ClientDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client");
  }

  const clientProfile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true, displayName: true }
  });

  const jobs: ClientDashboardJob[] = clientProfile
    ? await db.job.findMany({
        where: { clientProfileId: clientProfile.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          workMode: true,
          city: true,
          createdAt: true,
          _count: { select: { bids: true } }
        }
      })
    : [];

  return (
    <>
      <PageHeader
        title="Client overview"
        description={
          clientProfile
            ? `Hiring as ${clientProfile.displayName}. Your listings and bid counts are loaded from the database.`
            : "Create a client company profile to post jobs. You can still explore the product from here."
        }
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Your jobs</h2>
        {!clientProfile ? (
          <p className="text-muted-foreground text-sm">
            No client profile on this account yet.{" "}
            <Link href="/settings" className="text-primary font-medium underline-offset-4 hover:underline">
              Complete setup
            </Link>
          </p>
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            You have not posted any jobs yet.{" "}
            <Link href="/client/jobs/new" className="text-primary font-medium underline-offset-4 hover:underline">
              Post a job
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {job.status} · {job.workMode}
                      {job.city ? ` · ${job.city}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    {job._count.bids} bid{job._count.bids === 1 ? "" : "s"} · Posted {job.createdAt.toLocaleDateString()}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
