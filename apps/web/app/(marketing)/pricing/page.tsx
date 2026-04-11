import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/features/shared/components/PageHeader";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <PageHeader
        title="Pricing"
        description="Plans and limits are enforced server-side; this page is a marketing shell."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {["Free", "Pro", "Agency"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Details will be loaded from your billing service.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
