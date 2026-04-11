import Link from "next/link";
import { Briefcase, Globe, Moon } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

type PageProps = {
  searchParams: Promise<{ returnUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const returnUrl = sp.returnUrl;
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(rgb(255 255 255 / 0.14) 1px, transparent 1px)",
          backgroundSize: "22px 22px"
        }}
        aria-hidden
      />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-2xl shadow-black/40 ring-1 ring-zinc-950/5 sm:p-10 dark:bg-white">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Briefcase className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-xl font-bold tracking-tight text-indigo-600">NearWork</span>
          </Link>

          <LoginForm returnUrl={returnUrl} />

          <nav
            aria-label="Legal"
            className="mt-10 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-8 text-center text-[11px] text-zinc-500 sm:text-xs"
          >
            <span className="truncate sm:whitespace-normal">Privacy Policy</span>
            <span className="truncate sm:whitespace-normal">Terms of Service</span>
            <Link href="/how-it-works" className="truncate font-medium text-zinc-600 hover:text-indigo-600 sm:whitespace-normal">
              Help Center
            </Link>
          </nav>

          <p className="mt-6 text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-400">
            © {year} NearWork. The intentional curator.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-800"
              aria-label="Language (coming soon)"
            >
              <Globe className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-800"
              aria-label="Theme (coming soon)"
            >
              <Moon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
