import type { ReactNode } from "react";
import Link from "next/link";

type AuthLayoutShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthLayoutShell({ title, description, children }: AuthLayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 text-sm font-semibold text-muted-foreground hover:text-foreground">
        ← Acme Freelance
      </Link>
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
