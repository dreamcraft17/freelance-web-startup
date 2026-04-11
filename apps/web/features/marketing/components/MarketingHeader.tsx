import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Acme Freelance
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/jobs" className="hover:text-foreground">
            Jobs
          </Link>
          <Link href="/freelancers" className="hover:text-foreground">
            Freelancers
          </Link>
          <Link href="/search/nearby" className="hover:text-foreground">
            Nearby
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
