import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateCardProps = {
  title: string;
  description: string;
};

/** Presentational empty state — no data fetching or domain rules. */
export function EmptyStateCard({ title, description }: EmptyStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
