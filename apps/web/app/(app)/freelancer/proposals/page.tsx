import { redirect } from "next/navigation";
import Link from "next/link";
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
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">
            Track every bid you have sent and focus on responses that need action.
          </p>
          <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
            Find more jobs
          </Link>
          <Link href="/freelancer/profile" className="text-sm font-semibold text-slate-600 hover:underline">
            Update profile
          </Link>
        </div>
      </header>

      <FreelancerProposalsWorkspace hasProfile={Boolean(profile)} proposals={proposals} />
    </div>
  );
}
