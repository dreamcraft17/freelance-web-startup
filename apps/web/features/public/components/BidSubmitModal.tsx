"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JobProposalForm } from "@/features/public/components/JobProposalForm";

type Props = {
  jobId: string;
  currency: string;
  userId?: string | null;
  clientUserId?: string | null;
  labels: React.ComponentProps<typeof JobProposalForm>["labels"];
  triggerLabel: string;
  className?: string;
};

/** V2 bid submission — modal on mobile, inline-friendly trigger. */
export function BidSubmitModal({ jobId, currency, userId, clientUserId, labels, triggerLabel, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className ?? "min-h-11 w-full"} size="lg">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent title={labels.title} description={labels.subtitle} className="max-w-2xl">
        <JobProposalForm
          jobId={jobId}
          currency={currency}
          userId={userId}
          clientUserId={clientUserId}
          labels={labels}
          onSubmitted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
