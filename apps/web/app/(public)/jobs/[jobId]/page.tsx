import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BidStatus, UserRole } from "@acme/types";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { loginReturnTo, registerFreelancerReturnToJob } from "@/features/auth/lib/register-intents";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { SaveJobButton } from "@/features/saved/components/SaveJobButton";
import { BidDecisionAction } from "@/components/client-jobs/BidDecisionAction";
import { BidConversationAction } from "@/components/client-jobs/BidConversationAction";
import { JobService } from "@/server/services/job.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

function formatMoney(amount: unknown, currency: string): string {
  const n =
    amount != null && typeof (amount as { toString?: () => string }).toString === "function"
      ? Number(amount)
      : NaN;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function budgetLine(job: {
  budgetMin: unknown;
  budgetMax: unknown;
  currency: string;
  budgetType: string;
}): string {
  const min = job.budgetMin;
  const max = job.budgetMax;
  if (min != null && max != null) {
    return `${formatMoney(min, job.currency)} – ${formatMoney(max, job.currency)}`;
  }
  if (min != null) return `From ${formatMoney(min, job.currency)}`;
  if (max != null) return `Up to ${formatMoney(max, job.currency)}`;
  return job.budgetType.replace(/_/g, " ");
}

function locationParts(
  parts: { city?: string | null; country?: string | null }[]
): string | null {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const c = p.city?.trim();
    const co = p.country?.trim();
    if (c && !seen.has(`c:${c}`)) {
      seen.add(`c:${c}`);
      out.push(c);
    } else if (co && !seen.has(`co:${co}`)) {
      seen.add(`co:${co}`);
      out.push(co);
    }
  }
  return out.length > 0 ? out.join(" · ") : null;
}

