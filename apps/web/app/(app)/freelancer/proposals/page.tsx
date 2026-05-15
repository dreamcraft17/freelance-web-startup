import type { Route } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  FreelancerProposalsWorkspace,
  type FreelancerProposalRow
} from "@/components/freelancer/FreelancerProposalsWorkspace";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

export default async function FreelancerProposalsPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer/proposals");
  }

  const { t, locale } = await getServerTranslator();
  const jobsBrowseRoot = withPublicLocale(locale, "/jobs");
  const wp = (path: string) => withWorkspaceLocale(locale, path) as Route;
  const emptyOnboarding = {
    step1: t("public.moderation.onboardingProposalStep1"),
    step2: t("public.moderation.onboardingProposalStep2"),
    step3: t("public.moderation.onboardingProposalStep3")
  };

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
    <div className="mx-auto max-w-3xl nw-page-stack">
      <header className="nw-card-elevated border-b-0 p-5 sm:p-6">
        <p className="nw-section-title">{t("dashboard.freelancer.proposalsPageKicker")}</p>
        <h1 className="nw-type-display mt-2 text-slate-900">{t("dashboard.freelancer.proposalsPageTitle")}</h1>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="max-w-xl nw-type-body">{t("dashboard.freelancer.proposalsPageIntro")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href={jobsBrowseRoot as Route} className="nw-link-action text-sm font-semibold">
              {t("dashboard.freelancer.proposalsFindJobsCta")}
            </Link>
            <Link href={wp("/freelancer/profile")} className="nw-link-action text-sm font-semibold text-slate-700">
              {t("dashboard.freelancer.proposalsUpdateProfileCta")}
            </Link>
          </div>
        </div>
      </header>

      <FreelancerProposalsWorkspace
        hasProfile={Boolean(profile)}
        proposals={proposals}
        emptyOnboarding={emptyOnboarding}
      />
    </div>
  );
}
