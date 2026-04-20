"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { UserRole } from "@acme/types";
import type { SessionPayload } from "@src/lib/session";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import {
  type PublicSessionLite,
  primaryActionForRole,
  secondaryActionForRole
} from "@/features/public/lib/auth-nav";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { cn } from "@/lib/utils";

/** Center column: discovery first (stronger), then product/support (lighter). */
const navDiscovery = [
  { href: "/jobs", label: "Jobs", hint: "Find work" },
  { href: "/freelancers", label: "Freelancers", hint: "Hire talent" }
] as const;

const navProduct = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" }
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/help") return pathname === "/help" || pathname.startsWith("/help/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function unreadBadgeLabel(count: number): string {
  if (count <= 0) return "Notifications";
  if (count > 9) return "More than 9 unread notifications";
  return `${count} unread notification${count === 1 ? "" : "s"}`;
}

function unreadMessagesLabel(count: number): string {
  if (count <= 0) return "Messages";
  if (count > 9) return "More than 9 unread message threads";
  return `${count} unread message thread${count === 1 ? "" : "s"}`;
}

function contextualSignedInCta(role: UserRole, fallback: { label: string; href: string }): {
  label: string;
  href: string;
} {
  if (role === UserRole.CLIENT) return { label: "Post a job", href: "/client/jobs/new" };
  if (role === UserRole.FREELANCER) return { label: "Find jobs", href: "/jobs" };
  return fallback;
}

function CenterNavLink({
  href,
  label,
  hint,
  pathname,
  emphasis
}: {
  href: string;
  label: string;
  hint?: string;
  pathname: string;
  emphasis: "discovery" | "product";
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href as Route}
      title={hint}
      aria-label={hint ? `${label} — ${hint}` : label}
      className={cn(
        "relative whitespace-nowrap border-b-2 px-2.5 py-3.5 text-sm transition-colors",
        emphasis === "discovery" ? "font-semibold tracking-tight" : "font-medium",
        active
          ? "border-[#3525cd] text-[#3525cd]"
          : cn(
              "border-transparent",
              emphasis === "discovery"
                ? "text-slate-800 hover:text-slate-950"
                : "text-slate-600 hover:text-slate-900"
            )
      )}
    >
      {label}
    </Link>
  );
}

export function MarketingNavBar({
  session,
  unreadNotifications = 0,
  unreadMessages = 0
}: {
  session: SessionPayload | null;
  unreadNotifications?: number;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const authSession: PublicSessionLite | null = session
    ? { userId: session.userId, role: session.role, accountStatus: session.accountStatus }
    : null;
  const primary = authSession ? primaryActionForRole(authSession.role) : null;
  const secondary = authSession ? secondaryActionForRole(authSession.role) : null;
  const signedInCta = authSession && primary
    ? contextualSignedInCta(authSession.role, primary)
    : { label: "Dashboard", href: "/" };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/90 bg-white">
      <nav className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
        {/* Brand — strongest anchor */}
        <div className="flex shrink-0 items-center py-1 pr-4 sm:pr-6 lg:pr-10">
          <BrandLogo
            href={"/" as Route}
            className="inline-flex max-w-[min(88vw,300px)] items-center outline-none transition duration-200 hover:opacity-[0.88] motion-reduce:transition-none sm:max-w-[min(70vw,340px)] md:max-w-[min(52vw,380px)] lg:max-w-[420px]"
            imageClassName="h-10 w-auto object-contain object-left sm:h-11 md:h-12 md:max-h-[3rem]"
            alt="NearWork"
          />
        </div>

        {/* Primary navigation — lighter than brand; grouped rhythm */}
        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-0.5 sm:gap-x-1">
            <div className="flex items-center">
              {navDiscovery.map(({ href, label, hint }) => (
                <CenterNavLink key={href} href={href} label={label} hint={hint} pathname={pathname} emphasis="discovery" />
              ))}
            </div>
            <span
              className="mx-2 hidden h-5 w-px shrink-0 bg-slate-200 sm:block lg:mx-3"
              aria-hidden
            />
            <div className="flex flex-wrap items-center justify-center gap-x-0.5 sm:gap-x-1">
              {navProduct.map(({ href, label }) => (
                <CenterNavLink key={href} href={href} label={label} pathname={pathname} emphasis="product" />
              ))}
            </div>
          </div>
        </div>

        {/* Utility / auth — visually secondary to main nav */}
        {authSession && primary ? (
          <div className="ml-auto hidden shrink-0 items-center gap-2 border-l border-slate-100 pl-4 md:flex lg:gap-3 lg:pl-6 xl:pl-8">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 xl:inline">
              Signed in
            </span>
            {secondary ? (
              <Link
                href={secondary.href as Route}
                className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {secondary.label}
              </Link>
            ) : null}
            <Link
              href={"/notifications" as Route}
              aria-label={unreadBadgeLabel(unreadNotifications)}
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <Bell className="h-4 w-4" aria-hidden />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#3525cd] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
            <Link
              href={"/messages" as Route}
              aria-label={unreadMessagesLabel(unreadMessages)}
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              {unreadMessages > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              ) : null}
            </Link>
            <Link href={signedInCta.href as Route} className="nw-cta-primary px-4 py-2 text-sm font-semibold shadow-none">
              {signedInCta.label}
            </Link>
            <AuthUserMenu compact />
          </div>
        ) : (
          <div className="ml-auto hidden shrink-0 items-center gap-1 border-l border-slate-100 pl-4 md:flex lg:gap-2 lg:pl-6 xl:pl-8">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 xl:inline">
              Guest mode
            </span>
            <Link
              href="/jobs"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Browse jobs
            </Link>
            <Link
              href="/login"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              Register
            </Link>
            <Link
              href="/register?role=CLIENT&intent=post-job"
              className="nw-cta-primary ml-1 px-4 py-2 text-sm font-semibold shadow-none"
            >
              Start hiring
            </Link>
          </div>
        )}

        <button
          type="button"
          className="ml-auto inline-flex shrink-0 items-center justify-center self-center rounded-md border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50 md:hidden"
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
          className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Explore
            </p>
            {[...navDiscovery, ...navProduct].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={"hint" in item ? item.hint : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition hover:bg-slate-50",
                  item.href === "/jobs" || item.href === "/freelancers"
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-600"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            {authSession && primary ? (
              <>
                <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Signed in
                </p>
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
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <span>Notifications</span>
                  {unreadNotifications > 0 ? (
                    <span className="rounded-full bg-[#3525cd] px-2 py-0.5 text-[11px] font-semibold text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={"/messages" as Route}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    Messages
                    {unreadMessages > 0 ? (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    ) : null}
                  </span>
                </Link>
                <Link
                  href={signedInCta.href as Route}
                  className="rounded-lg bg-[#433C93] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4d45a5]"
                  onClick={() => setOpen(false)}
                >
                  {signedInCta.label}
                </Link>
              </>
            ) : (
              <>
                <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Account
                </p>
                <Link
                  href="/jobs"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Browse jobs
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/register?role=CLIENT&intent=post-job"
                  className="nw-cta-primary mt-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Start hiring
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
