import { db } from "@acme/database";

export type ActivationStepId =
  | "profile"
  | "first_job"
  | "review_proposal"
  | "discussion"
  | "browse_jobs"
  | "first_proposal";

export type ActivationStepState = {
  id: ActivationStepId;
  done: boolean;
  /** App Router path — staff-safe, no fabricated IDs */
  href: string;
};

/**
 * Lightweight activation milestones derived from persisted rows only (no invented metrics).
 * Used by client/freelancer dashboards for early-launch onboarding checklists.
 */
export class OnboardingActivationService {
  async getClientActivation(userId: string): Promise<ActivationStepState[]> {
    const clientProfile = await db.clientProfile.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        displayName: true,
        companyName: true,
        industry: true,
        city: true,
        country: true,
        region: true
      }
    });

    const profileDone = Boolean(
      clientProfile &&
        clientProfile.displayName.trim().length >= 2 &&
        (Boolean(clientProfile.companyName?.trim()) ||
          Boolean(clientProfile.industry?.trim()) ||
          Boolean(clientProfile.city?.trim()) ||
          Boolean(clientProfile.region?.trim()) ||
          Boolean(clientProfile.country?.trim()))
    );

    let jobCount = 0;
    let bidCountOnJobs = 0;
    if (clientProfile) {
      const [jc, bc] = await Promise.all([
        db.job.count({ where: { clientProfileId: clientProfile.id, deletedAt: null } }),
        db.bid.count({ where: { job: { clientProfileId: clientProfile.id, deletedAt: null } } })
      ]);
      jobCount = jc;
      bidCountOnJobs = bc;
    }

    const firstJobDone = jobCount >= 1;
    const reviewProposalDone = bidCountOnJobs >= 1;

    const userMessageCount = await db.message.count({
      where: { senderId: userId, deletedAt: null, isSystem: false }
    });
    const discussionStarted = userMessageCount >= 1;

    return [
      { id: "profile", done: profileDone, href: "/settings" },
      { id: "first_job", done: firstJobDone, href: "/client/jobs/new" },
      {
        id: "review_proposal",
        done: reviewProposalDone,
        href: "/client/jobs"
      },
      { id: "discussion", done: discussionStarted, href: "/messages" }
    ];
  }

  async getFreelancerActivation(userId: string): Promise<ActivationStepState[]> {
    const profile = await db.freelancerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, username: true, bio: true, workMode: true }
    });

    /** Mirrors bid eligibility (`FreelancerRepository.isComplete`): username + bio + work mode. */
    const profileDone = Boolean(profile?.username?.trim() && profile?.bio?.trim() && profile?.workMode);

    const [savedJobsCount, bidCount] = profile
      ? await Promise.all([
          db.savedJob.count({ where: { userId } }),
          db.bid.count({ where: { freelancerId: profile.id } })
        ])
      : [0, 0];

    /** Observable “explored catalogue”: saved roles or submitted a proposal. */
    const browseJobsDone = savedJobsCount >= 1 || bidCount >= 1;
    const firstProposalDone = bidCount >= 1;

    const userMessageCount = await db.message.count({
      where: { senderId: userId, deletedAt: null, isSystem: false }
    });
    const discussionStarted = userMessageCount >= 1;

    return [
      { id: "profile", done: profileDone, href: "/freelancer/profile" },
      { id: "browse_jobs", done: browseJobsDone, href: "/jobs" },
      {
        id: "first_proposal",
        done: firstProposalDone,
        href: "/freelancer/proposals"
      },
      { id: "discussion", done: discussionStarted, href: "/messages" }
    ];
  }
}
