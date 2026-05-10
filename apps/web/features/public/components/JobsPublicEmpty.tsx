"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

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

function EmptyContext({ what, why, next }: { what: string; why: string; next: string }) {
  return (
    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-left text-xs leading-relaxed text-slate-600">
      <p>
        <span className="font-semibold text-slate-800">{what}</span>
      </p>
      <p>
        <span className="font-semibold text-slate-800">{why}</span>
      </p>
      <p>
        <span className="font-semibold text-slate-800">{next}</span>
      </p>
    </div>
  );
}

export function JobsPublicEmpty({ categorySelected, hasFilters, viewerRole = null }: JobsPublicEmptyProps) {
  const { t, locale } = useI18n();
  const jobsBase = withPublicLocale(locale, "/jobs");
  const flBase = withPublicLocale(locale, "/freelancers");

  if (categorySelected) {
    return (
      <div className="nw-empty-state text-left">
        <p className="text-base font-semibold text-slate-900">{t("public.jobs.emptyCategoryTitle")}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("public.jobs.emptyCategoryBody")}
        </p>
        <EmptyContext
          what={t("public.jobs.emptyCategoryWhat")}
          why={t("public.jobs.emptyCategoryWhy")}
          next={t("public.jobs.emptyCategoryNext")}
        />
        <SuggestedSteps>
          <li>{t("public.jobs.emptyCategoryStep1")}</li>
          <li>{t("public.jobs.emptyCategoryStep2")}</li>
          <li>{t("public.jobs.emptyCategoryStep3")}</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={jobsBase as Route} className="nw-cta-primary px-5 py-2.5">
            {t("public.jobs.emptyCategoryPrimary")}
          </Link>
          <AuthAwareCtaLink
            href={withWorkspaceLocale(locale, "/client/jobs/new") as Route}
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
        <EmptyContext
          what={t("public.jobs.emptyFiltersWhat")}
          why={t("public.jobs.emptyFiltersWhy")}
          next={t("public.jobs.emptyFiltersNext")}
        />
        <SuggestedSteps>
          <li>{t("public.jobs.emptyFiltersStep1")}</li>
          <li>{t("public.jobs.emptyFiltersStep2")}</li>
          <li>{t("public.jobs.emptyFiltersStep3")}</li>
        </SuggestedSteps>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={jobsBase as Route} className="nw-cta-primary px-5 py-2.5">
            {t("public.jobs.emptyFiltersPrimary")}
          </Link>
          <Link
            href={withPublicLocale(locale, "/jobs?workMode=REMOTE") as Route}
            className="text-sm font-semibold text-[#433C93] hover:underline"
          >
            {t("public.jobs.emptyFiltersSecondary")}
          </Link>
          <AuthAwareCtaLink
            href={withWorkspaceLocale(locale, "/freelancer/profile") as Route}
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
      <EmptyContext
        what={t("public.jobs.emptyActionWhat")}
        why={t("public.jobs.emptyActionWhy")}
        next={t("public.jobs.emptyActionNext")}
      />
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
          href={withWorkspaceLocale(locale, "/client/jobs/new") as Route}
          intent="post-job"
          unauthenticatedTo="register"
          registerRoleHint="client"
          className="nw-cta-primary px-5 py-2.5"
        >
          {t("public.jobs.emptyActionPrimary")}
        </AuthAwareCtaLink>
        <Link href={flBase as Route} className="text-sm font-semibold text-[#433C93] hover:underline">
          {t("public.jobs.emptyActionSecondary")}
        </Link>
      </div>
    </div>
  );
}
