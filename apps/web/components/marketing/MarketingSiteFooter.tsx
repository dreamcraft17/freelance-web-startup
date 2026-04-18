import type { Route } from "next";
import Link from "next/link";

type FooterLink = { href: Route; label: string };

const productLinks: FooterLink[] = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/freelancers", label: "Find freelancers" }
];

const companyLinks: FooterLink[] = [
  { href: "/how-it-works", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/early-access", label: "Early access" }
];

const legalLinks: FooterLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
];

const supportLinks: FooterLink[] = [
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" }
];

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-xs font-medium text-slate-600 transition hover:text-[#3525cd]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingSiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/90">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="text-sm font-bold tracking-tight text-slate-900 hover:text-[#3525cd]">
              NearWork
            </Link>
            <p className="mt-1.5 max-w-xs text-xs leading-snug text-slate-500">
              Freelance marketplace for local and remote work.
            </p>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:col-span-8 lg:justify-end"
            aria-label="Footer"
          >
            <LinkColumn title="Product" links={productLinks} />
            <LinkColumn title="Company" links={companyLinks} />
            <LinkColumn title="Legal" links={legalLinks} />
            <LinkColumn title="Support" links={supportLinks} />
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/90 pt-4 text-[11px] font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NearWork</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/privacy" className="hover:text-[#3525cd]">
              Privacy
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="hover:text-[#3525cd]">
              Terms
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/login" className="hover:text-[#3525cd]">
              Log in
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/register" className="hover:text-[#3525cd]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
