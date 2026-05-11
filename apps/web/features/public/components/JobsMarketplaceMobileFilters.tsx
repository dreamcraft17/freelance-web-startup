"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/features/i18n/I18nProvider";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { jobsBrowseQueryString } from "@/features/public/lib/jobs-browse-query";
import { Button } from "@/components/ui/button";

type CategoryOption = { id: string; name: string };

export function JobsMarketplaceMobileFilters(props: {
  keyword: string;
  city: string;
  workMode: string;
  categoryId: string;
  minBudget: string;
  postedWithinDays: string;
  categories: CategoryOption[];
}) {
  const { t, locale } = useI18n();
  const jobsBase = withPublicLocale(locale, "/jobs");
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const q = {
    keyword: props.keyword,
    city: props.city,
    workMode: props.workMode,
    categoryId: props.categoryId,
    minBudget: props.minBudget,
    postedWithinDays: props.postedWithinDays,
    page: 1
  };

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full justify-center gap-2 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        {t("public.jobs.filterSheetTrigger")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/60" role="presentation">
          <button
            type="button"
            className="absolute inset-0 z-0 cursor-default"
            aria-label={t("public.jobs.filterSheetClose")}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[88vh] rounded-t-2xl border border-slate-200/90 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-3 sm:px-4">
              <h2 id={titleId} className="text-base font-bold tracking-tight text-slate-900">
                {t("public.filters.title")}
              </h2>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
                onClick={() => setOpen(false)}
                aria-label={t("public.jobs.filterSheetClose")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto overscroll-contain px-3 pb-8 pt-4 sm:px-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("public.filters.category")}</p>
                <div className="mt-2 space-y-1">
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...q, categoryId: "" })}` as Route}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      props.categoryId === "" ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {t("public.filters.allCategories")}
                  </Link>
                  {props.categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...q, categoryId: c.id })}` as Route}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        props.categoryId === c.id ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.budgetFilterLabel")}</p>
                <div className="mt-2 space-y-1">
                  {[
                    { value: "500000", label: t("public.jobs.budgetFilter500k") },
                    { value: "1000000", label: t("public.jobs.budgetFilter1m") },
                    { value: "3000000", label: t("public.jobs.budgetFilter3m") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...q, minBudget: item.value })}` as Route}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        props.minBudget === item.value ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.postedFilterLabel")}</p>
                <div className="mt-2 space-y-1">
                  {[
                    { value: "1", label: t("public.jobs.postedFilter24h") },
                    { value: "7", label: t("public.jobs.postedFilter7d") },
                    { value: "30", label: t("public.jobs.postedFilter30d") }
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`${jobsBase}${jobsBrowseQueryString({ ...q, postedWithinDays: item.value })}` as Route}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        props.postedWithinDays === item.value ? "bg-[#3525cd] text-white shadow-sm" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("public.jobs.workTypeFilterLabel")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...q, workMode: "REMOTE" })}` as Route}
                    onClick={() => setOpen(false)}
                    className={`min-h-10 rounded-full px-3.5 py-2 text-xs font-bold ${
                      props.workMode === "REMOTE"
                        ? "bg-[#3525cd] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {t("public.filters.workModeRemote")}
                  </Link>
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...q, workMode: "ONSITE" })}` as Route}
                    onClick={() => setOpen(false)}
                    className={`min-h-10 rounded-full px-3.5 py-2 text-xs font-bold ${
                      props.workMode === "ONSITE"
                        ? "bg-[#3525cd] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {t("public.filters.workModeOnSite")}
                  </Link>
                  <Link
                    href={`${jobsBase}${jobsBrowseQueryString({ ...q, workMode: "HYBRID" })}` as Route}
                    onClick={() => setOpen(false)}
                    className={`min-h-10 rounded-full px-3.5 py-2 text-xs font-bold ${
                      props.workMode === "HYBRID"
                        ? "bg-[#3525cd] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {t("public.filters.workModeHybrid")}
                  </Link>
                </div>
              </div>

              <Link
                href={jobsBase as Route}
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl border-2 border-slate-200 py-3 text-center text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                {t("public.filters.reset")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
