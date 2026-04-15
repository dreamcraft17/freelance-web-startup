import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { REGISTER_FREELANCER_PROFILE } from "@/features/auth/lib/register-intents";

type FreelancersPublicEmptyProps = {
  categorySelected: boolean;
  hasFilters: boolean;
};

function SuggestedSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-left text-sm text-slate-600 marker:font-semibold">
      {children}
    </ol>
  );
}

export function FreelancersPublicEmpty({ categorySelected, hasFilters }: FreelancersPublicEmptyProps) {
  if (categorySelected) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">No freelancers in this category yet</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          Nobody on the directory lists skills under that category right now—that is a real empty state, not a bug.
        </p>
        <SuggestedSteps>
          <li>Clear category and try a broader keyword.</li>
          <li>Switch work mode to Any if you over-filtered remote vs on-site.</li>
          <li>Check open jobs if you are hiring instead of browsing talent.</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/freelancers" className="nw-cta-primary px-5 py-2.5">
            Browse everyone
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
            View open jobs →
          </Link>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">No freelancers match these filters</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          The directory is still growing in early access—tight filters often return zero even when people are signing up.
        </p>
        <SuggestedSteps>
          <li>Remove city or widen radius if you used nearby.</li>
          <li>Try remote-only for roles that do not need someone on-site.</li>
          <li>Shorten the keyword to one strong term.</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/freelancers" className="nw-cta-primary px-5 py-2.5">
            Reset filters
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
            View open jobs →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nw-empty-state text-left">
      <p className="text-base font-semibold text-slate-900">No public profiles yet</p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        When freelancers publish profiles with city and work mode, they show up here automatically—nothing to seed by
        hand.
      </p>
      <SuggestedSteps>
        <li>If you are a freelancer, complete your profile and set availability.</li>
        <li>If you are hiring, post a job so bids can start.</li>
        <li>Come back after early-access invites roll out—this list will move first.</li>
      </SuggestedSteps>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={REGISTER_FREELANCER_PROFILE as Route} className="nw-cta-primary px-5 py-2.5">
          Create a freelancer profile
        </Link>
        <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
          Browse jobs →
        </Link>
      </div>
    </div>
  );
}
