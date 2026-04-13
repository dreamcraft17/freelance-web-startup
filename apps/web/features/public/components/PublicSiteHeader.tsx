import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/features/shared/components/BrandLogo";

/** Lightweight header for browse/search surfaces (jobs, freelancers, nearby). */
export function PublicSiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <BrandLogo imageClassName="h-6 w-auto" alt="NearWork logo" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">Jobs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/freelancers">Freelancers</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
