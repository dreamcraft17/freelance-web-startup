import { PageHeader } from "@/features/shared/components/PageHeader";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageHeader
        title="How it works"
        description="Replace this copy with product marketing content. No marketplace rules belong in this file."
      />
      <ol className="mt-8 list-decimal space-y-4 pl-5 text-sm text-muted-foreground">
        <li>Create a profile as a client or freelancer.</li>
        <li>Post or discover jobs — including onsite and hybrid work.</li>
        <li>Hire, deliver, and get paid through your payments integration.</li>
      </ol>
    </div>
  );
}
