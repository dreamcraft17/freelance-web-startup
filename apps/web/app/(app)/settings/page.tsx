import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";
import { SavedListsSection } from "./saved-lists";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Account, billing, notification preferences, and saved items." />
      <div className="mb-10">
        <SavedListsSection />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <EmptyStateCard title="Account" description="Wire to user profile and security endpoints." />
        <EmptyStateCard title="Billing" description="Wire to subscription and payment provider." />
      </div>
    </>
  );
}
