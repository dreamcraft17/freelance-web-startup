import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function NearbySearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader
        title="Nearby search"
        description="Combine geolocation inputs with your GeoService and search APIs."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <EmptyStateCard title="Map / radius" description="Map UI reads query state from URL or form — logic stays in hooks/services." />
        <EmptyStateCard title="Results" description="Render freelancers or jobs returned from the search layer." />
      </div>
    </div>
  );
}
