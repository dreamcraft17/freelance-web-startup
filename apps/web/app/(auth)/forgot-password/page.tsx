import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function ForgotPasswordPage() {
  const { t } = await getServerTranslator();

  return (
    <AuthLayoutShell
      title={t("auth.forgotPassword.title")}
      description={t("auth.forgotPassword.description")}
    >
      <ForgotPasswordForm />
    </AuthLayoutShell>
  );
}
