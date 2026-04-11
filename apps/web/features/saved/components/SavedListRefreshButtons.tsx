"use client";

import { useRouter } from "next/navigation";
import { SaveFreelancerButton } from "./SaveFreelancerButton";
import { SaveJobButton } from "./SaveJobButton";

export function SavedJobUnsaveButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  return (
    <SaveJobButton
      jobId={jobId}
      initialSaved
      onSavedChange={(saved) => {
        if (!saved) router.refresh();
      }}
    />
  );
}

export function SavedFreelancerUnsaveButton({ freelancerProfileId }: { freelancerProfileId: string }) {
  const router = useRouter();
  return (
    <SaveFreelancerButton
      freelancerProfileId={freelancerProfileId}
      initialSaved
      onSavedChange={(saved) => {
        if (!saved) router.refresh();
      }}
    />
  );
}
