import { PageHeader } from "@/features/shared/components/PageHeader";
import { EmptyStateCard } from "@/features/shared/components/EmptyStateCard";

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" description="Thread list and composer consume your messaging API." />
      <EmptyStateCard title="Inbox" description="Render threads from MessageService-backed loaders." />
    </>
  );
}
