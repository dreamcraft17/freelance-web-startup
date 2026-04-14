import { VerificationStatus } from "@acme/types";
import { formatAdminDateTime } from "@/features/admin/components/AdminUi";
import {
  AdminIdCell,
  AdminTable,
  AdminTableScroll,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  AdminTbody
} from "@/features/admin/components/tables/AdminTable";
import { VerificationReviewActions } from "./VerificationReviewActions";

export type AdminVerificationRow = {
  id: string;
  userEmail: string;
  userRole: string;
  type: string;
  status: VerificationStatus;
  statusLabel: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewerEmail: string | null;
  reviewNote: string | null;
};

function StatusPill({ status, label }: { status: VerificationStatus; label: string }) {
  const tone =
    status === VerificationStatus.PENDING
      ? "bg-amber-50 text-amber-900 ring-amber-200"
      : status === VerificationStatus.VERIFIED
        ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
        : status === VerificationStatus.REJECTED
          ? "bg-rose-50 text-rose-900 ring-rose-200"
          : "bg-slate-100 text-slate-800 ring-slate-200";

  return (
    <span
      className={`inline-flex max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ring-1 ${tone}`}
      title={status}
    >
      {label}
    </span>
  );
}

export function AdminVerificationTable({ rows }: { rows: AdminVerificationRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Request</AdminTh>
            <AdminTh>User</AdminTh>
            <AdminTh>Type</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Created</AdminTh>
            <AdminTh>Review</AdminTh>
            <AdminTh className="min-w-[11rem]">Actions</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.id}>
              <AdminIdCell id={r.id} />
              <AdminTd className="max-w-[14rem]">
                <span className="font-medium text-slate-900" title={r.userEmail}>
                  {r.userEmail}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{r.userRole}</p>
              </AdminTd>
              <AdminTd className="font-mono text-xs text-slate-700">{r.type}</AdminTd>
              <AdminTd>
                <StatusPill status={r.status} label={r.statusLabel} />
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(r.createdAt)}</AdminTd>
              <AdminTd className="max-w-[12rem] text-xs text-slate-600">
                {r.reviewedAt ? (
                  <>
                    <p className="whitespace-nowrap">{formatAdminDateTime(r.reviewedAt)}</p>
                    {r.reviewerEmail ? (
                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500" title={r.reviewerEmail}>
                        by {r.reviewerEmail}
                      </p>
                    ) : null}
                    {r.reviewNote ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-500" title={r.reviewNote}>
                        {r.reviewNote}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </AdminTd>
              <AdminTd className="align-top">
                {r.status === VerificationStatus.PENDING ? (
                  <VerificationReviewActions requestId={r.id} />
                ) : (
                  <span className="text-[11px] text-slate-400">—</span>
                )}
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
