import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <p>© {new Date().getFullYear()} Acme Freelance. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
}
