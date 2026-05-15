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
    <div className="mx-3 mb-2 rounded-2xl border border-[#3525cd]/14 bg-gradient-to-br from-[#3525cd]/[0.09] via-white to-slate-50/40 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3525cd]/12 text-[#3525cd]">
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-snug text-slate-900">{t("workspace.communityCardTitle")}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{t("workspace.communityCardBody")}</p>
          <Link
            href={helpPath as Route}
            className="mt-2 inline-flex text-[11px] font-semibold text-[#3525cd] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/35 focus-visible:ring-offset-2"
          >
            {t("workspace.communityCardCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
