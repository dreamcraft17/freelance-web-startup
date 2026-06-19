import { ModerationReportPriority } from "@acme/types";

export type ModerationTriage = {
  priority: ModerationReportPriority;
  slaHours: number;
};

const TRIAGE_BY_CATEGORY: Readonly<Record<string, ModerationTriage>> = {
  harassment: { priority: ModerationReportPriority.URGENT, slaHours: 4 },
  scam: { priority: ModerationReportPriority.URGENT, slaHours: 4 },
  policy: { priority: ModerationReportPriority.HIGH, slaHours: 12 },
  ip: { priority: ModerationReportPriority.HIGH, slaHours: 24 },
  spam: { priority: ModerationReportPriority.NORMAL, slaHours: 24 },
  other: { priority: ModerationReportPriority.LOW, slaHours: 48 }
};

export function moderationTriageForCategory(category: string): ModerationTriage {
  return TRIAGE_BY_CATEGORY[category.toLowerCase()] ?? {
    priority: ModerationReportPriority.NORMAL,
    slaHours: 24
  };
}
