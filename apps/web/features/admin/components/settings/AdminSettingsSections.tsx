import Link from "next/link";
import type { Route } from "next";
import type { AccountStatus, UserRole } from "@acme/types";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  SUPPORT_ADMIN: "Support admin",
  MODERATOR: "Moderator",
  FINANCE_ADMIN: "Finance admin"
};

type AdminAccountCardProps = {
  userId: string;
  email: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
};

export function AdminAccountCard({ userId, email, role, accountStatus }: AdminAccountCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Admin account</h3>
        <p className="mt-0.5 text-xs text-slate-500">Signed-in staff identity for this workspace (session-backed).</p>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <dl className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-x-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="font-medium text-slate-900">{email ?? "—"}</dd>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
          <dd className="text-slate-800">
            {ROLE_LABEL[role] ?? role}{" "}
            <span className="font-mono text-xs text-slate-500">({role})</span>
          </dd>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Account</dt>
          <dd>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">{accountStatus}</span>
          </dd>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User ID</dt>
          <dd>
            <code className="break-all font-mono text-[11px] text-slate-700" title={userId}>
              {userId}
            </code>
          </dd>
        </dl>
        <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
          Password and profile details use the same flows as the rest of the app (e.g. account settings outside this
          internal shell when wired).
        </p>
      </div>
    </section>
  );
}

export function InternalPreferencesCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Internal preferences</h3>
        <p className="mt-0.5 text-xs text-slate-500">Per-user admin UI options when we add persistence.</p>
      </div>
      <div className="px-4 py-4">
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center">
          <p className="text-sm text-slate-600">No saved preferences yet</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Future: default landing tab, compact tables, notification routing for on-call, and pinned internal links.
          </p>
        </div>
      </div>
    </section>
  );
}

type EnvironmentInfoCardProps = {
  nodeEnv: string;
  vercelEnv: string | null;
};

export function EnvironmentInfoCard({ nodeEnv, vercelEnv }: EnvironmentInfoCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Environment &amp; features</h3>
        <p className="mt-0.5 text-xs text-slate-500">Non-secret runtime hints for support and release checks.</p>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <dl className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-x-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">NODE_ENV</dt>
          <dd className="font-mono text-xs text-slate-800">{nodeEnv}</dd>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">VERCEL_ENV</dt>
          <dd className="font-mono text-xs text-slate-800">{vercelEnv ?? "—"}</dd>
        </dl>
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-600">
            Monetization toggles and resolved values:{" "}
            <Link href={"/admin/feature-flags" as Route} className="font-medium text-[#3525cd] hover:underline">
              Feature flags
            </Link>
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Secrets (database URLs, API keys) are never shown here. Use your host or secrets manager for configuration
          audits.
        </p>
      </div>
    </section>
  );
}
