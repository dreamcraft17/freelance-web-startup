"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import type { SessionPayload } from "@src/lib/session";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import {
  type PublicSessionLite,
  primaryActionForRole,
  secondaryActionForRole
} from "@/features/public/lib/auth-nav";

/** Discovery-first — reads like a product shell, not a brochure nav */
const navPrimary = [
  { href: "/jobs", label: "Jobs" },
  { href: "/freelancers", label: "Freelancers" }
] as const;

const navSecondary = [
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
    <header className="fixed top-0 z-50 w-full border-b border-black/[0.05] bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-7 py-3 sm:px-10 lg:px-12">
        <Link href={"/" as Route} className="flex min-w-0 shrink-0 items-center gap-3.5 pr-3">
          <span className="relative inline-flex h-14 w-14 overflow-hidden rounded-xl border border-[#433C93]/15 bg-white">
            <img
              src="/logo/logo3.png"
              alt="NearWork"
              className="h-full w-[236px] max-w-none object-cover object-left"
            />
          </span>
          <span className="text-[1.55rem] font-semibold leading-none tracking-[0.01em] text-[#231E59]">NearWork</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-1">
            {navPrimary.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "whitespace-nowrap rounded-md bg-[#433C93]/10 px-3 py-2 text-sm font-semibold text-[#2f2a68]"
                      : "whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-[#433C93]"
                  }
                >
                  {label}
                </Link>
              );
            })}
            <span className="mx-1 hidden h-5 w-px bg-slate-200 lg:inline-block" aria-hidden />
            {navSecondary.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "whitespace-nowrap px-2.5 py-2 text-xs font-medium text-[#433C93] underline decoration-[#433C93]/30 underline-offset-4"
                      : "whitespace-nowrap px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-800"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        {authSession && primary ? (
          <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
            {secondary ? (
              <Link href={secondary.href as Route} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {secondary.label}
              </Link>
            ) : null}
            <Link
              href={"/notifications" as Route}
              aria-label="Notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <Bell className="h-4 w-4" aria-hidden />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" aria-hidden />
            </Link>
            <Link
              href={"/messages" as Route}
              aria-label="Messages"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={primary.href as Route} className="nw-cta-primary px-4 py-2">
              {primary.label}
            </Link>
            <AuthUserMenu compact />
          </div>
        ) : (
          <div className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
            <Link
              href="/jobs"
              className="rounded-md px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Browse jobs
            </Link>
            <Link href="/login" className="rounded-md px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              Log in
            </Link>
            <Link href="/register" className="rounded-md px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              Register
            </Link>
            <Link href="/early-access" className="nw-cta-primary px-4 py-2">
              Early access
            </Link>
          </div>
        )}

        <button
          type="button"
          className="ml-auto inline-flex shrink-0 rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
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
          className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Browse</p>
            {navPrimary.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Product</p>
            {navSecondary.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
                  href={"/notifications" as Route}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  href={"/messages" as Route}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  href={primary.href as Route}
                  className="rounded-lg bg-[#433C93] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4d45a5]"
                  onClick={() => setOpen(false)}
                >
                  {primary.label}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Browse jobs
                </Link>
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
                <Link href="/early-access" className="nw-cta-primary mt-1 rounded-lg px-4 py-2.5 text-center" onClick={() => setOpen(false)}>
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
