import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingHomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Hire any skill. Local or remote.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          One platform for digital work, onsite services, and hybrid projects — with fair quotas and
          location-aware discovery.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
