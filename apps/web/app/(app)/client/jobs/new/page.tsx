import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import { Briefcase } from "lucide-react";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import {
  ClientNewJobForm,
  type ClientNewJobCategoryOption
} from "@/components/client-jobs/ClientNewJobForm";

export default async function ClientNewJobPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/client/jobs/new");
  }

  const clientProfile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: { id: true }
  });

  if (!clientProfile) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-10">
        <header className="border-b border-slate-200/80 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">NearWork · Client</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Post a new job</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Complete your client profile before publishing roles so freelancers see a trustworthy company context.
          </p>
        </header>
        <DashboardEmptyState
          tone="elevated"
          kicker="Profile"
          icon={Briefcase}
          title="Set up your client profile first"
          description="Job creation uses your client workspace. Finish setup in settings, then return here to publish."
          action={{ label: "Go to settings", href: "/settings" }}
          secondaryAction={{ label: "Back to my jobs", href: "/client/jobs" }}
        />
      </div>
    );
  }

  const rows = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      subcategories: {
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
        select: { id: true, slug: true, name: true }
      }
    }
  });

  const categories: ClientNewJobCategoryOption[] = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    subcategories: c.subcategories.map((s) => ({ id: s.id, slug: s.slug, name: s.name }))
  }));

  return <ClientNewJobForm categories={categories} />;
}
