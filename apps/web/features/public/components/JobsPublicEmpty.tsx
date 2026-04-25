"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { useI18n } from "@/features/i18n/I18nProvider";

type JobsPublicEmptyProps = {
  /** True when user narrowed by category */
  categorySelected: boolean;
  /** True when any filter (keyword, city, mode, category) is active */
  hasFilters: boolean;
  /** Role hint for action emphasis */
  viewerRole?: "CLIENT" | "FREELANCER" | null;
};

function SuggestedSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-left text-sm text-slate-600 marker:font-semibold">
      {children}
    </ol>
  );
}

export function JobsPublicEmpty({ categorySelected, hasFilters, viewerRole = null }: JobsPublicEmptyProps) {
  const { t } = useI18n();

  if (categorySelected) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">{t("public.jobs.emptyCategoryTitle")}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("public.jobs.emptyCategoryBody")}
        </p>
        <SuggestedSteps>
          <li>{t("public.jobs.emptyCategoryStep1")}</li>
          <li>{t("public.jobs.emptyCategoryStep2")}</li>
          <li>{t("public.jobs.emptyCategoryStep3")}</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className="nw-cta-primary px-5 py-2.5">
            {t("public.jobs.emptyCategoryPrimary")}
          </Link>
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="text-sm font-semibold text-[#433C93] hover:underline"
          >
            {t("public.jobs.emptyCategorySecondary")}
          </AuthAwareCtaLink>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">{t("public.jobs.emptyFiltersTitle")}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("public.jobs.emptyFiltersBody")}
        </p>
        <SuggestedSteps>
          <li>{t("public.jobs.emptyFiltersStep1")}</li>
          <li>{t("public.jobs.emptyFiltersStep2")}</li>
          <li>{t("public.jobs.emptyFiltersStep3")}</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className="nw-cta-primary px-5 py-2.5">
            {t("public.jobs.emptyFiltersPrimary")}
          </Link>
          <Link href="/jobs?workMode=REMOTE" className="text-sm font-semibold text-[#433C93] hover:underline">
            {t("public.jobs.emptyFiltersSecondary")}
          </Link>
          <AuthAwareCtaLink
            href={"/freelancer/profile" as Route}
            intent="protected"
            unauthenticatedTo="register"
            registerRoleHint="freelancer"
            className="text-sm font-semibold text-[#433C93] hover:underline"
          >
            {t("public.jobs.emptyFiltersTertiary")}
          </AuthAwareCtaLink>
        </div>
      </div>
    );
  }

  return (
    <div className="nw-empty-state text-left">
      <p className="text-base font-semibold text-slate-900">{t("public.jobs.emptyActionTitle")}</p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        {t("public.jobs.emptyActionBody")}
      </p>
      <p className="mt-2 text-xs font-medium text-slate-500">
        {viewerRole === "CLIENT"
          ? t("public.jobs.emptyRoleClient")
          : viewerRole === "FREELANCER"
            ? t("public.jobs.emptyRoleFreelancer")
            : t("public.jobs.emptyRoleGeneric")}
      </p>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("public.jobs.emptyUseCaseTitle")}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          <li>{t("public.jobs.emptyUseCaseOne")}</li>
          <li>{t("public.jobs.emptyUseCaseTwo")}</li>
          <li>{t("public.jobs.emptyUseCaseThree")}</li>
          <li>{t("public.jobs.emptyUseCaseFour")}</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <AuthAwareCtaLink
          href={"/client/jobs/new" as Route}
          intent="post-job"
          unauthenticatedTo="register"
          registerRoleHint="client"
          className="nw-cta-primary px-5 py-2.5"
        >
          {t("public.jobs.emptyActionPrimary")}
        </AuthAwareCtaLink>
        <Link href="/freelancers" className="text-sm font-semibold text-[#433C93] hover:underline">
          {t("public.jobs.emptyActionSecondary")}
        </Link>
      </div>
    </div>
  );
}
