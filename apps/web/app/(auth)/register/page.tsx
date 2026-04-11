import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayoutShell title="Create an account" description="Join as a client or freelancer.">
      <RegisterForm />
    </AuthLayoutShell>
  );
}
