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
    <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-4 text-sm shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <EarlyAccessBadge />
            <span className="text-muted-foreground">
              Full platform access while we ship billing. Optional{" "}
              <span className="font-medium text-foreground">Upgrade to Pro</span> labels preview future perks — nothing
              is locked yet.
            </span>
          </div>
          {quota ? <FreelancerQuotaStrip quota={quota} /> : (
            <p className="text-muted-foreground">
              Create a freelancer profile to see bid and contract quota usage here.
            </p>
          )}
        </div>
        <SupportPlatformCta />
      </div>
    </div>
  );
}
