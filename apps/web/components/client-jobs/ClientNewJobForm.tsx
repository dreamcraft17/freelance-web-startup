"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { createJobSchema } from "@acme/validators";
import { BudgetType, WorkMode } from "@acme/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Layers,
  Loader2,
  MapPin,
  Sparkles,
  Wallet
} from "lucide-react";

export type ClientNewJobCategoryOption = {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
};

const inputClass =
  "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus-visible:border-[#3525cd]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/20 disabled:opacity-50";

const selectClass = cn(inputClass, "cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9");

type ClientNewJobFormProps = {
  categories: ClientNewJobCategoryOption[];
};

function sectionCard(
  icon: React.ReactNode,
  title: string,
  description: string,
  children: React.ReactNode
) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.03] ring-1 ring-slate-900/[0.02] md:p-7">
      <div className="mb-6 flex gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3525cd]/[0.08] text-[#3525cd] ring-1 ring-[#3525cd]/10">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function ClientNewJobForm({ categories }: ClientNewJobFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [budgetType, setBudgetType] = useState<BudgetType>(BudgetType.RANGE);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE);
  const [city, setCity] = useState("");
  const [bidDeadlineLocal, setBidDeadlineLocal] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subcategories = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.subcategories ?? [];
  }, [categories, categoryId]);

  function onCategoryChange(id: string) {
    setCategoryId(id);
    setSubcategoryId("");
  }

  async function submit() {
    setError(null);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      workMode,
      budgetType,
      currency: currency.trim().toUpperCase().slice(0, 3) || "USD"
    };

    if (subcategoryId) payload.subcategoryId = subcategoryId;
    if (city.trim()) payload.city = city.trim();
    if (bidDeadlineLocal) {
      const d = new Date(bidDeadlineLocal);
      if (Number.isNaN(d.getTime())) {
        setError("Please enter a valid proposal deadline, or leave it blank.");
        return;
      }
      payload.bidDeadline = d.toISOString();
    }

    if (budgetType !== BudgetType.REQUEST_QUOTE) {
      if (budgetMin.trim() !== "") {
        const n = Number(budgetMin);
        if (Number.isFinite(n)) payload.budgetMin = n;
      }
      if (budgetMax.trim() !== "") {
        const n = Number(budgetMax);
        if (Number.isFinite(n)) payload.budgetMax = n;
      }
    }

    const parsed = createJobSchema.safeParse(payload);
    if (!parsed.success) {
      const field = parsed.error.flatten().fieldErrors;
      const first =
        field.title?.[0] ??
        field.description?.[0] ??
        field.categoryId?.[0] ??
        field.currency?.[0] ??
        field.budgetMin?.[0] ??
        field.budgetMax?.[0] ??
        field.bidDeadline?.[0] ??
        "Please check the highlighted fields.";
      setError(first);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { id: string };
      };

      if (!res.ok || !json.success || !json.data?.id) {
        setError(json.error ?? "Could not publish this job. Try again.");
        return;
      }

      router.push(`/jobs/${json.data.id}` as Route);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-8 pb-28 md:pb-10">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={"/client/jobs" as Route}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#3525cd]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to my jobs
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">NearWork · Client</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
              Post a new job
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Walk through each block once—clear briefs attract stronger proposals. Nothing is published until you
              submit at the bottom.
            </p>
          </div>
        </div>

        {error ? (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form
          id="new-job-form"
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {sectionCard(
            <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
            "Basic job info",
            "Give freelancers a crisp title and enough context to decide if they are a fit.",
            <>
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-slate-700">
                  Title
                </Label>
                <Input
                  id="job-title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior product designer for B2B dashboard"
                  maxLength={180}
                  className={inputClass}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-slate-400">{title.trim().length}/180 · min 3 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description" className="text-slate-700">
                  Description
                </Label>
                <textarea
                  id="job-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Scope, deliverables, timeline, tools, and how you will collaborate."
                  rows={8}
                  className={cn(inputClass, "min-h-[10rem] resize-y py-3")}
                  required
                />
                <p className="text-xs text-slate-400">{description.trim().length} characters · at least 30</p>
              </div>
            </>
          )}

          {sectionCard(
            <Layers className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
            "Category & skills",
            "Choose where this role belongs. Mention must-have tools or seniority in the description for now—structured skill tags will connect here in a future release.",
            <>
              <div className="space-y-2">
                <Label htmlFor="job-category" className="text-slate-700">
                  Category
                </Label>
                <select
                  id="job-category"
                  name="categoryId"
                  value={categoryId}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className={selectClass}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-subcategory" className="text-slate-700">
                  Subcategory <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <select
                  id="job-subcategory"
                  name="subcategoryId"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  disabled={subcategories.length === 0}
                  className={cn(selectClass, subcategories.length === 0 && "opacity-60")}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`
                  }}
                >
                  <option value="">None</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                  <Sparkles className="h-4 w-4 text-[#3525cd]" aria-hidden />
                  Skills & stack
                </span>
                <p className="mt-1.5 leading-relaxed">
                  Call out frameworks, languages, or certifications in your description. A dedicated skills picker will
                  ship later without changing how jobs are saved today.
                </p>
              </div>
            </>
          )}

          {sectionCard(
            <Wallet className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
            "Budget",
            "Set how you want to engage. Request quote is fine when scope still needs discovery.",
            <>
              <div className="space-y-2">
                <Label htmlFor="budget-type" className="text-slate-700">
                  Budget type
                </Label>
                <select
                  id="budget-type"
                  name="budgetType"
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value as BudgetType)}
                  className={selectClass}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`
                  }}
                >
                  <option value={BudgetType.FIXED}>Fixed price</option>
                  <option value={BudgetType.HOURLY}>Hourly</option>
                  <option value={BudgetType.RANGE}>Range</option>
                  <option value={BudgetType.REQUEST_QUOTE}>Request quote</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-700">
                    Currency (ISO)
                  </Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    maxLength={3}
                    placeholder="USD"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              {budgetType !== BudgetType.REQUEST_QUOTE ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget-min" className="text-slate-700">
                      {budgetType === BudgetType.HOURLY ? "Min hourly" : "Minimum"}
                    </Label>
                    <Input
                      id="budget-min"
                      name="budgetMin"
                      type="number"
                      min={0}
                      step="0.01"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-max" className="text-slate-700">
                      {budgetType === BudgetType.HOURLY ? "Max hourly" : "Maximum"}
                    </Label>
                    <Input
                      id="budget-max"
                      name="budgetMax"
                      type="number"
                      min={0}
                      step="0.01"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Freelancers will propose pricing after reading your brief—no budget fields required.
                </p>
              )}
            </>
          )}

          {sectionCard(
            <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
            "Location & work mode",
            "Clarify how and where work happens so expectations stay aligned.",
            <>
              <div className="space-y-2">
                <Label htmlFor="work-mode" className="text-slate-700">
                  Work mode
                </Label>
                <select
                  id="work-mode"
                  name="workMode"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className={selectClass}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`
                  }}
                >
                  <option value={WorkMode.REMOTE}>Remote</option>
                  <option value={WorkMode.HYBRID}>Hybrid</option>
                  <option value={WorkMode.ONSITE}>On-site</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-700">
                  City / region <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Berlin or EU-wide"
                  maxLength={120}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {sectionCard(
            <CalendarClock className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
            "Deadline & requirements",
            "Optional proposal deadline. Other requirements belong in your description for now.",
            <>
              <div className="space-y-2">
                <Label htmlFor="bid-deadline" className="text-slate-700">
                  Proposal deadline <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="bid-deadline"
                  name="bidDeadline"
                  type="datetime-local"
                  value={bidDeadlineLocal}
                  onChange={(e) => setBidDeadlineLocal(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-slate-500">
                  Stored in UTC. Leave blank if you are still calibrating timing with candidates.
                </p>
              </div>
            </>
          )}

          <div className="hidden items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-6 py-4 md:flex">
            <p className="text-sm text-slate-600">
              Ready? Publishing sends the job live for freelancers to discover.
            </p>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-xl bg-[#3525cd] px-8 text-base font-semibold shadow-md shadow-[#3525cd]/20 hover:bg-[#2d1fb0]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Publishing…
                </>
              ) : (
                "Publish listing"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500">Publish when your brief feels complete</p>
          <Button
            type="submit"
            form="new-job-form"
            disabled={submitting}
            className="h-11 shrink-0 rounded-xl bg-[#3525cd] px-5 text-sm font-semibold shadow-md shadow-[#3525cd]/20 hover:bg-[#2d1fb0]"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Publish"}
          </Button>
        </div>
      </div>
    </>
  );
}
