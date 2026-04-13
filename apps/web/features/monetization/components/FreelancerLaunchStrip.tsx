import { db } from "@acme/database";
import { QuotaService } from "@/server/services/quota.service";
import { EarlyAccessBadge } from "./EarlyAccessBadge";
import { FreelancerQuotaStrip } from "./FreelancerQuotaStrip";
import { SupportPlatformCta } from "./SupportPlatformCta";

export async function FreelancerLaunchStrip({ userId }: { userId: string }) {
  const profile = await db.freelancerProfile.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true }
  });

  const quota = profile ? await new QuotaService().getUsageForFreelancerUser(userId) : null;

  return (
    <div className="flex flex-col gap-4 text-sm lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <EarlyAccessBadge />
          <span className="leading-relaxed text-slate-600">
            Full platform access while we ship billing. Optional{" "}
            <span className="font-medium text-slate-900">Upgrade to Pro</span> labels preview future perks — nothing is
            locked yet.
          </span>
        </div>
        {quota ? (
          <FreelancerQuotaStrip quota={quota} />
        ) : (
          <p className="text-slate-600">Create a freelancer profile to see bid and contract quota usage here.</p>
        )}
      </div>
      <div className="shrink-0 border-t border-slate-100 pt-3 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
        <SupportPlatformCta />
      </div>
    </div>
  );
}
