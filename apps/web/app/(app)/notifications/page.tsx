import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Pull from your notifications store or real-time feed." />
      <EmptyStateCard title="No notifications" description="Map API items to rows; keep sorting in the service layer." />
    </>
  );
}
