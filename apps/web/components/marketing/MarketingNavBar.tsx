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
    <header className="fixed top-0 z-50 w-full border-b border-black/[0.05] bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-7 py-3 sm:px-10 lg:px-12">
        <Link href={"/" as Route} className="flex min-w-0 shrink-0 items-center gap-3.5 pr-3">
          <span className="relative inline-flex h-14 w-14 overflow-hidden rounded-xl border border-[#433C93]/15 bg-white shadow-[0_4px_18px_-10px_rgba(67,60,147,0.45)]">
            <img
              src="/logo/logo3.png"
              alt="NearWork"
              className="h-full w-[236px] max-w-none object-cover object-left"
            />
          </span>
          <span className="text-[1.55rem] font-bold leading-none tracking-[0.01em] text-[#231E59]">NearWork</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex min-w-0 items-center gap-6 lg:gap-7">
            {navLinks.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "whitespace-nowrap border-b-2 border-[#433C93]/45 py-1 text-sm font-medium text-slate-700"
                      : "whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-slate-600/90 transition-all duration-200 hover:border-[#433C93]/35 hover:text-[#433C93]"
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
            <Link
              href={primary.href as Route}
              className="rounded-md bg-[#433C93] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d45a5]"
            >
              {primary.label}
            </Link>
            <AuthUserMenu compact />
          </div>
        ) : (
          <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Register
            </Link>
            <Link
              href="/early-access"
              className="rounded-md bg-[#3A3288] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(58,50,136,0.9)] transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
            >
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
                  className="mt-1 rounded-lg bg-[#3A3288] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(58,50,136,0.9)] transition-all duration-200 hover:scale-[1.01] hover:brightness-110"
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
