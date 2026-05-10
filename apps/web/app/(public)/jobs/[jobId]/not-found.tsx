import type { Route } from "next";
import Link from "next/link";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";

export default async function JobNotFound() {
  const { locale } = await getServerTranslator();
  const jobsBrowse = withPublicLocale(locale, "/jobs");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Job not found"
        description="This job may have been filled, closed, or the link is incorrect."
      />
      <p className="text-muted-foreground mt-6 text-sm">
        <Link href={jobsBrowse as Route} className="text-foreground font-medium underline-offset-4 hover:underline">
          Back to browse jobs
        </Link>
      </p>
    </div>
  );
}
