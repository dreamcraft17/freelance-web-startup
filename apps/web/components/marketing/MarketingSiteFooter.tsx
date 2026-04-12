import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/help", label: "Help" }
] as const;

export function MarketingSiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200/80 bg-slate-50 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-8 md:flex-row md:items-center md:gap-8">
        <Link href="/" className="text-lg font-bold text-slate-900 transition hover:text-indigo-800">
          NearWork
        </Link>
        <nav className="flex flex-wrap justify-center gap-6 sm:gap-8" aria-label="Footer">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-[#3525cd]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-500 md:text-right">
          © {new Date().getFullYear()} NearWork
        </p>
      </div>
    </footer>
  );
}
