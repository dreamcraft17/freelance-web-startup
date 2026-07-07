"use client";

import { Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionUpgradeModal } from "@/components/design-system/SubscriptionUpgradeModal";

type Props = {
  activeBids?: number;
  bidLimit?: number;
  planName?: string;
};

/** Shown when freelancer nears bid quota — matches V2 subscription limits alert. */
export function SubscriptionLimitsBanner({ activeBids = 0, bidLimit = 5, planName = "Free" }: Props) {
  if (bidLimit <= 0 || activeBids < bidLimit - 1) return null;
  const atLimit = activeBids >= bidLimit;

  return (
    <Alert variant={atLimit ? "warning" : "info"} className="mb-6">
      <Sparkles className="h-4 w-4" aria-hidden />
      <AlertTitle>{atLimit ? "Bid limit reached" : "Almost at your bid limit"}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {atLimit
            ? `You have used all ${bidLimit} active bids on the ${planName} plan.`
            : `You have ${activeBids}/${bidLimit} active bids on the ${planName} plan.`}
        </p>
        <SubscriptionUpgradeModal currentPlan={planName} />
      </AlertDescription>
    </Alert>
  );
}
