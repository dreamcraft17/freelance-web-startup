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

export type AdminJobRow = {
  id: string;
  title: string;
  slug: string;
  clientLabel: string;
  status: string;
  createdAt: Date;
  bidCount: number;
};

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-800 ring-1 ring-slate-200/80">
      {children}
    </span>
  );
}

export function AdminJobsTable({ jobs }: { jobs: AdminJobRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Job ID</AdminTh>
            <AdminTh>Title</AdminTh>
            <AdminTh>Client</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Bids</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {jobs.map((j) => (
            <AdminTr key={j.id}>
              <AdminIdCell id={j.id} />
              <AdminTd className="max-w-[20rem]">
                <span className="font-medium text-slate-900" title={j.title}>
                  {j.title}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400" title={j.slug}>
                  {j.slug}
                </p>
              </AdminTd>
              <AdminTd className="max-w-[12rem] text-slate-700" title={j.clientLabel}>
                {j.clientLabel}
              </AdminTd>
              <AdminTd>
                <StatusPill>{j.status}</StatusPill>
              </AdminTd>
              <AdminTd className="text-right tabular-nums text-slate-800">{j.bidCount}</AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(j.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
