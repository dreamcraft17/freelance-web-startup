"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveJobButton } from "./SaveJobButton";

export type SerializableJobCard = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  budgetType: string;
  workMode: string;
  city: string | null;
};

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false };

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function budgetLabel(job: SerializableJobCard): string {
  const { budgetMin: min, budgetMax: max, currency, budgetType } = job;
  if (min != null && max != null) return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
  if (min != null) return `From ${formatMoney(min, currency)}`;
  if (max != null) return `Up to ${formatMoney(max, currency)}`;
  return budgetType.replace(/_/g, " ");
}

type JobsBrowseGridProps = {
  jobs: SerializableJobCard[];
};

export function JobsBrowseGrid({ jobs }: JobsBrowseGridProps) {
  const [savedIds, setSavedIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/saved-items/jobs?idsOnly=1", { credentials: "include" });
      if (cancelled) return;
      if (res.status === 401) {
        setSavedIds(new Set());
        return;
      }
      const body = (await res.json()) as ApiOk<{ jobIds: string[] }> | ApiErr;
      if (!body.success || !("data" in body)) {
        setSavedIds(new Set());
        return;
      }
      setSavedIds(new Set(body.data.jobIds));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSavedChange = useCallback((jobId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev ?? []);
      if (saved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  }, []);

  return (
    <>
      {jobs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No open jobs right now. Check back soon.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-snug">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    {savedIds ? (
                      <SaveJobButton
                        jobId={job.id}
                        initialSaved={savedIds.has(job.id)}
                        onSavedChange={(saved) => onSavedChange(job.id, saved)}
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                      />
                    ) : (
                      <span className="text-muted-foreground shrink-0 text-xs">…</span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-1 text-xs">
                  <p>
                    <span className="font-medium text-foreground">{budgetLabel(job)}</span>
                    <span className="mx-1">·</span>
                    {job.workMode}
                    {job.city ? (
                      <>
                        <span className="mx-1">·</span>
                        {job.city}
                      </>
                    ) : null}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
