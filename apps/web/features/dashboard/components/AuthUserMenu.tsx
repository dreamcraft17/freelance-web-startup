"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, Loader2, LogOut, Settings, User } from "lucide-react";
import { getSessionSnapshot, signOutCurrentSession } from "@/features/auth/lib/client-auth-actions";
import { cn } from "@/lib/utils";

type SessionDto = {
  userId: string;
  role: "CLIENT" | "FREELANCER" | string;
  accountStatus: string;
};

function initialsFromSession(session: SessionDto | null): string {
  if (!session) return "U";
  if (session.role === "CLIENT") return "CL";
  if (session.role === "FREELANCER") return "FR";
  return session.userId.slice(0, 2).toUpperCase();
}

function profileHrefForRole(role: SessionDto["role"] | null): string {
  if (role === "FREELANCER") return "/freelancer/profile";
  if (role === "CLIENT") return "/client";
  if (role === "ADMIN" || role === "SUPPORT_ADMIN" || role === "MODERATOR" || role === "FINANCE_ADMIN") {
    return "/admin";
  }
  return "/settings";
}

function settingsHrefForRole(role: SessionDto["role"] | null): string {
  if (role === "ADMIN" || role === "SUPPORT_ADMIN" || role === "MODERATOR" || role === "FINANCE_ADMIN") {
    return "/admin/settings";
  }
  return "/settings";
}

type AuthUserMenuProps = {
  compact?: boolean;
  /** Internal admin toolbar: flatter chrome, lighter shadows */
  variant?: "default" | "admin";
};

export function AuthUserMenu({ compact = false, variant = "default" }: AuthUserMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<SessionDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const snapshot = await getSessionSnapshot();
      if (!active) return;
      setSession(snapshot.ok && snapshot.data ? snapshot.data : null);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const initials = useMemo(() => initialsFromSession(session), [session]);
  const roleLabel = session?.role === "FREELANCER" ? "Freelancer" : session?.role === "CLIENT" ? "Client" : "User";
  const profileHref = profileHrefForRole(session?.role ?? null);
  const settingsHref = settingsHrefForRole(session?.role ?? null);

  const onLogout = () => {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await signOutCurrentSession();
      if (!result.ok) {
        setError("Could not sign out");
        return;
      }
      setOpen(false);
      // Hard redirect prevents lingering protected-route UI after cookie clear.
      window.location.assign("/");
    });
  };

  const adminChrome = variant === "admin";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border text-slate-700 transition hover:text-slate-900",
          adminChrome
            ? "border-slate-200/90 bg-white shadow-none hover:border-slate-300 hover:bg-slate-50"
            : "border-slate-200 bg-white/95 shadow-sm hover:border-slate-300 hover:bg-white",
          compact ? "h-8 px-2.5 text-xs font-semibold" : "h-9 px-3 text-sm font-medium"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3525cd]/12 text-[11px] font-bold text-[#3525cd] ring-1 ring-[#3525cd]/15">
          {initials}
        </span>
        {!compact ? <span className="hidden sm:inline">{roleLabel}</span> : null}
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1",
            adminChrome
              ? "shadow-md shadow-slate-900/[0.06]"
              : "shadow-lg shadow-slate-900/[0.12] ring-1 ring-slate-900/[0.03]"
          )}
        >
          <div className="border-b border-slate-100 px-3 pb-2 pt-2">
            <p className="text-xs font-semibold text-slate-800">{roleLabel} account</p>
            <p className="text-[11px] text-slate-500">Manage workspace and preferences</p>
          </div>
          <div className="p-1">
            <Link
              href={profileHref as Route}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              Profile
            </Link>
            <Link
              href={settingsHref as Route}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4 text-slate-400" aria-hidden />
              Settings
            </Link>
            <button
              type="button"
              onClick={onLogout}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
              {isPending ? "Signing out..." : "Log out"}
            </button>
          </div>
          {error ? <p className="px-3 pb-2 text-[11px] text-rose-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
