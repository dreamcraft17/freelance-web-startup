import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

type JobsPublicEmptyProps = {
  /** True when user narrowed by category */
  categorySelected: boolean;
  /** True when any filter (keyword, city, mode, category) is active */
  hasFilters: boolean;
};

function SuggestedSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-left text-sm text-slate-600 marker:font-semibold">
      {children}
    </ol>
  );
}

export function JobsPublicEmpty({ categorySelected, hasFilters }: JobsPublicEmptyProps) {
  if (categorySelected) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">No jobs yet in this category</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          Nothing open matches that category right now. The board only shows what clients have actually posted.
        </p>
        <SuggestedSteps>
          <li>Clear category and scan the full board.</li>
          <li>Loosen keyword or city if you stacked filters.</li>
          <li>Post a brief if you are the one hiring.</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className="nw-cta-primary px-5 py-2.5">
            Browse all open jobs
          </Link>
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="text-sm font-semibold text-[#433C93] hover:underline"
          >
            Post a job →
          </AuthAwareCtaLink>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">No jobs match these filters</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          Early access boards stay sparse—filters are doing their job even when the answer is zero.
        </p>
        <SuggestedSteps>
          <li>Reset work mode to Any, then narrow again.</li>
          <li>Drop city if the role might be remote.</li>
          <li>Use one keyword from the job title you remember.</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className="nw-cta-primary px-5 py-2.5">
            Clear filters
          </Link>
          <Link href="/freelancers" className="text-sm font-semibold text-[#433C93] hover:underline">
            Find freelancers instead →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nw-empty-state text-left">
      <p className="text-base font-semibold text-slate-900">No open jobs on the board</p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        The public job list is empty until clients post real briefs—there is no demo data behind this view.
      </p>
      <SuggestedSteps>
        <li>Clients: post the first brief with budget and work mode.</li>
        <li>Freelancers: browse the directory and polish your profile while jobs ramp up.</li>
        <li>Everyone: early access means the feed will move—bookmark and check back.</li>
      </SuggestedSteps>
      <div className="mt-6 flex flex-wrap gap-3">
        <AuthAwareCtaLink
          href={"/client/jobs/new" as Route}
          intent="post-job"
          unauthenticatedTo="register"
          registerRoleHint="client"
          className="nw-cta-primary px-5 py-2.5"
        >
          Post the first job
        </AuthAwareCtaLink>
        <Link href="/freelancers" className="text-sm font-semibold text-[#433C93] hover:underline">
          Browse freelancers →
        </Link>
      </div>
    </div>
  );
}
