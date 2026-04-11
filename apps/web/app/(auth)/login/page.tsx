import Link from "next/link";
import { Briefcase, Globe, Moon } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

type PageProps = {
  searchParams: Promise<{ returnUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const returnUrl = sp.returnUrl;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/90 dark:bg-zinc-950">
      <header className="flex shrink-0 items-center justify-center gap-2 px-4 pb-6 pt-10 md:pt-14">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
            <Briefcase className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-bold tracking-tight text-indigo-950 dark:text-indigo-100">NearWork</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-[400px] rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-black/5 dark:shadow-black/40 md:p-10">
          <LoginForm returnUrl={returnUrl} />
        </div>
      </main>

      <footer className="mt-auto flex flex-col items-center gap-6 px-4 pb-10">
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link href="/how-it-works" className="hover:text-foreground">
            Help Center
          </Link>
          <span className="hidden text-border sm:inline" aria-hidden>
            |
          </span>
          <span className="text-muted-foreground/80">Privacy Policy</span>
          <span className="hidden text-border sm:inline" aria-hidden>
            |
          </span>
          <span className="text-muted-foreground/80">Terms of Service</span>
        </nav>
        <p className="max-w-sm text-center text-[10px] font-medium uppercase leading-relaxed tracking-widest text-muted-foreground/70">
          © {new Date().getFullYear()} NearWork. The intentional curator.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Language (coming soon)"
          >
            <Globe className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Theme (coming soon)"
          >
            <Moon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </footer>
    </div>
  );
}
