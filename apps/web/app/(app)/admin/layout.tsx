import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { requireStaffSession } from "@/features/admin/lib/server-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireStaffSession();
  return <AdminShell role={session.role}>{children}</AdminShell>;
}

