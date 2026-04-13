import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  FreelancerProposalsWorkspace,
  type FreelancerProposalRow
} from "@/components/freelancer/FreelancerProposalsWorkspace";

export default async function FreelancerProposalsPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer/proposals");
  }

  const profile = await db.freelancerProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true }
  });

  const bids = profile
    ? await db.bid.findMany({
        where: { freelancerId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              currency: true
            }
          }
        }
      })
    : [];

  const proposals: FreelancerProposalRow[] = bids.map((b) => ({
    id: b.id,
    status: b.status,
    amount: Number(b.bidAmount),
    currency: b.job.currency,
    createdAt: b.createdAt.toISOString(),
    estimatedDays: b.estimatedDays,
    job: { id: b.job.id, title: b.job.title }
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <header className="border-b border-slate-200/80 pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Freelancer</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Proposals
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Track every bid you have sent—amount, job, and how clients have responded—without digging through email.
        </p>
      </header>

      <FreelancerProposalsWorkspace hasProfile={Boolean(profile)} proposals={proposals} />
    </div>
  );
}
