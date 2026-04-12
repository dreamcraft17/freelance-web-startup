import Link from "next/link";
import { Briefcase } from "lucide-react";

const platformLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" }
] as const;

const supportLinks = [
  { href: "/how-it-works", label: "Help center", disabled: false },
  { href: "#", label: "Terms of service", disabled: true },
  { href: "#", label: "Privacy policy", disabled: true },
  { href: "#", label: "Trust & safety", disabled: true }
] as const;

export function MarketingSiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3525cd] text-white shadow-sm">
              <Briefcase className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-lg font-bold text-indigo-900">NearWork</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            A single place to hire nearby or remote freelancers—design, media, lessons, marketing, local services, and
            more.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold text-slate-900">Platform</h2>
          <ul className="space-y-3">
            {platformLinks.map(({ href, label }) => (
              <li key={href + label}>
                <Link href={href} className="text-sm text-slate-600 transition-colors hover:text-[#3525cd]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold text-slate-900">Support</h2>
          <ul className="space-y-3">
            {supportLinks.map(({ href, label, disabled }) => (
              <li key={label}>
                {disabled ? (
                  <span className="cursor-not-allowed text-sm text-slate-400" title="Coming soon">
                    {label}
                  </span>
                ) : (
                  <Link href={href} className="text-sm text-slate-600 transition-colors hover:text-[#3525cd]">
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold text-slate-900">Updates</h2>
          <p className="mb-3 text-sm text-slate-500">Product news and early-access notes. No spam.</p>
          <div className="flex gap-2">
            <input
              type="email"
              name="footer-email"
              autoComplete="email"
              placeholder="Email"
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 outline-none"
              title="Coming soon"
            />
            <button
              type="button"
              disabled
              className="shrink-0 cursor-not-allowed rounded-lg bg-[#3525cd]/40 px-3 py-2 text-white"
              title="Coming soon"
              aria-label="Subscribe"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-6 text-center sm:text-left">
        <p className="mx-auto max-w-7xl px-4 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} NearWork. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
