"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/jobs", label: "Marketplace" },
  { href: "/pricing", label: "Solutions" },
  { href: "/how-it-works", label: "About" }
] as const;

export function MarketingNavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-indigo-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#3525cd] sm:text-2xl"
            onClick={() => setOpen(false)}
          >
            NearWork
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "border-b-2 border-indigo-600 py-1 text-sm font-semibold text-indigo-700"
                      : "py-1 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#3525cd] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5] active:scale-[0.98]"
          >
            Early access
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-indigo-800 shadow-sm md:hidden"
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
          className="border-t border-slate-100 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-md md:hidden"
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
              className="mt-1 rounded-lg bg-[#3525cd] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4f46e5]"
              onClick={() => setOpen(false)}
            >
              Early access
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
