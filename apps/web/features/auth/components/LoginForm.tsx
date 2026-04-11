"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UserRole } from "@acme/types";
import { homePathForSessionRole, sanitizeReturnUrl } from "@src/lib/return-url";

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
};

export function LoginForm({ returnUrl }: LoginFormProps) {
  const router = useRouter();
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const form = e.currentTarget;
      const fd = new FormData(form);
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "same-origin"
        });

        const body = (await res.json()) as LoginApiSuccess | LoginApiError;

        if (!res.ok || !body.success) {
          const msg =
            !body.success && typeof body.error === "string" && body.error.length > 0
              ? body.error
              : "Could not sign in. Try again.";
          setError(msg);
          return;
        }

        const role = body.data.session.role;
        const fallback = homePathForSessionRole(role);
        const next = sanitizeReturnUrl(returnUrl ?? null, fallback);
        router.replace(next as Route);
        router.refresh();
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [returnUrl, router]
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to your account to continue</p>
      </div>

      <form className="space-y-6" onSubmit={submit} aria-busy={loading}>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor={emailId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={passwordId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
              className="flex h-11 w-full rounded-lg border border-input bg-background py-2 pl-3 pr-11 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-input bg-muted/40 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-60"
        title="Coming soon"
        aria-label="Continue with Google (coming soon)"
      >
        <GoogleMark className="h-5 w-5 shrink-0" aria-hidden />
        Continue with Google
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
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
