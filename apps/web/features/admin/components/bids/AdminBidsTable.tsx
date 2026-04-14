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

export type AdminBidRow = {
  id: string;
  freelancerLine: string;
  /** Second line when full name is shown (e.g. @handle). */
  freelancerHandle?: string;
  jobTitle: string;
  jobSlug: string;
  amountLabel: string;
  status: string;
  createdAt: Date;
};

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-800 ring-1 ring-slate-200/80">
      {children}
    </span>
  );
}

export function AdminBidsTable({ bids }: { bids: AdminBidRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Bid ID</AdminTh>
            <AdminTh>Freelancer</AdminTh>
            <AdminTh>Job</AdminTh>
            <AdminTh className="text-right">Amount</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {bids.map((b) => (
            <AdminTr key={b.id}>
              <AdminIdCell id={b.id} />
              <AdminTd className="max-w-[14rem]">
                <span className="font-medium text-slate-900">{b.freelancerLine}</span>
                {b.freelancerHandle ? (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">{b.freelancerHandle}</p>
                ) : null}
              </AdminTd>
              <AdminTd className="max-w-[18rem]">
                <span className="text-slate-900" title={b.jobTitle}>
                  {b.jobTitle}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400" title={b.jobSlug}>
                  {b.jobSlug}
                </p>
              </AdminTd>
              <AdminTd className="text-right font-medium tabular-nums text-slate-900">{b.amountLabel}</AdminTd>
              <AdminTd>
                <StatusPill>{b.status}</StatusPill>
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(b.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
