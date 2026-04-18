"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useId, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UserRole } from "@acme/types";
import { resolvePostLoginRedirect, sanitizeReturnUrl } from "@src/lib/return-url";
import { buildLoginToRegisterHref, loginIntentMessage, type AuthIntent } from "@/features/auth/lib/auth-intent";
import { clearPasswordFieldsInForm } from "@/features/auth/lib/clear-form-password-fields";
import { readApiBody } from "@/features/auth/lib/read-api-body";

type LoginApiSuccess = {
  success: true;
  data: {
    session: { userId: string; role: UserRole; accountStatus: string };
  };
};

type LoginApiError = {
  success: false;
  error?: string;
  code?: string;
};

export type LoginFormProps = {
  returnUrl?: string | null;
  intent?: AuthIntent;
};

export function LoginForm({ returnUrl, intent = "continue" }: LoginFormProps) {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUpHref = useMemo(() => {
    return buildLoginToRegisterHref({ returnUrl, intent });
  }, [intent, returnUrl]);

  const contextMessage = useMemo(() => {
    const direct = loginIntentMessage(intent);
    if (direct) return direct;

    const safe = sanitizeReturnUrl(returnUrl ?? null, "/");
    if (safe === "/") return null;
    if (safe === "/client" || safe.startsWith("/client/")) return "Log in to continue to your client dashboard.";
    if (safe === "/freelancer" || safe.startsWith("/freelancer/")) {
      return "Log in to continue to your freelancer dashboard.";
    }
    if (safe === "/messages" || safe.startsWith("/messages/")) return "Log in to continue to your messages.";
    if (safe === "/notifications" || safe.startsWith("/notifications/")) {
      return "Log in to continue to your notifications.";
    }
    if (safe === "/settings" || safe.startsWith("/settings/")) return "Log in to continue to your settings.";
    if (safe === "/admin" || safe.startsWith("/admin/")) return "Log in to continue to internal admin.";
    return "Log in to continue.";
  }, [intent, returnUrl]);

  const destinationHint = useMemo(() => {
    const safe = sanitizeReturnUrl(returnUrl ?? null, "/");
    return safe !== "/" ? safe : null;
  }, [returnUrl]);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const form = e.currentTarget;
      const fd = new FormData(form);
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");
      clearPasswordFieldsInForm(form, ["password"]);

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "same-origin"
        });

        const parsed = await readApiBody<LoginApiSuccess | LoginApiError>(res);
        if (!parsed.ok) {
          setError(parsed.message);
          return;
        }

        const body = parsed.data;
        if (!res.ok || !body.success) {
          const msg =
            !body.success && typeof body.error === "string" && body.error.length > 0
              ? body.error
              : "Could not sign in. Try again.";
          setError(msg);
          return;
        }

        const role = body.data.session.role;
        form.reset();
        window.location.assign(resolvePostLoginRedirect(role, returnUrl));
      } catch (err) {
        const msg = err instanceof Error && err.message ? err.message : "Request failed";
        setError(
          /failed to fetch|networkerror|load failed/i.test(msg)
            ? "Could not reach the server. Check your connection, VPN, or ad blockers, then try again."
            : `Something went wrong: ${msg}`
        );
      } finally {
        setLoading(false);
      }
    },
    [returnUrl]
  );

  return (
    <div className="space-y-8 text-slate-900">
      <div className="space-y-2 text-left">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Secure sign in
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back</h1>
        <p className="text-sm text-slate-500">Log in to your account to continue</p>
        {contextMessage ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            {contextMessage}
          </p>
        ) : null}
        {destinationHint ? (
          <p className="text-xs text-slate-500">
            After sign in, you&apos;ll continue to{" "}
            <span className="font-medium text-slate-700">{destinationHint}</span>.
          </p>
        ) : null}
      </div>

      <form className="space-y-6" onSubmit={submit} aria-busy={loading}>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor={emailId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            disabled={loading}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/35 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <Link
              href={"/forgot-password" as Route}
              className="text-xs font-medium text-[#3525cd] hover:text-[#4f46e5]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              className="block w-full rounded-lg border border-slate-200 bg-white py-3 pl-3 pr-11 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/35 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-[#3525cd] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#4f46e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3525cd] disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-slate-400">
          <span className="bg-white px-3">or</span>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
        title="Coming soon"
        aria-label="Continue with Google (coming soon)"
      >
        <GoogleMark className="h-5 w-5 shrink-0" aria-hidden />
        Continue with Google
      </button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref as Route} className="font-semibold text-[#3525cd] hover:text-[#4f46e5]">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
