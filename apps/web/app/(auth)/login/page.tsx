import Link from "next/link";
import { Briefcase, Globe, Moon } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

type PageProps = {
  searchParams: Promise<{ returnUrl?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const returnUrl = sp.returnUrl ?? sp.next;
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 sm:py-12">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
              <Briefcase className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-xl font-bold tracking-tight text-indigo-600">NearWork</span>
          </Link>

          <LoginForm returnUrl={returnUrl} />

          <nav
            aria-label="Legal"
            className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-200 pt-8 text-center text-xs text-slate-500"
          >
            <span className="truncate sm:whitespace-normal">Privacy Policy</span>
            <span className="truncate sm:whitespace-normal">Terms of Service</span>
            <Link
              href="/how-it-works"
              className="truncate font-medium text-slate-600 underline-offset-4 hover:text-indigo-600 hover:underline sm:whitespace-normal"
            >
              Help Center
            </Link>
          </nav>

          <p className="mt-6 text-center text-xs font-medium uppercase leading-relaxed tracking-wide text-slate-400">
            © {year} NearWork. The intentional curator.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-800"
              aria-label="Language (coming soon)"
            >
              <Globe className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-800"
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
