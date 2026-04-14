import Link from "next/link";
import { Globe, Moon } from "lucide-react";
import { parseAuthIntent } from "@/features/auth/lib/auth-intent";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { BrandLogo } from "@/features/shared/components/BrandLogo";

type PageProps = {
  searchParams: Promise<{ next?: string; role?: string; intent?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const intent = parseAuthIntent(sp.intent);
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 sm:py-12">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_2px_28px_-6px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 sm:p-10">
          <div className="mb-8">
            <BrandLogo imageClassName="h-10 w-auto sm:h-11" alt="NearWork logo" />
          </div>

          <RegisterForm
            initialNext={sp.next}
            initialRoleHint={sp.role}
            initialIntent={intent}
          />

          <nav
            aria-label="Legal"
            className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-200 pt-8 text-center text-xs text-slate-500"
          >
            <span className="truncate sm:whitespace-normal">Privacy Policy</span>
            <span className="truncate sm:whitespace-normal">Terms of Service</span>
            <Link
              href="/how-it-works"
              className="truncate font-medium text-slate-600 underline-offset-4 hover:text-[#3525cd] hover:underline sm:whitespace-normal"
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
