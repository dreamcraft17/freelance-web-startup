"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useMemo, useState } from "react";
import { Briefcase, Eye, EyeOff, UserRound } from "lucide-react";
import type { UserRole } from "@acme/types";
import { resolvePostLoginRedirect, sanitizeReturnUrl } from "@src/lib/return-url";
import { parseAuthIntent, registerIntentMessageKey, roleHintFromIntent, type AuthIntent } from "@/features/auth/lib/auth-intent";
import { useI18n } from "@/features/i18n/I18nProvider";
import { clearPasswordFieldsInForm } from "@/features/auth/lib/clear-form-password-fields";
import { readApiBody } from "@/features/auth/lib/read-api-body";
import { AuthSubmitOverlay } from "@/features/auth/components/AuthSubmitOverlay";

type RegisterApiSuccess = {
  success: true;
  data: {
    session: { userId: string; role: UserRole; accountStatus: string };
  };
};

type RegisterApiError = {
  success: false;
  error?: string;
  code?: string;
  details?: unknown;
};

type RegisterFormInnerProps = {
  initialNext?: string | null;
  initialRoleHint?: string | null;
  initialIntent?: AuthIntent;
};

function RegisterFormInner({ initialNext, initialRoleHint, initialIntent = "continue" }: RegisterFormInnerProps) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const id = useId();
  const nameId = `${id}-name`;
  const emailId = `${id}-email`;
  const passwordId = `${id}-password`;
  const confirmId = `${id}-confirm`;
  const roleLegendId = `${id}-role-legend`;

  const [role, setRole] = useState<"FREELANCER" | "CLIENT">("FREELANCER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextDest = searchParams.get("next") ?? initialNext ?? null;
  const intent = parseAuthIntent(searchParams.get("intent") ?? initialIntent);

  useEffect(() => {
    const r = (searchParams.get("role") ?? initialRoleHint ?? roleHintFromIntent(intent))?.toLowerCase();
    if (r === "client") setRole("CLIENT");
    else if (r === "freelancer") setRole("FREELANCER");
  }, [initialRoleHint, intent, searchParams]);

  const loginHref = useMemo(() => {
    const q = new URLSearchParams();
    if (intent !== "continue") q.set("intent", intent);
    if (!nextDest) return q.toString() ? `/login?${q.toString()}` : "/login";
    const safe = sanitizeReturnUrl(nextDest, "/");
    q.set("returnUrl", safe);
    return `/login?${q.toString()}`;
  }, [intent, nextDest]);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      setError(null);
      const form = e.currentTarget;
      const fd = new FormData(form);
      const fullName = String(fd.get("fullName") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");
      const confirmPassword = String(fd.get("confirmPassword") ?? "");

      if (password !== confirmPassword) {
        clearPasswordFieldsInForm(form, ["password", "confirmPassword"]);
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        clearPasswordFieldsInForm(form, ["password", "confirmPassword"]);
        setError("Password must be at least 8 characters.");
        return;
      }

      clearPasswordFieldsInForm(form, ["password", "confirmPassword"]);
      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            password,
            role
          }),
          credentials: "same-origin"
        });

        const parsed = await readApiBody<RegisterApiSuccess | RegisterApiError>(res);
        if (!parsed.ok) {
          setError(parsed.message);
          return;
        }

        const body = parsed.data;
        if (!res.ok || !body.success) {
          const msg =
            !body.success && typeof body.error === "string" && body.error.length > 0
              ? body.error
              : "Could not create account. Try again.";
          setError(msg);
          return;
        }

        const rawNext = searchParams.get("next");
        form.reset();
        window.location.assign(resolvePostLoginRedirect(body.data.session.role, rawNext));
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
    [loading, role, searchParams]
  );

  const signUpContext =
    nextDest && sanitizeReturnUrl(nextDest, "/") !== "/" ? (
      <p className="text-xs leading-relaxed text-slate-500">
        {t("auth.registerForm.afterCreate")}{" "}
        <span className="font-medium text-slate-700">{sanitizeReturnUrl(nextDest, "/")}</span>.
      </p>
    ) : null;
  const intentKey = registerIntentMessageKey(intent);
  const intentMessage = intentKey ? t(intentKey) : null;
  const roleOutcome = role === "CLIENT"
    ? {
        title: "Client workspace next",
        bullets: ["Post jobs in minutes", "Receive bids from freelancers", "Shortlist and message talent"]
      }
    : {
        title: "Freelancer workspace next",
        bullets: ["Set up your profile", "Apply to open jobs", "Message clients and track proposals"]
      };

  const inputClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-8 text-slate-900">
      <AuthSubmitOverlay active={loading} message={t("auth.registerForm.signingUp")} />

      <div className="space-y-2 text-left">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {t("auth.registerForm.badge")}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("auth.registerForm.title")}</h1>
        <p className="text-sm text-slate-500">{t("auth.registerForm.subtitle")}</p>
        {intentMessage ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            {intentMessage}
          </p>
        ) : null}
        {signUpContext}
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
          <label htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Full name
          </label>
          <input
            id={nameId}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Alex Morgan"
            disabled={loading}
            className={inputClass}
          />
        </div>

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
            className={inputClass}
          />
        </div>

        <fieldset className="space-y-3" aria-describedby={`${roleLegendId}-hint`}>
          <legend id={roleLegendId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            I am joining as
          </legend>
          <p id={`${roleLegendId}-hint`} className="sr-only">
            Tab to move between Freelancer and Client. Press Space to select. When a radio is focused, use Left
            and Right arrow keys to change the option.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:rounded-xl sm:border sm:border-slate-200 sm:bg-slate-100 sm:p-1">
            <label
              className={`flex flex-1 cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 sm:border-0 sm:py-3 ${
                role === "FREELANCER"
                  ? "border-[#3525cd] bg-white shadow-md ring-1 ring-[#3525cd]/20 sm:bg-white sm:shadow-sm sm:ring-0"
                  : "border-slate-200 bg-white hover:border-slate-300 sm:bg-transparent sm:hover:bg-white/70"
              }`}
            >
              <span className="flex shrink-0 items-start pt-0.5">
                <input
                  type="radio"
                  name="role"
                  value="FREELANCER"
                  checked={role === "FREELANCER"}
                  onChange={() => setRole("FREELANCER")}
                  disabled={loading}
                  className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <UserRound
                    className={`h-5 w-5 shrink-0 ${role === "FREELANCER" ? "text-[#3525cd]" : "text-slate-500"}`}
                    aria-hidden
                  />
                  <span
                    className={`text-sm font-semibold ${role === "FREELANCER" ? "text-[#221a80]" : "text-slate-900"}`}
                  >
                    Freelancer
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">
                  Create a profile and apply to jobs
                </span>
              </span>
            </label>
            <label
              className={`flex flex-1 cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 sm:border-0 sm:py-3 ${
                role === "CLIENT"
                  ? "border-[#3525cd] bg-white shadow-md ring-1 ring-[#3525cd]/20 sm:bg-white sm:shadow-sm sm:ring-0"
                  : "border-slate-200 bg-white hover:border-slate-300 sm:bg-transparent sm:hover:bg-white/70"
              }`}
            >
              <span className="flex shrink-0 items-start pt-0.5">
                <input
                  type="radio"
                  name="role"
                  value="CLIENT"
                  checked={role === "CLIENT"}
                  onChange={() => setRole("CLIENT")}
                  disabled={loading}
                  className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <Briefcase
                    className={`h-5 w-5 shrink-0 ${role === "CLIENT" ? "text-[#3525cd]" : "text-slate-500"}`}
                    aria-hidden
                  />
                  <span
                    className={`text-sm font-semibold ${role === "CLIENT" ? "text-[#221a80]" : "text-slate-900"}`}
                  >
                    Client
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">Post jobs and receive bids</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{roleOutcome.title}</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
            {roleOutcome.bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]/60" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Password
          </label>
          <div className="relative">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              disabled={loading}
              className={`${inputClass} pr-11`}
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
          <p className="text-xs text-slate-400">At least 8 characters.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor={confirmId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confirm password
          </label>
          <div className="relative">
            <input
              id={confirmId}
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              disabled={loading}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              disabled={loading}
              aria-pressed={showConfirm}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-[#3525cd] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#4f46e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3525cd] disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? (
            <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
          ) : null}
          {loading ? t("auth.registerForm.submitting") : t("auth.registerForm.submit")}
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
        Already have an account?{" "}
        <Link href={loginHref as Route} className="font-semibold text-[#3525cd] hover:text-[#4f46e5]">
          Log in
        </Link>
      </p>
    </div>
  );
}

type RegisterFormProps = {
  initialNext?: string | null;
  initialRoleHint?: string | null;
  initialIntent?: AuthIntent;
};

export function RegisterForm({ initialNext, initialRoleHint, initialIntent }: RegisterFormProps) {
  return (
    <Suspense
      fallback={<p className="text-center text-sm text-slate-500">Loading signup…</p>}
    >
      <RegisterFormInner initialNext={initialNext} initialRoleHint={initialRoleHint} initialIntent={initialIntent} />
    </Suspense>
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
