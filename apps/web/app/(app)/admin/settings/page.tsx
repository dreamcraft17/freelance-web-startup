import { db } from "@acme/database";
import { AdminPageIntro } from "@/features/admin/components/AdminUi";
import {
  AdminAccountCard,
  EnvironmentInfoCard,
  InternalPreferencesCard
} from "@/features/admin/components/settings/AdminSettingsSections";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminSettingsPage() {
  const session = await requireAdminAccess("settings");

  const user = await db.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    select: { email: true }
  });

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const vercelEnv = process.env.VERCEL_ENV?.trim() || null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageIntro
        title="Admin settings"
        description="Lightweight internal workspace preferences and context. No destructive controls on this page."
        badge="Internal"
      />

      <AdminAccountCard
        userId={session.userId}
        email={user?.email ?? null}
        role={session.role}
        accountStatus={session.accountStatus}
      />

      <InternalPreferencesCard />

      <EnvironmentInfoCard nodeEnv={nodeEnv} vercelEnv={vercelEnv} />
    </div>
  );
}
