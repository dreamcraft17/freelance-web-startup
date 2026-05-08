import { formatAdminDateTime } from "@/features/admin/components/AdminUi";
import {
  AdminTable,
  AdminTableScroll,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  AdminTbody
} from "@/features/admin/components/tables/AdminTable";
import { AdminModerationReportRowActions } from "@/features/admin/components/reports/AdminModerationReportRowActions";

export type AdminModerationReportRow = {
  id: string;
  createdAt: Date | string;
  status: string;
  subjectType: string;
  subjectRef: string;
  category: string;
  descriptionPreview: string;
  reporterEmail: string;
  assigneeEmail: string | null;
  assigneeId: string | null;
  noteCount: number;
};

export function AdminModerationReportsTable({
  rows,
  staffUserId
}: {
  rows: AdminModerationReportRow[];
  staffUserId: string;
}) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>When</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Subject</AdminTh>
            <AdminTh>Reporter</AdminTh>
            <AdminTh>Assignee</AdminTh>
            <AdminTh>Notes</AdminTh>
            <AdminTh>Summary</AdminTh>
            <AdminTh className="text-right">Triage</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.id}>
              <AdminTd className="whitespace-nowrap text-xs text-slate-700">
                {formatAdminDateTime(typeof r.createdAt === "string" ? new Date(r.createdAt) : r.createdAt)}
              </AdminTd>
              <AdminTd>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-800 ring-1 ring-slate-200/70">
                  {r.status.replace(/_/g, " ")}
                </span>
              </AdminTd>
              <AdminTd>
                <p className="break-all font-mono text-[11px] text-slate-900">{r.subjectRef}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase text-slate-500">{r.subjectType}</p>
              </AdminTd>
              <AdminTd className="max-w-[10rem]">
                <span className="text-xs font-medium text-slate-900" title={r.reporterEmail}>
                  {r.reporterEmail}
                </span>
              </AdminTd>
              <AdminTd className="max-w-[8rem] text-xs text-slate-700">
                {r.assigneeEmail ?? <span className="text-slate-400">Unassigned</span>}
              </AdminTd>
              <AdminTd className="tabular-nums text-xs text-slate-800">{r.noteCount}</AdminTd>
              <AdminTd className="max-w-[18rem]">
                <p className="line-clamp-2 text-[11px] text-slate-700" title={`${r.category}: ${r.descriptionPreview}`}>
                  <span className="font-semibold text-slate-900">{r.category}</span>: {r.descriptionPreview}
                </p>
              </AdminTd>
              <AdminTd className="text-right align-top">
                <AdminModerationReportRowActions
                  reportId={r.id}
                  status={r.status}
                  assigneeId={r.assigneeId}
                  staffUserId={staffUserId}
                />
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
