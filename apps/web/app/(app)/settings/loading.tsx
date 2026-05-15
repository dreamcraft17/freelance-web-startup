import { NwLoadingCardStack, NwLoadingHeader } from "@/components/system/LoadingSkeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <NwLoadingHeader compact />
      <NwLoadingCardStack rows={4} />
    </div>
  );
}

