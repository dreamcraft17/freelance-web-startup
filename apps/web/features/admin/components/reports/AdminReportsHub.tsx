import { ClipboardList, Gavel, Radio, ShieldAlert } from "lucide-react";

const WORKFLOW = [
  {
    icon: Radio,
    title: "Intake",
    copy: "User-submitted reports, automated flags, and escalations land in a single queue with source and context."
  },
  {
    icon: ClipboardList,
    title: "Triage",
    copy: "Staff assign severity, link evidence, and coordinate with support or legal before action."
  },
  {
    icon: Gavel,
    title: "Resolution",
    copy: "Outcomes documented: warnings, restrictions, reversals, or closure—with audit trail for compliance."
  }
] as const;

/**
 * Placeholder layout for future trust & safety / moderation reporting.
 * No report entities in the DB yet; structure is ready to swap for a real queue table.
 */
export function AdminReportsHub() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Intended workflow</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            This page is reserved for operational moderation—not analytics. Wire your report pipeline here when ready.
          </p>
        </div>
        <div className="grid gap-3 p-3.5 sm:grid-cols-3">
          {WORKFLOW.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-dashed border-slate-300/90 bg-white px-4 py-10 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50 text-amber-800">
          <ShieldAlert className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-base font-semibold text-slate-900">No moderation queue yet</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          This area is reserved for <strong className="font-semibold text-slate-800">trust &amp; safety</strong> and{" "}
          <strong className="font-semibold text-slate-800">moderation reports</strong>—for example abuse reports, policy
          violations, spam, and escalations from users or automated checks. When the reporting backend is connected, open
          items will appear here for triage and resolution.
        </p>
        <p className="mx-auto mt-4 max-w-md text-xs text-slate-500">
          Until then, use verification, jobs, and reviews for adjacent inspection workflows.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 border-dashed bg-slate-50/80 px-3.5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Future integration points</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-slate-600">
          <li>Persisted report records with status, assignee, and priority.</li>
          <li>Links to subject entities (profiles, jobs, messages) and immutable evidence snapshots.</li>
          <li>Optional notifications to reporters on resolution; audit log for staff actions.</li>
        </ul>
      </section>
    </div>
  );
}
