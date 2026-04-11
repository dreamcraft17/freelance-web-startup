import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayoutShell title="Log in" description="Access your freelancer or client workspace.">
      <LoginForm />
    </AuthLayoutShell>
  );
}
