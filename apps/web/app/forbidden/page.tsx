import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        You do not have permission to open this area of the app. Use the dashboard for your account type, or sign in with a different user.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link className="text-primary text-sm font-medium underline-offset-4 hover:underline" href="/login">
          Sign in
        </Link>
        <Link className="text-primary text-sm font-medium underline-offset-4 hover:underline" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
