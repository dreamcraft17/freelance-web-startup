"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSubmitOverlay } from "@/features/auth/components/AuthSubmitOverlay";
import { useI18n } from "@/features/i18n/I18nProvider";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setNotice(null);
    setLoading(true);
    try {
      // Placeholder flow until reset-email backend is fully wired.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setNotice(t("auth.forgotPassword.noticePending"));
    } finally {
      setLoading(false);
    }
  }, [loading, t]);

  return (
    <form
      className="space-y-4"
      onSubmit={onSubmit}
      aria-busy={loading}
    >
      <AuthSubmitOverlay active={loading} message={t("auth.forgotPassword.sending")} />

      {notice ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{notice}</p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={loading} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
        ) : null}
        {loading ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
