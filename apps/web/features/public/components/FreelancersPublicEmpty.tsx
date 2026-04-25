"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { REGISTER_FREELANCER_PROFILE } from "@/features/auth/lib/register-intents";
import { useI18n } from "@/features/i18n/I18nProvider";

type FreelancersPublicEmptyProps = {
  categorySelected: boolean;
  hasFilters: boolean;
};

function SuggestedSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-3 list-decimal space-y-1 pl-5 text-left text-sm text-slate-600 marker:font-semibold">
      {children}
    </ol>
  );
}

export function FreelancersPublicEmpty({ categorySelected, hasFilters }: FreelancersPublicEmptyProps) {
  const { t } = useI18n();

  if (categorySelected) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-left">
        <p className="text-base font-semibold text-slate-900">{t("public.freelancers.emptyCategoryTitle")}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("public.freelancers.emptyCategoryBody")}
        </p>
        <SuggestedSteps>
          <li>{t("public.freelancers.emptyCategoryStep1")}</li>
          <li>{t("public.freelancers.emptyCategoryStep2")}</li>
          <li>{t("public.freelancers.emptyCategoryStep3")}</li>
        </SuggestedSteps>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/freelancers" className="nw-cta-primary px-5 py-2.5">
            {t("public.freelancers.emptyCategoryPrimary")}
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
            {t("public.freelancers.emptyCategorySecondary")}
          </Link>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-left">
        <p className="text-base font-semibold text-slate-900">{t("public.freelancers.emptyFiltersTitle")}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("public.freelancers.emptyFiltersBody")}
        </p>
        <SuggestedSteps>
          <li>{t("public.freelancers.emptyFiltersStep1")}</li>
          <li>{t("public.freelancers.emptyFiltersStep2")}</li>
          <li>{t("public.freelancers.emptyFiltersStep3")}</li>
        </SuggestedSteps>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/freelancers" className="nw-cta-primary px-5 py-2.5">
            {t("public.freelancers.emptyFiltersPrimary")}
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
            {t("public.freelancers.emptyFiltersSecondary")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-left">
      <p className="text-base font-semibold text-slate-900">{t("public.freelancers.emptyDefaultTitle")}</p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        {t("public.freelancers.emptyDefaultBody")}
      </p>
      <SuggestedSteps>
        <li>{t("public.freelancers.emptyDefaultStep1")}</li>
        <li>{t("public.freelancers.emptyDefaultStep2")}</li>
        <li>{t("public.freelancers.emptyDefaultStep3")}</li>
      </SuggestedSteps>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={REGISTER_FREELANCER_PROFILE as Route} className="nw-cta-primary px-5 py-2.5">
          {t("public.freelancers.emptyDefaultPrimary")}
        </Link>
        <Link href="/jobs" className="text-sm font-semibold text-[#433C93] hover:underline">
          {t("public.freelancers.emptyDefaultSecondary")}
        </Link>
      </div>
    </div>
  );
}
