"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sanitizeReturnUrl } from "@src/lib/return-url";
import { hasActiveSession } from "@/features/auth/lib/client-auth-actions";
import { parseAuthIntent, roleHintFromIntent, type AuthIntent } from "@/features/auth/lib/auth-intent";
import { cn } from "@/lib/utils";

type AuthAwareCtaLinkProps = {
  href: string;
  intent: AuthIntent;
  className?: string;
  children: React.ReactNode;
  /** If unauthenticated, where should we send users first? */
  unauthenticatedTo?: "login" | "register";
  /** Optional explicit role hint for register page. */
  registerRoleHint?: "client" | "freelancer";
};

function buildAuthUrl(params: {
  target: string;
  intent: AuthIntent;
  unauthenticatedTo: "login" | "register";
  roleHint: "client" | "freelancer" | null;
}): string {
  const safeTarget = sanitizeReturnUrl(params.target, "/");
  const q = new URLSearchParams();
  q.set("intent", params.intent);
  if (params.unauthenticatedTo === "register") {
    q.set("next", safeTarget);
    if (params.roleHint) q.set("role", params.roleHint);
    return `/register?${q.toString()}`;
  }
  q.set("returnUrl", safeTarget);
  return `/login?${q.toString()}`;
}

export function AuthAwareCtaLink({
  href,
  intent,
  className,
  children,
  unauthenticatedTo = "login",
  registerRoleHint
}: AuthAwareCtaLinkProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    setBusy(true);
    try {
      const hasSession = await hasActiveSession();
      if (hasSession) {
        router.push(href as Route);
        return;
      }
      const roleHint = registerRoleHint ?? roleHintFromIntent(parseAuthIntent(intent));
      const authUrl = buildAuthUrl({
        target: href,
        intent,
        unauthenticatedTo,
        roleHint
      });
      router.push(authUrl as Route);
    } catch {
      const roleHint = registerRoleHint ?? roleHintFromIntent(parseAuthIntent(intent));
      const authUrl = buildAuthUrl({
        target: href,
        intent,
        unauthenticatedTo,
        roleHint
      });
      router.push(authUrl as Route);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      href={href as Route}
      onClick={(e) => void onClick(e)}
      aria-disabled={busy}
      className={cn(className, busy && "pointer-events-none opacity-80")}
    >
      {children}
    </Link>
  );
}
