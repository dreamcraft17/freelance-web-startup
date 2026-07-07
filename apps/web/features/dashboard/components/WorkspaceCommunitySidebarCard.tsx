"use client";

import Link from "next/link";
import type { Route } from "next";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";

/** Early-access community CTA — no billing checkout (see copy). */
export function WorkspaceCommunitySidebarCard() {
  const { t, locale } = useI18n();
  const helpPath = withPublicLocale(locale, "/help");

  return (
    <div className="mx-3 mb-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-nw-brand/12 text-nw-brand">
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-snug text-slate-900">{t("workspace.communityCardTitle")}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{t("workspace.communityCardBody")}</p>
          <Link
            href={helpPath as Route}
            className="mt-2 inline-flex text-[11px] font-semibold text-nw-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nw-brand/35 focus-visible:ring-offset-2"
          >
            {t("workspace.communityCardCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
