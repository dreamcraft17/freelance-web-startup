"use client";

import { ModerationReportButton } from "./ModerationReportButton";

type Props = { jobId: string };

export function ReportJobButton({ jobId }: Props) {
  return <ModerationReportButton intent="job" target={{ subjectType: "JOB", subjectJobId: jobId }} />;
}
