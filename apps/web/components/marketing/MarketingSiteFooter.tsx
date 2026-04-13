import Link from "next/link";

const productLinks = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/freelancers", label: "Find freelancers" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/early-access", label: "Early access" }
] as const;

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" }
] as const;

const supportLinks = [
  { href: "/help", label: "Help" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
] as const;

export function MarketingSiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200/80 bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900 transition hover:text-indigo-800">
            NearWork
          </Link>

          <nav className="flex max-w-xl flex-col gap-6 text-center sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center md:text-left" aria-label="Footer">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-[#3525cd]"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
              {accountLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-[#3525cd]"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
              {supportLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-[#3525cd]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <p className="mt-10 text-center text-xs font-medium uppercase tracking-wider text-slate-500 md:text-right">
          © {new Date().getFullYear()} NearWork
        </p>
      </div>
    </footer>
  );
}
