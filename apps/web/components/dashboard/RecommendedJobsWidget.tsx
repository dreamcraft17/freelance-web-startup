import Link from "next/link";
import type { Route } from "next";
import { Sparkles } from "lucide-react";
import { RecommendationService } from "@/server/services/recommendation.service";
import { Card } from "@/components/ui/card";
import { RecommendationScore } from "@/components/design-system/RecommendationScore";
import type { AppLocale } from "@/lib/i18n/types";
import { withPublicLocale } from "@/lib/i18n/locale-path";

type Props = {
  freelancerUserId: string;
  locale: AppLocale;
  title?: string;
};

export async function RecommendedJobsWidget({ freelancerUserId, locale, title = "Recommended for you" }: Props) {
  const service = new RecommendationService();
  const items = await service.listForFreelancer(freelancerUserId, 5);

  if (items.length === 0) {
    return (
      <Card className="nw-card p-4">
        <div className="flex items-center gap-2 text-nw-brand">
          <Sparkles className="h-4 w-4" aria-hidden />
          <h2 className="nw-type-section-title">{title}</h2>
        </div>
        <p className="nw-type-body mt-2 text-slate-600">
          Recommendations appear after the daily matching job runs. Browse jobs meanwhile.
        </p>
        <Link href={withPublicLocale(locale, "/jobs") as Route} className="nw-link-action mt-3 inline-block text-sm">
          Browse jobs
        </Link>
      </Card>
    );
  }

  return (
    <Card className="nw-card p-4">
      <div className="flex items-center gap-2 text-nw-brand">
        <Sparkles className="h-4 w-4" aria-hidden />
        <h2 className="nw-type-section-title">{title}</h2>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <Link
              href={withPublicLocale(locale, `/jobs/${item.jobId}`) as Route}
              className="nw-type-body font-medium text-slate-900 hover:text-nw-brand dark:text-slate-100"
            >
              {item.job?.title ?? "Job"}
            </Link>
            <RecommendationScore score={item.score} reasons={item.matchReasons} compact className="mt-3" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
