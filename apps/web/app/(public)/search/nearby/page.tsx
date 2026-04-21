import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function NearbySearchPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader
        title={t("public.nearbySearch.title")}
        description={t("public.nearbySearch.description")}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <EmptyStateCard
          title={t("public.nearbySearch.mapTitle")}
          description={t("public.nearbySearch.mapDescription")}
        />
        <EmptyStateCard
          title={t("public.nearbySearch.resultsTitle")}
          description={t("public.nearbySearch.resultsDescription")}
        />
      </div>
    </div>
  );
}
