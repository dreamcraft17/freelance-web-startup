"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/freelancers", label: "Freelancers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" }
] as const;

export function MarketingNavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg text-slate-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#3525cd]"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3525cd] text-white shadow-md shadow-indigo-900/20">
            <Briefcase className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-indigo-900 sm:text-xl">NearWork</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "border-b-2 border-[#3525cd] pb-0.5 text-sm font-semibold text-[#3525cd]"
                    : "text-sm font-medium text-slate-600 transition-colors hover:text-[#3525cd]"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2d1fb0] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-[#3525cd] shadow-sm md:hidden"
          aria-expanded={open}
          aria-controls="marketing-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </nav>

      {open ? (
        <div
          id="marketing-mobile-nav"
          className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="mt-1 rounded-lg bg-[#3525cd] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#2d1fb0]"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
