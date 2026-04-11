import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayoutShell title="Reset password" description="We will email you a link when auth is wired.">
      <ForgotPasswordForm />
    </AuthLayoutShell>
  );
}
