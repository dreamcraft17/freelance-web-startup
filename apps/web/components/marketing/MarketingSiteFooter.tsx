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
    <footer className="mt-auto w-full border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="text-lg font-semibold text-slate-900 transition hover:text-[#433C93]">
            NearWork
          </Link>

          <nav className="flex max-w-xl flex-col gap-5 text-left sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-start" aria-label="Footer">
            <div className="flex flex-wrap justify-start gap-x-5 gap-y-2">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-[#433C93]"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-start gap-x-5 gap-y-2">
              {accountLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-[#433C93]"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-start gap-x-5 gap-y-2">
              {supportLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-[#433C93]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <p className="mt-8 text-left text-xs font-medium text-slate-500 md:text-right">
          © {new Date().getFullYear()} NearWork
        </p>
      </div>
    </footer>
  );
}
