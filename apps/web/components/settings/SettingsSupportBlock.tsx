"use client";

import type { Route } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { SupportPlatformCta } from "@/features/monetization/components/SupportPlatformCta";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";

export function SettingsSupportBlock() {
  return (
    <SettingsSectionCard
      icon={HeartHandshake}
      title="Support & contribution"
      description="Get help using NearWork or optionally support ongoing development."
      headingId="settings-support-heading"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            Questions, feedback, and roadmap notes belong in our{" "}
            <Link
              href={"/help" as Route}
              className="font-medium text-[#3525cd] underline-offset-4 hover:underline"
            >
              help center
            </Link>
            . Optional donations are recorded as demo entries until payments are wired up.
          </p>
        </div>
        <div className="shrink-0 sm:pt-0.5">
          <SupportPlatformCta />
        </div>
      </div>
    </SettingsSectionCard>
  );
}
