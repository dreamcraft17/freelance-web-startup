"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { SessionPayload } from "@src/lib/session";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import {
  type PublicSessionLite,
  primaryActionForRole,
  secondaryActionForRole
} from "@/features/public/lib/auth-nav";
import { BrandLogo } from "@/features/shared/components/BrandLogo";

const navLinks = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/freelancers", label: "Find freelancers" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/early-access", label: "Early access" },
  { href: "/help", label: "Help" }
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/help") return pathname === "/help" || pathname.startsWith("/help/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNavBar({ session }: { session: SessionPayload | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const authSession: PublicSessionLite | null = session
    ? { userId: session.userId, role: session.role, accountStatus: session.accountStatus }
    : null;
  const primary = authSession ? primaryActionForRole(authSession.role) : null;
  const secondary = authSession ? secondaryActionForRole(authSession.role) : null;

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6 lg:gap-8">
          <BrandLogo
            className="shrink-0"
            imageClassName="h-10 w-auto sm:h-11"
            alt="NearWork logo"
          />
          <div className="hidden min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex md:gap-x-4 lg:gap-x-5">
            {navLinks.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "whitespace-nowrap border-b-2 border-indigo-600 py-1 text-sm font-semibold text-indigo-700"
                      : "whitespace-nowrap py-1 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {authSession && primary ? (
          <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
            {secondary ? (
              <Link href={secondary.href as Route} className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                {secondary.label}
              </Link>
            ) : null}
            <Link
              href={primary.href as Route}
              className="rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f46e5] active:scale-[0.98]"
            >
              {primary.label}
            </Link>
            <AuthUserMenu compact />
          </div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Log in
            </Link>
            <Link
              href="/register"
              className="hidden text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline"
            >
              Register
            </Link>
            <Link
              href="/early-access"
              className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5] active:scale-[0.98] sm:px-6"
            >
              Early access
            </Link>
          </div>
        )}

        <button
          type="button"
          className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-indigo-800 shadow-sm md:hidden"
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
            {authSession && primary ? (
              <>
                {secondary ? (
                  <Link
                    href={secondary.href as Route}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    {secondary.label}
                  </Link>
                ) : null}
                <Link
                  href={primary.href as Route}
                  className="rounded-lg bg-[#3525cd] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4f46e5]"
                  onClick={() => setOpen(false)}
                >
                  {primary.label}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/early-access"
                  className="mt-1 rounded-lg bg-[#3525cd] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4f46e5]"
                  onClick={() => setOpen(false)}
                >
                  Early access
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
