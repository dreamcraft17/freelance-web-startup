"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { UserRole } from "@acme/types";
import type { SessionPayload } from "@/lib/session";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import { LocaleSwitcher } from "@/features/i18n/LocaleSwitcher";
import { useI18n } from "@/features/i18n/I18nProvider";
import {
  type PublicSessionLite,
  primaryActionForRole,
  secondaryActionForRole
} from "@/features/public/lib/auth-nav";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { cn } from "@/lib/utils";

const navDiscovery = [
  { href: "/jobs", labelKey: "nav.jobs" },
  { href: "/freelancers", labelKey: "nav.freelancers" }
] as const;

const navProduct = [
  { href: "/how-it-works", labelKey: "nav.howItWorks" },
  { href: "/pricing", labelKey: "nav.pricing" },
  { href: "/help", labelKey: "nav.help" }
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/help") return pathname === "/help" || pathname.startsWith("/help/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function contextualSignedInCta(role: UserRole, fallback: { labelKey: string; href: string }): {
  labelKey: string;
  href: string;
} {
  if (role === UserRole.CLIENT) return { labelKey: "nav.postAJob", href: "/client/jobs/new" };
  if (role === UserRole.FREELANCER) return { labelKey: "nav.findJobs", href: "/jobs" };
  return fallback;
}

function CenterNavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href as Route}
      aria-label={label}
      className={cn(
        "relative whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium tracking-tight transition-colors",
        active
          ? "border-[#4f35e8] text-[#4f35e8]"
          : "border-transparent text-slate-700 hover:text-slate-900"
      )}
    >
      {label}
    </Link>
  );
}

function MockLanguagePills() {
  return (
    <div className="hidden items-center gap-1 xl:flex" aria-label="language switch">
      <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">EN</span>
      <span className="rounded-md bg-[#111827] px-1.5 py-0.5 text-[10px] font-semibold text-white">ID</span>
      <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">FR</span>
    </div>
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
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const authSession: PublicSessionLite | null = session
    ? { userId: session.userId, role: session.role, accountStatus: session.accountStatus }
    : null;
  const primary = authSession ? primaryActionForRole(authSession.role) : null;
  const secondary = authSession ? secondaryActionForRole(authSession.role) : null;
  const signedInCta =
    authSession && primary
      ? contextualSignedInCta(authSession.role, { labelKey: primary.labelKey, href: primary.href })
      : { labelKey: "nav.dashboard", href: "/" };

  const unreadBadgeLabel = (count: number): string => {
    if (count <= 0) return t("nav.notifications");
    if (count > 9) return t("nav.aria.notificationsOverflow");
    if (count === 1) return t("nav.aria.notificationsOne");
    return t("nav.aria.notificationsSome", { count });
  };

  const unreadMessagesLabel = (count: number): string => {
    if (count <= 0) return t("nav.messages");
    if (count > 9) return t("nav.aria.messagesOverflow");
    if (count === 1) return t("nav.aria.messagesOne");
    return t("nav.aria.messagesSome", { count });
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white">
      <nav className="mx-auto flex min-h-[4.5rem] max-w-[1280px] items-center px-4 sm:px-6">
        <div className="flex shrink-0 items-center py-1 pr-3 sm:pr-4 lg:pr-5">
          <BrandLogo
            href={"/" as Route}
            className="inline-flex max-w-[min(86vw,280px)] items-center outline-none transition duration-200 hover:opacity-[0.88] motion-reduce:transition-none sm:max-w-[min(64vw,330px)] lg:max-w-[350px] xl:max-w-[400px]"
            imageClassName="h-10 w-auto object-contain object-left sm:h-10 lg:h-12 lg:max-h-[3rem]"
            alt="NearWork"
          />
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex min-w-0 max-w-full items-center gap-x-1">
            <div className="flex min-w-0 items-center gap-x-0.5">
              {[...navDiscovery, ...navProduct].map(({ href, labelKey }) => (
                <CenterNavLink key={href} href={href} label={t(labelKey)} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>

        {authSession && primary ? (
          <div className="ml-auto hidden shrink-0 items-center gap-2 border-l border-slate-100 pl-4 lg:flex">
            <span className="text-[13px] font-medium text-slate-700">{t("nav.signedIn")}</span>
            <Link href={"/messages" as Route} className="text-[13px] font-medium text-slate-700 hover:text-slate-900">
              {t("nav.messages")}
            </Link>
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
            <Link
              href={"/jobs" as Route}
              className="nw-cta-primary whitespace-nowrap rounded-lg bg-[#4f35e8] px-3.5 py-2 text-[13px] font-semibold text-white shadow-none hover:bg-[#4326d9]"
            >
              Cari lowongan
            </Link>
            <MockLanguagePills />
            <LocaleSwitcher />
            <AuthUserMenu compact />
          </div>
        ) : (
          <div className="ml-auto hidden shrink-0 items-center gap-2 border-l border-slate-100 pl-4 lg:flex">
            <Link href={"/login" as Route} className="px-3 py-2 text-[13px] font-semibold text-slate-700 hover:text-slate-900">
              Masuk
            </Link>
            <Link
              href={"/register" as Route}
              className="rounded-lg bg-[#4f35e8] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#4326d9]"
            >
              Daftar
            </Link>
            <LocaleSwitcher />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center self-center rounded-md border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50"
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t("nav.closeMenu") : t("nav.openMenu")}</span>
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="marketing-mobile-nav" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t("nav.explore")}
            </p>
            {[...navDiscovery, ...navProduct].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition hover:bg-slate-50",
                  item.href === "/jobs" || item.href === "/freelancers"
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-600"
                )}
                onClick={() => setOpen(false)}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            {authSession && primary ? (
              <>
                <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {t("nav.signedIn")}
                </p>
                {secondary ? (
                  <Link
                    href={secondary.href as Route}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    {t(secondary.labelKey)}
                  </Link>
                ) : null}
                <Link
                  href={"/notifications" as Route}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <span>{t("nav.notifications")}</span>
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
                    {t("nav.messages")}
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
                  {t(signedInCta.labelKey)}
                </Link>
              </>
            ) : (
              <>
                <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {t("nav.account")}
                </p>
                <Link
                  href="/jobs"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.browseJobs")}
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.logIn")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.register")}
                </Link>
                <Link
                  href="/register?role=CLIENT&intent=post-job"
                  className="nw-cta-primary mt-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.startHiring")}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
