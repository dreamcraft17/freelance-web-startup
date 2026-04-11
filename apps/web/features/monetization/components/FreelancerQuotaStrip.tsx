import type { FreelancerQuotaUsage } from "@/server/services/quota.service";

export function FreelancerQuotaStrip({ quota }: { quota: FreelancerQuotaUsage }) {
  if (quota.quotasUnlimited) {
    return (
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Quotas:</span> {quota.usage.activeBids} active bids,{" "}
        {quota.usage.activeContracts} active contracts — unlimited during early access (your plan: {quota.planKey}
        ).
      </p>
    );
  }

  return (
    <p className="text-muted-foreground">
      <span className="font-medium text-foreground">Quotas:</span> {quota.remaining.activeBids} bid slots left (
      {quota.usage.activeBids}/{quota.limits.activeBids}), {quota.remaining.activeContracts} contract slots left (
      {quota.usage.activeContracts}/{quota.limits.activeContracts}) — {quota.planKey} plan.
    </p>
  );
}