function formatRelativeTime(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

function profileStrengthHint(completeness: number | null | undefined): string {
  if (completeness == null) return "Profile details limited";
  if (completeness >= 85) return "Profile looks strong";
  if (completeness >= 60) return "Profile is moderately complete";
  return "Profile still sparse";
}

function bidDecisionHint(status: string): string {
  if (status === BidStatus.SHORTLISTED) return "Ready to hire when you're confident";
  if (status === BidStatus.SUBMITTED) return "Shortlist to compare later";
  if (status === BidStatus.ACCEPTED) return "Hiring decision completed";
  return "No decision needed";
}

export default async function JobDetailPage({ params }: PageProps) {
  const { jobId: rawId } = await params;
  const jobId = rawId?.trim() ?? "";
  if (!jobId) notFound();

  const jobService = new JobService();
  const job = await jobService.getJobByIdForPublic(jobId);
  if (!job) notFound();
  const session = await getSessionFromCookies();

  const owner = await db.job.findFirst({
    where: { id: job.id, deletedAt: null },
    select: { clientProfile: { select: { userId: true } } }
  });
  const isClientOwner = Boolean(
    session && owner?.clientProfile.userId === session.userId && session.role === UserRole.CLIENT
  );

  const bidRows = isClientOwner
    ? await db.bid.findMany({
        where: { jobId: job.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          bidAmount: true,
          estimatedDays: true,
          createdAt: true,
          freelancer: { select: { userId: true, fullName: true, username: true } }
        }
      })
    : [];

  const jobThreads = isClientOwner
    ? await db.messageThread.findMany({
        where: {
          type: "JOB",
          jobId: job.id,
          participants: { some: { userId: session!.userId } }
        },
        select: {
          id: true,
          participants: { select: { userId: true } },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true, senderId: true }
          }
        }
      })
    : [];

  const freelancerUserIds = [...new Set(bidRows.map((b) => b.freelancer.userId))];
  const freelancerProfiles = freelancerUserIds.length
    ? await db.freelancerProfile.findMany({
        where: { userId: { in: freelancerUserIds }, deletedAt: null },
        select: { userId: true, city: true, workMode: true, profileCompleteness: true }
      })
    : [];
  const profileMap = new Map(freelancerProfiles.map((p) => [p.userId, p]));

  const conversationMap = new Map<
    string,
    { threadId: string; lastMessageAt: Date | null; awaitingReply: boolean; hasMessages: boolean }
  >();
  if (session) {
    for (const t of jobThreads) {
      const peer = t.participants.find((p) => p.userId !== session.userId);
      if (!peer) continue;
      const last = t.messages[0] ?? null;
      conversationMap.set(peer.userId, {
        threadId: t.id,
        lastMessageAt: last?.createdAt ?? null,
        awaitingReply: Boolean(last && last.senderId !== session.userId),
        hasMessages: Boolean(last)
      });
    }
  }

  const pendingDecisionCount = bidRows.filter((b) => b.status === BidStatus.SUBMITTED).length;
  const shortlistedCount = bidRows.filter((b) => b.status === BidStatus.SHORTLISTED).length;
  const awaitingReplyCount = bidRows.filter((b) => conversationMap.get(b.freelancer.userId)?.awaitingReply).length;

  const categoryLabel = job.subcategory
    ? `${job.category.name} · ${job.subcategory.name}`
    : job.category.name;

  const jobLocation = locationParts([{ city: job.city, country: job.country }]);
  const clientLocation = locationParts([
    { city: job.clientProfile.city, country: job.clientProfile.country }
  ]);

  const bidDeadline =
    job.bidDeadline != null
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(job.bidDeadline)
      : null;

  const returnToThisJob = `/jobs/${job.id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/jobs" className="hover:text-foreground underline-offset-4 hover:underline">
          Browse jobs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Details</span>
      </nav>

      <PageHeader
        title={job.title}
        description={
          [categoryLabel, job.workMode, jobLocation].filter(Boolean).join(" · ") || "Open role"
        }
        actions={<SaveJobButton jobId={job.id} />}
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget</CardTitle>
            <CardDescription>{budgetLine(job)}</CardDescription>
          </CardHeader>
          {bidDeadline ? (
            <CardContent className="text-muted-foreground pt-0 text-sm">Bids close {bidDeadline}</CardContent>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category</CardTitle>
            <CardDescription>{categoryLabel}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
            <CardDescription>
              {job.clientProfile.displayName}
              {job.clientProfile.companyName ? ` · ${job.clientProfile.companyName}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            {job.clientProfile.industry ? <p>{job.clientProfile.industry}</p> : null}
            {clientLocation ? <p>{clientLocation}</p> : null}
            {!job.clientProfile.industry && !clientLocation ? (
              <p className="text-muted-foreground/80">No additional client details.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isClientOwner ? "Bid review" : "Submit a bid"}</CardTitle>
            <CardDescription>
              {isClientOwner
                ? "Compare freelancers by price, profile readiness, and location signals. Start with pending decisions."
                : "Bidding requires a signed-in freelancer account. Browse this page freely; sign in or register when you are ready to propose."}
            </CardDescription>
          </CardHeader>
          {isClientOwner ? (
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pending decision</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{pendingDecisionCount}</p>
                  <p className="text-[11px] text-slate-500">Shortlist to compare, accept when ready</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Shortlisted</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{shortlistedCount}</p>
                  <p className="text-[11px] text-slate-500">Focused candidates for final decision</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total bids</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{bidRows.length}</p>
                  <p className="text-[11px] text-slate-500">Use price + profile + response signals</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Awaiting reply</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{awaitingReplyCount}</p>
                  <p className="text-[11px] text-slate-500">Conversation may need your follow-up</p>
                </div>
              </div>

              {bidRows.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
                  No bids yet. Keep this job open or refine the brief to attract stronger proposals.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2.5">Freelancer</th>
                        <th className="px-3 py-2.5">Price</th>
                        <th className="px-3 py-2.5">Profile strength</th>
                        <th className="px-3 py-2.5">Location / mode</th>
                        <th className="px-3 py-2.5">Conversation</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5 text-right">Next action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bidRows.map((bid) => {
                        const profile = profileMap.get(bid.freelancer.userId);
                        const convo = conversationMap.get(bid.freelancer.userId);
                        return (
                          <tr key={bid.id} className={bid.status === BidStatus.SUBMITTED ? "bg-amber-50/30" : undefined}>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-900">{bid.freelancer.fullName}</p>
                              <p className="text-xs text-slate-500">@{bid.freelancer.username}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Submitted{" "}
                                {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
                                  bid.createdAt
                                )}
                              </p>
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-900">{formatMoney(bid.bidAmount, job.currency)}</p>
                              {bid.estimatedDays != null ? (
                                <p className="text-xs text-slate-500">~{bid.estimatedDays} day timeline</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              {profile?.profileCompleteness != null ? (
                                <div>
                                  <p className="font-medium text-slate-800">{profile.profileCompleteness}% complete</p>
                                  <p className="text-[11px] text-slate-500">{profileStrengthHint(profile.profileCompleteness)}</p>
                                </div>
                              ) : (
                                <span className="text-slate-500">Not available</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">
                              <div>
                                <p>{[profile?.city, profile?.workMode].filter(Boolean).join(" · ") || "Not specified"}</p>
                                {job.city && profile?.city ? (
                                  <p className="text-[11px] text-slate-500">
                                    {job.city.toLowerCase() === profile.city.toLowerCase()
                                      ? "Location relevant (same city)"
                                      : "Different city from job"}
                                  </p>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {!convo ? (
                                <div className="text-slate-500">
                                  <p>No conversation yet</p>
                                  <div className="mt-1">
                                    <BidConversationAction
                                      threadId={null}
                                      jobId={job.id}
                                      freelancerUserId={bid.freelancer.userId}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className={convo.awaitingReply ? "text-[#433C93]" : "text-slate-600"}>
                                  <p className="font-medium">
                                    {convo.awaitingReply
                                      ? "Unread message"
                                      : convo.hasMessages
                                        ? "Conversation active"
                                        : "Thread active"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {convo.awaitingReply ? "Waiting for your reply" : "Conversation ongoing"}
                                  </p>
                                  <p className="text-slate-500">
                                    {convo.lastMessageAt ? `Last message ${formatRelativeTime(convo.lastMessageAt)}` : "No messages yet"}
                                  </p>
                                  <div className="mt-1">
                                    <BidConversationAction
                                      threadId={convo.threadId}
                                      jobId={job.id}
                                      freelancerUserId={bid.freelancer.userId}
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div>
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                  {bid.status.replace(/_/g, " ").toLowerCase()}
                                </span>
                                <p className="mt-1 text-[11px] text-slate-500">{bidDecisionHint(bid.status)}</p>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <BidDecisionAction bidId={bid.id} currentStatus={bid.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href={"/client/jobs" as Route} className="font-semibold text-[#433C93] hover:underline">
                  Review all jobs
                </Link>
                <Link href={"/messages" as Route} className="font-semibold text-slate-600 hover:underline">
                  Open messages
                </Link>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={loginReturnTo(returnToThisJob, "submit-bid") as Route}
                className="inline-flex justify-center rounded-lg bg-[#3525cd] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
              >
                Sign in to submit a bid
              </Link>
              <Link
                href={registerFreelancerReturnToJob(job.id) as Route}
                className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Register as freelancer
              </Link>
            </CardContent>
          )}
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Description</h2>
          <Separator className="mb-4" />
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        </div>
      </div>
    </div>
  );
}
